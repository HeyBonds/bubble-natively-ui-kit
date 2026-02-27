import { useMemo, useCallback } from 'react';
import { NativelyStorage } from 'natively';

// Module-level: track which keys have been verified this session (shared across all hook instances)
const verified = new Set();

/**
 * useNativelyStorage — Fast reads via localStorage, durable writes via NativelyStorage.
 *
 * Strategy:
 * - Reads (getItem): If localStorage has a value, return it instantly and background-verify
 *   against NativelyStorage once per key per session. If localStorage is empty, wait for
 *   NativelyStorage (with timeout) to recover values after WebView cache clears.
 * - Writes: Always write to both localStorage (sync) and NativelyStorage (async).
 * - Outside Natively (web, preview): localStorage only — no native bridge to talk to.
 *
 * NativelyStorage uses window.$agent.trigger() to call native storage via the Natively
 * bridge. Each read is a JS→native→JS round-trip (~50-500ms). No batching API exists,
 * but concurrent reads via Promise.all() are supported.
 */
export const useNativelyStorage = () => {
  // Only use NativelyStorage when running inside the Natively native wrapper.
  // window.$agent is injected by the Natively SDK — absent in web browsers and preview.
  const isNativeApp = typeof window.$agent !== 'undefined';

  const storage = useMemo(() => {
    if (isNativeApp) {
        return new NativelyStorage();
    }
    return null;
  }, [isNativeApp]);

  const setItem = useCallback((key, value) => {
    localStorage.setItem(key, value);
    if (storage) {
        storage.setStorageValue(key, value);
    }
  }, [storage]);

  /**
   * getItem — Smart read with automatic recovery.
   *
   * If localStorage has a value: return it instantly, background-verify once per session.
   * If localStorage is empty AND NativelyStorage is available: wait for native response
   * (up to 2s) to recover from WebView cache clears. If native has the value, restore it
   * to localStorage and return it.
   */
  const getItem = useCallback((key) => {
    const localValue = localStorage.getItem(key);

    // Fast path: localStorage has a value — return immediately, verify in background
    if (localValue != null) {
        if (storage && !verified.has(key)) {
            verified.add(key);
            storage.getStorageValue(key, (resp) => {
                const nativeValue = resp.value;
                if (nativeValue != null && nativeValue !== localValue) {
                    console.log(`🔄 [Storage] Background reconciled "${key}": native="${nativeValue}" wins over local="${localValue}".`);
                    localStorage.setItem(key, nativeValue);
                }
            });
        }
        return Promise.resolve(localValue);
    }

    // Slow path: localStorage is empty — check NativelyStorage (recovery after cache clear)
    if (storage && !verified.has(key)) {
        verified.add(key);
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`⏱️ [Storage] Recovery timeout for "${key}" (2s). Returning null.`);
                resolve(null);
            }, 2000);

            storage.getStorageValue(key, (resp) => {
                clearTimeout(timeout);
                const nativeValue = resp.value;
                if (nativeValue != null) {
                    console.log(`🔄 [Storage] Recovered "${key}" from native="${nativeValue}".`);
                    localStorage.setItem(key, nativeValue);
                    resolve(nativeValue);
                } else {
                    resolve(null);
                }
            });
        });
    }

    return Promise.resolve(null);
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
  }), [setItem, getItem, removeItem, clear]);
};
