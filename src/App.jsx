import React, { useState, useEffect, useCallback, useRef } from 'react';
import mixpanel from 'mixpanel-browser';
import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './components/MainTabs';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import mockOnboardingSteps from './data/mockOnboardingSteps';
import { useNativelyStorage } from './hooks/useNativelyStorage';

// Transition map: [fromPhase][toPhase] → { exit, enter, exitDuration }
const TRANSITIONS = {
    welcome: {
        onboarding: { exit: 'phase-zoom-out', enter: 'phase-slide-up', exitDuration: 450 },
        main:       { exit: 'phase-zoom-out', enter: 'phase-scale-in', exitDuration: 450 },
    },
    onboarding: {
        main:       { exit: 'phase-complete-out', enter: 'phase-scale-in', exitDuration: 600 },
        welcome:    { exit: 'phase-slide-down', enter: 'phase-zoom-in', exitDuration: 400 },
    },
    main: {
        welcome:    { exit: 'phase-fade-out', enter: 'phase-fade-in', exitDuration: 300 },
        onboarding: { exit: 'phase-fade-out', enter: 'phase-slide-up', exitDuration: 300 },
    },
};

const DEFAULT_TRANSITION = { exit: 'phase-fade-out', enter: 'phase-fade-in', exitDuration: 300 };

const App = () => {
    const [appPhase, setAppPhase] = useState('loading');
    const [displayedPhase, setDisplayedPhase] = useState('loading');
    const [animClass, setAnimClass] = useState('');
    const [debugMode, setDebugMode] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const transitionRef = useRef(false);
    const displayedPhaseRef = useRef('loading');

    const { getItem, setItem, removeItem } = useNativelyStorage();
    const SESSION_KEY = 'bonds_session_active';
    const DEVICE_ID_KEY = 'bonds_device_id';
    const ONBOARDING_KEY = 'onboarding_complete';

    // Animated phase transition (uses ref to avoid stale closure)
    const transitionTo = useCallback((nextPhase) => {
        if (transitionRef.current) return;
        const fromPhase = displayedPhaseRef.current;
        if (fromPhase === nextPhase) return;

        // Loading → anything: no exit animation, just enter
        if (fromPhase === 'loading') {
            displayedPhaseRef.current = nextPhase;
            setDisplayedPhase(nextPhase);
            setAppPhase(nextPhase);
            setAnimClass('phase-fade-in');
            return;
        }

        const t = TRANSITIONS[fromPhase]?.[nextPhase] || DEFAULT_TRANSITION;
        transitionRef.current = true;

        // 1. Play exit animation on current phase
        setAnimClass(t.exit);

        // 2. After exit completes, swap content + play enter
        setTimeout(() => {
            displayedPhaseRef.current = nextPhase;
            setDisplayedPhase(nextPhase);
            setAppPhase(nextPhase);
            setAnimClass(t.enter);
            transitionRef.current = false;
        }, t.exitDuration);
    }, []);

    useEffect(() => {
        initializeAnalytics();

        window.appUI = window.appUI || {};

        window.appUI.setLoginState = (isLogged) => {
            console.log(`🔑 Bubble Setting Login State: ${isLogged}`);
            if (isLogged) {
                setItem(SESSION_KEY, 'true');
                getItem(ONBOARDING_KEY).then(ob => {
                    transitionTo(ob === 'true' ? 'main' : 'onboarding');
                });
            } else {
                removeItem(SESSION_KEY);
                transitionTo('welcome');
            }
        };

        checkSession();
    }, []);

    const initializeAnalytics = async () => {
        try {
            const token = window.APP_CONFIG?.MIXPANEL_TOKEN;

            if (token) {
                mixpanel.init(token, { debug: true, track_pageview: false, persistence: 'localStorage' });
                console.log('📊 Mixpanel Initialized');

                let storedId = await getItem(DEVICE_ID_KEY);

                if (storedId) {
                    if (storedId.startsWith('$device:')) {
                        console.log('🧹 Cleaning polluted Device ID:', storedId);
                        storedId = storedId.replace(/^\$device:/, '');
                        await setItem(DEVICE_ID_KEY, storedId);
                    }
                    console.log('📂 Loaded Existing Device ID:', storedId);
                    mixpanel.identify(storedId);
                } else {
                    const rawId = mixpanel.get_distinct_id();
                    storedId = rawId.replace(/^\$device:/, '');
                    console.log('🆕 Generated New Device ID:', storedId, '(Raw:', rawId, ')');
                    await setItem(DEVICE_ID_KEY, storedId);
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
            const sessionPromise = getItem(SESSION_KEY);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), 2000));

            const sessionResult = await Promise.race([sessionPromise, timeoutPromise]);

            console.log(`💾 App: Session check result: ${sessionResult}`);

            if (sessionResult === 'timeout') {
                console.warn('⚠️ App: Storage check timed out. Defaulting to welcome.');
                transitionTo('welcome');
            } else if (sessionResult === 'true') {
                const obResult = await getItem(ONBOARDING_KEY);
                transitionTo(obResult === 'true' ? 'main' : 'onboarding');
            } else {
                transitionTo('welcome');
            }
        } catch (err) {
            console.error('❌ App: Failed to check session:', err);
            transitionTo('welcome');
        } finally {
            console.log('✅ App: Loading finished. Rendering UI.');
        }
    };

    const handleWelcomeAction = (action) => {
        if (action === 'go') {
            setItem(SESSION_KEY, 'true');
            transitionTo('onboarding');
        } else if (action === 'signin') {
            setItem(SESSION_KEY, 'true');
            setItem(ONBOARDING_KEY, 'true');
            transitionTo('main');
        }
    };

    const handleOnboardingComplete = () => {
        setItem(ONBOARDING_KEY, 'true');
        transitionTo('main');
    };

    const handleDebugClick = (e) => {
        if (e.detail === 3) {
            setDebugMode(!debugMode);
        }
    };

    if (displayedPhase === 'loading') {
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
            {/* Animated phase wrapper */}
            <div className={`w-full h-full ${animClass}`}>
                {displayedPhase === 'welcome' && (
                    <WelcomeScreen deviceId={deviceId} onAction={handleWelcomeAction} />
                )}
                {displayedPhase === 'onboarding' && (
                    <OnboardingFlow
                        steps={mockOnboardingSteps}
                        credits={0}
                        showCredits={true}
                        onComplete={handleOnboardingComplete}
                        onBack={() => transitionTo('welcome')}
                    />
                )}
                {displayedPhase === 'main' && (
                    <MainTabs userProps={userProps} />
                )}
            </div>

            {/* Debug Overlay */}
            {debugMode && (
                <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 scale-75 origin-top-right">
                    <div className="bg-black/80 text-white p-2 text-[10px] font-mono rounded border border-white/20">
                        <p>Phase: {appPhase.toUpperCase()}</p>
                        <p>Device ID: {deviceId || 'Loading...'}</p>
                    </div>
                    <button
                        onClick={() => transitionTo('welcome')}
                        className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        → Welcome
                    </button>
                    <button
                        onClick={() => transitionTo('onboarding')}
                        className="bg-purple-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        → Onboarding
                    </button>
                    <button
                        onClick={() => transitionTo('main')}
                        className="bg-green-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        → Main
                    </button>
                    <button
                        onClick={() => {
                            removeItem(SESSION_KEY);
                            removeItem(DEVICE_ID_KEY);
                            removeItem(ONBOARDING_KEY);
                            localStorage.removeItem('onboarding_state');
                            window.location.reload();
                        }}
                        className="bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow-lg font-mono opacity-80 hover:opacity-100"
                    >
                        Reset All Storage
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
