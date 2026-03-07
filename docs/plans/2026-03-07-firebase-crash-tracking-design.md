# Firebase Crash Tracking Design

## Goal

Add crash and error tracking to the app using Firebase Analytics custom events. Track both hard crashes (uncaught JS errors, React render failures) and silent failures (TTS, storage, bridge, realtime errors) to gain full visibility into app health.

## Decision: Why Firebase Analytics

- **Free** — unlimited events, 500 distinct event types
- **Lightweight** — `firebase/app` + `firebase/analytics` adds ~30KB (tree-shaken by esbuild)
- **Future-proof** — Firebase initialization enables future Remote Config, A/B testing
- **Firebase Crashlytics is not available for web** — Crashlytics is native-only (iOS/Android SDK). For a web app wrapped in Natively, Analytics custom events are the correct approach
- **Security** — Firebase config keys are designed to be public (client identifiers, not secrets). Restrict API key to `bonds.heybonds.com` in Google Cloud Console

## Event Schema

Two events, differentiated by parameters:

### `app_crash` — Fatal errors

| Parameter | Type | Description |
|-----------|------|-------------|
| `error_message` | string (100 char max) | Error message, truncated |
| `stack_trace` | string (100 char max) | Top of stack trace, truncated |
| `source_file` | string | File where error originated |
| `source_line` | string | Line number |
| `app_version` | string | From `APP_VERSION` in config.js |
| `crash_type` | string | `uncaught` / `unhandled_rejection` / `react_boundary` |

### `app_error` — Non-fatal errors

| Parameter | Type | Description |
|-----------|------|-------------|
| `error_message` | string (100 char max) | Error message, truncated |
| `category` | string | `tts` / `storage` / `bubble_bridge` / `realtime` / `audio` / `init` |
| `context` | string (100 char max) | Additional context about what was happening |
| `app_version` | string | From `APP_VERSION` in config.js |

## Capture Points

### 1. Global error handlers (in `src/index.jsx`, before React mount)

- `window.addEventListener('error', handler)` — uncaught synchronous exceptions → `app_crash`
- `window.addEventListener('unhandledrejection', handler)` — unhandled Promise rejections → `app_crash`

### 2. React Error Boundary (wraps `AppInner` in `App.jsx`)

- New component `src/components/ErrorBoundary.jsx`
- Catches render/lifecycle errors → logs `app_crash` with `crash_type: 'react_boundary'`
- Fallback UI: brand-colored screen with "Something went wrong, tap to reload"

### 3. Instrumented catch blocks (add `logError()` calls to existing code)

- `src/utils/tts.js` — `logError('tts', error, context)`
- `src/utils/realtime.js` — `logError('realtime', error, context)`
- `src/hooks/useNativelyStorage.js` — `logError('storage', error, context)`
- `src/utils/bubble.js` — `logError('bubble_bridge', error, context)`
- `src/App.jsx` — `logError('init', error, context)` for analytics/session init failures

### 4. User association

- Call Firebase `setUserId(deviceId)` after Mixpanel identifies the user in `App.jsx`
- Enables filtering crashes by user in Firebase console

## Deduplication

In-memory Set tracks `error_message + category` keys. Duplicate errors within a 60-second window are skipped to avoid flooding Firebase during loops or repeated failures.

## File Changes

### New files

- `src/utils/firebase.js` — Firebase init, `logCrash()`, `logError()`, `setFirebaseUser()`, dedup logic
- `src/components/ErrorBoundary.jsx` — React Error Boundary with fallback UI

### Modified files

- `src/config.js` — add `FIREBASE_CONFIG` object
- `src/index.jsx` — init Firebase + attach global error handlers before React mount
- `src/App.jsx` — wrap with ErrorBoundary, call `setFirebaseUser()` after Mixpanel identify
- `src/utils/tts.js` — add `logError('tts', ...)` in catch blocks
- `src/utils/realtime.js` — add `logError('realtime', ...)` in catch blocks
- `src/hooks/useNativelyStorage.js` — add `logError('storage', ...)` in catch blocks
- `src/utils/bubble.js` — add `logError('bubble_bridge', ...)` in catch blocks
- `package.json` — add `firebase` dependency

## Prerequisites (manual, outside code)

1. Create Firebase project at https://console.firebase.google.com
2. Add a "Web App" to get config values (apiKey, authDomain, projectId, appId, measurementId)
3. Enable Google Analytics in Firebase project settings
4. (Recommended) Restrict API key to `bonds.heybonds.com` in Google Cloud Console

## Bundle Impact

- Firebase modular SDK with tree-shaking: ~30KB additional (gzipped)
- One-time download cost, then cached by service worker
- No impact on subsequent page loads
