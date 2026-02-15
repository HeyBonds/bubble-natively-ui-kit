import React, { useState, useEffect } from 'react';
import { useNativelyStorage } from '../hooks/useNativelyStorage';

/**
 * NativeStorageManager
 * Production-ready interface for managing native device storage.
 */
const NativeStorageManager = () => {
  const { setItem, getItem, removeItem, clear } = useNativelyStorage();
  const [currentUserId, setCurrentUserId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('');

  const STORAGE_KEY = 'bubble_current_user_id';

  // Load the stored user ID on mount
  useEffect(() => {
    refreshStoredValue();
  }, []);

  const refreshStoredValue = async () => {
    try {
      const value = await getItem(STORAGE_KEY);
      setCurrentUserId(value || 'Not set');
    } catch (err) {
      console.error('Failed to get storage value:', err);
      setStatus('Error retrieving value');
    }
  };

  const handleSave = () => {
    if (!inputValue) {
      setStatus('Please enter a value');
      return;
    }
    setItem(STORAGE_KEY, inputValue);
    setStatus(`Updated Current User ID: ${inputValue}`);
    setInputValue('');
    // Refresh after a short delay since native calls might be async
    setTimeout(refreshStoredValue, 500);
  };

  const handleRemove = () => {
    removeItem(STORAGE_KEY);
    setStatus('User ID removed from device');
    setTimeout(refreshStoredValue, 500);
  };

  const handleClear = () => {
    clear();
    setStatus('All native storage data cleared');
    setTimeout(refreshStoredValue, 500);
  };

  return (
    <div className="p-6 text-white space-y-6 max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-xl font-bold mb-2 text-[#FF2258]">Native Storage</h2>
        <p className="text-sm text-white/60 mb-6">
          Manage persistent data stored directly on this device.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-black/20 rounded-xl border border-white/10 space-y-3">
            <div>
                <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">Current User ID</span>
                <span className="text-sm font-mono text-white break-all">{currentUserId}</span>
            </div>
            <div className="pt-3 border-t border-white/5">
                <span className="text-xs text-[#FF2258] uppercase tracking-wider block mb-1">Device ID (Mixpanel)</span>
                <span className="text-xs font-mono text-white/80 break-all" id="debug-device-id">
                    {/* Fetched dynamically or via separate state if needed, simpler to just show it if we add it to state */}
                    (See App Debug Overlay)
                </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-wider block">Set New User ID</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter User ID"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF2258]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSave}
              className="bg-[#FF2258] hover:bg-[#FF2258]/80 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#FF2258]/20"
            >
              Update ID
            </button>
            <button
              onClick={handleRemove}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all active:scale-95 border border-white/10"
            >
              Remove
            </button>
          </div>

          <button
            onClick={handleClear}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium py-2 rounded-xl transition-all border border-red-500/20 text-xs"
          >
            Clear All Data
          </button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-[#FF2258]/10 rounded-lg text-center border border-[#FF2258]/20 animate-fade-in">
            <span className="text-xs text-white/90">{status}</span>
          </div>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Native Infrastructure</h3>
        <p className="text-[11px] text-white/50 leading-relaxed">
          This system interfaces with the device's native storage layer via the Natively SDK. 
          Data persisted here remains available across app restarts and is isolated from traditional browser cache.
        </p>
      </div>
    </div>
  );
};

export default NativeStorageManager;
