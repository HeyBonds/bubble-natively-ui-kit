# Conversation Simulator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Duolingo-style Conversation Simulator tab with real-time voice AI (Azure OpenAI Realtime API via WebRTC), push-to-talk interaction, canvas waveform visualization, and a results/evaluation screen.

**Architecture:** The simulator is a tab in MainTabs with 3 phases: Landing (pre-session), Session (3 stages: coach intake → partner simulation → evaluation), and Results. The existing `bubble-realtime.js` state machine is ported to `src/utils/realtime.js` with an EventEmitter pattern (replacing Bubble bridge). A reusable `Dialog` component handles audio check and session-close confirmation. Tab switching is locked during an active session.

**Tech Stack:** React (Preact), Tailwind CSS, WebRTC, AudioContext/AnalyserNode, Canvas API, Azure OpenAI Realtime API

---

## Context for the Implementer

### Project conventions
- React → Preact aliased at build time. Write standard React code.
- Fonts: `font-jakarta` (headings), `font-poppins` (body/UI)
- Duolingo-style buttons: rounded, bold, `border-b-[4px]` for 3D press effect, `active:border-b-0 active:translate-y-[1px]`
- Brand color: `#E44B8E`. Green CTA: `#58CC02`. Theme accessed via `theme` prop (dark/light).
- Borders: always add `border-solid` alongside `border-*` classes.
- Animations: only `transform` + `opacity` (compositor-only, no `transition-all`).
- `sendToBubble(fnName, action, data)` for JS→Bubble. `window.appUI.xxx` for Bubble→JS callbacks.
- Always run `npx eslint src/` then `npm run build` after changes.

### Key files to reference
- `src/components/MainTabs.jsx` — tab system, stack navigation, theme resolution
- `src/theme.js` — THEMES object with dark/light tokens
- `src/utils/bubble.js` — sendToBubble utility
- `src/input.css` — custom keyframe animations
- `bonds-admin/app/realtime/bubble-realtime.js` — original RT state machine (~1960 lines)
- `bonds-admin/app/realtime/waveform-component.html` — original waveform component (~1285 lines)

