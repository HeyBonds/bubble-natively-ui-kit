import React from 'react';
import { sendToBubble } from '../utils/bubble';

const WelcomeScreen = ({ deviceId: _deviceId, onAction }) => {
    const bgImage = 'https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io/f1744960311608x780031988693140400/BG%20%281%29.png?_gl=1*1sjnvjs*_gcl_au*MTI1MTA4NjA5OS4xNzY0NjcxNTYy*_ga*MTkwNzcwNjAyMy4xNzY0MTUwMzM2*_ga_BFPVR2DEE2*czE3NzA4ODE1ODYkbzYyJGcxJHQxNzcwODk2MDU5JGoyMyRsMCRoMA..';

    const handleAction = (action) => {
        sendToBubble('bubble_fn_welcome', action);
        if (onAction) onAction(action);
    };

    return (
        <div className="relative w-full h-full bg-black font-jakarta overflow-hidden">
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={bgImage} className="w-full h-full object-cover opacity-80" alt="Couple" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full px-6 py-10">
                
                {/* Logo / Icon */}
                <div className="mx-auto flex flex-col items-center">
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill="white" />
                        <rect x="19" y="19" width="26" height="26" fill="#FF2258" />
                    </svg>
                    <div className="text-white text-center mt-2 font-bold tracking-widest text-[10px]">BONDS</div>
                </div>

                {/* Spacer to push content down slightly but not too much */}
                <div className="flex-1 min-h-[20px]"></div>

                {/* Main Text */}
                <div className="mb-8">
                    <h1 className="text-white text-[32px] leading-[38px] font-normal mb-3">
                        Your Relationship<br />
                        Superpower
                    </h1>
                    <p className="text-white/80 text-base font-light leading-relaxed">
                        We learn your dynamics and tailor expert built, AI powered insights & actions
                    </p>
                </div>

                {/* Action Buttons Container */}
                <div className="space-y-6">
                    <button onClick={() => handleAction('go')}
                            className="w-full h-[58px] rounded-[40px] bg-gradient-to-l from-[#B900B0] to-[#D8003F] flex items-center justify-center shadow-lg transform transition active:scale-95 btn-pressed">
                        <span className="font-jakarta font-semibold text-[18px] text-white tracking-[3px] uppercase">
                            LET’S GO
                        </span>
                    </button>

                    <div className="text-center">
                        <span className="font-jakarta text-[16px] text-white tracking-[0.2px]">
                            Got an account? {' '}
                            <button onClick={() => handleAction('signin')} 
                                    className="font-bold border-b border-white hover:opacity-80 transition">
                                Sign In here
                            </button>
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WelcomeScreen;
