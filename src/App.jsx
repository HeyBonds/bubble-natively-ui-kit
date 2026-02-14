import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './components/MainTabs';
import { useNativelyStorage } from './hooks/useNativelyStorage';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [debugMode, setDebugMode] = useState(false); // For local testing
    
    // Natively Storage for persistence
    const { getItem, setItem, removeItem } = useNativelyStorage();
    const SESSION_KEY = 'bonds_session_active';

    useEffect(() => {
        // 1. Expose global bridge for Bubble
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

        // 2. Check for existing session on mount
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            console.log('🔄 App: Starting session check...');
            // Add a timeout race condition to prevent hanging if storage never returns
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

    // Toggle Debug Mode (Triple click handler helper)
    const handleDebugClick = (e) => {
        if (e.detail === 3) {
            setDebugMode(!debugMode);
        }
    };

    // --- RENDER ---

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

    // Mock Data for Main User
    const userProps = {
        userName: 'Jonathan',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        credits: 23
    };

    return (
        <div className="w-full h-full" onClick={handleDebugClick}>
            {/* Conditional Routing */}
            {isLoggedIn ? (
                <MainTabs userProps={userProps} />
            ) : (
                <WelcomeScreen />
            )}

            {/* Debug Floating Toggle (Visible only if enabled via triple click or generic hidden trigger) */}
            {debugMode && (
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
                    <button 
                        onClick={() => window.appUI.setLoginState(!isLoggedIn)}
                        className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        [Debug] Toggle Auth: {isLoggedIn ? 'ON' : 'OFF'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