### RT state machine events (from bubble-realtime.js)
The original emits via `window.RT.emit(type, data)` → `bubble_fn_rt_event(json)`. Key event types:
- `state` → `{ state: "SESSION_STARTED" | "BEGIN_SIMULATION" | "COACH_SPEAKING" | "PUSH_TO_TALK_READY" | "PUSH_TO_TALK_ACTIVE" | "PUSH_TO_TALK_STOPPED" | "LOADING_SIMULATION" | "PARTNER_SPEAKING" | "SESSION_COMPLETED" | "SESSION_STOPPED" | "SESSION_ERROR" }`
- `stage2_token_needed` → `{ voice, userName, issue, jsonContext }`
- `evaluation_json_received` → `{ data: { overall_score, skill_level, metrics, strengths, improvements, summary } }`
- `partner_text` / `coach_text` → `{ text }` (final transcript of assistant turn)
- `user_transcript` → `{ text }` (user's speech-to-text)
- `error` → `{ message, code }`

### Evaluation JSON shape (from RT code)
```json
{
  "overall_score": 3,
  "skill_level": "Getting Started",
  "metrics": [
    { "name": "Response Length", "direction": "down", "score": 2 },
    { "name": "Clarity", "direction": "down", "score": 2 },
    { "name": "Acknowledgment", "direction": "up", "score": 4 },
    { "name": "Calmness", "direction": "up", "score": 4 }
  ],
  "strengths": ["You remained calm in your tone.", "You gave a minimal acknowledgment."],
  "improvements": ["Try to elaborate more.", "Be more specific about feelings."],
  "summary": "Coach's spoken summary of the session."
}
```

---

## Task 1: Add simulator theme tokens to `src/theme.js`

**Files:**
- Modify: `src/theme.js`

**Step 1: Add `simulator` sub-object to both dark and light themes**

In `src/theme.js`, add a `simulator` key to each theme (same pattern as `onboarding`):

```js
// Inside THEMES.dark, after the onboarding block:
simulator: {
  // Landing
  landingBg: '#252538',
  landingBorder: 'rgba(255,255,255,0.08)',
  landingTitle: '#FFFFFF',
  landingSubtitle: 'rgba(255,255,255,0.6)',
  landingHint: 'rgba(255,255,255,0.4)',
  creditCost: 'rgba(255,255,255,0.35)',

  // Session
  sessionBg: '#1B1B2F',
  statusText: '#FFFFFF',
  statusSubtext: 'rgba(255,255,255,0.5)',

  // Waveform
  waveformLine: '#E44B8E',
  waveformBg: 'transparent',

  // Mic button
  micBg: 'rgba(255,255,255,0.08)',
  micBorder: 'rgba(255,255,255,0.2)',
  micIcon: '#FFFFFF',
  micActiveBg: '#E44B8E',
  micActiveBorder: '#B83A72',
  micActiveIcon: '#FFFFFF',
  micStopBg: 'rgba(228,75,142,0.15)',
  micStopIcon: '#E44B8E',

  // Transcript
  transcriptBg: 'rgba(255,255,255,0.06)',
  transcriptBorder: 'rgba(255,255,255,0.1)',
  transcriptText: '#FFFFFF',

  // Progress dots
  dotActive: '#E44B8E',
  dotInactive: 'rgba(255,255,255,0.15)',
  dotBorder: 'rgba(255,255,255,0.2)',

  // Transition
  transitionText: '#FFFFFF',
  transitionSubtext: 'rgba(255,255,255,0.5)',

  // Results
  resultsBg: '#252538',
  resultsBorder: 'rgba(255,255,255,0.08)',
  resultsTitle: '#FFFFFF',
  scoreFraction: 'rgba(255,255,255,0.5)',
  metricUp: '#58CC02',
  metricDown: '#FF4B4B',
  metricNeutral: 'rgba(255,255,255,0.4)',
  metricText: '#FFFFFF',
  sectionTitle: '#58CC02',
  sectionTitleImprove: '#FF9600',
  bulletText: 'rgba(255,255,255,0.7)',
  readMoreText: '#E44B8E',

  // Dialog
  dialogBg: '#252538',
  dialogBorder: 'rgba(255,255,255,0.1)',
  dialogTitle: '#FFFFFF',
  dialogText: 'rgba(255,255,255,0.7)',
  dialogDimBg: 'rgba(0,0,0,0.6)',
},

// Inside THEMES.light, after the onboarding block:
simulator: {
  landingBg: '#FFFFFF',
  landingBorder: 'rgba(0,0,0,0.06)',
  landingTitle: '#1B1B2F',
  landingSubtitle: 'rgba(0,0,0,0.55)',
  landingHint: 'rgba(0,0,0,0.35)',
  creditCost: 'rgba(0,0,0,0.3)',

  sessionBg: '#F0F0F5',
  statusText: '#1B1B2F',
  statusSubtext: 'rgba(0,0,0,0.4)',

  waveformLine: '#E44B8E',
  waveformBg: 'transparent',

  micBg: 'rgba(0,0,0,0.04)',
  micBorder: 'rgba(0,0,0,0.12)',
  micIcon: '#1B1B2F',
  micActiveBg: '#E44B8E',
  micActiveBorder: '#B83A72',
  micActiveIcon: '#FFFFFF',
  micStopBg: 'rgba(228,75,142,0.1)',
  micStopIcon: '#E44B8E',

  transcriptBg: 'rgba(0,0,0,0.03)',
  transcriptBorder: 'rgba(0,0,0,0.06)',
  transcriptText: '#1B1B2F',

  dotActive: '#E44B8E',
  dotInactive: 'rgba(0,0,0,0.08)',
  dotBorder: 'rgba(0,0,0,0.12)',

  transitionText: '#1B1B2F',
  transitionSubtext: 'rgba(0,0,0,0.4)',

  resultsBg: '#FFFFFF',
  resultsBorder: 'rgba(0,0,0,0.06)',
  resultsTitle: '#1B1B2F',
  scoreFraction: 'rgba(0,0,0,0.4)',
  metricUp: '#58CC02',
  metricDown: '#FF4B4B',
  metricNeutral: 'rgba(0,0,0,0.3)',
  metricText: '#1B1B2F',
  sectionTitle: '#58CC02',
  sectionTitleImprove: '#FF9600',
  bulletText: 'rgba(0,0,0,0.6)',
  readMoreText: '#E44B8E',

  dialogBg: '#FFFFFF',
  dialogBorder: 'rgba(0,0,0,0.06)',
  dialogTitle: '#1B1B2F',
  dialogText: 'rgba(0,0,0,0.6)',
  dialogDimBg: 'rgba(0,0,0,0.4)',
},
```

**Step 2: Verify**

```bash
npx eslint src/theme.js && npm run build
```

---

## Task 2: Create reusable Dialog component

**Files:**
- Create: `src/components/Dialog.jsx`
- Modify: `src/input.css` (add dialog animations)

**What this builds:** A themed modal dialog component used for the audio-check prompt, session-close confirmation, and any future modals. Renders a dim backdrop + centered card with title, body content, and action buttons.

**Step 1: Add dialog animation keyframes to `src/input.css`**

Add inside `@layer utilities { ... }`, before the closing `}`:

```css
/* Dialog overlay + card */
@keyframes dialogFadeIn {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes dialogCardIn {
  0%   { opacity: 0; transform: scale(0.92) translateZ(0); }
  100% { opacity: 1; transform: scale(1) translateZ(0); }
}
@keyframes dialogFadeOut {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes dialogCardOut {
  0%   { opacity: 1; transform: scale(1) translateZ(0); }
  100% { opacity: 0; transform: scale(0.92) translateZ(0); }
}
.dialog-overlay-in  { animation: dialogFadeIn 0.2s ease-out forwards; }
.dialog-overlay-out { animation: dialogFadeOut 0.15s ease-in forwards; }
.dialog-card-in     { animation: dialogCardIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform, opacity; }
.dialog-card-out    { animation: dialogCardOut 0.15s ease-in forwards; will-change: transform, opacity; }
```

**Step 2: Create `src/components/Dialog.jsx`**

```jsx
import React, { useState, useEffect, useCallback } from 'react';

/**
 * Dialog — Reusable themed modal.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void (called on backdrop tap or cancel action)
 *  - title: string
 *  - children: React node (body content)
 *  - actions: [{ label, onClick, primary?, disabled? }]
 *  - theme: theme object (from MainTabs)
 *  - closeOnBackdrop: boolean (default true)
 */
const Dialog = ({ open, onClose, title, children, actions = [], theme, closeOnBackdrop = true }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  const handleBackdrop = useCallback(() => {
    if (closeOnBackdrop && onClose) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!visible) return null;

  const sim = theme.simulator;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${closing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
        style={{ background: sim.dialogDimBg }}
        onClick={handleBackdrop}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl p-6 border border-solid ${closing ? 'dialog-card-out' : 'dialog-card-in'}`}
        style={{ background: sim.dialogBg, borderColor: sim.dialogBorder }}
      >
        {title && (
          <h3 className="font-jakarta font-extrabold text-[18px] mb-3 text-center" style={{ color: sim.dialogTitle }}>
            {title}
          </h3>
        )}

        <div className="font-poppins text-[14px] leading-relaxed text-center" style={{ color: sim.dialogText }}>
          {children}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-col gap-3 mt-6">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`w-full py-3 rounded-xl font-jakarta font-extrabold text-[14px] border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100 ${
                  action.disabled ? 'opacity-40' : ''
                }`}
                style={action.primary ? {
                  background: '#58CC02',
                  borderColor: '#46A302',
                  color: '#FFFFFF',
                } : {
                  background: sim.dialogBg,
                  borderColor: sim.dialogBorder,
                  color: sim.dialogTitle,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
```

