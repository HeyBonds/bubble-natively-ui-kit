
/* ========================================= */
/* SOURCE: 00-globals.js */
/* ========================================= */
/* =========================================
   GLOBAL SETUP & UTILITIES
   ========================================= */
const AppConfig = {
    fonts: [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ],
    // Primary gradient colors for reference
    colors: {
        start: "#AD256C", 
        end: "#E76B0C"
    }
};

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
            pointer-events: none;
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
    window.BubbleBridge = {
        send: (fnName, data) => {
            console.log(`📤 Sending to Bubble [${fnName}]:`, data);
            if (window[fnName]) window[fnName](data); 
        }
    };
}
initGlobals();


/* ========================================= */
/* SOURCE: 10-daily-question.js */
/* ========================================= */
/* =========================================
   DAILY QUESTION COMPONENT
   ========================================= */
window.appUI = window.appUI || {};

window.appUI.dailyQuestion = {
    topBar: (credits) => {
        return `
            <div class="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <button onclick="BubbleBridge.send('bubble_fn_close_daily_question')" 
                        class="pointer-events-auto absolute top-[18px] left-[18px] w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity z-20">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13.6675 1.99162C14.1108 1.53601 14.1108 0.79732 13.6675 0.341709C13.2243 -0.113903 12.5056 -0.113903 12.0623 0.341709L7 5.54491L1.9377 0.341709C1.49442 -0.113903 0.775732 -0.113903 0.332457 0.341708C-0.110818 0.79732 -0.110818 1.53601 0.332457 1.99162L5.20521 7L0.332456 12.0084C-0.110819 12.464 -0.110819 13.2027 0.332456 13.6583C0.77573 14.1139 1.49442 14.1139 1.93769 13.6583L7 8.45509L12.0623 13.6583C12.5056 14.1139 13.2243 14.1139 13.6675 13.6583C14.1108 13.2027 14.1108 12.464 13.6675 12.0084L8.79479 7L13.6675 1.99162Z" fill="white"/>
                  </svg>
                </button>

                <div class="absolute top-4 -right-[95px] z-10">
                  <div class="relative w-[180px] h-10 rounded-full flex items-center" style="border: 1px solid rgba(255, 255, 255, 0.5);">
                    <div id="creditsCircle" class="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center transition-transform duration-700">
                      <span id="creditsNumber" class="font-jakarta font-extrabold text-xs text-white tracking-wide leading-none">${credits}</span>
                    </div>
                    <span class="absolute left-[42px] top-1/2 translate-y-[6px] font-jakarta font-medium text-[10px] text-white tracking-wide leading-none">Credits</span>
                  </div>
                </div>
            </div>
        `;
    },

    render: (props) => {
        // Generate Options
        const optionsHTML = props.options.map((opt, index) => `
            <div class="daily-question-option relative w-full max-w-[315px] h-9 bg-white/5 border border-solid border-white/10 backdrop-blur-md rounded-lg cursor-pointer overflow-hidden mb-[19px] transition-all duration-300 hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                 data-value="${opt.text}" 
                 data-percent="${opt.percent}"
                 onclick="window.appUI.dailyQuestion.handleVote(this, ${index}, '${opt.text}')">
                 
                 <div class="option-bar absolute left-0 top-0 h-full bg-[#6D6987]/70 rounded-lg" style="width: 0%"></div>
                 
                 <div class="relative flex items-center justify-between h-full px-[42px] z-10">
                    <span class="font-poppins font-bold text-sm text-[#F8F8F8] tracking-[0.02em]">${opt.text}</span>
                    <span class="percentage font-poppins text-xs text-[#F8F8F8] tracking-[0.02em] opacity-0">${opt.percent}%</span>
                 </div>
            </div>
        `).join('');

        return `
            <div class="relative w-full min-h-screen overflow-hidden gradient-purple-orange font-poppins">
                
                ${window.appUI.dailyQuestion.topBar(props.credits)}

                <div class="px-9 pt-[78px] max-w-[375px] mx-auto relative z-10">
                  
                  <div class="font-jakarta font-medium text-lg text-white mb-[68px]">
                    ${props.category || 'Time Together'}
                  </div>

                  <div class="font-poppins font-semibold text-xl text-white leading-[30px] tracking-[0.02em] mb-10 max-w-[303px]">
                    ${props.question}
                  </div>

                  <div id="daily-question-options-container" class="space-y-[19px] mb-16">
                    ${optionsHTML}
                  </div>

                  <div id="footer-area" class="min-h-[100px] flex flex-col items-center justify-start">
                      
                      <div id="footerBefore" class="font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[295px]">
                        Vote and see the live results and also gain 1 credits
                      </div>

                      <div id="footerAfter" class="hidden font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[309px] mb-6 animate-fade-in">
                        <span class="font-bold">${props.userName}</span>, we would love to plan with you that first step to creating more 'you time'
                      </div>

                      <button id="startBtn" onclick="window.appUI.dailyQuestion.handleStart()" 
                              class="hidden px-10 py-3 bg-white rounded-[64px] btn-pressed animate-fade-in pointer-events-auto">
                        <span class="font-jakarta font-semibold text-[17px] text-[#E76B0C] tracking-[0.7px] pointer-events-none">Start</span>
                      </button>

                  </div>
                </div>
            </div>
        `;
    },

    handleVote: (element, index, answerText) => {
        if (element.classList.contains('voted')) return;
        
        const container = document.getElementById('daily-question-options-container');
        
        // 1. Lock UI
        const allOptions = container.querySelectorAll('.daily-question-option');
        allOptions.forEach(opt => opt.classList.add('voted', 'pointer-events-none')); // Disable clicks

        // 2. Visual Selected State
        element.classList.add('selected-option');

        // 3. Reveal Bars & Percentages
        allOptions.forEach(opt => {
            const pct = opt.getAttribute('data-percent');
            const bar = opt.querySelector('.option-bar');
            const pctText = opt.querySelector('.percentage');
            
            // Slight delay for organic feel
            setTimeout(() => {
                bar.style.width = pct + '%';
                pctText.classList.remove('opacity-0');
                if(opt === element) pctText.style.fontWeight = "bold";
            }, 100);
        });

        // 4. Update Credits (Enhanced Center Animation)
        const creditsNumEl = document.getElementById('creditsNumber');
        const creditsCircle = document.getElementById('creditsCircle');
        const currentCreds = parseInt(creditsNumEl.innerText);
        
        setTimeout(() => {
            // Create overlay credit circle in center
            const overlay = document.createElement('div');
            overlay.className = 'credit-overlay credit-center-animation';
            overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                pointer-events: none;
            `;
            
            overlay.innerHTML = `
                <div class="w-24 h-24 bg-[#FF2258] rounded-full flex items-center justify-center shadow-2xl">
                    <span id="overlayCreditsNumber" class="font-jakarta font-extrabold text-4xl text-white tracking-wide leading-none">
                        ${currentCreds}
                    </span>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Create dim overlay
            const dimOverlay = document.createElement('div');
            dimOverlay.className = 'dim-overlay';
            document.body.appendChild(dimOverlay);
            
            // Step 1: Fade in and scale (600ms)
            // Force reflow and activate dimming
            setTimeout(() => {
                dimOverlay.classList.add('active');
            }, 10);
            
            // Step 1: Fade in and scale (600ms)
            // (handled by CSS animation)
            
            // Step 2: Increment number (600ms duration, starts at 600ms)
            setTimeout(() => {
                const overlayNum = document.getElementById('overlayCreditsNumber');
                let start = currentCreds;
                let end = currentCreds + 1;
                let duration = 600;
                let startTime = null;
                
                function animateNumber(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    
                    // Easing function for smooth increment
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = Math.round(start + (end - start) * easeOutQuart);
                    
                    overlayNum.innerText = current;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animateNumber);
                    }
                }
                
                requestAnimationFrame(animateNumber);
            }, 600);
            
            // Step 3: Move to corner (600ms duration, starts at 1200ms)
            setTimeout(() => {
                overlay.classList.remove('credit-center-animation');
                overlay.classList.add('credit-move-animation');
                
                // Fade out dim overlay
                dimOverlay.classList.remove('active');
                
                // Force a reflow to ensure the transition class is applied
                overlay.offsetHeight;
                
                // Get the actual position of the credit circle
                const targetRect = creditsCircle.getBoundingClientRect();
                
                // Move overlay to match the target position
                overlay.style.top = targetRect.top + 'px';
                overlay.style.left = targetRect.left + 'px';
                overlay.style.transform = 'scale(1)';
                
                // Update the overlay size to match target
                const overlayCircle = overlay.querySelector('div');
                overlayCircle.style.transition = 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                overlayCircle.style.width = '32px';
                overlayCircle.style.height = '32px';
                overlayCircle.querySelector('span').style.fontSize = '0.75rem';
            }, 1200);
            
            // Step 4: Cleanup and update original (at 1800ms)
            setTimeout(() => {
                // Update the original credit display
                creditsNumEl.innerText = currentCreds + 1;
                
                // Add a subtle pulse to the original
                creditsCircle.style.transition = 'transform 0.3s ease';
                creditsCircle.style.transform = 'translateY(-50%) scale(1.2)';
                
                setTimeout(() => {
                    creditsCircle.style.transform = 'translateY(-50%) scale(1)';
                }, 300);
                
                // Remove overlay
                overlay.remove();
                dimOverlay.remove();
            }, 1800);
            
        }, 2000); // Start 2 seconds after answer selection

        // 5. Swap Footer (Text -> Button)
        setTimeout(() => {
            document.getElementById('footerBefore').classList.add('hidden');
            document.getElementById('footerAfter').classList.remove('hidden');
            document.getElementById('startBtn').classList.remove('hidden');
        }, 800);

        // 6. Send to Bubble
        BubbleBridge.send('bubble_fn_daily_question_vote', {
            answer: answerText,
            index: index
        });
    },

    handleStart: () => {
        BubbleBridge.send('bubble_fn_start_planning', { timestamp: new Date() });
    }
};


