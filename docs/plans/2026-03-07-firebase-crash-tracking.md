# Firebase Crash Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add crash and error tracking using Firebase Analytics custom events (`app_crash`, `app_error`) with global error handlers, a React Error Boundary, and instrumented catch blocks across the codebase.

**Architecture:** Firebase modular SDK (`firebase/app` + `firebase/analytics`) initialized before React mount in `src/index.jsx`. A utility module (`src/utils/firebase.js`) exposes `logCrash()` and `logError()` with 60-second deduplication. Existing catch blocks in TTS, realtime, storage, and Bubble bridge call `logError()`. A React Error Boundary wraps `AppInner` to catch render crashes.

**Tech Stack:** Firebase JS SDK (modular), React Error Boundary, esbuild (tree-shakes Firebase)

**Design doc:** `docs/plans/2026-03-07-firebase-crash-tracking-design.md`

---

### Task 1: Install Firebase dependency

**Files:**
- Modify: `package.json`

**Step 1: Install firebase**

Run: `npm install firebase`

**Step 2: Verify installation**

Run: `node -e "require('firebase/app')"`
Expected: No errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add firebase dependency"
```

---

### Task 2: Add Firebase config to config.js

**Files:**
- Modify: `src/config.js`

**Step 1: Add Firebase config placeholder**

The user needs to create a Firebase project and get these values. Add them as a placeholder that works safely when unconfigured:

```js
// src/config.js — add after existing exports

export const FIREBASE_CONFIG = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};
```

Leave values empty — Firebase init will be skipped if `apiKey` is empty (handled in Task 3). The user fills these in after creating their Firebase project.

**Step 2: Verify build still works**

Run: `npm run build:js:dev`
Expected: Builds successfully, no errors

**Step 3: Commit**

```bash
git add src/config.js
git commit -m "feat: add Firebase config placeholder to config.js"
```

---

### Task 3: Create Firebase utility module

**Files:**
- Create: `src/utils/firebase.js`

**Step 1: Create `src/utils/firebase.js`**

```jsx
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserId } from 'firebase/analytics';
import { FIREBASE_CONFIG, APP_VERSION } from '../config';

let analytics = null;

// Deduplication: skip identical errors within 60 seconds
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 60_000;

function isDuplicate(key) {
  const now = Date.now();
  const lastSeen = recentErrors.get(key);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return true;
  recentErrors.set(key, now);
  // Prune old entries periodically
  if (recentErrors.size > 100) {
    for (const [k, ts] of recentErrors) {
      if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(k);
    }
  }
  return false;
}

function truncate(str, max = 100) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * Initialize Firebase. Call once at app startup (before React mount).
 * Silently skips if config is missing/empty.
 */
export function initFirebase() {
  if (analytics) return; // already initialized
  if (!FIREBASE_CONFIG.apiKey) {
    console.warn('[Firebase] No apiKey configured — crash tracking disabled.');
    return;
  }
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    analytics = getAnalytics(app);
    console.log('[Firebase] Analytics initialized');
  } catch (err) {
    console.error('[Firebase] Init failed:', err);
  }
}

/**
 * Log a fatal crash (uncaught exception, unhandled rejection, React boundary).
 * @param {'uncaught'|'unhandled_rejection'|'react_boundary'} crashType
 * @param {Error|string} error
 * @param {string} [sourceFile]
 * @param {string} [sourceLine]
 */
export function logCrash(crashType, error, sourceFile, sourceLine) {
  const message = truncate(error?.message || String(error));
  const stack = truncate(error?.stack || '');
  const key = `crash:${message}`;
  if (isDuplicate(key)) return;

  console.error(`[Firebase] app_crash (${crashType}):`, message);
  if (!analytics) return;
  logEvent(analytics, 'app_crash', {
    error_message: message,
    stack_trace: stack,
    source_file: truncate(sourceFile || '', 100),
    source_line: truncate(sourceLine || '', 20),
    app_version: APP_VERSION,
    crash_type: crashType,
  });
}

/**
 * Log a non-fatal error (caught in try/catch).
 * @param {string} category — e.g. 'tts', 'storage', 'bubble_bridge', 'realtime', 'audio', 'init'
 * @param {Error|string} error
 * @param {string} [context] — what was happening when the error occurred
 */
export function logError(category, error, context) {
  const message = truncate(error?.message || String(error));
  const key = `error:${category}:${message}`;
  if (isDuplicate(key)) return;

  console.warn(`[Firebase] app_error (${category}):`, message);
  if (!analytics) return;
  logEvent(analytics, 'app_error', {
    error_message: message,
    category,
    context: truncate(context || '', 100),
    app_version: APP_VERSION,
  });
}

/**
 * Associate a user ID with Firebase Analytics (for filtering crashes by user).
 * @param {string} userId
 */