**Step 3: Verify**

```bash
npx eslint src/components/Dialog.jsx && npm run build
```

---

## Task 3: Port RT state machine to `src/utils/realtime.js`

**Files:**
- Create: `src/utils/realtime.js`

**What this builds:** A self-contained module that wraps the `bubble-realtime.js` WebRTC state machine. Instead of emitting events to Bubble via `bubble_fn_rt_event`, it uses a simple callback/listener pattern that React components can subscribe to. The public API stays the same: `start(token)`, `stop()`, `startPushToTalk()`, `stopPushToTalk()`, `retrySimulation()`, `getMicStream()`.

**Strategy:**
1. Copy the entire `bubble-realtime.js` into `src/utils/realtime.js`
2. Replace `window.RT` with a module-scoped object
3. Replace `window.RT.emit = function(type, data) { ... bubble_fn_rt_event(json) ... }` with a listener-based emit that calls all registered callbacks
4. Export: `RT` object (start, stop, startPushToTalk, stopPushToTalk, retrySimulation, getMicStream, config, state) + `onRTEvent(callback)` / `offRTEvent(callback)` subscription functions
5. Remove the auto-start line at the bottom (`window.RT.start("__TOKEN__")`)
6. Remove `window.WaveformComponent` references (React will handle waveform state directly)

**Step 1: Create `src/utils/realtime.js`**

Copy `bonds-admin/app/realtime/bubble-realtime.js` as the base. Make these precise changes:

**Change 1 — Module scope instead of window:**
```js
// At the top, replace:
//   window.RT = window.RT || {};
// With:
const RT = {};
```

**Change 2 — Replace emit function:**
```js
// Replace the emit function (around line 393) with:
const _listeners = new Set();

RT.emit = function (type, data) {
  const evt = { type, ts: Date.now(), data: data || {} };
  _listeners.forEach(fn => {
    try { fn(evt); } catch (e) { console.error('[RT] Listener error:', e); }
  });
};

export function onRTEvent(callback) {
  _listeners.add(callback);
}

export function offRTEvent(callback) {
  _listeners.delete(callback);
}
```

**Change 3 — Replace all `window.RT.state` / `window.RT.config` / `window.RT.emit` references:**
Use find-and-replace: `window.RT.` → `RT.` throughout the file.

**Change 4 — Remove WaveformComponent references:**
In `RT.start`, remove the block that calls `window.WaveformComponent.resetAudioContext()`.

**Change 5 — Remove bottom auto-start and Bubble template placeholders:**
Remove these lines from the bottom:
```js
// Remove:
window.RT.config.ISSUE_JSON_INSTRUCTIONS_TEMPLATE = "{{Your Issue JSON Template}}";
window.RT.config.EVALUATION_JSON_INSTRUCTIONS_TEMPLATE = "{{Your Evaluation JSON Template}}";
window.RT.config.USER_NAME = "{{Current User's Name}}";
window.RT.start("__TOKEN__");
```

**Change 6 — Export the RT object:**
```js
// At the very bottom:
export default RT;
```

**Step 2: Verify**

```bash
npx eslint src/utils/realtime.js && npm run build
```

Note: ESLint may flag some patterns from the original code (unused vars, etc.). Fix only what blocks the build. The RT code is battle-tested — minimize changes.

---

## Task 4: Create Waveform React component

**Files:**
- Create: `src/components/simulator/Waveform.jsx`

**What this builds:** A canvas-based waveform visualization with 3 modes: `idle` (flat line), `speaking` (simulated wave when AI is speaking), `recording` (real mic input from AudioContext/AnalyserNode). Ported from the canvas logic in `waveform-component.html`.

**Step 1: Create `src/components/simulator/Waveform.jsx`**

```jsx
import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Waveform — Canvas-based audio visualization.
 *
 * Props:
 *  - mode: 'idle' | 'speaking' | 'recording'
 *  - analyserNode: AnalyserNode | null (for 'recording' mode)
 *  - theme: theme object
 *  - height: number (default 48)
 */
const Waveform = ({ mode = 'idle', analyserNode = null, theme, height = 48 }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const sim = theme.simulator;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = sim.waveformLine;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const midY = h / 2;

    if (mode === 'idle') {
      // Flat line
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
    } else if (mode === 'speaking') {
      // Simulated wave — sine with noise
      phaseRef.current += 0.06;
      const phase = phaseRef.current;
      for (let x = 0; x < w; x++) {
        const t = x / w;
        // Envelope — taper at edges
        const envelope = Math.sin(t * Math.PI);
        // Composite wave
        const wave = (
          Math.sin(t * 8 + phase) * 0.4 +
          Math.sin(t * 14 + phase * 1.3) * 0.25 +
          Math.sin(t * 22 + phase * 0.7) * 0.15 +
          (Math.random() - 0.5) * 0.1
        );
        const y = midY + wave * envelope * (h * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (mode === 'recording' && analyserNode) {
      // Real mic data
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      for (let i = 0; i < bufferLength; i++) {
        const t = i / bufferLength;
        const v = dataArray[i] / 128.0; // normalize to 0-2
        const y = midY + (v - 1) * (h * 0.45);
        if (i === 0) ctx.moveTo(t * w, y);
        else ctx.lineTo(t * w, y);
      }
    } else {
      // Fallback: flat line
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
    }

    ctx.stroke();
    rafRef.current = requestAnimationFrame(draw);
  }, [mode, analyserNode, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height, display: 'block' }}
    />
  );
};

export default Waveform;
```

