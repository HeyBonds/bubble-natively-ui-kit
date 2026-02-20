# Bonds Tech Roadmap: From Prototype to Platform

A 3-phase migration strategy from Bubble + Natively to a fully native mobile app.

---

## Where We Are Today

The Bonds app currently runs as a **Bubble-native app wrapped with Natively**. All UI is rendered by Bubble's built-in page system — Bubble elements, Bubble responsive engine, Bubble workflows. Natively wraps the whole thing in a native shell for App Store distribution and provides bridge access to device capabilities (biometrics, haptics, storage).

This got us to market. But we're hitting fundamental platform limitations:

- **WebView performance ceiling** — Everything renders in a browser engine inside the app. No matter how optimized, it can't match native rendering for scroll-heavy lists, gesture-driven animations, or complex transitions. Lower-end devices feel this most.
- **Bubble vendor lock-in** — Business logic lives in Bubble's visual workflows. Can't version-control it, can't unit test it, can't migrate it without rewriting.
- **Bridge overhead** — Every native capability (haptics, biometrics, storage) takes a round trip: JS → Natively bridge → native OS API → bridge → JS. This adds latency to every native interaction and limits what's architecturally possible.
- **No push notifications, background sync, or offline-first** — WebView apps can't register for native push tokens, can't run background tasks, and can't implement offline-first data sync. These are fundamental native-only capabilities that no bridge can fully replicate.
- **Scale costs** — Bubble pricing scales per user/workflow. At 10k+ users, costs become significant. No control over server infrastructure or query optimization.

These limitations exist today and persist through Phase 1 — they're inherent to the WebView + Bubble architecture. Only Phase 2 (native rendering) and Phase 3 (real backend) resolve them.

---

## Why Migrate?

**The business case is simple**: we validated the product with Bubble. Now we need the infrastructure to scale it.

---

## The Strategy: Incremental, Not Big-Bang

Each phase ships a working product. Nothing is throwaway.

```
Current State           Phase 1 (NOW)          Phase 2 (NEXT)           Phase 3 (FUTURE)
┌──────────────┐       ┌──────────────┐       ┌──────────────┐         ┌──────────────┐
│  Bubble UI   │       │  React UI    │       │  React Native│         │  React Native│
│  (Pages)     │       │  (WebView)   │       │  (Native)    │         │  (Native)    │
├──────────────┤       ├──────────────┤       ├──────────────┤         ├──────────────┤
│  Natively    │       │  Natively    │       │              │         │              │
│  (Wrapper)   │  ──►  │  (Bridge)    │  ──►  │  Native APIs │   ──►   │  Native APIs │
├──────────────┤       ├──────────────┤       ├──────────────┤         ├──────────────┤
│  Bubble      │       │  Bubble      │       │  Bubble      │         │  Real        │
│  (Everything)│       │  (Backend)   │       │  (as API)    │         │  Backend     │
└──────────────┘       └──────────────┘       └──────────────┘         └──────────────┘
```

Key principle: **each phase reduces risk independently**. We can stop at any phase and have a solid product.

---

## Why React? The Vibe Coding Advantage

Choosing React (and later React Native) isn't just a technical decision — it's a **velocity multiplier** because of how well it works with AI-assisted development:

- **Largest ecosystem in frontend**: React has the most libraries, tutorials, Stack Overflow answers, and open-source code of any UI framework. AI models have been trained on massive amounts of React code, which means AI-assisted coding tools generate higher-quality React code than for any other framework.
- **Declarative, component-based architecture**: React components are self-contained, declarative units. This maps perfectly to how AI code generation works — you describe what a component should do, and the AI produces a complete, working component. No imperative wiring or framework boilerplate to get wrong.
- **JSX is readable by humans and machines**: JSX combines markup and logic in a single file, making it straightforward for AI tools to understand context and generate correct output. No template language to learn, no separate files to keep in sync.
- **React → React Native is the same paradigm**: The mental model, component patterns, hooks, state management — all transfer directly from React to React Native. AI tools that generate good React code also generate good React Native code. This means our Phase 1 investment in React accelerates Phase 2.
- **Massive community = fast problem-solving**: Any issue we encounter has likely been solved publicly. AI tools can reference these solutions, and developers can find answers quickly.

