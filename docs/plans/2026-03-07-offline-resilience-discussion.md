# Offline Resilience & Idempotency — Architecture Discussion

## Context

The app runs React in a Natively WKWebView/WebView with Bubble.io as the backend. All JS→Bubble communication is **fire-and-forget** via `sendToBubble()`. There is no acknowledgment, no retry, and no offline queue. If the network is down or flaky when a critical action fires, the data is lost silently. Some data inconsistencies have been observed.

---

## Current Resilience Map

### What's Already Resilient (offline-safe)

| Layer | Mechanism |
|-------|-----------|
| App shell (JS/CSS) | Service worker cache-first |
| Fonts, images | Runtime cache on first fetch |
| User data, session, preferences | Dual-tier storage (localStorage + NativelyStorage) |
| Onboarding progress | Persisted to device storage, resumable |
| Daily question (cached) | Persisted, shows stale data if no network |
| Simulator AI templates | Cached in localStorage after first fetch |

### What's Vulnerable (network-dependent, no retry)

| Operation | Risk Level | What Happens on Failure |
|-----------|-----------|------------------------|
| **Onboarding complete** | CRITICAL | User finishes all steps, answers + coins never reach Bubble. Local state says "done", server doesn't know. |
| **Simulator session_complete** | CRITICAL | AI evaluation (score, feedback) computed client-side, sent once. If lost, session results vanish. |
| **Daily question vote** | HIGH | Optimistic UI shows vote + coins, but Bubble never records it. Next refresh: vote gone, coins incorrect. |
| **Insight answers** | HIGH | Individual answers sent one-at-a-time. If any fail silently, insight generation has incomplete data. |
| **Simulator token requests** | MODERATE | Coins deducted before token received. If token never arrives, coins lost. |
| **Sign-in** | LOW | `bonds_auth_pending` flag provides basic retry detection. |

### The Core Problem

```
sendToBubble('bubble_fn_simulator', 'session_complete', { score: 4, ... })
```

This line either works or silently fails. No ACK. No retry. No queue. The user has no idea their data was lost.

---

## Bubble Constraints

Bubble workflows are **trigger-based**, not API endpoints. Key limitations:

1. **No return values** from JS→Bubble — `sendToBubble` is one-way via Toolbox Multiple Outputs
2. **Bubble can call back** via `window.appUI.*` functions — this IS a return channel
3. **No native idempotency keys** — Bubble has no built-in dedup mechanism
4. **Workflows are stateless** — each trigger runs independently, no transaction guarantees
5. **Bubble database IS accessible** — workflows can check "does this record already exist?"

---

## Proposed Strategy: Offline Action Queue with ACK (Option A — Selected)

### Layer 1: Pending Action Queue (React side)

Instead of calling `sendToBubble()` directly for critical writes, push to a persistent queue:

```
User action → queue.push({ id: uuid, action, data, createdAt })
             → persist queue to localStorage + NativelyStorage
             → attempt immediate flush
```

The queue replays on:
- Network restored (online event)
- App foreground (visibility change)
- Periodic retry (exponential backoff: 5s, 15s, 45s)

### Layer 2: Idempotency via Action ID (Bubble side)

Each queued action carries a UUID. Bubble workflows check:
```
"Only when" → Do a search for Actions where actionId = output2's actionId → count = 0
```
If the action already exists, Bubble skips processing but still sends ACK.

### Layer 3: ACK Channel (Bubble → JS)

After processing, Bubble calls back:
```javascript
window.appUI.ackAction({ actionId: "uuid-here", status: "ok" })
```

React removes the action from the queue. If no ACK within timeout → retry.

---

## What This Looks Like Per Feature

### Onboarding Complete
```
1. User finishes last step
2. Queue: { id: "abc", action: "complete", data: { answers, coins } }
3. sendToBubble fires immediately
4. Bubble creates onboarding record (checking actionId doesn't exist)
5. Bubble calls window.appUI.ackAction({ actionId: "abc" })
6. Queue removes "abc"
7. If no ACK in 10s → retry. If offline → retry when online.
```

### Daily Question Vote
```
1. User taps answer
2. Optimistic UI update (immediate)
3. Queue: { id: "def", action: "vote", data: { questionId, index } }
4. Same flush + ACK cycle
5. If ACK includes updated coin count → reconcile UI
```

### Simulator Session Complete
```
1. AI evaluation finishes
2. Results displayed to user immediately (already have data)
3. Queue: { id: "ghi", action: "session_complete", data: { score, ... } }
4. Same flush + ACK cycle
5. Critical: results are in-memory only, so also persist to device storage as backup
```

---

## Implementation Sketch

### New: `src/utils/actionQueue.js` (~100 lines)

- `enqueue(fnName, action, data)` — assigns UUID, persists, flushes
- `flush()` — sends all pending items via `sendToBubble`, starts ACK timers
- `ack(actionId)` — removes item from queue, cancels retry timer
- `init(storage)` — hydrates queue from device storage on app start
- Persistence: queue serialized to `bonds_action_queue` key
- Retry: 3 attempts with exponential backoff, then park as "failed"

### New: `sendReliable()` in `src/utils/bubble.js`

Wrapper that routes through the queue. Existing `sendToBubble()` stays unchanged for non-critical calls.

### Modified call sites (4 files)

| File | Action | Change |
|------|--------|--------|
| `OnboardingFlow.jsx` | `complete` | `sendToBubble` → `sendReliable` |
| `SimulatorSection.jsx` | `session_complete` | `sendToBubble` → `sendReliable` |
| `DailyQuestion.jsx` | `vote` | `sendToBubble` → `sendReliable` |
| `InsightFlow.jsx` | `answer` | `sendToBubble` → `sendReliable` |

### Bubble workflow changes (per protected workflow)

1. Add dedup guard: search for existing actionId before processing
2. Add ACK callback: `window.appUI.ackAction({ actionId })` at end

---

## Alternative Approaches Considered

### Option B: Full Offline Mode
Queue ALL sendToBubble calls, show pending state indicators, conflict resolution. **Rejected**: too much complexity for Phase 1.

### Option C: Reconcile on Open
Persist all state locally, send full reconciliation payload on next app open. **Rejected**: Bubble reconciliation logic would be complex and error-prone. Queue + ACK is more explicit and reliable.

---

## Open Questions for Future Discussion

1. **Coin consistency** — Coins are shown optimistically but credited server-side. Would "eventually consistent" (syncs next app open) be acceptable, or do we need real-time ACK with updated coin count?
2. **Failed actions UI** — If an action fails 3 times, should the user see anything? Or just silently retry forever?
3. **Queue size limits** — How many pending actions before we cap or alert?
4. **Simulator results persistence** — Should we persist full evaluation to device storage as a backup, independent of the queue?
5. **Phase 2 migration** — When we move to React Native + real backend, this queue pattern maps directly to a proper API retry layer.

---

## Effort Estimate

- React side: ~2-3 hours (actionQueue module + 4 call site changes + App.jsx init)
- Bubble side: ~1 hour (add actionId dedup + ACK callback to 4 workflows)
- Testing: ~1 hour (airplane mode, kill app, duplicate detection, backoff)
