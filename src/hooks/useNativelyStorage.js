import { useMemo } from 'react';
import { NativelyStorage } from 'natively';

/**
 * Custom hook to interact with Natively's native storage.
 * Wraps the callback-based API in Promises for better React integration.
 */
export const useNativelyStorage = () => {
  // Check if Natively SDK is actually available in this environment
  // We also force fallback on localhost to avoid timeouts where the SDK might be injected but not functional
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
        return null; // Signals to use fallback logic
    }
  }, []);

  /**
   * Saves a value to native device storage.
   * @param {string} key - The unique key identifier
   * @param {string} value - The value to store
   */
  const setItem = (key, value) => {
    if (storage) {
        storage.setStorageValue(key, value);
    } else {
        localStorage.setItem(key, value);
    }
  };

  /**
   * Retrieves a value from native device storage.
   * @param {string} key - The unique key identifier
   * @returns {Promise<string|null>}
   */
  const getItem = (key) => {
    return new Promise((resolve) => {
      if (storage) {
        storage.getStorageValue(key, (resp) => {
            console.log(`[NativelyStorage] Received value for ${resp.key}:`, resp.value);
            resolve(resp.value);
        });
      } else {
        // Fallback for browser preview
        const val = localStorage.getItem(key);
        console.log(`[LocalStorage Fallback] Received value for ${key}:`, val);
        resolve(val);
      }
    });
  };

  /**
   * Removes a specific value from native device storage.
   * @param {string} key - The unique key identifier
   */
  const removeItem = (key) => {
    if (storage) {
        storage.removeStorageValue(key);
    } else {
        localStorage.removeItem(key);
    }
  };

  /**
   * Clears all data from the app's native storage.
   */
  const clear = () => {
    if (storage) {
        storage.resetStorage();
    } else {
        localStorage.clear();
    }
  };

  return {
    setItem,
    getItem,
    removeItem,
    clear,
  };
};