This means we can move fast in every phase — Phase 1 with React in WebView, Phase 2 with React Native — with AI-assisted development accelerating both.

---

## Phase 1 — Bubble + Natively + React (NOW)

**What it is**: Bubble remains the backend (database, workflows, auth). React components progressively replace Bubble's UI, rendering inside the Natively WebView wrapper. Each screen is a single-page React component that communicates back to Bubble via the JS-to-Bubble bridge.

### What We've Built So Far

We've built proof-of-concept implementations for the core UI infrastructure, validating the approach across multiple feature areas:

- **Daily Question** — fully working in production. Complete feature including UI, animations, state management, and Bubble integration.
- **Onboarding flow** — POC with custom animations and multi-step forms
- **Tab navigation + stack routing** — POC for the main app shell architecture
- **Glassmorphic design system** — POC for dark surfaces, blur effects, gradients
- **Device storage** — POC via Natively SDK with localStorage fallback
- **Mixpanel analytics** — POC for event tracking integration
- **JS-to-Bubble bridge** — working communication layer (`sendToBubble`) using Toolbox Multiple Outputs
- **Build pipeline** — Tailwind CSS + esbuild with React aliased to Preact for smaller bundles

### What's Ahead in Phase 1

Phase 1 is far from done. The app is large, and migrating each screen from Bubble UI to React involves significant work:

- **Screen-by-screen migration**: Every Bubble page needs to be rebuilt as a React component. Each screen requires new UI code, new styling, and new interaction logic.
- **Workflow restructuring**: Moving to single-page React components fundamentally changes how Bubble workflows operate. Since React handles the UI and communicates via JS-to-Bubble (JS2B) bridge, most frontend workflows need to be rearchitected. Bubble workflows shift from driving UI directly to responding to JS2B events — receiving actions and data from React, then triggering backend logic. This is mostly a frontend workflow change, but it touches every screen.
- **JS2B integration per feature**: Each feature needs its own Toolbox JS2B element configured with Multiple Outputs, proper action routing, and corresponding Bubble workflows wired to `"Only when output1 is 'action_name'"`.
- **Testing and polish**: Each migrated screen needs thorough testing across devices to ensure the React version matches or exceeds the Bubble original.

### Value Delivered

- **Speed**: Product went from idea to App Store in weeks, not months
- **Iteration**: UI changes deploy instantly (CDN cache bust), no app store review needed for most updates
- **AI-assisted velocity**: React's ecosystem means AI tools generate high-quality components, accelerating screen-by-screen migration

### Phase 1-Specific Challenges

- **Two UI paradigms during migration** — During Phase 1, some screens run as Bubble pages and others as React components. Users experience inconsistency, and the team maintains two rendering approaches simultaneously.
- **Workflow restructuring overhead** — Every screen migration requires rearchitecting its Bubble workflows. Frontend workflows shift from driving UI to responding to JS2B events — this is non-trivial and touches both the React and Bubble side.
- **JS2B bridge complexity scales with features** — Each new screen adds another Toolbox element, more action routing, and more Bubble workflows wired to specific outputs. The coordination overhead grows with the app's surface area.
- **Debugging across the bridge** — When things go wrong, bugs can live in React, in Bubble workflows, or in the JS2B communication between them. Tracing issues across this boundary is harder than debugging either side alone.

---

## Phase 2 — React Native + Bubble Backend APIs (NEXT)

**What changes**: The native app shell replaces the WebView. React Native renders truly native UI components. Bubble stays as the backend, exposed through its Data API and Workflow API as REST endpoints.

### What Carries Over

