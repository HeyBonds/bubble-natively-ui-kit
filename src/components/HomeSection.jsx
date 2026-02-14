import React from 'react';

const HomeSection = ({ userName, userAvatar, credits, push }) => {
    // Default journey data
    const currentJourney = {
        title: 'Intimacy',
        description: 'Exploring how being wanted and desired intersects with sexual fulfilment together'
    };

    // Helper functions for Bubble interactions
    const sendToBubble = (action, data = {}) => {
        if (window.BubbleBridge) {
            window.BubbleBridge.send('bubble_fn_home', { action, ...data });
        }
    };

    return (
        <div className="relative w-full pb-8">
            
            {/* User Profile Header */}
            <div className="relative w-full px-4 pt-6 pb-4 bg-gradient-to-b from-[#2E2740] to-transparent">
                <div className="flex items-center justify-between">
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <img src={userAvatar} 
                             alt={userName} 
                             className="w-12 h-12 rounded-full border-2 border-solid border-white/20" />
                        <span className="font-jakarta font-semibold text-lg text-white">{userName}</span>
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                        {/* Send Icon */}
                        <button onClick={() => sendToBubble('send')} 
                                className="w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                        
                        {/* Chat Icon */}
                        <button onClick={() => sendToBubble('chat')} 
                                className="w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        
                        {/* Notifications Icon with Badge */}
                        <button onClick={() => sendToBubble('notifications')} 
                                className="relative w-10 h-10 rounded-full bg-[#FF2258] flex items-center justify-center hover:bg-[#FF2258]/90 transition-all">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF2258] border-2 border-solid border-[#2E2740] rounded-full flex items-center justify-center">
                                <span className="font-jakarta font-bold text-[10px] text-white">{credits}</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Personalized Journeys Section */}
            <div className="px-4 mt-8">
                <h2 className="font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4">
                    PERSONALIZED JOURNEYS
                </h2>
                
                <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-6 shadow-lg">
                    
                    {/* Navigation Arrows */}
                    <button onClick={() => sendToBubble('previous_journey')} 
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    
                    <button onClick={() => sendToBubble('next_journey')} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                    
                    {/* Journey Content */}
                    <div className="px-8">
                        <h3 className="font-jakarta font-bold text-2xl text-white mb-4 text-center">
                            {currentJourney.title}
                        </h3>
                        
                        {/* Description Box */}
                        <div className="bg-[#2E2740] rounded-xl p-4 mb-6">
                            <p className="font-poppins text-sm text-white/90 leading-relaxed">
                                {currentJourney.description}
                            </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={() => push('details', { title: currentJourney.title })} 
                                    className="px-8 py-3 bg-[#FF2258] rounded-full font-jakarta font-semibold text-sm text-white hover:bg-[#FF2258]/90 transition-all btn-pressed">
                                Select (Push Test)
                            </button>
                            
                            <button onClick={() => sendToBubble('change_topic')} 
                                    className="px-6 py-3 border border-solid border-white/50 rounded-full font-jakarta font-medium text-sm text-white hover:bg-white/10 transition-all flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="1 4 1 10 7 10"></polyline>
                                    <polyline points="23 20 23 14 17 14"></polyline>
                                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                                </svg>
                                Topic
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Quick Steps Section */}
            <div className="px-4 mt-8">
                <h2 className="font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4">
                    QUICK STEPS
                </h2>
                
                <div className="space-y-4">
                    
                    {/* Conversation Coach Card (with NEW badge) */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6D6987] to-[#4A4660] p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                         onClick={() => sendToBubble('conversation_coach')}>
                        
                        {/* NEW Badge */}
                        <div className="absolute -top-1 -right-1 w-20 h-20 overflow-hidden">
                            <div className="absolute top-4 -right-8 w-32 bg-[#E76B0C] text-white text-center font-jakarta font-bold text-xs py-1 transform rotate-45 shadow-lg">
                                NEW
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-[#E76B0C] flex items-center justify-center flex-shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            
                            {/* Text */}
                            <div>
                                <h3 className="font-jakarta font-bold text-lg text-white">Conversation</h3>
                                <h3 className="font-jakarta font-bold text-lg text-white">Coach</h3>
                            </div>
                        </div>
                    </div>
                    
                    {/* Quick Action Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* Practical Actions */}
                        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                             onClick={() => sendToBubble('practical_actions')}>
                            <div className="flex flex-col items-start gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <polyline points="9 11 12 14 22 4"></polyline>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                    </svg>
                                </div>
                                <h3 className="font-jakarta font-bold text-base text-white leading-tight">Practical<br/>Actions</h3>
                            </div>
                        </div>
                        
                        {/* Ask a Question */}
                        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#4A7C9E] to-[#3A5F7D] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                             onClick={() => sendToBubble('ask_question')}>
                            <div className="flex flex-col items-start gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                </div>
                                <h3 className="font-jakarta font-bold text-base text-white leading-tight">Ask a<br/>Question</h3>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeSection;
