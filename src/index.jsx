// Initialize Global Namespace
window.appUI = window.appUI || {};

// --- GLOBAL SETUP (Runs immediately) ---
const initGlobals = () => {
    // 1. Inject Fonts
    const fonts = [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ];
    fonts.forEach(url => {
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    });

    // 2. Bubble Bridge Setup
    window.BubbleBridge = {
        send: (fnName, data) => {
            if (window[fnName]) window[fnName](data);
        }
    };
    // 3. Debug: reset all storage (localStorage + NativelyStorage) and reload
    window.appUI.resetAllStorage = () => {
        const keys = ['bonds_session_active', 'bonds_device_id', 'onboarding_complete', 'onboarding_state', 'credits_intro_seen'];
        keys.forEach(k => localStorage.removeItem(k));
        try {
            const ns = new NativelyStorage();
            keys.forEach(k => ns.removeStorageValue(k));
        } catch (e) { console.warn('NativelyStorage unavailable:', e.message); }
        window.location.reload();
    };

    console.log('🌍 Globals Initialized');
};
initGlobals();

import React from 'react';
import { createRoot } from 'react-dom/client';
import { NativelyStorage } from 'natively';
import App from './App';
import WelcomeScreen from './components/WelcomeScreen';
import DailyQuestion from './components/DailyQuestion';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import mockOnboardingSteps from './data/mockOnboardingSteps';
import JourneyPath from './components/JourneyPath';

// Expose mount functions for the Previewer / Bubble
window.appUI.mountMainApp = (container) => {
    const root = createRoot(container);
    root.render(<App />);
    return root;
};

window.appUI.mountWelcome = (container, props = {}) => {
    const root = createRoot(container);
    root.render(<WelcomeScreen {...props} />);
    return root;
};

window.appUI.mountDailyQuestion = (container, props = {}) => {
    const root = createRoot(container);
    root.render(<DailyQuestion {...props} />);
    return root;
};

window.appUI.mountOnboarding = (container, props = {}) => {
    const defaults = { steps: mockOnboardingSteps, credits: 0, showCredits: true };
    const root = createRoot(container);
    root.render(<OnboardingFlow {...defaults} {...props} />);
    return root;
};

window.appUI.mountJourney = (container, props = {}) => {
    const defaults = { credits: 5 };
    const root = createRoot(container);
    root.render(<JourneyPath {...defaults} {...props} />);
    return root;
};

// Auto-mount only if there's an explicit container for the Main App.
// Otherwise, just expose mount functions and let Bubble call them.
const appContainer = document.getElementById('app-content-area');
if (appContainer) {
    window.appUI.mountMainApp(appContainer);
    console.log('🚀 Main App Auto-Mounted into #app-content-area');
} else {
    console.log('📦 UI Kit loaded. Mount functions ready on window.appUI');
}
