import './00-globals.js'; // MUST be first to init window.appUI
import './05-welcome-screen.js'; // Legacy component
import './10-daily-question.js'; // Legacy component
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Expose mount function for the Previewer / Bubble
window.appUI.mountMainApp = (container) => {
    const root = createRoot(container);
    root.render(<App />);
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