| Asset | Reuse | Notes |
|-------|-------|-------|
| Component structure | ~80% | Same component hierarchy, same state patterns. Some adaptation for native APIs. |
| Business logic | ~80% | Hooks, utilities, data transformations. Some hooks rewired for native platform. |
| User flows | 100% | Onboarding, navigation, feature flows stay identical |
| Design values | 100% | Colors, gradients, spacing, typography — framework-agnostic constants |
| Analytics events | 100% | Same Mixpanel tracking calls |
| API communication | ~50% | JS2B bridge → REST API calls (same data, different transport) |

### What Gets Rewritten

| Area | From (Phase 1) | To (Phase 2) |
|------|----------------|--------------|
| Styling | Tailwind CSS classes | React Native StyleSheet / NativeWind |
| Animations | CSS `@keyframes` | React Native Reanimated |
| Navigation | Custom stack router in `App.jsx` | React Navigation |
| Storage | Natively SDK bridge | AsyncStorage / MMKV |
| Native features | Natively SDK (bridge) | Direct native modules |

### New Capabilities Unlocked

- **True native performance** — 60fps animations, native scroll, native gesture handling
- **Push notifications** — Firebase Cloud Messaging / APNs, fully controlled
- **Offline support** — local-first data with background sync
- **Native animations** — Reanimated/Moti for gesture-driven, spring-based UI
- **Background tasks** — periodic sync, silent push processing
- **Deep linking** — native URL scheme and universal links

### Bubble's Role in Phase 2

Bubble becomes a headless backend:

```
React Native App
       │
       ▼
  REST API calls
       │
       ▼
┌─────────────────────┐
│  Bubble Data API    │  ← Read/write database records
│  Bubble Workflow API│  ← Trigger server-side logic
│  Bubble Auth        │  ← User authentication
└─────────────────────┘
```

No changes needed on the Bubble side — just expose existing data types and workflows as API endpoints (Bubble supports this natively). This means **zero backend migration risk**.

---

## Phase 3 — React Native + Real Backend (FUTURE)

**What changes**: Replace Bubble's backend with a real API server and database. The React Native frontend stays largely unchanged from Phase 2.

### Architecture

```
React Native App          (unchanged from Phase 2)
       │
       ▼
  REST / GraphQL API
       │
       ▼
┌─────────────────────┐
│  Node.js / Python   │  ← API server (Express, FastAPI, etc.)
│  PostgreSQL / etc.  │  ← Own database
│  Redis              │  ← Caching, sessions, rate limiting
│  S3 / CloudFlare    │  ← File storage, CDN
└─────────────────────┘
```

### Value

- **Full control** — custom queries, optimized data models, complex business logic in real code that can be version-controlled and tested
- **Cost efficiency** — no per-user Bubble pricing; infrastructure costs scale with actual usage, not user count
- **Performance** — optimized database queries, server-side caching, edge computing
- **Flexibility** — any third-party integration, any data pipeline, any auth provider

### When to Trigger Phase 3

This phase is **optional until scale demands it**. Concrete triggers:

- Bubble costs exceed equivalent self-hosted infrastructure
- Business logic complexity exceeds what Bubble workflows can express cleanly
- Performance requirements (response times, concurrent users) exceed Bubble's capacity
- Need for features Bubble can't support (real-time WebSockets, complex aggregations, ML pipelines)

### What Stays the Same

The React Native frontend from Phase 2 is mostly untouched. The migration is a backend swap:

- API call URLs change
- Auth token format may change
- Response shapes may change slightly (but can be adapted with a thin mapping layer)
- All UI, navigation, animations, and user flows remain identical

---

## What Transfers at Each Step

