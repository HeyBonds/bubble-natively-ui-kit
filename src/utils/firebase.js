/**
 * Crash & Error Tracking via Google Analytics 4 (gtag.js)
 *
 * Uses the gtag.js snippet loaded externally in Bubble SEO header.
 * Events appear in Firebase Analytics console under custom events.
 *
 * Two event types:
 *   app_crash    — fatal: uncaught exceptions, unhandled rejections, React boundary
 *   app_error    — non-fatal: caught errors in TTS, storage, realtime, bridge
 *
 * Note on stale-while-revalidate bundles:
 *   The SW serves cached bundles instantly, so users may run an older version.
 *   APP_VERSION is baked into every event so crash reports are version-tagged.
 */
import { APP_VERSION, GA_MEASUREMENT_ID } from '../config';

let initialized = false;
let initRetryTimer = null;
const MAX_INIT_RETRIES = 5;
const INIT_RETRY_MS = 500;

// Deduplication: skip identical errors within 60 seconds.
// Checked AFTER successful send to avoid marking unsent errors as seen.
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 60_000;

function isDuplicate(key) {
  const now = Date.now();
  const lastSeen = recentErrors.get(key);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return true;
  return false;
}

function markSeen(key) {
  const now = Date.now();
  recentErrors.set(key, now);
  if (recentErrors.size >= 100) {
    for (const [k, ts] of recentErrors) {
      if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(k);
    }
  }
}

function truncate(str, max = 100) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * Send event to GA4. Returns true if sent, false if skipped.
 */
function gtagEvent(eventName, params) {
  if (!initialized || typeof window.gtag !== 'function') return false;
  window.gtag('event', eventName, params);
  return true;
}

/**
 * Initialize crash tracking. Call once at app startup.
 * Requires gtag.js to be loaded via Bubble SEO header snippet.
 * If gtag.js isn't ready yet (async race), retries up to 5 times (500ms apart).
 */
export function initFirebase() {
  if (initialized) return;
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Analytics] No GA_MEASUREMENT_ID configured — crash tracking disabled.');
    return;
  }
  if (typeof window.gtag !== 'function') {
    // gtag shim not ready — schedule retry (handles async script race)
    if (!initRetryTimer) {
      let retries = 0;
      initRetryTimer = setInterval(() => {
        retries++;
        if (typeof window.gtag === 'function') {
          clearInterval(initRetryTimer);
          initRetryTimer = null;
          initialized = true;
          console.log('[Analytics] Crash tracking initialized (after retry)');
          return;
        }
        if (retries >= MAX_INIT_RETRIES) {
          clearInterval(initRetryTimer);
          initRetryTimer = null;
          console.warn('[Analytics] gtag.js not loaded after retries — crash tracking disabled.');
        }
      }, INIT_RETRY_MS);
    }
    return;
  }
  initialized = true;
  console.log('[Analytics] Crash tracking initialized');
}

/**
 * Log a fatal crash (uncaught exception, unhandled rejection, React boundary).
 */
export function logCrash(crashType, error, sourceFile, sourceLine) {
  const message = truncate(error?.message || String(error));
  const stack = truncate(error?.stack || '');
  const key = `crash:${crashType}:${message}`;
  if (isDuplicate(key)) return;

  const sent = gtagEvent('app_crash', {
    error_message: message,
    stack_trace: stack,
    source_file: truncate(sourceFile || '', 100),
    source_line: truncate(sourceLine || '', 20),
    app_version: APP_VERSION,
    crash_type: crashType,
  });

  if (sent) {
    markSeen(key);
    console.error(`[Analytics] app_crash (${crashType}):`, message);
  }
}

/**
 * Log a non-fatal error (caught in try/catch).
 */
export function logError(category, error, context) {
  const message = truncate(error?.message || String(error));
  const key = `error:${category}:${message}`;
  if (isDuplicate(key)) return;

  const sent = gtagEvent('app_error', {
    error_message: message,
    category,
    context: truncate(context || '', 100),
    app_version: APP_VERSION,
  });

  if (sent) {
    markSeen(key);
    console.warn(`[Analytics] app_error (${category}):`, message);
  }
}

/**
 * Associate a user ID with GA4 (for filtering crashes by user).
 */
export function setFirebaseUser(userId) {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('set', { user_id: userId });
}
