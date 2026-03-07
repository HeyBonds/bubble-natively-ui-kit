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

export function initFirebase() {
  if (analytics) return;
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

export function setFirebaseUser(userId) {
  if (!analytics) return;
  setUserId(analytics, userId);
}
