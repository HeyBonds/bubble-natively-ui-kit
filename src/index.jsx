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

    // 2. Bubble Bridge Setup with Auto-Stringify
    window.BubbleBridge = {
        send: (fnName, data) => {
            const payload = (typeof data === 'object' && data !== null) 
                ? JSON.stringify(data) 
                : data;
            console.log(`📤 Sending to Bubble [${fnName}]:`, payload);
            if (window[fnName]) window[fnName](payload); 
        }
    };
    console.log('🌍 Globals Initialized');
};
initGlobals();

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import WelcomeScreen from './components/WelcomeScreen';
import DailyQuestion from './components/DailyQuestion';

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

// Check if we should auto-mount (e.g., in production or standalone)
// If we are in the previewer, 'component-selector' exists.
if (!document.getElementById('component-selector')) {
    // We are likely in Bubble or a standalone page
    // Try to find a root, or create one
    let container = document.getElementById('app-content-area');
    if (!container) {
        container = document.createElement('div');
        container.id = 'react-root';
        container.style.height = '100%';
        container.style.width = '100%';
        document.body.appendChild(container);
    }
    
    // Auto-mount
    window.appUI.mountMainApp(container);
    console.log('🚀 Main App Auto-Mounted');
} else {
    console.log('🛠️ Preview Mode detected: Waiting for manual mount.');
}
