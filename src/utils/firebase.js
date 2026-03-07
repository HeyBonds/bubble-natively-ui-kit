/**
 * Crash & Error Tracking via Google Analytics 4 (gtag.js)
 *
 * Uses the gtag.js snippet loaded externally in Bubble SEO header.
 * Events appear in Firebase Analytics console under custom events.
 *
 * Two event types:
 *   app_crash    — fatal: uncaught exceptions, unhandled rejections, React boundary
 *   app_error    — non-fatal: caught errors in TTS, storage, realtime, bridge
 */
import { APP_VERSION, GA_MEASUREMENT_ID } from '../config';

let initialized = false;

// Deduplication: skip identical errors within 60 seconds
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 60_000;

function isDuplicate(key) {
  const now = Date.now();
  const lastSeen = recentErrors.get(key);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return true;
  recentErrors.set(key, now);
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

function gtagEvent(eventName, params) {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/**
 * Initialize crash tracking. Call once at app startup.
 * Requires gtag.js to be loaded via Bubble SEO header snippet.
 */
export function initFirebase() {
  if (initialized) return;
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Analytics] No GA_MEASUREMENT_ID configured — crash tracking disabled.');
    return;
  }
  if (typeof window.gtag !== 'function') {
    console.warn('[Analytics] gtag.js not loaded — crash tracking disabled.');
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
  const key = `crash:${message}`;
  if (isDuplicate(key)) return;

  console.error(`[Analytics] app_crash (${crashType}):`, message);
  gtagEvent('app_crash', {
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
 */
export function logError(category, error, context) {
  const message = truncate(error?.message || String(error));
  const key = `error:${category}:${message}`;
  if (isDuplicate(key)) return;

  console.warn(`[Analytics] app_error (${category}):`, message);
  gtagEvent('app_error', {
    error_message: message,
    category,
    context: truncate(context || '', 100),
    app_version: APP_VERSION,
  });
}

/**
 * Associate a user ID with GA4 (for filtering crashes by user).
 */
export function setFirebaseUser(userId) {
  if (!initialized || typeof window.gtag !== 'function') return;
  window.gtag('set', { user_id: userId });
}