**Step 2: Verify**

```bash
npx eslint src/components/simulator/Waveform.jsx && npm run build
```

---

## Task 5: Create MicButton and Transcript components

**Files:**
- Create: `src/components/simulator/MicButton.jsx`
- Create: `src/components/simulator/Transcript.jsx`

**Step 1: Create MicButton**

States: `hidden` (not rendered), `waiting` (spinner), `ready` (mic icon, tap to speak), `recording` (stop icon, tap when done).

```jsx
import React from 'react';

/**
 * MicButton — Push-to-talk toggle.
 *
 * Props:
 *  - state: 'hidden' | 'waiting' | 'ready' | 'recording'
 *  - onPress: () => void
 *  - theme: theme object
 */
const MicButton = ({ state = 'hidden', onPress, theme }) => {
  if (state === 'hidden') return null;

  const sim = theme.simulator;

  if (state === 'waiting') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-solid animate-paused-clock"
          style={{ background: sim.micBg, borderColor: sim.micBorder }}
        >
          {/* Spinner */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ animationDuration: '1.5s' }}>
            <circle cx="12" cy="12" r="10" stroke={sim.micIcon} strokeWidth="2" strokeDasharray="50 20" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  const isRecording = state === 'recording';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onPress}
        className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-solid transition-[transform,background-color] duration-150 active:scale-95"
        style={{
          background: isRecording ? sim.micStopBg : sim.micBg,
          borderColor: isRecording ? sim.micActiveBorder : sim.micBorder,
        }}
      >
        {isRecording ? (
          /* Stop icon */
          <div className="w-5 h-5 rounded-sm" style={{ background: sim.micStopIcon }} />
        ) : (
          /* Mic icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sim.micIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MicButton;
```

**Step 2: Create Transcript**

Displays the last line of transcript text in a rounded card. Text streams in character by character.

```jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * Transcript — Streaming text display.
 *
 * Props:
 *  - text: string (full text to display)
 *  - streaming: boolean (if true, reveal character by character)
 *  - theme: theme object
 */
const Transcript = ({ text = '', streaming = false, theme }) => {
  const [displayedLen, setDisplayedLen] = useState(text.length);
  const prevTextRef = useRef(text);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!streaming) {
      setDisplayedLen(text.length);
      return;
    }

    // If text grew (new characters appended), animate from where we were
    const prevLen = prevTextRef.current.length;
    if (text.length > prevLen && text.startsWith(prevTextRef.current)) {
      // Reveal new chars at ~30 chars/sec
      let current = prevLen;
      const reveal = () => {
        current++;
        setDisplayedLen(current);
        if (current < text.length) {
          timerRef.current = setTimeout(reveal, 33);
        }
      };
      timerRef.current = setTimeout(reveal, 33);
    } else {
      // Text replaced entirely — show immediately
      setDisplayedLen(text.length);
    }

    prevTextRef.current = text;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, streaming]);

  const sim = theme.simulator;
  const visibleText = text.slice(0, displayedLen);

  if (!text) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 border border-solid"
      style={{ background: sim.transcriptBg, borderColor: sim.transcriptBorder }}
    >
      <p className="font-poppins text-[14px] leading-relaxed text-center" style={{ color: sim.transcriptText }}>
        {visibleText}
      </p>
    </div>
  );
};

export default Transcript;
```

**Step 3: Verify**

```bash
npx eslint src/components/simulator/MicButton.jsx src/components/simulator/Transcript.jsx && npm run build
```

---

## Task 6: Create SimulatorLanding

**Files:**
- Create: `src/components/simulator/SimulatorLanding.jsx`

**What this builds:** The pre-session landing page shown when user opens the Simulator tab. Duolingo-style: clean surface card, big heading, description, green CTA "Start" button with credit cost. Handles the audio-check dialog (Android only, once per session).

**Step 1: Create the component**

```jsx
import React, { useState } from 'react';
import Dialog from '../Dialog';

// Module-level: audio check shown once per session
let audioCheckShown = false;

const isAndroid = () => /android/i.test(navigator.userAgent);

/**
 * SimulatorLanding — Pre-session intro screen.
 *
 * Props:
 *  - onStart: () => void (called after audio check, begins session)
 *  - creditCost: number (default 4)
 *  - theme: theme object
 */
const SimulatorLanding = ({ onStart, creditCost = 4, theme }) => {
  const [showAudioCheck, setShowAudioCheck] = useState(false);
  const sim = theme.simulator;

  const handleStart = () => {
    if (isAndroid() && !audioCheckShown) {
      audioCheckShown = true;
      setShowAudioCheck(true);
      return;
    }
    onStart();
  };

  const handleAudioCheckDismiss = () => {
    setShowAudioCheck(false);
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Illustration area — placeholder for now */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ background: sim.micBg, borderColor: sim.micBorder }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={sim.micIcon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="font-jakarta font-extrabold text-[28px] text-center mb-3" style={{ color: sim.landingTitle }}>
        Conversation
      </h1>
      <h1 className="font-jakarta font-extrabold text-[28px] text-center mb-6 -mt-2" style={{ color: sim.landingTitle }}>
        Simulator
      </h1>

      {/* Description */}
      <p className="font-poppins text-[15px] text-center leading-relaxed mb-auto px-4" style={{ color: sim.landingSubtitle }}>
        Practice what you want to say, and how you say it. Get honest and objective guidance.
      </p>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center gap-3 mt-8">
        <p className="font-poppins text-[13px]" style={{ color: sim.landingHint }}>
          Find a quiet place to start
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full max-w-[260px] py-3.5 rounded-xl font-jakarta font-extrabold text-[16px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100"
          style={{ background: '#58CC02', borderColor: '#46A302' }}
        >
          Start
        </button>

        <p className="font-poppins text-[12px]" style={{ color: sim.creditCost }}>
          Uses {creditCost} credits
        </p>
      </div>

      {/* Audio check dialog — Android only */}
      <Dialog
        open={showAudioCheck}
        onClose={handleAudioCheckDismiss}
        title="Let's make sure you can hear us!"
        theme={theme}
        closeOnBackdrop={false}
        actions={[{ label: 'Got it', onClick: handleAudioCheckDismiss, primary: true }]}
      >
        <p className="mb-3">
          This experience includes audio. Some devices may experience low or no audio output.
        </p>
        <p>
          Use the side buttons to turn up your volume. Please ensure both Media and Ringer levels are active.
        </p>
      </Dialog>
    </div>
  );
};

export default SimulatorLanding;
```