/* ========================================= */
/* SOURCE: 20-main-app.js */
/* ========================================= */
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


/* ========================================= */
/* SOURCE: 21-home-section.js */
/* ========================================= */
/* =========================================
   HOME SECTION
   ========================================= */
window.appUI = window.appUI || {};

window.appUI.home = {
    render: (props) => {
        // props: { userName, userAvatar, credits, journeys, quickSteps }
        const userName = props.userName || 'Jonathan';
        const userAvatar = props.userAvatar || 'https://i.pravatar.cc/150?img=12';
        const credits = props.credits || 23;
        
        // Default journey data
        const currentJourney = props.currentJourney || {
            title: 'Intimacy',
            description: 'Exploring how being wanted and desired intersects with sexual fulfilment together'
        };
        
        return `
            <div class="relative w-full pb-8">
                
                <!-- User Profile Header -->
                ${window.appUI.home._renderHeader(userName, userAvatar, credits)}
                
                <!-- Personalized Journeys Section -->
                <div class="px-4 mt-8">
                    <h2 class="font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4">
                        PERSONALIZED JOURNEYS
                    </h2>
                    ${window.appUI.home._renderJourneyCard(currentJourney)}
                </div>
                
                <!-- Quick Steps Section -->
                <div class="px-4 mt-8">
                    <h2 class="font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4">
                        QUICK STEPS
                    </h2>
                    ${window.appUI.home._renderQuickSteps()}
                </div>
                
            </div>
        `;
    },
    
    _renderHeader: (userName, userAvatar, credits) => {
        return `
            <div class="relative w-full px-4 pt-6 pb-4 bg-gradient-to-b from-[#2E2740] to-transparent">
                <div class="flex items-center justify-between">
                    
                    <!-- User Info -->
                    <div class="flex items-center gap-3">
                        <img src="${userAvatar}" 
                             alt="${userName}" 
                             class="w-12 h-12 rounded-full border-2 border-solid border-white/20" />
                        <span class="font-jakarta font-semibold text-lg text-white">${userName}</span>
                    </div>
                    
                    <!-- Action Icons -->
                    <div class="flex items-center gap-3">
                        <!-- Send Icon -->
                        <button onclick="BubbleBridge.send('bubble_fn_send_action')" 
                                class="w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                        
                        <!-- Chat Icon -->
                        <button onclick="BubbleBridge.send('bubble_fn_chat_action')" 
                                class="w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        
                        <!-- Notifications Icon with Badge -->
                        <button onclick="BubbleBridge.send('bubble_fn_notifications_action')" 
                                class="relative w-10 h-10 rounded-full bg-[#FF2258] flex items-center justify-center hover:bg-[#FF2258]/90 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span class="absolute -top-1 -right-1 w-5 h-5 bg-[#FF2258] border-2 border-solid border-[#2E2740] rounded-full flex items-center justify-center">
                                <span class="font-jakarta font-bold text-[10px] text-white">${credits}</span>
                            </span>
                        </button>
                    </div>
                    
                </div>
            </div>
        `;
    },
    
    _renderJourneyCard: (journey) => {
        return `
            <div class="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-6 shadow-lg">
                
                <!-- Navigation Arrows -->
                <button onclick="window.appUI.home.previousJourney()" 
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                
                <button onclick="window.appUI.home.nextJourney()" 
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                
                <!-- Journey Content -->
                <div class="px-8">
                    <h3 class="font-jakarta font-bold text-2xl text-white mb-4 text-center">
                        ${journey.title}
                    </h3>
                    
                    <!-- Description Box -->
                    <div class="bg-[#2E2740] rounded-xl p-4 mb-6">
                        <p class="font-poppins text-sm text-white/90 leading-relaxed">
                            ${journey.description}
                        </p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center justify-center gap-3">
                        <button onclick="BubbleBridge.send('bubble_fn_select_journey', { journey: '${journey.title}' })" 
                                class="px-8 py-3 bg-[#FF2258] rounded-full font-jakarta font-semibold text-sm text-white hover:bg-[#FF2258]/90 transition-all btn-pressed">
                            Select
                        </button>
                        
                        <button onclick="BubbleBridge.send('bubble_fn_change_topic')" 
                                class="px-6 py-3 border border-solid border-white/50 rounded-full font-jakarta font-medium text-sm text-white hover:bg-white/10 transition-all flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="1 4 1 10 7 10"></polyline>
                                <polyline points="23 20 23 14 17 14"></polyline>
                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                            </svg>
                            Topic
                        </button>
                    </div>
                </div>
                
            </div>
        `;
    },
    
    _renderQuickSteps: () => {
        return `
            <div class="space-y-4">
                
                <!-- Conversation Coach Card (with NEW badge) -->
                <div class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6D6987] to-[#4A4660] p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                     onclick="BubbleBridge.send('bubble_fn_conversation_coach')">
                    
                    <!-- NEW Badge -->
                    <div class="absolute -top-1 -right-1 w-20 h-20 overflow-hidden">
                        <div class="absolute top-4 -right-8 w-32 bg-[#E76B0C] text-white text-center font-jakarta font-bold text-xs py-1 transform rotate-45 shadow-lg">
                            NEW
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Icon -->
                        <div class="w-12 h-12 rounded-full bg-[#E76B0C] flex items-center justify-center flex-shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        
                        <!-- Text -->
                        <div>
                            <h3 class="font-jakarta font-bold text-lg text-white">Conversation</h3>
                            <h3 class="font-jakarta font-bold text-lg text-white">Coach</h3>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Action Cards Grid -->
                <div class="grid grid-cols-2 gap-4">
                    
                    <!-- Practical Actions -->
                    <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                         onclick="BubbleBridge.send('bubble_fn_practical_actions')">
                        <div class="flex flex-col items-start gap-2">
                            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <polyline points="9 11 12 14 22 4"></polyline>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                </svg>
                            </div>
                            <h3 class="font-jakarta font-bold text-base text-white leading-tight">Practical<br/>Actions</h3>
                        </div>
                    </div>
                    
                    <!-- Ask a Question -->
                    <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-[#4A7C9E] to-[#3A5F7D] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                         onclick="BubbleBridge.send('bubble_fn_ask_question')">
                        <div class="flex flex-col items-start gap-2">
                            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            </div>
                            <h3 class="font-jakarta font-bold text-base text-white leading-tight">Ask a<br/>Question</h3>
                        </div>
                    </div>
                    
                </div>
                
            </div>
        `;
    },
    
    // Journey navigation handlers
    previousJourney: () => {
        BubbleBridge.send('bubble_fn_previous_journey');
    },
    
    nextJourney: () => {
        BubbleBridge.send('bubble_fn_next_journey');
    }
};

