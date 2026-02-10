/* =========================================
   1. GLOBAL SETUP & UTILS
   ========================================= */
const AppConfig = {
    fonts: [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ],
    // The "Orange Red" from your credits-badge.html
    brandColor: "#FF2258" 
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

    // 2. Inject Custom Font Classes (Tailwind JIT might miss these if not explicit)
    const style = document.createElement('style');
    style.innerHTML = `
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .brand-text { color: ${AppConfig.brandColor}; }
        .brand-bg { background-color: ${AppConfig.brandColor}; }
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
   2. UI LIBRARY (Styles matched to your uploads)
   ========================================= */
window.appUI = {
    
    // --- COMPONENT: Top Bar ---
    topBar: (credits) => {
        return `
            <div class="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <button onclick="BubbleBridge.send('bubble_fn_close_poll')" 
                        class="pointer-events-auto absolute top-[18px] left-[18px] w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity">
                   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.6675 1.99162C14.1108 1.53601 14.1108 0.79732 13.6675 0.341709C13.2243 -0.113903 12.5056 -0.113903 12.0623 0.341709L7 5.54491L1.9377 0.341709C1.49442 -0.113903 0.775732 -0.113903 0.332457 0.341708C-0.110818 0.79732 -0.110818 1.53601 0.332457 1.99162L5.20521 7L0.332456 12.0084C-0.110819 12.464 -0.110819 13.2027 0.332456 13.6583C0.77573 14.1139 1.49442 14.1139 1.93769 13.6583L7 8.45509L12.0623 13.6583C12.5056 14.1139 13.2243 14.1139 13.6675 13.6583C14.1108 13.2027 14.1108 12.464 13.6675 12.0084L8.79479 7L13.6675 1.99162Z" fill="#1F2937"/>
                   </svg>
                </button>

                <div class="pointer-events-auto absolute top-4 -right-[95px] transition-all duration-500">
                    <div class="relative w-[180px] h-10 border border-black/5 bg-white/80 backdrop-blur-md rounded-full flex items-center shadow-sm">
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
        render: (props) => {
            const optionsHTML = props.options.map((opt, index) => `
                <div class="poll-option relative w-full h-14 mb-3 bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer transition-all active:scale-[0.98]"
                     onclick="window.appUI.poll.handleVote(this, ${index}, '${opt.text}')">
                     
                     <div class="option-bar absolute top-0 left-0 h-full bg-[#FF2258]/10 transition-all duration-1000 ease-out" style="width: 0%"></div>
                     
                     <div class="relative z-10 flex items-center justify-between px-5 h-full">
                        <span class="font-poppins font-medium text-gray-700 text-[13px] leading-tight">${opt.text}</span>
                        <span class="percentage font-jakarta font-bold text-[#FF2258] opacity-0 transition-opacity duration-300" 
                              data-percent="${opt.percent}">${opt.percent}%</span>
                     </div>
                </div>
            `).join('');

            return `
                <div class="relative min-h-screen bg-[#FAFAFA] flex flex-col font-poppins text-gray-900">
                    ${window.appUI.topBar(props.credits)}
                    
                    <div class="flex-1 flex flex-col justify-center px-6 pt-10 pb-6">
                        <div class="mb-4 flex justify-center">
                           <span class="px-3 py-1 bg-[#F3E6FF] text-[#9B51E0] rounded-full text-[10px] font-bold tracking-wide uppercase font-jakarta">Time Together</span>
                        </div>
                        
                        <h2 class="text-[22px] font-bold text-center leading-[1.3] mb-8 font-jakarta">
                            ${props.question}
                        </h2>

                        <div id="poll-options-container" class="space-y-3">
                            ${optionsHTML}
                        </div>
                    </div>
                    
                    <div class="p-6 text-center text-gray-400 text-[10px] font-jakarta">
                        Poll by ${props.userName || 'Guest'}
                    </div>
                </div>
            `;
        },

        handleVote: (element, index, answerText) => {
            if (element.classList.contains('voted')) return;
            
            const container = document.getElementById('poll-options-container');
            container.classList.add('pointer-events-none'); // Lock UI
            
            // Reveal All
            const allOptions = container.querySelectorAll('.poll-option');
            allOptions.forEach(opt => {
                opt.classList.add('voted');
                const pctEl = opt.querySelector('.percentage');
                pctEl.classList.remove('opacity-0');
                const bar = opt.querySelector('.option-bar');
                // Use a darker opacity for the winning/selected bar? 
                // For now, consistent style:
                bar.style.width = pctEl.getAttribute('data-percent') + '%';
            });

            // Highlight Selected (Red Ring instead of Blue)
            element.classList.add('ring-2', 'ring-[#FF2258]', 'ring-offset-1');

            // Send to Bubble
            BubbleBridge.send('bubble_fn_submit_poll', {
                answer: answerText,
                index: index
            });
        }
    }
};