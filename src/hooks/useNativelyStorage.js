import { useMemo, useCallback } from 'react';
import { NativelyStorage } from 'natively';

// Module-level: track which keys have been verified this session (shared across all hook instances)
const verified = new Set();

/**
 * useNativelyStorage — Fast reads via localStorage, durable writes via NativelyStorage.
 *
 * Strategy:
 * - Reads (getItem): Return localStorage value instantly. Background-verify against
 *   NativelyStorage once per key per session.
 * - Critical reads (reconcile): Wait for NativelyStorage response (with timeout) before
 *   returning. Use this at startup for session-critical keys.
 * - Writes: Always write to both localStorage (sync) and NativelyStorage (async).
 * - On localhost: skip NativelyStorage entirely.
 *
 * NativelyStorage uses window.$agent.trigger() to call native storage via the Natively
 * bridge. Each read is a JS→native→JS round-trip (~50-500ms). No batching API exists,
 * but concurrent reads via Promise.all() are supported.
 */
export const useNativelyStorage = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isNativelyAvailable = typeof NativelyStorage !== 'undefined' && !isLocalhost;

  const storage = useMemo(() => {
    if (isNativelyAvailable) {
        return new NativelyStorage();
    } else {
        if (isLocalhost) {
             console.log('🔧 Storage: localhost → localStorage only.');
        }
        return null;
    }
  }, [isNativelyAvailable, isLocalhost]);

  const setItem = useCallback((key, value) => {
    localStorage.setItem(key, value);
    if (storage) {
        storage.setStorageValue(key, value);
    }
  }, [storage]);

  /**
   * getItem — Returns localStorage value immediately (sync, wrapped in resolved Promise).
   * Kicks off a one-time background native read to reconcile if values ever diverge.
   */
  const getItem = useCallback((key) => {
    const localValue = localStorage.getItem(key);

    // Background verify: only once per key per session
    if (storage && !verified.has(key)) {
        verified.add(key);

        const timeout = setTimeout(() => {
            console.warn(`⏱️ [Storage] Background verify timeout for "${key}" (5s).`);
        }, 5000);

        storage.getStorageValue(key, (resp) => {
            clearTimeout(timeout);
            const nativeValue = resp.value;
            if (nativeValue != null && nativeValue !== localValue) {
                console.log(`🔄 [Storage] Reconciled "${key}": native="${nativeValue}" wins over local="${localValue}".`);
                localStorage.setItem(key, nativeValue);
            }
        });
    }

    return Promise.resolve(localValue);
  }, [storage]);

  /**
   * reconcile — Wait for NativelyStorage to respond for a set of critical keys.
   * Updates localStorage with native values where they differ (native wins).
   * Returns a Promise that resolves when all keys are reconciled or timeout fires.
   *
   * Use this BEFORE making session-critical decisions (e.g. which screen to show).
   * Typical latency: 50-500ms. Timeout: 2s (falls back to localStorage values).
   */
  const reconcile = useCallback((keys) => {
    if (!storage) {
        console.log('🔧 [Storage] No native bridge — using localStorage values.');
        return Promise.resolve();
    }

    console.log(`🔄 [Storage] Reconciling ${keys.length} keys from NativelyStorage...`);
    const start = Date.now();

    return new Promise((resolve) => {
        let settled = false;
        let remaining = keys.length;

        const finish = (reason) => {
            if (settled) return;
            settled = true;
            const ms = Date.now() - start;
            console.log(`✅ [Storage] Reconciliation ${reason} in ${ms}ms.`);
            // Mark all keys as verified so background getItem skips them
            keys.forEach(k => verified.add(k));
            resolve();
        };

        // Timeout: don't block the app longer than 2s
        const timeout = setTimeout(() => finish('timed out'), 2000);

        keys.forEach((key) => {
            const localValue = localStorage.getItem(key);

            storage.getStorageValue(key, (resp) => {
                const nativeValue = resp.value;
                if (nativeValue != null && nativeValue !== localValue) {
                    console.log(`🔄 [Storage] "${key}": native="${nativeValue}" wins over local="${localValue}".`);
                    localStorage.setItem(key, nativeValue);
                } else if (nativeValue == null && localValue != null) {
                    // localStorage has value but native doesn't — seed native
                    console.log(`📤 [Storage] "${key}": seeding native from local="${localValue}".`);
                    storage.setStorageValue(key, localValue);
                }
                remaining--;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    finish('complete');
                }
            });
        });
    });
  }, [storage]);

  const removeItem = useCallback((key) => {
    localStorage.removeItem(key);
    if (storage) {
        storage.removeStorageValue(key);
    }
  }, [storage]);

  const clear = useCallback(() => {
    localStorage.clear();
    if (storage) {
        storage.resetStorage();
    }
  }, [storage]);

  return useMemo(() => ({
    setItem,
    getItem,
    removeItem,
    clear,
    reconcile,
  }), [setItem, getItem, removeItem, clear, reconcile]);
};
