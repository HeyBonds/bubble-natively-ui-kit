/* =========================================
   GLOBAL SETUP & UTILITIES
   ========================================= */
const AppConfig = {
    fonts: [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ],
    colors: {
        start: "#AD256C", 
        end: "#E76B0C"
    }
};

// Initialize Global Namespace
window.appUI = window.appUI || {};

function initGlobals() {
    // 1. Inject Fonts
    AppConfig.fonts.forEach(url => {
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    });

    // 2. Inject Custom CSS (Gradient + Animations)
    const style = document.createElement('style');
    style.innerHTML = `
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        /* The missing gradient class */
        .gradient-purple-orange {
            background: linear-gradient(180deg, #AD256C 0%, #E76B0C 100%);
        }
        
        /* Animation Utility */
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Option specific transitions */
        .option-bar { transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .percentage { transition: opacity 0.3s ease 0.6s; }
        .selected-option { background: rgba(255, 255, 255, 0.15) !important; box-shadow: inset 0px 2px 8px rgba(0, 0, 0, 0.15); }

        /* 3D Pressed Button Effect - Subtle */
        .btn-pressed {
            transition: all 0.1s ease;
            box-shadow: 0 4px rgba(0,0,0,0.15);
            transform: translateY(0);
        }
        .btn-pressed:active {
            box-shadow: 0 1px rgba(0,0,0,0.15) !important;
            transform: translateY(3px) !important;
        }

        /* Credit Animation Keyframes */
        @keyframes creditFadeInScale {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.5);
            }
        }

        /* creditMoveToCorner is now handled dynamically via JavaScript */

        .credit-overlay {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
        }

        .credit-center-animation {
            animation: creditFadeInScale 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .credit-move-animation {
            transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Dim Overlay */
        .dim-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            opacity: 0;
            transition: opacity 600ms ease;
            z-index: 9998; /* Below credit (9999) */
            pointer-events: auto;
        }
        .dim-overlay.active {
            opacity: 1;
        }

        /* Hide Scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
        
        /* Tab Selection Shimmer */
        @keyframes shimmer {
            0% { filter: brightness(100%); transform: scale(1); }
            50% { filter: brightness(150%) drop-shadow(0 0 5px rgba(255, 34, 88, 0.5)); transform: scale(1.15); }
            100% { filter: brightness(100%); transform: scale(1.1); }
        }
        .active-tab-shimmer {
            animation: shimmer 0.4s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // 3. Bubble Bridge
    // 3. Bubble Bridge
    window.BubbleBridge = {
        send: (fnName, data) => {
            // Auto-stringify if data is an object (and not null)
            const payload = (typeof data === 'object' && data !== null) 
                ? JSON.stringify(data) 
                : data;

            console.log(`📤 Sending to Bubble [${fnName}]:`, payload);
            if (window[fnName]) window[fnName](payload); 
        }
    };
}
initGlobals();
