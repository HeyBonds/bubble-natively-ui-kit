import React, { useState, useEffect, useCallback, useRef } from 'react';
import mixpanel from 'mixpanel-browser';
import WelcomeScreen from './components/WelcomeScreen';
import MainTabs from './components/MainTabs';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import mockOnboardingSteps from './data/mockOnboardingSteps';
import { useNativelyStorage } from './hooks/useNativelyStorage';
import { THEMES, getSystemTheme } from './theme';

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
    const [displayedPhase, setDisplayedPhase] = useState('loading');
    const [animClass, setAnimClass] = useState('');
    const [deviceId, setDeviceId] = useState(null);
    const transitionRef = useRef(false);
    const displayedPhaseRef = useRef('loading');

    const { getItem, setItem, removeItem, reconcile } = useNativelyStorage();
    const SESSION_KEY = 'bonds_session_active';
    const DEVICE_ID_KEY = 'bonds_device_id';
    const ONBOARDING_KEY = 'onboarding_complete';

    // Theme resolution — defaults to 'system' (OS preference) during onboarding
    const [darkModePref, setDarkModePref] = useState(() => localStorage.getItem('bonds_dark_mode') || 'system');
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    useEffect(() => {
        getItem('bonds_dark_mode').then(val => {
            if (val) setDarkModePref(prev => val !== prev ? val : prev);
        });
    }, [getItem]);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const themeKey = darkModePref === 'on' ? 'dark' : darkModePref === 'off' ? 'light' : systemTheme;
    const theme = THEMES[themeKey];

    // Animated phase transition (uses ref to avoid stale closure)
    const transitionTo = useCallback((nextPhase) => {
        if (transitionRef.current) return;
        const fromPhase = displayedPhaseRef.current;
        if (fromPhase === nextPhase) return;

        // Loading → anything: no exit animation, just enter
        if (fromPhase === 'loading') {
            displayedPhaseRef.current = nextPhase;
            setDisplayedPhase(nextPhase);
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
            setAnimClass(t.enter);
            transitionRef.current = false;
        }, t.exitDuration);
    }, []);

    useEffect(() => {
        const initializeAnalytics = async () => {
            try {
                const token = window.APP_CONFIG?.MIXPANEL_TOKEN;
                if (!token) {
                    console.warn('⚠️ Mixpanel Token NOT found in window.APP_CONFIG. Analytics disabled.');
                    return;
                }

                mixpanel.init(token, { debug: true, track_pageview: false, persistence: 'localStorage' });
                console.log('📊 Mixpanel Initialized');

                let storedId = await getItem(DEVICE_ID_KEY);

                if (storedId) {
                    if (storedId.startsWith('$device:')) {
                        storedId = storedId.replace(/^\$device:/, '');
                        await setItem(DEVICE_ID_KEY, storedId);
                    }
                    mixpanel.identify(storedId);
                } else {
                    const rawId = mixpanel.get_distinct_id();
                    storedId = rawId.replace(/^\$device:/, '');
                    await setItem(DEVICE_ID_KEY, storedId);
                    mixpanel.identify(storedId);
                }

                setDeviceId(storedId);
            } catch (err) {
                console.error('❌ Analytics Init Failed:', err);
            }
        };

        const checkSession = async () => {
            try {
                // Wait for NativelyStorage to reconcile critical keys before deciding.
                // This prevents stale localStorage (cleared by OS) from sending users
                // to the wrong screen. Resolves in ~50-500ms, times out at 2s.
                await reconcile([SESSION_KEY, ONBOARDING_KEY, DEVICE_ID_KEY, 'onboarding_state']);

                const sessionResult = localStorage.getItem(SESSION_KEY);
                const obResult = localStorage.getItem(ONBOARDING_KEY);
                const onboardingState = localStorage.getItem('onboarding_state');

                console.log(`📋 [App] Session check — session=${sessionResult}, onboarding=${obResult}, state=${onboardingState ? 'saved' : 'none'}`);

                if (sessionResult === 'true') {
                    transitionTo(obResult === 'true' ? 'main' : 'onboarding');
                } else if (onboardingState) {
                    setItem(SESSION_KEY, 'true');
                    transitionTo('onboarding');
                } else {
                    transitionTo('welcome');
                }
            } catch (err) {
                console.error('❌ App: Failed to check session:', err);
                transitionTo('welcome');
            }
        };

        initializeAnalytics();

        window.appUI = window.appUI || {};
        window.appUI.setLoginState = (isLogged) => {
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
    }, [getItem, setItem, removeItem, reconcile, transitionTo]);

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

    if (displayedPhase === 'loading') {
        return (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center font-jakarta">
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
        credits: 23,
        dailyQuestion: {
            category: 'Time Together',
            question: 'How much intentional one-on-one time do you have in a typical week?',
            options: [
                { text: 'Less than 1 hour', percent: 10, index: 1 },
                { text: '1-3 hours', percent: 45, index: 2 },
                { text: '3-5 hours', percent: 30, index: 3 },
                { text: 'More than 5 hours', percent: 15, index: 4 },
            ],
            selectedAnswer: null,
        },
    };

    return (
        <div className="absolute inset-0">
            <div className={`w-full h-full ${animClass}`}>
                {displayedPhase === 'welcome' && (
                    <WelcomeScreen deviceId={deviceId} onAction={handleWelcomeAction} />
                )}
                {displayedPhase === 'onboarding' && (
                    <OnboardingFlow
                        steps={mockOnboardingSteps}
                        credits={0}
                        showCredits={true}
                        theme={theme}
                        onComplete={handleOnboardingComplete}
                        onBack={() => transitionTo('welcome')}
                    />
                )}
                {displayedPhase === 'main' && (
                    <MainTabs userProps={userProps} />
                )}
            </div>
        </div>
    );
};

export default App;
