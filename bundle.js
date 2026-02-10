/* =========================================
   1. GLOBAL SETUP & UTILS
   ========================================= */
const AppConfig = {
    fonts: [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ],
    colors: {
        primary: "#667eea",
        success: "#28a745"
    }
};

// Inject Fonts & Global Styles
function initGlobals() {
    // 1. Fonts
    AppConfig.fonts.forEach(url => {
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        }
    });

    // 2. Global Helper: BubbleBridge (Abstractions for bubble_fn_ calls)
    window.BubbleBridge = {
        send: (fnName, data) => {
            console.log(`📤 Sending to Bubble [${fnName}]:`, data);
            if (window[fnName]) {
                window[fnName](data); // Call the actual Toolbox function
            } else {
                console.warn(`⚠️ Bubble function '${fnName}' not found. Is the Toolbox element on page?`);
            }
        }
    };
}
// Run immediately
initGlobals();


/* =========================================
   2. UI LIBRARY (Reusable Components)
   ========================================= */
window.appUI = {
    
    // --- COMPONENT: Top Bar (Combines Close Button & Credits) ---
    topBar: (credits) => {
        return `
            <div class="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <button onclick="BubbleBridge.send('bubble_fn_close_poll')" 
                        class="pointer-events-auto absolute top-[18px] left-[18px] w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity">
                   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 13L13 1M1 1L13 13"/>
                   </svg>
                </button>

                <div class="pointer-events-auto absolute top-4 -right-[95px] transition-all duration-500" id="credits-container">
                    <div class="relative w-[180px] h-10 border border-black/10 bg-white/50 backdrop-blur-sm rounded-full flex items-center shadow-sm">
                        <div class="absolute left-[6px] top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center">
                            <span class="font-jakarta font-extrabold text-xs text-white">${credits}</span>
                        </div>
                        <span class="absolute left-[42px] font-jakarta font-medium text-[10px] text-gray-800">Credits</span>
                    </div>
                </div>
            </div>
        `;
    },

    // --- FEATURE: Poll Screen ---
    poll: {
        // A. The Renderer (HTML Structure)
        render: (props) => {
            // props = { question, credits, options: [{text, percent, id}], userName }
            
            // Generate Options HTML
            const optionsHTML = props.options.map((opt, index) => `
                <div class="poll-option relative w-full h-14 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer transition-all active:scale-95"
                     onclick="window.appUI.poll.handleVote(this, ${index}, '${opt.text}')">
                     
                     <div class="option-bar absolute top-0 left-0 h-full bg-blue-100 transition-all duration-1000 ease-out" style="width: 0%"></div>
                     
                     <div class="relative z-10 flex items-center justify-between px-4 h-full">
                        <span class="font-poppins font-medium text-gray-700 text-sm">${opt.text}</span>
                        <span class="percentage font-jakarta font-bold text-gray-900 opacity-0 transition-opacity duration-300" 
                              data-percent="${opt.percent}">${opt.percent}%</span>
                     </div>
                </div>
            `).join('');

            return `
                <div class="relative min-h-screen bg-gray-50 flex flex-col font-poppins">
                    ${window.appUI.topBar(props.credits)}
                    
                    <div class="flex-1 flex flex-col justify-center px-6 pt-10 pb-6">
                        <div class="mb-2">
                           <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold tracking-wide uppercase">Time Together</span>
                        </div>
                        
                        <h2 class="text-2xl font-bold text-gray-900 leading-tight mb-8">
                            ${props.question}
                        </h2>

                        <div id="poll-options-container">
                            ${optionsHTML}
                        </div>
                    </div>
                    
                    <div class="p-6 text-center text-gray-400 text-xs">
                        Poll by ${props.userName || 'Guest'}
                    </div>
                </div>
            `;
        },

        // B. The Logic (Interactivity)
        handleVote: (element, index, answerText) => {
            // 1. Visual Selection State
            if (element.classList.contains('voted')) return; // Prevent double vote
            
            const container = document.getElementById('poll-options-container');
            container.classList.add('has-voted');
            
            // 2. Reveal All Percentages
            const allOptions = container.querySelectorAll('.poll-option');
            allOptions.forEach(opt => {
                opt.classList.add('voted', 'cursor-default');
                
                // Show text percent
                const pctEl = opt.querySelector('.percentage');
                pctEl.classList.remove('opacity-0');
                
                // Animate Bar Width
                const bar = opt.querySelector('.option-bar');
                const targetWidth = pctEl.getAttribute('data-percent');
                // Tiny delay for visual effect
                setTimeout(() => { bar.style.width = targetWidth + '%'; }, 50);
            });

            // 3. Highlight Selected
            element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');

            // 4. Send Data to Bubble
            BubbleBridge.send('bubble_fn_submit_poll', {
                answer: answerText,
                index: index
            });
        }
    }
};