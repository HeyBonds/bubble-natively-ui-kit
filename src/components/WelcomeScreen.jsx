import React from 'react';

const WelcomeScreen = () => {
    const bgImage = 'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io/f1744960311608x780031988693140400/BG%20%281%29.png?_gl=1*1sjnvjs*_gcl_au*MTI1MTA4NjA5OS4xNzY0NjcxNTYy*_ga*MTkwNzcwNjAyMy4xNzY0MTUwMzM2*_ga_BFPVR2DEE2*czE3NzA4ODE1ODYkbzYyJGcxJHQxNzcwODk2MDU5JGoyMyRsMCRoMA..';

    const sendToBubble = (action) => {
        if (window.BubbleBridge) {
            window.BubbleBridge.send('bubble_fn_welcome', { action });
        }
    };

    return (
        <div className="relative w-full h-full min-h-screen bg-black font-jakarta overflow-hidden">
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={bgImage} className="w-full h-full object-cover opacity-80" alt="Couple" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full px-6 pb-12 pt-20">
                
                {/* Logo / Icon */}
                <div className="mx-auto mb-auto flex flex-col items-center">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="white" />
                        <rect x="19" y="19" width="26" height="26" fill="#FF2258" />
                    </svg>
                    <div className="text-white text-center mt-2 font-bold tracking-widest text-xs">BONDS</div>
                </div>

                {/* Main Text */}
                <div className="mb-8">
                    <h1 className="text-white text-[34px] leading-[40px] font-normal mb-4">
                        Your Relationship<br />
                        Superpower
                    </h1>
                    <p className="text-white/80 text-lg font-light">
                        We learn your dynamics and tailor expert built, AI powered insights & actions
                    </p>
                </div>

                {/* Action Button */}
                <button onClick={() => sendToBubble('go')}
                        className="w-full h-[60px] rounded-[40px] bg-gradient-to-l from-[#B900B0] to-[#D8003F] flex items-center justify-center mb-6 shadow-lg transform transition active:scale-95 btn-pressed">
                    <span className="font-jakarta font-semibold text-[20px] text-white tracking-[3px] uppercase">
                        LET’S GO
                    </span>
                </button>

                {/* Sign In Link */}
                <div className="text-center">
                    <span className="font-jakarta text-[17px] text-white tracking-[0.2px]">
                        Got an account? {' '}
                        <button onClick={() => sendToBubble('signin')} 
                                className="font-bold border-b border-white hover:opacity-80 transition">
                            Sign In here
                        </button>
                    </span>
                </div>

            </div>
        </div>
    );
};

export default WelcomeScreen;
