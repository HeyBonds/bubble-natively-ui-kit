/* =========================================
   1. GLOBAL SETUP & UTILS
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


/* =========================================
   2. UI LIBRARY
   ========================================= */
window.appUI = {
    
    // --- FEATURE: Poll Screen ---
    poll: {
        topBar: (credits) => {
        return `
            <div class="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <button onclick="BubbleBridge.send('bubble_fn_close_poll')" 
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
                <div class="poll-option relative w-full max-w-[315px] h-9 bg-white/5 rounded-lg cursor-pointer overflow-hidden mb-[19px] transition-all duration-300 hover:bg-white/10"
                     data-value="${opt.text}" 
                     data-percent="${opt.percent}"
                     onclick="window.appUI.poll.handleVote(this, ${index}, '${opt.text}')">
                     
                     <div class="option-bar absolute left-0 top-0 h-full bg-[#6D6987]/70 rounded-lg" style="width: 0%"></div>
                     
                     <div class="relative flex items-center justify-between h-full px-[42px] z-10">
                        <span class="font-poppins font-bold text-sm text-[#F8F8F8] tracking-[0.02em]">${opt.text}</span>
                        <span class="percentage font-poppins text-xs text-[#F8F8F8] tracking-[0.02em] opacity-0">${opt.percent}%</span>
                     </div>
                </div>
            `).join('');

            return `
                <div class="relative w-full min-h-screen overflow-hidden gradient-purple-orange font-poppins">
                    
                    ${window.appUI.poll.topBar(props.credits)}

                    <div class="px-9 pt-[78px] max-w-[375px] mx-auto relative z-10">
                      
                      <div class="font-jakarta font-medium text-lg text-white mb-[68px]">
                        ${props.category || 'Time Together'}
                      </div>

                      <div class="font-poppins font-semibold text-xl text-white leading-[30px] tracking-[0.02em] mb-10 max-w-[303px]">
                        ${props.question}
                      </div>

                      <div id="poll-options-container" class="space-y-[19px] mb-16">
                        ${optionsHTML}
                      </div>

                      <div id="footer-area" class="min-h-[100px] flex flex-col items-center justify-start">
                          
                          <div id="footerBefore" class="font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[295px]">
                            Vote and see the live poll results and also gain 1 credits
                          </div>

                          <div id="footerAfter" class="hidden font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[309px] mb-6 animate-fade-in">
                            <span class="font-bold">${props.userName}</span>, we would love to plan with you that first step to creating more 'you time'
                          </div>

                          <button id="startBtn" onclick="window.appUI.poll.handleStart()" class="hidden px-10 py-3 bg-white rounded-[64px] shadow-[0px_3px_36px_1px_rgba(0,0,0,0.2)] backdrop-blur-[11px] transition-transform active:scale-95 animate-fade-in">
                            <span class="font-jakarta font-semibold text-[17px] text-[#E76B0C] tracking-[0.7px]">Start</span>
                          </button>

                      </div>
                    </div>
                </div>
            `;
        },

        handleVote: (element, index, answerText) => {
            if (element.classList.contains('voted')) return;
            
            const container = document.getElementById('poll-options-container');
            
            // 1. Lock UI
            const allOptions = container.querySelectorAll('.poll-option');
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

            // 4. Update Credits (Animation)
            const creditsNumEl = document.getElementById('creditsNumber');
            const creditsCircle = document.getElementById('creditsCircle');
            const currentCreds = parseInt(creditsNumEl.innerText);
            
            setTimeout(() => {
                creditsCircle.style.transform = "translateY(-50%) scale(1.2)"; // Pop effect
                setTimeout(() => {
                    creditsNumEl.innerText = currentCreds + 1;
                    creditsCircle.style.transform = "translateY(-50%) scale(1.0)";
                }, 700);
            }, 800);

            // 5. Swap Footer (Text -> Button)
            setTimeout(() => {
                document.getElementById('footerBefore').classList.add('hidden');
                document.getElementById('footerAfter').classList.remove('hidden');
                document.getElementById('startBtn').classList.remove('hidden');
            }, 800);

            // 6. Send to Bubble
            BubbleBridge.send('bubble_fn_poll_vote', {
                answer: answerText,
                index: index
            });
        },

        handleStart: () => {
            BubbleBridge.send('bubble_fn_start_planning', { timestamp: new Date() });
        }
    }
};