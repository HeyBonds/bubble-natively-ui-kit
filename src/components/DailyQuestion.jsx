import React, { useState, useEffect, useRef } from 'react';
import { sendToBubble } from '../utils/bubble';

const DailyQuestion = ({ category, question, options, userName, credits: initialCredits, selectedAnswer: initialSelectedAnswer }) => {
    const [credits, setCredits] = useState(initialCredits || 0);
    const [selectedAnswer, setSelectedAnswer] = useState(initialSelectedAnswer);
    const [isVoted, setIsVoted] = useState(initialSelectedAnswer !== undefined && initialSelectedAnswer !== null);
    const [showFooterAfter, setShowFooterAfter] = useState(isVoted);
    const creditsCircleRef = useRef(null);
    const creditsNumberRef = useRef(null);

    const handleVote = (answerText, index) => {
        if (isVoted) return;

        setIsVoted(true);
        setSelectedAnswer(index);

        // Visual reveal delay
        setTimeout(() => {
            setShowFooterAfter(true);
        }, 800);

        // Send to Bubble
        sendToBubble('bubble_fn_daily_question', 'vote', { answer: answerText, index });

        // Credit Animation Logic (Ported from legacy)
        setTimeout(() => {
            triggerCreditAnimation();
        }, 2000);
    };

    const triggerCreditAnimation = () => {
        // Create dim overlay
        const dimOverlay = document.createElement('div');
        dimOverlay.className = 'dim-overlay active';
        document.body.appendChild(dimOverlay);

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
                    ${credits}
                </span>
            </div>
        `;
        document.body.appendChild(overlay);

        // Step 2: Increment number
        setTimeout(() => {
            const overlayNum = document.getElementById('overlayCreditsNumber');
            let start = credits;
            let end = credits + 1;
            let duration = 600;
            let startTime = null;
            
            function animateNumber(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.round(start + (end - start) * easeOutQuart);
                if (overlayNum) overlayNum.innerText = current;
                if (progress < 1) requestAnimationFrame(animateNumber);
            }
            requestAnimationFrame(animateNumber);
        }, 600);

        // Step 3: Move to corner
        setTimeout(() => {
            overlay.classList.remove('credit-center-animation');
            overlay.classList.add('credit-move-animation');
            dimOverlay.classList.remove('active');
            
            // Force reflow
            overlay.offsetHeight;

            if (creditsCircleRef.current) {
                const targetRect = creditsCircleRef.current.getBoundingClientRect();
                
                // Match original logic: move to top-left of target rect
                overlay.style.top = targetRect.top + 'px';
                overlay.style.left = targetRect.left + 'px';
                overlay.style.transform = 'scale(1)'; // This REMOVES the translate(-50%, -50%)
                
                const overlayCircle = overlay.querySelector('div');
                overlayCircle.style.transition = 'width 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                overlayCircle.style.width = '32px';
                overlayCircle.style.height = '32px';
                overlayCircle.querySelector('span').style.fontSize = '0.75rem';
            }
        }, 1200);

        // Step 4: Cleanup and pulse
        setTimeout(() => {
            setCredits(prev => prev + 1);
            
            if (creditsCircleRef.current) {
                // Original subtle pulse logic
                creditsCircleRef.current.style.transition = 'transform 0.3s ease';
                creditsCircleRef.current.style.transform = 'translateY(-50%) scale(1.2)';
                
                setTimeout(() => {
                    if (creditsCircleRef.current) {
                        creditsCircleRef.current.style.transform = 'translateY(-50%) scale(1)';
                    }
                }, 300);
            }

            overlay.remove();
            dimOverlay.remove();
        }, 1800);
    };

    const handleStart = () => {
        sendToBubble('bubble_fn_daily_question', 'start_planning');
    };

    const handleClose = () => {
        sendToBubble('bubble_fn_daily_question', 'close');
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden gradient-purple-orange font-poppins">
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
                <button onClick={handleClose}
                        className="pointer-events-auto absolute top-[18px] left-[18px] w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity z-20">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M13.6675 1.99162C14.1108 1.53601 14.1108 0.79732 13.6675 0.341709C13.2243 -0.113903 12.5056 -0.113903 12.0623 0.341709L7 5.54491L1.9377 0.341709C1.49442 -0.113903 0.775732 -0.113903 0.332457 0.341708C-0.110818 0.79732 -0.110818 1.53601 0.332457 1.99162L5.20521 7L0.332456 12.0084C-0.110819 12.464 -0.110819 13.2027 0.332456 13.6583C0.77573 14.1139 1.49442 14.1139 1.93769 13.6583L7 8.45509L12.0623 13.6583C12.5056 14.1139 13.2243 14.1139 13.6675 13.6583C14.1108 13.2027 14.1108 12.464 13.6675 12.0084L8.79479 7L13.6675 1.99162Z" fill="white"/>
                  </svg>
                </button>

                <div className="absolute top-4 -right-[95px] z-10">
                  <div className="relative w-[180px] h-10 rounded-full flex items-center border border-solid border-white/50">
                    <div ref={creditsCircleRef} id="creditsCircle" 
                         className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-jakarta font-extrabold text-xs text-white tracking-wide leading-none">{credits}</span>
                    </div>
                    <span className="absolute left-[42px] top-1/2 translate-y-[6px] font-jakarta font-medium text-[10px] text-white tracking-wide leading-none">Credits</span>
                  </div>
                </div>
            </div>

            <div className="px-9 pt-[78px] max-w-[375px] mx-auto relative z-10">
              
              <div className="font-jakarta font-medium text-lg text-white mb-[68px]">
                {category || 'Time Together'}
              </div>

              <div className="font-poppins font-semibold text-xl text-white leading-[30px] tracking-[0.02em] mb-10 max-w-[303px]">
                {question}
              </div>

              <div className="space-y-[19px] mb-16">
                {options.map((opt, i) => {
                    const optIndex = opt.index !== undefined ? opt.index : (i + 1);
                    const isSelected = isVoted && (selectedAnswer === optIndex);
                    
                    return (
                        <div key={optIndex}
                             className={`daily-question-option relative w-full max-w-[315px] h-9 bg-white/[0.07] border border-solid border-white/10 rounded-lg cursor-pointer overflow-hidden transition-[background-color] duration-200 hover:bg-white/10 ${isVoted ? 'voted pointer-events-none' : ''} ${isSelected ? 'selected-option' : ''}`}
                             onClick={() => handleVote(opt.text, optIndex)}>
                             
                             <div className="option-bar absolute left-0 top-0 h-full bg-[#6D6987]/70 rounded-lg"
                                  style={{ width: isVoted ? `${opt.percent}%` : '0%' }}></div>
                             
                             <div className="relative flex items-center justify-between h-full px-[42px] z-10">
                                <span className="font-poppins font-bold text-sm text-[#F8F8F8] tracking-[0.02em]">{opt.text}</span>
                                <span className={`percentage font-poppins text-xs text-[#F8F8F8] tracking-[0.02em] ${isVoted ? 'opacity-100' : 'opacity-0'}`}
                                      style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                                    {opt.percent}%
                                </span>
                             </div>
                        </div>
                    );
                })}
              </div>

              <div className="min-h-[100px] flex flex-col items-center justify-start">
                  
                  {!showFooterAfter ? (
                      <div className="font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[295px]">
                        Vote and see the live results and also gain 1 credits
                      </div>
                  ) : (
                      <>
                        <div className="font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[309px] mb-6 animate-fade-in">
                          {userName}, We would love to answer any follow up question you might have about {category}
                        </div>

                        <button onClick={handleStart} 
                                className="px-10 py-3 bg-white rounded-[64px] btn-pressed animate-fade-in pointer-events-auto">
                          <span className="font-jakarta font-semibold text-[17px] text-[#E76B0C] tracking-[0.7px] pointer-events-none">Start</span>
                        </button>
                      </>
                  )}

              </div>
            </div>
        </div>
    );
};

export default DailyQuestion;