export function setFirebaseUser(userId) {
  if (!analytics) return;
  setUserId(analytics, userId);
}
```

**Step 2: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully (Firebase tree-shaken to analytics only)

**Step 3: Commit**

```bash
git add src/utils/firebase.js
git commit -m "feat: add Firebase analytics utility with logCrash/logError and dedup"
```

---

### Task 4: Initialize Firebase + global error handlers in index.jsx

**Files:**
- Modify: `src/index.jsx`

**Step 1: Add Firebase init and global error handlers**

At the top of `src/index.jsx`, after the existing `initGlobals()` call (line 45), add:

```jsx
// --- FIREBASE CRASH TRACKING (Runs before React) ---
import { initFirebase, logCrash } from './utils/firebase';
initFirebase();

window.addEventListener('error', (event) => {
  logCrash('uncaught', event.error || event.message, event.filename, String(event.lineno));
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  logCrash('unhandled_rejection', error);
});
```

Note: The imports should go with the other imports (after line 46). The `initFirebase()` call and listeners should go after `initGlobals()` but before the mount functions.

**Step 2: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 3: Commit**

```bash
git add src/index.jsx
git commit -m "feat: init Firebase and attach global error handlers before React mount"
```

---

### Task 5: Create React Error Boundary component

**Files:**
- Create: `src/components/ErrorBoundary.jsx`

**Step 1: Create `src/components/ErrorBoundary.jsx`**

```jsx
import React from 'react';
import { logCrash } from '../utils/firebase';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const componentStack = errorInfo?.componentStack || '';
    logCrash('react_boundary', error, componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="absolute inset-0 bg-[#1F1A2E] flex flex-col items-center justify-center font-jakarta text-center px-8"
          onClick={() => window.location.reload()}
        >
          <div className="w-16 h-16 rounded-full bg-[#FF2258]/20 flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2258" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-white/60 text-sm mb-8">An unexpected error occurred.</p>
          <button className="bg-[#FF2258] text-white font-medium py-3 px-8 rounded-full text-sm">
            Tap to reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Step 2: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 3: Commit**

```bash
git add src/components/ErrorBoundary.jsx
git commit -m "feat: add React ErrorBoundary with crash logging and fallback UI"
```

---

### Task 6: Wrap App with ErrorBoundary + set Firebase user

**Files:**
- Modify: `src/App.jsx`

**Step 1: Import ErrorBoundary and setFirebaseUser**

Add to the imports at the top of `src/App.jsx`:

```jsx
import ErrorBoundary from './components/ErrorBoundary';
import { setFirebaseUser, logError } from './utils/firebase';
```

**Step 2: Set Firebase user after Mixpanel identifies**

In the `initializeAnalytics` function inside `AppInner` (around line 129, after `setDeviceId(storedId)`), add:

```jsx
setFirebaseUser(storedId);
```

**Step 3: Add logError to analytics init catch block**

In the catch block at line 130-132, add `logError`:

```jsx
} catch (err) {
    console.error('❌ Analytics Init Failed:', err);
    logError('init', err, 'initializeAnalytics');
}
```

**Step 4: Add logError to session check catch block**

In the catch block at line 166-169, add `logError`:

```jsx
} catch (err) {
    console.error('❌ App: Failed to check session:', err);
    logError('init', err, 'checkSession');
    if (displayedPhaseRef.current === 'loading') transitionTo('welcome');
}
```

**Step 5: Wrap the App component with ErrorBoundary**

Change the `App` component (lines 261-268) to:

```jsx
const App = () => (
    <ErrorBoundary>
        <UserProvider>
            <DailyQuestionProvider>
                <AppInner />
            </DailyQuestionProvider>
        </UserProvider>
    </ErrorBoundary>
);
```

**Step 6: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 7: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wrap App with ErrorBoundary, set Firebase user, log init errors"
```

---

### Task 7: Instrument TTS catch blocks

**Files:**
- Modify: `src/utils/tts.js`

**Step 1: Import logError**

Add at the top of `src/utils/tts.js`:

```jsx
import { logError } from './firebase';
```

**Step 2: Instrument the listener error catch (line 46)**

Change:

```jsx
try { fn(evt); } catch (e) { console.error('[TTS] Listener error:', e); }
```

To:

```jsx
try { fn(evt); } catch (e) { console.error('[TTS] Listener error:', e); logError('tts', e, 'event listener'); }
```

**Step 3: Instrument the main TTS.start catch block (lines 362-372)**

Change:

```jsx
} catch (e) {
    if (e.name === 'AbortError') {
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
      return;
    }
    console.error('TTS error:', e);
    state.status = 'error';
    TTS.emit('status', { status: 'error' });
    TTS.emit('error', { message: e.message });
  }
```

To:

```jsx
} catch (e) {
    if (e.name === 'AbortError') {
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
      return;
    }
    console.error('TTS error:', e);
    logError('tts', e, `TTS.start (${TTS_BACKEND})`);
    state.status = 'error';
    TTS.emit('status', { status: 'error' });
    TTS.emit('error', { message: e.message });
  }
