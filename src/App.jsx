import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SignInScreen from './components/SignInScreen';
import MainTabs from './components/MainTabs';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import mockOnboardingSteps from './data/mockOnboardingSteps';
import { useNativelyStorage } from './hooks/useNativelyStorage';
import { THEMES, getSystemTheme } from './theme';
import { UserProvider, useUser } from './contexts/UserContext';
import { DailyQuestionProvider, useDailyQuestion } from './contexts/DailyQuestionContext';
import NetworkBanner from './components/NetworkBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { logError } from './utils/firebase';
import { initAnalytics, track, screen, resetIdentity } from './utils/analytics';

// Transition map: [fromPhase][toPhase] → { exit, enter, exitDuration }
const TRANSITIONS = {
    welcome: {
        signin:     { exit: 'phase-fade-out', enter: 'phase-slide-up', exitDuration: 300 },
        onboarding: { exit: 'phase-zoom-out', enter: 'phase-slide-up', exitDuration: 450 },
        main:       { exit: 'phase-zoom-out', enter: 'phase-scale-in', exitDuration: 450 },
    },
    signin: {
        welcome:    { exit: 'phase-slide-down', enter: 'phase-zoom-in', exitDuration: 400 },
        main:       { exit: 'phase-zoom-out', enter: 'phase-scale-in', exitDuration: 450 },
        onboarding: { exit: 'phase-zoom-out', enter: 'phase-slide-up', exitDuration: 450 },
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

const AppInner = () => {
    const { clearUser } = useUser();
    const { clearDailyQuestion } = useDailyQuestion();
    const [displayedPhase, setDisplayedPhase] = useState('loading');
    const [animClass, setAnimClass] = useState('');
    const transitionRef = useRef(false);
    const displayedPhaseRef = useRef('loading');

    const { getItem, setItem, removeItem } = useNativelyStorage();
    const SESSION_KEY = 'bonds_session_active';
    const ONBOARDING_KEY = 'onboarding_complete';
    const AUTH_PENDING_KEY = 'bonds_auth_pending';

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
        try {
            initAnalytics();
            track('App Opened');
        } catch (err) {
            console.error('[App] Analytics init failed:', err);
            logError('init', err, 'initAnalytics');
        }

        const checkSession = async () => {
            try {
                // getItem returns localStorage instantly if available, or waits for
                // NativelyStorage recovery (up to 2s) when localStorage is empty.
                const [sessionResult, obResult, onboardingState] = await Promise.all([
                    getItem(SESSION_KEY),
                    getItem(ONBOARDING_KEY),
                    getItem('onboarding_state'),
                ]);

                // If setLoginState already fired while we were waiting for storage,
                // don't override — it already transitioned us to the correct phase.
                if (displayedPhaseRef.current !== 'loading') {
                    console.log(`📋 [App] Session check skipped — already transitioned to ${displayedPhaseRef.current}`);
                    return;
                }

                console.log(`📋 [App] Session check — session=${sessionResult}, onboarding=${obResult}, state=${onboardingState ? 'saved' : 'none'}`);

                if (sessionResult === 'true') {
                    const dest = obResult === 'true' ? 'main' : 'onboarding';
                    if (dest === 'onboarding') screen('onboarding');
                    transitionTo(dest);
                } else if (onboardingState) {
                    // Staleness check: if the Bubble session UID changed, the
                    // anonymous user may have expired — clear onboarding state.
                    try {
                        const saved = JSON.parse(onboardingState);
                        const currentUid = window.bubble_session_uid;
                        if (saved.bubble_session_uid && currentUid && saved.bubble_session_uid !== currentUid) {
                            console.log('[App] Stale onboarding session detected — clearing');
                            removeItem('onboarding_state');
                            transitionTo('welcome');
                            screen('welcome');
                            return;
                        }
                    } catch { /* ignore parse errors, proceed with resume */ }
                    try {
                        const saved = JSON.parse(onboardingState);
                        track('Onboarding Resumed', { step: saved.currentStep || 0 });
                    } catch { /* ignore */ }
                    setItem(SESSION_KEY, 'true');
                    screen('onboarding');
                    transitionTo('onboarding');
                } else if (localStorage.getItem(AUTH_PENDING_KEY) === 'true') {
                    // OAuth redirect just happened — stay on loading until setLoginState fires.
                } else {
                    screen('welcome');
                    transitionTo('welcome');
                }
            } catch (err) {
                console.error('❌ App: Failed to check session:', err);
                logError('init', err, 'checkSession');
                if (displayedPhaseRef.current === 'loading') transitionTo('welcome');
            }
        };

        window.appUI = window.appUI || {};
        window.appUI.setLoginState = (isLogged) => {
            console.log(`🔑 [Auth] setLoginState called: isLogged=${isLogged}, currentPhase=${displayedPhaseRef.current}`);
            localStorage.removeItem(AUTH_PENDING_KEY);
            if (isLogged) {
                setItem(SESSION_KEY, 'true');
                setItem(ONBOARDING_KEY, 'true');
                transitionTo('main');
            } else {
                removeItem(SESSION_KEY);
                transitionTo('welcome');
            }
        };

        checkSession();
    }, [getItem, setItem, removeItem, transitionTo]);

    const handleWelcomeAction = (action) => {
        if (action === 'go') {
            setItem(SESSION_KEY, 'true');
            screen('onboarding');
            transitionTo('onboarding');
        } else if (action === 'signin') {
            screen('signin');
            transitionTo('signin');
        }
    };

    const handleOnboardingComplete = () => {
        setItem(ONBOARDING_KEY, 'true');
        transitionTo('main');
    };

    const handleLogout = () => {
        track('Logged Out');
        resetIdentity();
        clearUser();
        clearDailyQuestion();
        removeItem(SESSION_KEY);
        removeItem(ONBOARDING_KEY);
        removeItem('onboarding_state');
        removeItem('bonds_dark_mode');
        screen('welcome');
        transitionTo('welcome');
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

    return (
        <div className="absolute inset-0">
            <NetworkBanner theme={theme} />
            <div className={`w-full h-full ${animClass}`}>
                {displayedPhase === 'welcome' && (
                    <WelcomeScreen onAction={handleWelcomeAction} />
                )}
                {displayedPhase === 'signin' && (
                    <SignInScreen
                        theme={theme}
                        onBack={() => transitionTo('welcome')}
                    />
                )}
                {displayedPhase === 'onboarding' && (
                    <OnboardingFlow
                        steps={mockOnboardingSteps}
                        coins={0}
                        showCoins={true}
                        theme={theme}
                        onComplete={handleOnboardingComplete}
                        onBack={() => { track('Onboarding Abandoned'); screen('welcome'); transitionTo('welcome'); }}
                    />
                )}
                {displayedPhase === 'main' && (
                    <MainTabs onLogout={handleLogout} />
                )}
            </div>
        </div>
    );
};

const App = () => (
    <ErrorBoundary>
        <UserProvider>
            <DailyQuestionProvider>
                <AppInner />
            </DailyQuestionProvider>
        </UserProvider>
    </ErrorBoundary>
);

export default App;
