/* =========================================
   MAIN APP - NAVIGATION CONTAINER
   ========================================= */
window.appUI = window.appUI || {};

window.appUI.mainApp = {
    // Current active section state
    _activeSection: 'home',
    
    render: (props) => {
        // props: { userName, userAvatar, credits, activeSection }
        const activeSection = props.activeSection || 'home';
        window.appUI.mainApp._activeSection = activeSection;
        
        return `
            <div class="relative w-full h-full bg-gradient-to-b from-[#2E2740] to-[#1F1A2E] font-poppins overflow-hidden">
                
                <!-- Content Area (scrollable) -->
                <div id="app-content-area" class="w-full h-full overflow-y-auto pb-24 scrollbar-hide">
                    ${window.appUI.mainApp.renderSection(activeSection, props)}
                </div>
                
                <!-- Bottom Navigation (absolute to container) -->
                <div class="absolute bottom-0 left-0 right-0 h-20 bg-[#1F1A2E]/95 backdrop-blur-md border-t border-solid border-white/10 z-50">
                    <div class="flex items-center justify-around h-full max-w-[500px] mx-auto px-4">
                        ${window.appUI.mainApp._renderNavButton('home', 'Home', activeSection)}
                        ${window.appUI.mainApp._renderNavButton('learn', 'Learn', activeSection)}
                        ${window.appUI.mainApp._renderNavButton('act', 'Act', activeSection)}
                        ${window.appUI.mainApp._renderNavButton('ask', 'Ask', activeSection)}
                    </div>
                </div>
                
            </div>
        `;
    },
    
    _renderNavButton: (section, label, activeSection) => {
        const isActive = section === activeSection;
        
        // Active: Pink text + Scale Animation
        // Inactive: White/60 text
        const activeClass = isActive ? 'text-[#FF2258] font-bold scale-110' : 'text-white/60 font-medium scale-100 opacity-70';
        
        // Icon SVGs for each section
        const icons = {
            home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>`,
            learn: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>`,
            act: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>`,
            ask: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>`
        };
        
        return `
            <button onclick="window.appUI.mainApp.navigateTo('${section}')" 
                    id="nav-btn-${section}"
                    class="flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out transform ${activeClass}">
                ${icons[section]}
                <span class="font-jakarta text-[10px] tracking-wide">${label}</span>
            </button>
        `;
    },
    
    renderSection: (section, props) => {
        // Route to appropriate section component
        switch(section) {
            case 'home':
                return window.appUI.home ? window.appUI.home.render(props) : '<div class="p-8 text-white">Home loading...</div>';
            case 'learn':
                return window.appUI.learn ? window.appUI.learn.render(props) : '<div class="p-8 text-white text-center">Learn - Coming Soon</div>';
            case 'act':
                return window.appUI.act ? window.appUI.act.render(props) : '<div class="p-8 text-white text-center">Act - Coming Soon</div>';
            case 'ask':
                return window.appUI.ask ? window.appUI.ask.render(props) : '<div class="p-8 text-white text-center">Ask - Coming Soon</div>';
            default:
                return '<div class="p-8 text-white">Section not found</div>';
        }
    },
    
    navigateTo: (section) => {
        // Update active section
        const prevSection = window.appUI.mainApp._activeSection;
        window.appUI.mainApp._activeSection = section;
        
        // Get current props (in real app, this would come from Bubble)
        const currentProps = {
            userName: 'Jonathan',
            userAvatar: 'https://i.pravatar.cc/150?img=12',
            credits: 23,
            activeSection: section
        };
        
        // 1. Re-render content area
        const contentArea = document.getElementById('app-content-area');
        if (contentArea) {
            contentArea.innerHTML = window.appUI.mainApp.renderSection(section, currentProps);
            contentArea.scrollTop = 0;
        }
        
        // 2. Update nav buttons state (Class Toggling for smooth animation)
        const sections = ['home', 'learn', 'act', 'ask'];
        
        sections.forEach(s => {
            const btn = document.getElementById(`nav-btn-${s}`);
            if (!btn) return;
            
            // Define active vs inactive classes
            // We use standard Tailwind + custom active-tab-shimmer which we'll add to globals
            if (s === section) {
                // ACTIVE: Pink, Bold, Scaled Up, Shimmer
                // We reset animation by removing class then adding back if needed, but simple CSS transition handles scale
                btn.className = 'flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-spring transform text-[#FF2258] font-bold scale-110 active-tab-shimmer';
            } else {
                // INACTIVE: White/60, Normal weight, Normal scale, Fade out
                btn.className = 'flex flex-col items-center justify-center gap-1 transition-all duration-500 ease-out transform text-white/60 font-medium scale-100 opacity-70';
            }
        });
        
        // Send to Bubble for analytics
        BubbleBridge.send('bubble_fn_navigate', { section: section, timestamp: new Date() });
    }
};