```

**Step 4: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 5: Commit**

```bash
git add src/utils/tts.js
git commit -m "feat: instrument TTS error tracking with logError"
```

---

### Task 8: Instrument Realtime catch blocks

**Files:**
- Modify: `src/utils/realtime.js`

**Step 1: Import logError**

Add at the top of `src/utils/realtime.js`:

```jsx
import { logError } from './firebase';
```

**Step 2: Instrument key error points**

Focus on the most important error points (not every silent `catch {}` — only those with `console.error` or meaningful failures):

- **Line 170** (listener error): Add `logError('realtime', e, 'event listener');` after the `console.error`
- **Line 220** (around localStorage parse errors): Add `logError('realtime', e, 'localStorage parse');`
- **Line 1060** (connection/SDP error): Add `logError('realtime', err, 'WebRTC connection');`
- **Line 1214** (session error): Add `logError('realtime', err, 'session setup');`
- **Line 1681** (general RT error): Add `logError('realtime', e, 'RT operation');`
- **Line 1737** (cleanup error): Add `logError('realtime', err, 'cleanup');`

Do NOT instrument the many `catch { /* ignore */ }` blocks — these are intentional silent fallbacks (e.g. during cleanup). Only add `logError` where there's already a `console.error` or where the error represents a real failure.

**Step 3: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add src/utils/realtime.js
git commit -m "feat: instrument Realtime error tracking with logError"
```

---

### Task 9: Instrument Bubble bridge

**Files:**
- Modify: `src/utils/bubble.js`

**Step 1: Import logError**

Add at the top of `src/utils/bubble.js`:

```jsx
import { logError } from './firebase';
```

**Step 2: Instrument the missing bridge warning**

Change the else branch (line 25-27):

```jsx
} else {
    console.warn(`⚠️ BubbleBridge not found [${fnName}]`, { action, ...data });
}
```

To:

```jsx
} else {
    console.warn(`⚠️ BubbleBridge not found [${fnName}]`, { action, ...data });
    logError('bubble_bridge', new Error(`BubbleBridge not found: ${fnName}`), action);
}
```

**Step 3: Verify build**

Run: `npm run build:js:dev`
Expected: Builds successfully

**Step 4: Commit**

```bash
git add src/utils/bubble.js
git commit -m "feat: instrument Bubble bridge error tracking with logError"
```

---

### Task 10: Instrument storage hook

**Files:**
- Modify: `src/hooks/useNativelyStorage.js`

`useNativelyStorage.js` doesn't currently have any catch blocks — it relies on NativelyStorage callbacks and the timeout pattern. The storage errors here are non-exceptional (timeout, missing values), so **no changes are needed** for this file. The init/session errors in `App.jsx` (Task 6) already cover the cases where storage failures cause app problems.

Skip this task.

---

### Task 11: Build and verify bundle size

**Step 1: Full production build**

Run: `npm run build`
Expected: Builds successfully, generates `bundle.js`, `bundle.css`, bumps service worker

**Step 2: Check bundle size**

Run: `ls -lh bundle.js`
Expected: Size should be roughly 560KB + 30-50KB (Firebase analytics module). If significantly larger, Firebase tree-shaking may not be working correctly.

**Step 3: Commit built artifacts**

```bash
git add bundle.js bundle.css service-worker.js
git commit -m "build: production build with Firebase crash tracking"
```

---

### Task 12: Test in preview

**Step 1: Start dev server**

Run: `npm run dev`
Open: `http://localhost:8000/preview/index.html`

**Step 2: Verify no console errors**

Open browser DevTools. Firebase should log `[Firebase] No apiKey configured — crash tracking disabled.` since config is empty. This is expected — no errors or crashes.

**Step 3: Test Error Boundary (optional)**

Temporarily add a throw inside a component to verify the error boundary fallback UI shows. Remove after testing.

---

## Summary of all files changed

| File | Action | What |
|------|--------|------|
| `package.json` | Modify | Add `firebase` dependency |
| `src/config.js` | Modify | Add `FIREBASE_CONFIG` placeholder |
| `src/utils/firebase.js` | Create | Firebase init, logCrash, logError, setFirebaseUser, dedup |
| `src/components/ErrorBoundary.jsx` | Create | React Error Boundary with fallback UI |
| `src/index.jsx` | Modify | Init Firebase + global error/rejection handlers |
| `src/App.jsx` | Modify | Wrap with ErrorBoundary, set Firebase user, log init errors |
| `src/utils/tts.js` | Modify | Add logError to TTS error catch blocks |
| `src/utils/realtime.js` | Modify | Add logError to key RT error catch blocks |
| `src/utils/bubble.js` | Modify | Add logError when BubbleBridge missing |

## After implementation: User setup steps

1. Go to https://console.firebase.google.com → Create project → Enable Google Analytics
2. Add Web App → Copy config object
3. Paste values into `src/config.js` `FIREBASE_CONFIG`
4. `npm run build` → Upload `bundle.js`, `bundle.css`, `service-worker.js` to Bubble
5. (Recommended) In Google Cloud Console → Credentials → Restrict API key to `bonds.heybonds.com`