**Step 2: Verify**

```bash
npx eslint src/components/simulator/SimulatorLanding.jsx && npm run build
```

---

## Task 7: Create SimulatorSession (Coach + Partner + Transition)

**Files:**
- Create: `src/components/simulator/SimulatorSession.jsx`

**What this builds:** The main session UI that manages all 3 stages. Subscribes to RT events, updates React state, renders Waveform/MicButton/Transcript. Handles the Coach stage (Stage 1), the "Your simulation will begin shortly" transition, and the Partner stage (Stage 2) with progress dots.

This is the largest component. Key responsibilities:
- Subscribe to RT events via `onRTEvent`/`offRTEvent`
- Track: `stage` (1, 'transition', 2, 3), `rtState` (current RT state string), `transcript` (current text), `micState` ('hidden'|'waiting'|'ready'|'recording'), turn counts
- Call `RT.startPushToTalk()` / `RT.stopPushToTalk()` on mic button press
- When evaluation arrives → call `onComplete(evaluationData)` to transition to Results
- Close/X button → call `onClose()` (parent handles confirmation dialog)

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import RT, { onRTEvent, offRTEvent } from '../../utils/realtime';
import { sendToBubble } from '../../utils/bubble';
import Waveform from './Waveform';
import MicButton from './MicButton';
import Transcript from './Transcript';

const TOTAL_TURNS = 4; // 2 partner + 2 user turns in Stage 2

const SimulatorSession = ({ theme, onComplete, onClose, onStage2Start }) => {
  const sim = theme.simulator;

  // Session state
  const [stage, setStage] = useState(1); // 1, 'transition', 2, 3
  const [rtState, setRtState] = useState('loading');
  const [transcript, setTranscript] = useState('');
  const [micState, setMicState] = useState('hidden');
  const [turnProgress, setTurnProgress] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  // Audio context for waveform
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  // Waveform mode
  const waveformMode = rtState === 'PUSH_TO_TALK_ACTIVE' ? 'recording'
    : ['COACH_SPEAKING', 'PARTNER_SPEAKING'].includes(rtState) ? 'speaking'
    : 'idle';

  // Status text
  const statusText = micState === 'recording' ? 'Tap when done speaking'
    : micState === 'ready' ? 'Tap to speak'
    : ['COACH_SPEAKING', 'PARTNER_SPEAKING'].includes(rtState) ? 'Listen'
    : rtState === 'loading' ? 'Connecting...'
    : '';

  // Handle RT events
  const handleRTEvent = useCallback((evt) => {
    const { type, data } = evt;

    switch (type) {
      case 'state': {
        const s = data.state;
        setRtState(s);

        switch (s) {
          case 'SESSION_STARTED':
          case 'BEGIN_SIMULATION':
            setMicState('hidden');
            break;
          case 'COACH_SPEAKING':
            setMicState('hidden');
            setIsStreaming(true);
            setTranscript('');
            break;
          case 'PARTNER_SPEAKING':
            setMicState('hidden');
            setIsStreaming(true);
            setTranscript('');
            if (data.partnerTurnCount) {
              setTurnProgress((data.partnerTurnCount - 1) * 2 + 1);
            }
            break;
          case 'PUSH_TO_TALK_READY':
            setMicState('ready');
            setIsStreaming(false);
            if (data.userTurnCount) {
              setTurnProgress(data.userTurnCount * 2);
            }
            break;
          case 'PUSH_TO_TALK_ACTIVE':
            setMicState('recording');
            break;
          case 'PUSH_TO_TALK_STOPPED':
            setMicState('waiting');
            break;
          case 'LOADING_SIMULATION':
            setStage('transition');
            setMicState('hidden');
            setTranscript('');
            break;
          case 'SESSION_COMPLETED':
            setStage(3);
            setMicState('hidden');
            break;
          case 'SESSION_ERROR':
          case 'SESSION_STOPPED':
            setMicState('hidden');
            break;
          default:
            break;
        }
        break;
      }
      case 'coach_text':
      case 'partner_text':
        setTranscript(data.text || '');
        setIsStreaming(false);
        break;
      case 'user_transcript':
        // Show user's own speech as transcript briefly
        break;
      case 'stage2_token_needed':
        // Tell Bubble to generate Stage 2 token
        if (onStage2Start) onStage2Start();
        sendToBubble('bubble_fn_simulator', 'stage2_token_needed', {
          voice: data.voice,
          userName: data.userName,
          issue: data.issue,
          jsonContext: data.jsonContext,
        });
        break;
      case 'evaluation_json_received':
        if (onComplete) onComplete(data.data || data);
        break;
      case 'error':
        console.error('[Simulator] RT error:', data.message, data.code);
        break;
      default:
        break;
    }
  }, [onComplete, onStage2Start]);

  // Subscribe to RT events
  useEffect(() => {
    onRTEvent(handleRTEvent);
    return () => offRTEvent(handleRTEvent);
  }, [handleRTEvent]);

  // Setup AudioContext for recording waveform
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (_) { /* noop */ }
      }
    };
  }, []);

  // When mic becomes active, connect to analyser
  useEffect(() => {
    if (micState === 'recording') {
      const micStream = RT.getMicStream();
      if (micStream && !audioCtxRef.current) {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const source = ctx.createMediaStreamSource(micStream);
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
    }
  }, [micState]);

  // Detect Stage 2 start (LOADING_SIMULATION → next PARTNER_SPEAKING = stage 2)
  useEffect(() => {
    if (rtState === 'PARTNER_SPEAKING' && stage === 'transition') {
      setStage(2);
    }
  }, [rtState, stage]);

  const handleMicPress = () => {
    if (micState === 'ready') {
      RT.startPushToTalk();
    } else if (micState === 'recording') {
      RT.stopPushToTalk();
    }
  };

  // Transition screen
  if (stage === 'transition') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6" style={{ background: sim.sessionBg }}>
        <p className="font-jakarta font-bold text-[20px] text-center" style={{ color: sim.transitionText }}>
          Your simulation will begin shortly
        </p>
        <div className="mt-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ animationDuration: '1.5s' }}>
            <circle cx="12" cy="12" r="10" stroke={sim.transitionSubtext} strokeWidth="2" strokeDasharray="50 20" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: sim.sessionBg }}>
      {/* Top bar — close button */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose} className="p-2 rounded-full" style={{ color: sim.statusText }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Stage indicator (only in Stage 2) */}
        {stage === 2 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_TURNS }).map((_, i) => (
              <div
                key={i}
                className="rounded-full border border-solid transition-[background-color] duration-300"
                style={{
                  width: i < turnProgress ? 20 : 16,
                  height: 8,
                  borderRadius: 4,
                  background: i < turnProgress ? sim.dotActive : sim.dotInactive,
                  borderColor: i < turnProgress ? sim.dotActive : sim.dotBorder,
                }}
              />
            ))}
          </div>
        )}

        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Center content — status + waveform */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Status text */}
        <p className="font-jakarta font-bold text-[20px]" style={{ color: sim.statusText }}>
          {statusText}
        </p>

        {/* Waveform + Mic */}
        <div className="w-full flex items-center gap-0">
          <div className="flex-1">
            <Waveform mode={waveformMode} analyserNode={analyserRef.current} theme={theme} height={48} />
          </div>
          {micState !== 'hidden' && (
            <div className="shrink-0 -ml-4">
              <MicButton state={micState} onPress={handleMicPress} theme={theme} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom — Transcript */}
      <div className="shrink-0 px-5 pb-6 pt-2">
        <Transcript text={transcript} streaming={isStreaming} theme={theme} />
      </div>
    </div>
  );
};