```
                    Phase 1 → 2         Phase 2 → 3
                   ─────────────       ─────────────
Component logic    ████████░░ 80%      ██████████ 100%
Design values      ██████████ 100%     ██████████ 100%
User flows         ██████████ 100%     ██████████ 100%
Analytics          ██████████ 100%     ██████████ 100%
Styling            ░░░░░░░░░░ rewrite  ██████████ 100%
Animations         ░░░░░░░░░░ rewrite  ██████████ 100%
Navigation         ██░░░░░░░░ partial  ██████████ 100%
Backend logic      ██████████ 100%     ░░░░░░░░░░ rewrite
Database schema    ██████████ 100%     ████████░░ migrate
Auth system        ██████████ 100%     ██░░░░░░░░ replace
```

The pattern: Phase 2 is a **frontend rewrite** (backend stays). Phase 3 is a **backend rewrite** (frontend stays). We never rewrite both at once.

---

## Effort & Sizing

| Phase | Relative Effort | Scope |
|-------|----------------|-------|
| **Phase 1** | █████░░░░░ | In progress. Large app — every screen migrated from Bubble to React, workflows rearchitected for JS2B. |
| **Phase 2** | ███████░░░ | Significant. New app shell, rewrite styling/animations/navigation, integrate Bubble APIs. |
| **Phase 3** | ██████████ | Largest effort. Full backend from scratch — API server, database, auth, data migration, DevOps. |

Phase 1 is substantial because it touches every screen and requires rethinking how Bubble workflows operate with React-driven UI.

Phase 2 is a big frontend effort but patterns repeat across screens — once the first few screens are migrated, the rest follow the same formula.

Phase 3 is the largest investment because it means building real infrastructure: designing a database schema, writing an API server, implementing authentication, migrating production data, and taking on operational responsibility (deployment, monitoring, on-call). Every workflow that lived in Bubble's visual editor gets reimplemented in code.

---

## Risks & Mitigations

### Phase 1 (Current)

| Risk | Impact | Mitigation |
|------|--------|------------|
| WebView performance degrades as UI complexity grows | Users perceive app as slow | Keep animations simple, optimize bundle size, lazy-load screens |
| Workflow rearchitecting takes longer than expected | Migration slows down | Start with simpler screens, build reusable JS2B patterns |
| Bubble outage affects all users | Complete app downtime | Accepted risk at this stage — Bubble's SLA covers it |
| Natively SDK limitations block a feature | Feature can't ship | Evaluate early, have fallback web-based approaches |

### Phase 2

| Risk | Impact | Mitigation |
|------|--------|------------|
| React Native learning curve slows delivery | Timeline extends | Team ramp-up before starting; leverage existing React knowledge |
| Bubble API rate limits or latency | Poor app performance | Cache aggressively on-device, paginate requests, batch writes |
| Scope creep ("while we're rewriting...") | Project drags on | Strict 1:1 feature parity first, new features after migration |
| Two codebases during transition | Maintenance burden | Set a hard cutover date; don't maintain Phase 1 in parallel for long |

### Phase 3

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration errors | Lost or corrupted user data | Dry-run migrations, run both backends in parallel during transition, rollback plan |
| Underestimating backend complexity | Timeline extends | Start with the most critical/complex workflows first |
| Operational burden (DevOps, monitoring, on-call) | Team bandwidth | Use managed services (managed DB, serverless where possible) to reduce ops load |
| Replicating all Bubble logic in code | Hidden complexity surfaces | Audit every Bubble workflow before starting; document edge cases |

---

## Next Steps

**Immediate actions to continue Phase 1:**

1. **Complete screen migrations** — Prioritize high-traffic screens. Build each as a single-page React component with JS2B bridge communication.
2. **Establish JS2B workflow patterns** — Document and templatize the Bubble workflow restructuring needed for each screen (frontend workflow → JS2B event handler).
3. **Validate at scale** — Stress-test migrated screens on lower-end devices to confirm WebView performance is acceptable.
4. **Audit Bubble APIs** — In parallel, document every data type and workflow for future Phase 2 readiness.
5. **Extract shared logic** — Identify hooks, utilities, and constants that will transfer directly to React Native.

---

*Each phase is a product, not a prototype. We build on what we have — we don't throw it away.*
