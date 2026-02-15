import React, { useState, useEffect } from 'react';
import mixpanel from 'mixpanel-browser'; // Import Mixpanel
import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './components/MainTabs';
import { useNativelyStorage } from './hooks/useNativelyStorage';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [debugMode, setDebugMode] = useState(false);
    const [deviceId, setDeviceId] = useState(null); // Store the "Shadow" Device ID
    
    // Natively Storage for persistence
    const { getItem, setItem, removeItem } = useNativelyStorage();
    const SESSION_KEY = 'bonds_session_active';
    const DEVICE_ID_KEY = 'bonds_device_id';

    useEffect(() => {
        // 1. Initialize Mixpanel & Identity
        initializeAnalytics();

        // 2. Expose global bridge for Bubble
        window.appUI = window.appUI || {};
        
        window.appUI.setLoginState = (isLogged) => {
            console.log(`🔑 Bubble Setting Login State: ${isLogged}`);
            setIsLoggedIn(isLogged);
            // Persist state
            if (isLogged) {
                setItem(SESSION_KEY, 'true');
            } else {
                removeItem(SESSION_KEY);
            }
        };

        // 3. Check for existing session on mount
        checkSession();
    }, []);

    const initializeAnalytics = async () => {
        try {
            // Get Token from Runtime Config (Bubble Header or Local Config)
            const token = window.APP_CONFIG?.MIXPANEL_TOKEN;
            
            if (token) {
                mixpanel.init(token, { debug: true, track_pageview: false, persistence: 'localStorage' });
                console.log('📊 Mixpanel Initialized');
                
                // --- Device ID Strategy ---
                // 1. Try to get ID from Native Storage (Persistent)
                // 1. Try to get ID from Native Storage (Persistent)
                let storedId = await getItem(DEVICE_ID_KEY);

                if (storedId) {
                    // MIGRATION FIX: Check if we have a polluted ID (starts with $device:)
                    if (storedId.startsWith('$device:')) {
                        console.log('🧹 Cleaning polluted Device ID:', storedId);
                        storedId = storedId.replace(/^\$device:/, '');
                        await setItem(DEVICE_ID_KEY, storedId); // Re-save clean version
                    }
                    
                    // 3. Keep existing identity
                    console.log('📂 Loaded Existing Device ID:', storedId);
                    mixpanel.identify(storedId);
                } else {
                     // 2. If missing, get Mixpanel's auto-generated distinct_id
                    const rawId = mixpanel.get_distinct_id();
                    // Strip the $device: prefix if present to promote it to a User ID
                    storedId = rawId.replace(/^\$device:/, '');
                    
                    console.log('🆕 Generated New Device ID:', storedId, '(Raw:', rawId, ')');
                    await setItem(DEVICE_ID_KEY, storedId);
                    
                    // Identify immediately to "claim" this ID as a user
                    mixpanel.identify(storedId);
                }

                setDeviceId(storedId);
            } else {
                console.warn('⚠️ Mixpanel Token NOT found in window.APP_CONFIG. Analytics disabled.');
            }
        } catch (err) {
            console.error('❌ Analytics Init Failed:', err);
        }
    };

    const checkSession = async () => {
        try {
            console.log('🔄 App: Starting session check...');
            // Add a timeout race condition to prevent hanging
            const sessionPromise = getItem(SESSION_KEY);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 2000));
            
            const result = await Promise.race([sessionPromise, timeoutPromise]);
            
            console.log(`💾 App: Session check result: ${result}`);
            
            if (result === 'timeout') {
                console.warn('⚠️ App: Storage check timed out. Defaulting to logged out.');
            } else if (result === 'true') {
                setIsLoggedIn(true);
            }
        } catch (err) {
            console.error('❌ App: Failed to check session:', err);
        } finally {
            console.log('✅ App: Loading finished. Rendering UI.');
            setIsLoading(false);
        }
    };

    const handleDebugClick = (e) => {
        if (e.detail === 3) {
            setDebugMode(!debugMode);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full min-h-screen bg-black flex flex-col items-center justify-center font-jakarta">
                <div className="animate-pulse flex flex-col items-center">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4">
                        <circle cx="32" cy="32" r="32" fill="white" opacity="0.2" />
                        <rect x="24" y="24" width="16" height="16" fill="#FF2258" className="animate-spin-slow" />
                    </svg>
                    <span className="text-white/40 text-xs tracking-widest uppercase">Loading Bonds...</span>
                </div>
            </div>
        );
    }

    const userProps = {
        userName: 'Jonathan',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        credits: 23
    };

    return (
        <div className="w-full h-full" onClick={handleDebugClick}>
            {isLoggedIn ? (
                <MainTabs userProps={userProps} />
            ) : (
                <WelcomeScreen deviceId={deviceId} /> 
            )}

            {/* Debug Info */}
            {debugMode && (
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 scale-75 origin-top-right">
                    <div className="bg-black/80 text-white p-2 text-[10px] font-mono rounded border border-white/20">
                        <p>Status: {isLoggedIn ? 'LOGGED IN' : 'ANONYMOUS'}</p>
                        <p>Device ID: {deviceId || 'Loading...'}</p>
                    </div>
                     <button 
                        onClick={() => window.appUI.setLoginState(!isLoggedIn)}
                        className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        Toggle Auth
                    </button>
                    <button 
                         onClick={() => {
                             removeItem(SESSION_KEY);
                             removeItem(DEVICE_ID_KEY); // Clear everything
                             window.location.reload();
                         }}
                         className="bg-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono"
                    >
                        Reset All Storage
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
