import { useMemo } from 'react';
import { NativelyStorage } from 'natively';

/**
 * Custom hook to interact with Natively's native storage.
 * Wraps the callback-based API in Promises for better React integration.
 *
 * Strategy:
 * - On localhost: skip NativelyStorage entirely, use localStorage (instant).
 * - On native device: use NativelyStorage with localStorage as backup.
 * - On Bubble web (no native bridge): NativelyStorage calls timeout after 1.5s,
 *   falls back to localStorage automatically.
 *
 * Writes always go to both storages so localStorage stays in sync.
 */
export const useNativelyStorage = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isNativelyAvailable = typeof NativelyStorage !== 'undefined' && !isLocalhost;

  const storage = useMemo(() => {
    if (isNativelyAvailable) {
        return new NativelyStorage();
    } else {
        if (isLocalhost) {
             console.log('🔧 Running on localhost: Forcing localStorage fallback (Instant).');
        } else {
             console.warn('⚠️ Natively SDK not found. Falling back to localStorage (Non-Production).');
        }
        return null;
    }
  }, []);

  const setItem = (key, value) => {
    // Always write to localStorage so it stays in sync as a fallback
    localStorage.setItem(key, value);
    if (storage) {
        storage.setStorageValue(key, value);
    }
  };

  const getItem = (key) => {
    return new Promise((resolve) => {
      if (storage) {
        // If native bridge doesn't respond within 1.5s, fall back to localStorage
        const timeout = setTimeout(() => {
            console.warn(`⏱️ [NativelyStorage] Timeout for "${key}", falling back to localStorage.`);
            resolve(localStorage.getItem(key));
        }, 1500);

        storage.getStorageValue(key, (resp) => {
            clearTimeout(timeout);
            console.log(`[NativelyStorage] Received value for ${resp.key}:`, resp.value);
            resolve(resp.value);
        });
      } else {
        const val = localStorage.getItem(key);
        console.log(`[LocalStorage Fallback] Received value for ${key}:`, val);
        resolve(val);
      }
    });
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

  // Probe: write a test key, read it back, report whether native bridge responded
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