export default SimulatorSession;
```

**Step 2: Verify**

```bash
npx eslint src/components/simulator/SimulatorSession.jsx && npm run build
```

---

## Task 8: Create SimulatorResults

**Files:**
- Create: `src/components/simulator/SimulatorResults.jsx`

**What this builds:** The evaluation results screen shown after the session completes. Duolingo-style card with: skill level title, colored score dots (red→green gradient), 4 metrics with directional arrows, "What you did well" / "Areas to improve" sections, and "TRY AGAIN" / "DONE" footer buttons.

**Step 1: Create the component**

```jsx
import React, { useState } from 'react';

const SCORE_COLORS = ['#FF4B4B', '#FF8C00', '#FFD700', '#9ACD32', '#58CC02'];

const SimulatorResults = ({ evaluation, theme, onRetry, onDone }) => {
  const sim = theme.simulator;
  const [expanded, setExpanded] = useState(false);

  if (!evaluation) return null;

  const { overall_score = 1, skill_level = 'Getting Started', metrics = [], strengths = [], improvements = [], summary = '' } = evaluation;

  return (
    <div className="flex flex-col h-full" style={{ background: sim.sessionBg }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-6 pb-4">

        {/* Score header */}
        <div className="text-center mb-6">
          <h2 className="font-jakarta font-extrabold text-[24px] mb-3" style={{ color: sim.resultsTitle }}>
            {skill_level}
          </h2>

          {/* Score dots */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {SCORE_COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: i < overall_score ? color : sim.dotInactive,
                  border: i < overall_score ? 'none' : `1px solid ${sim.dotBorder}`,
                }}
              />
            ))}
          </div>
          <p className="font-poppins text-[14px]" style={{ color: sim.scoreFraction }}>
            {overall_score}/5
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-2 mb-6">
          {metrics.map((metric, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-[18px]" style={{ color: metric.direction === 'up' ? sim.metricUp : sim.metricDown }}>
                {metric.direction === 'up' ? '\u2191' : '\u2193'}
              </span>
              <span className="font-poppins font-medium text-[15px]" style={{ color: sim.metricText }}>
                {metric.name}
              </span>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mb-5">
            <h3 className="font-jakarta font-bold text-[14px] mb-2" style={{ color: sim.sectionTitle }}>
              What you did well
            </h3>
            <ul className="flex flex-col gap-1.5">
              {strengths.map((item, i) => (
                <li key={i} className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="mb-5">
            <h3 className="font-jakarta font-bold text-[14px] mb-2" style={{ color: sim.sectionTitleImprove }}>
              Areas to improve
            </h3>
            <ul className="flex flex-col gap-1.5">
              {improvements.map((item, i) => (
                <li key={i} className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary — expandable */}
        {summary && (
          <div className="mb-4">
            {!expanded ? (
              <button onClick={() => setExpanded(true)} className="font-jakarta font-bold text-[13px] underline" style={{ color: sim.readMoreText }}>
                Read more
              </button>
            ) : (
              <p className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                {summary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer — TRY AGAIN / DONE */}
      <div className="shrink-0 flex items-center border-t border-solid" style={{ borderColor: sim.resultsBorder, background: sim.resultsBg }}>
        <button
          onClick={onRetry}
          className="flex-1 py-4 text-center"
        >
          <span className="font-jakarta font-extrabold text-[14px] block" style={{ color: sim.resultsTitle }}>
            TRY AGAIN
          </span>
          <span className="font-poppins text-[11px]" style={{ color: sim.scoreFraction }}>
            Same topic
          </span>
        </button>
        <div style={{ width: 1, height: 40, background: sim.resultsBorder }} />
        <button
          onClick={onDone}
          className="flex-1 py-4 text-center"
        >
          <span className="font-jakarta font-extrabold text-[14px]" style={{ color: sim.resultsTitle }}>
            DONE
          </span>
        </button>
      </div>
    </div>
  );
};

export default SimulatorResults;
```

**Step 2: Verify**

```bash
npx eslint src/components/simulator/SimulatorResults.jsx && npm run build
```

---

## Task 9: Create SimulatorSection (container + tab-lock)

**Files:**
- Create: `src/components/SimulatorSection.jsx`

**What this builds:** The top-level container for the Simulator tab. Manages the lifecycle: Landing → Session → Results → back to Landing. Exposes a `sessionActive` flag that MainTabs reads to lock tab switching. Shows confirmation dialog when user tries to leave during an active session.

```jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import RT from '../utils/realtime';
import { sendToBubble } from '../utils/bubble';
import Dialog from './Dialog';
import SimulatorLanding from './simulator/SimulatorLanding';
import SimulatorSession from './simulator/SimulatorSession';
import SimulatorResults from './simulator/SimulatorResults';

/**
 * SimulatorSection — Tab container.
 *
 * Props:
 *  - theme: theme object
 *  - onSessionChange: (active: boolean) => void — notifies MainTabs to lock/unlock tabs
 */
const SimulatorSection = ({ theme, onSessionChange }) => {
  const [phase, setPhase] = useState('landing'); // 'landing' | 'session' | 'results'
  const [evaluation, setEvaluation] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Pending tab switch callback (set by MainTabs when user tries to switch during session)
  const pendingLeaveRef = useRef(null);

  // Notify parent of session state changes
  useEffect(() => {
    if (onSessionChange) onSessionChange(phase === 'session');
  }, [phase, onSessionChange]);

  const handleStart = useCallback(() => {
    setPhase('session');
    // Tell Bubble to start generating the token
    sendToBubble('bubble_fn_simulator', 'start_session');
  }, []);

  // Bubble will call this with the token
  useEffect(() => {
    window.appUI.onSimulatorToken = (token) => {
      if (token) RT.start(token);
    };
    // Stage 2 token (partner voice)
    window.appUI.onSimulatorStage2Token = (token) => {
      if (token) RT.start(token);
    };
    return () => {
      delete window.appUI.onSimulatorToken;
      delete window.appUI.onSimulatorStage2Token;
    };
  }, []);

  const handleComplete = useCallback((evalData) => {
    setEvaluation(evalData);
    setPhase('results');
    sendToBubble('bubble_fn_simulator', 'session_complete', {
      score: evalData?.overall_score || 0,
      skillLevel: evalData?.skill_level || '',
    });
  }, []);

  const handleClose = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const confirmClose = useCallback(() => {
    RT.stop('stopped');
    setShowCloseDialog(false);
    setPhase('landing');
    setEvaluation(null);
    sendToBubble('bubble_fn_simulator', 'session_closed');

    // If there was a pending tab switch, execute it
    if (pendingLeaveRef.current) {
      pendingLeaveRef.current();
      pendingLeaveRef.current = null;
    }
  }, []);

  const cancelClose = useCallback(() => {
    setShowCloseDialog(false);
    pendingLeaveRef.current = null;
  }, []);

  const handleRetry = useCallback(() => {
    setPhase('session');
    setEvaluation(null);
    RT.retrySimulation();
  }, []);

  const handleDone = useCallback(() => {
    setPhase('landing');
    setEvaluation(null);
  }, []);

  const handleStage2Start = useCallback(() => {
    // Credits deducted when Stage 2 starts
    sendToBubble('bubble_fn_simulator', 'deduct_credits');
  }, []);

  // Public method for MainTabs to request leave (returns false if blocked)
  useEffect(() => {
    window.appUI._simulatorRequestLeave = (onConfirm) => {
      if (phase !== 'session') return true; // allow immediately
      pendingLeaveRef.current = onConfirm;
      setShowCloseDialog(true);
      return false; // blocked, will call onConfirm if user confirms
    };
    return () => { delete window.appUI._simulatorRequestLeave; };
  }, [phase]);

  return (
    <div className="w-full h-full">
      {phase === 'landing' && (
        <SimulatorLanding onStart={handleStart} theme={theme} />
      )}
      {phase === 'session' && (
        <SimulatorSession
          theme={theme}
          onComplete={handleComplete}
          onClose={handleClose}
          onStage2Start={handleStage2Start}
        />
      )}
      {phase === 'results' && (
        <SimulatorResults
          evaluation={evaluation}
          theme={theme}
          onRetry={handleRetry}
          onDone={handleDone}
        />
      )}

      {/* Close confirmation dialog */}
      <Dialog
        open={showCloseDialog}
        onClose={cancelClose}
        title="End session?"
        theme={theme}
        closeOnBackdrop={false}
        actions={[
          { label: 'End Session', onClick: confirmClose, primary: true },
          { label: 'Continue', onClick: cancelClose },
        ]}
      >
        <p>This will close your current simulation. Your progress will be lost.</p>
      </Dialog>
    </div>
  );
};

export default SimulatorSection;
```

**Step 2: Verify**

```bash
npx eslint src/components/SimulatorSection.jsx && npm run build
```

---

## Task 10: Wire SimulatorSection into MainTabs + Tab-lock

**Files:**
- Modify: `src/components/MainTabs.jsx`

**What this changes:**
1. Import `SimulatorSection` instead of using `PlaceholderSection` for simulator tab
2. Track `simulatorActive` state
3. Guard `switchTab` — if simulator is active, ask for confirmation via `_simulatorRequestLeave`

**Step 1: Add import**

At top of MainTabs.jsx, add:
```js
import SimulatorSection from './SimulatorSection';
```

**Step 2: Add state for simulator session lock**

Inside `MainTabs` component, after `const [navAction, setNavAction] = useState(null);`:
```js
const [simulatorActive, setSimulatorActive] = useState(false);
```

**Step 3: Replace simulator case in renderView**

Replace:
```js
case 'simulator':
    content = <PlaceholderSection title="Simulator" theme={t} />;
    break;
```

With:
```js
case 'simulator':
    content = <SimulatorSection theme={t} onSessionChange={setSimulatorActive} />;
    break;
```

**Step 4: Guard switchTab**

Replace the `switchTab` function:
```js
const switchTab = (tabId) => {
    if (tabId === activeTab) return;

    // If simulator session is active, ask for confirmation
    if (simulatorActive && activeTab === 'simulator') {
      if (window.appUI._simulatorRequestLeave) {
        const allowed = window.appUI._simulatorRequestLeave(() => {
          // Callback: user confirmed leave
          setNavAction('tab');
          setActiveTab(tabId);
        });
        if (!allowed) return; // blocked, dialog shown
      }
    }

    setNavAction('tab');
    setActiveTab(tabId);
};
```

**Step 5: Also guard the back button for simulator**

In the back button section, the existing `pop()` call should also check simulator state. However, since the simulator manages its own X button (which goes through `onClose` → Dialog), and the MainTabs back button only shows when `currentStack.length > 1`, and the simulator doesn't push sub-views, this should be fine as-is.

**Step 6: Verify**

```bash
npx eslint src/components/MainTabs.jsx && npm run build
```

**Step 7: Test in preview**

```bash
npm run dev
```

Open `http://localhost:8000/preview/index.html`:
- Navigate to Simulator tab → should see the Landing page
- Tap "Start" → should see Session UI (will fail to connect without a token, but UI should render)
- Press X → should see close confirmation dialog
- Press "Continue" → should stay in session
- Press "End Session" → should return to Landing
- Tab bar should be responsive

---

## Task 11: Add Bubble integration callbacks to `src/index.jsx`

**Files:**
- Modify: `src/index.jsx`

**What this changes:** Expose `window.appUI.onSimulatorToken` and `window.appUI.onSimulatorStage2Token` documentation/default stubs. The actual callbacks are set by `SimulatorSection` when it mounts.

Also expose `RT.config` so Bubble can set instruction templates before starting:

**Step 1: Add RT config exposure**

At the bottom of `index.jsx`, after the auto-mount block, add:
```js
// Expose RT config for Bubble to set instruction templates
import RT from './utils/realtime';
window.RT = RT;
```

This allows Bubble to call:
- `window.RT.config.USER_NAME = "Ido"`
- `window.RT.config.ISSUE_JSON_INSTRUCTIONS_TEMPLATE = "..."`
- `window.RT.config.EVALUATION_JSON_INSTRUCTIONS_TEMPLATE = "..."`
- `window.appUI.onSimulatorToken(token)` — set by SimulatorSection when mounted

**Step 2: Verify**

```bash
npx eslint src/index.jsx && npm run build
```

---

## Verification Checklist

After all tasks complete:

1. **Build**: `npm run build` passes cleanly
2. **Lint**: `npx eslint src/` passes with no errors
3. **Preview**: `npm run dev` → open `localhost:8000/preview/index.html`
   - [ ] Simulator tab shows Landing page
   - [ ] Landing has clean Duolingo-style design (no gradients!)
   - [ ] "Start" button visible with credit cost
   - [ ] On Android (or spoofed UA), audio check dialog appears
   - [ ] Session UI renders (won't connect without real token)
   - [ ] X button shows close confirmation dialog
   - [ ] Tab switching blocked during session with confirmation
   - [ ] Results page renders with mock data (test by directly setting evaluation state)
   - [ ] Dark mode toggle works — all simulator screens respect theme
   - [ ] Other tabs (Journey, Fun, Profile) still work correctly
4. **No regressions**: All existing features work as before

---

## Post-Implementation Notes

### What needs Bubble setup to test end-to-end:
1. Bubble workflow: on `bubble_fn_simulator` action `start_session` → generate Azure token → call `window.appUI.onSimulatorToken(token)`
2. Bubble workflow: on `bubble_fn_simulator` action `stage2_token_needed` → generate Stage 2 token with partner voice → call `window.appUI.onSimulatorStage2Token(token)`
3. Bubble: set `window.RT.config.USER_NAME`, `ISSUE_JSON_INSTRUCTIONS_TEMPLATE`, `EVALUATION_JSON_INSTRUCTIONS_TEMPLATE` before session starts
4. Bubble workflow: on `bubble_fn_simulator` action `deduct_credits` → deduct 4 credits

### Future enhancements (not in this plan):
- Face silhouette illustrations for the landing/session screens
- Session history (view past evaluation results)
- Animated score reveal on results screen
- Haptic feedback on mic button press (via Natively)
