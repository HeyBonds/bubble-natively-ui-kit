import { useMemo } from 'react';
import { NativelyStorage } from 'natively';

// Module-level: track which keys have been verified this session (shared across all hook instances)
const verified = new Set();

/**
 * useNativelyStorage — Fast reads via localStorage, durable writes via NativelyStorage.
 *
 * Strategy:
 * - Reads: Return localStorage synchronously (instant). In the background, verify
 *   against NativelyStorage (once per key per session). If native has a different
 *   value, update localStorage. Handles the rare case where the OS clears the
 *   WebView's localStorage but native storage persists.
 * - Writes: Always write to both localStorage (sync) and NativelyStorage (async).
 * - On localhost: skip NativelyStorage entirely.
 */
export const useNativelyStorage = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isNativelyAvailable = typeof NativelyStorage !== 'undefined' && !isLocalhost;

  const storage = useMemo(() => {
    if (isNativelyAvailable) {
        return new NativelyStorage();
    } else {
        if (isLocalhost) {
             console.log('🔧 Storage: localhost → localStorage only (instant).');
        }
        return null;
    }
  }, [isNativelyAvailable, isLocalhost]);

  const setItem = (key, value) => {
    localStorage.setItem(key, value);
    if (storage) {
        storage.setStorageValue(key, value);
    }
  };

  /**
   * getItem — Returns localStorage value immediately (sync, wrapped in resolved Promise).
   * Kicks off a one-time background native read to reconcile if values ever diverge.
   */
  const getItem = (key) => {
    const localValue = localStorage.getItem(key);

    // Background verify: only once per key per session
    if (storage && !verified.has(key)) {
        verified.add(key);

        const timeout = setTimeout(() => {
            console.warn(`⏱️ [NativelyStorage] Background verify timeout for "${key}".`);
        }, 5000);

        storage.getStorageValue(key, (resp) => {
            clearTimeout(timeout);
            const nativeValue = resp.value;
            if (nativeValue != null && nativeValue !== localValue) {
                console.log(`🔄 [NativelyStorage] Reconciled "${key}": native="${nativeValue}" wins over local="${localValue}".`);
                localStorage.setItem(key, nativeValue);
            }
        });
    }

    return Promise.resolve(localValue);
  };

  const removeItem = (key) => {
    localStorage.removeItem(key);
    if (storage) {
        storage.removeStorageValue(key);
    }
  };

  const clear = () => {
    localStorage.clear();
    if (storage) {
        storage.resetStorage();
    }
  };

  // Probe: write a test key, read it back via native bridge to confirm it's working
  const probeNative = () => {
    return new Promise((resolve) => {
      if (!storage) {
        resolve('localStorage-only');
        return;
      }
      const testKey = '__natively_probe__';
      storage.setStorageValue(testKey, 'ok');

      const timeout = setTimeout(() => {
        resolve('timeout (localStorage fallback)');
      }, 1500);

      storage.getStorageValue(testKey, (resp) => {
        clearTimeout(timeout);
        storage.removeStorageValue(testKey);
        resolve(resp.value === 'ok' ? 'native bridge active' : `unexpected: ${resp.value}`);
      });
    });
  };

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    probeNative,
  };
};
