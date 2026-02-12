(function() {
    window.appUI.welcome = {
        render: (props) => {
            const bgImage = 'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io/f1744960311608x780031988693140400/BG%20%281%29.png?_gl=1*1sjnvjs*_gcl_au*MTI1MTA4NjA5OS4xNzY0NjcxNTYy*_ga*MTkwNzcwNjAyMy4xNzY0MTUwMzM2*_ga_BFPVR2DEE2*czE3NzA4ODE1ODYkbzYyJGcxJHQxNzcwODk2MDU5JGoyMyRsMCRoMA..';
            
            return `
                <div class="relative w-full h-full min-h-screen bg-black font-jakarta overflow-hidden">
                    
                    <!-- Background Image -->
                    <div class="absolute inset-0 z-0">
                        <img src="${bgImage}" class="w-full h-full object-cover opacity-80" alt="Couple">
                        <!-- Gradient Overlay (Group 39812 equivalent) -->
                        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                    </div>

                    <!-- Content Container -->
                    <div class="relative z-10 flex flex-col h-full px-6 pb-12 pt-20">
                        
                        <!-- Logo / Icon (Vector/Union from specs) -->
                        <div class="mx-auto mb-auto">
                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0Z" fill="white"/>
                                <path d="M19 19H45V45H19V19Z" fill="#FF2258"/>
                            </svg>
                            <!-- Placeholder Logo Text if needed -->
                            <div class="text-white text-center mt-2 font-bold tracking-widest text-xs">BONDS</div>
                        </div>

                        <!-- Main Text: Your Relationship Superpower -->
                        <div class="mb-8">
                            <h1 class="text-white text-[34px] leading-[40px] font-normal mb-4">
                                Your Relationship<br>
                                Superpower
                            </h1>
                            <p class="text-white/80 text-lg font-light">
                                We learn your dynamics and tailor expert built, AI powered insights & actions
                            </p>
                        </div>

                        <!-- Action Button: LET'S GO -->
                        <button onclick="BubbleBridge.send('bubble_fn_welcome', { action: 'go' })"
                                class="w-full h-[60px] rounded-[40px] bg-gradient-to-l from-[#B900B0] to-[#D8003F] flex items-center justify-center mb-6 shadow-lg transform transition active:scale-95">
                            <span class="font-jakarta font-semibold text-[20px] text-white tracking-[3px] uppercase">
                                LET’S GO
                            </span>
                        </button>

                        <!-- Sign In Link -->
                        <div class="text-center">
                            <span class="font-jakarta text-[17px] text-white tracking-[0.2px]">
                                Got an account? 
                                <button onclick="BubbleBridge.send('bubble_fn_welcome', { action: 'signin' })" 
                                        class="font-bold border-b border-white hover:opacity-80 transition">
                                    Sign In here
                                </button>
                            </span>
                        </div>

                    </div>
                </div>
            `;
        }
    };
})();
