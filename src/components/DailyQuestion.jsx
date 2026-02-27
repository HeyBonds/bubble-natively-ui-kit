import React, { useState, useRef, useEffect } from 'react';
import { sendToBubble } from '../utils/bubble';

const DUOLINGO_GREEN = '#58CC02';
const GREEN_SHADOW = '#46A302';

// Darker silver coin — matches JourneyPath but toned down so the "B" is legible
const COIN_BG = 'radial-gradient(circle at 35% 30%, #C8C8C8, #8A8A8A 70%, #6E6E6E)';
const COIN_SHADOW = '0 2px 0 0 #555';

const DailyQuestion = ({ category, question, options, userName, credits: initialCredits, selectedAnswer: initialSelectedAnswer, theme, pop: _pop }) => {
    const [credits, setCredits] = useState(initialCredits || 0);
    const [selectedAnswer, setSelectedAnswer] = useState(initialSelectedAnswer);
    const [isVoted, setIsVoted] = useState(initialSelectedAnswer !== undefined && initialSelectedAnswer !== null);
    const [showFooterAfter, setShowFooterAfter] = useState(isVoted);
    const coinRef = useRef(null);
    const timersRef = useRef([]);
    const overlaysRef = useRef([]);
    const rafRef = useRef(null);

    // Cleanup all pending timers, DOM overlays, and rAF on unmount
    useEffect(() => {
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            overlaysRef.current.forEach(el => { try { el.remove(); } catch (_) { /* noop */ } });
            overlaysRef.current = [];
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const addTimer = (fn, delay) => {
        const id = setTimeout(fn, delay);
        timersRef.current.push(id);
        return id;
    };

    const handleVote = (answerText, index) => {
        if (isVoted) return;

        setIsVoted(true);
        setSelectedAnswer(index);

        addTimer(() => {
            setShowFooterAfter(true);
        }, 800);

        sendToBubble('bubble_fn_daily_question', 'vote', { answer: answerText, index });

        addTimer(() => {
            triggerCreditAnimation();
        }, 2000);
    };

    const triggerCreditAnimation = () => {
        // Dim overlay
        const dimOverlay = document.createElement('div');
        dimOverlay.className = 'dim-overlay active';
        document.body.appendChild(dimOverlay);
        overlaysRef.current.push(dimOverlay);

        // B coin + "+1" label — center pop
        const overlay = document.createElement('div');
        overlay.className = 'credit-center-animation';
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            pointer-events: none;
        `;

        overlay.innerHTML = `
            <div class="overlay-coin" style="width: 80px; height: 80px; border-radius: 50%; background: ${COIN_BG}; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 24px rgba(0,0,0,0.3), ${COIN_SHADOW};">
                <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 2rem; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3); line-height: 1;">B</span>
            </div>
            <span class="overlay-plus" style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 10px; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 2rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.4); opacity: 0; transition: opacity 300ms ease;">+1</span>
        `;
        document.body.appendChild(overlay);
        overlaysRef.current.push(overlay);

        // Step 2: Fade in the "+1" label
        addTimer(() => {
            const plus = overlay.querySelector('.overlay-plus');
            if (plus) plus.style.opacity = '1';
        }, 500);

        // Step 3: Fade out "+1"
        addTimer(() => {
            const plus = overlay.querySelector('.overlay-plus');
            if (plus) plus.style.opacity = '0';
        }, 1100);

        // Step 4: Fly coin to target via transform (GPU-composited, no top/left)
        addTimer(() => {
            // Snapshot current center position
            const startRect = overlay.getBoundingClientRect();
            overlay.classList.remove('credit-center-animation');
            overlay.style.top = startRect.top + 'px';
            overlay.style.left = startRect.left + 'px';
            overlay.style.transform = 'none';

            overlay.classList.add('credit-move-animation');
            dimOverlay.classList.remove('active');
            overlay.offsetHeight; // force reflow

            if (coinRef.current) {
                const targetRect = coinRef.current.getBoundingClientRect();
                const dx = targetRect.left - startRect.left;
                const dy = targetRect.top - startRect.top;
                overlay.style.transform = `translate(${dx}px, ${dy}px)`;

                const coinEl = overlay.querySelector('.overlay-coin');
                if (coinEl) {
                    coinEl.style.transition = 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                    coinEl.style.transformOrigin = 'top left';
                    coinEl.style.transform = 'scale(0.4)'; // 80px → 32px
                }
            }
        }, 1300);

        // Step 5: Cleanup, pulse coin, animate number increment
        addTimer(() => {
            overlay.remove();
            dimOverlay.remove();
            overlaysRef.current = overlaysRef.current.filter(el => el !== overlay && el !== dimOverlay);

            // Pulse the target coin
            if (coinRef.current) {
                coinRef.current.style.transition = 'transform 0.3s ease';
                coinRef.current.style.transform = 'scale(1.3)';
                addTimer(() => {
                    if (coinRef.current) coinRef.current.style.transform = 'scale(1)';
                }, 300);
            }

            // Animate the number counting up
            setCredits(prev => {
                const start = prev;
                const end = prev + 1;
                const duration = 400;
                let startTime = null;
                const numEl = document.getElementById('creditsNumber');

                function tick(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(start + (end - start) * easeOut);
                    if (numEl) numEl.textContent = current;
                    if (progress < 1) {
                        rafRef.current = requestAnimationFrame(tick);
                    }
                }
                rafRef.current = requestAnimationFrame(tick);
                return end;
            });
        }, 1900);
    };

    const handleStart = () => {
        sendToBubble('bubble_fn_daily_question', 'start_planning');
    };

    return (
        <div className="relative w-full h-full overflow-x-hidden font-poppins flex flex-col" style={{ background: theme.bg }}>

            {/* Credits coin — top right, clears back button on left */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                <div
                    ref={coinRef}
                    className="coin-shimmer"
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: COIN_BG,
                        boxShadow: COIN_SHADOW,
                    }}
                >
                    <span className="font-extrabold text-[12px] text-white" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}>B</span>
                </div>
                <span id="creditsNumber" className="font-extrabold text-[16px]" style={{ color: theme.creditsText }}>{credits}</span>
            </div>

            <div className="flex flex-col flex-1 min-h-0 px-7 pt-16 pb-8 max-w-[375px] mx-auto relative overflow-y-auto">

              {/* Category */}
              <div className="font-jakarta font-medium text-lg mb-6" style={{ color: theme.textSecondary }}>
                {category || 'Time Together'}
              </div>

              {/* Question */}
              <div className="font-poppins font-bold text-xl leading-[30px] tracking-[0.02em] mb-8 max-w-[303px]" style={{ color: theme.textPrimary }}>
                {question}
              </div>

              {/* Options — Duolingo chunky style */}
              <div className="space-y-3">
                {options.map((opt, i) => {
                    const optIndex = opt.index !== undefined ? opt.index : (i + 1);
                    const isSelected = isVoted && (selectedAnswer === optIndex);

                    return (
                        <button key={optIndex}
                             className={`relative w-full h-12 rounded-xl border-2 border-solid cursor-pointer overflow-hidden transition-[transform,border-color] duration-200 text-left ${isVoted ? 'pointer-events-none' : 'active:translate-y-[2px]'}`}
                             style={{
                                 background: theme.surface,
                                 borderColor: isSelected ? DUOLINGO_GREEN : theme.border,
                                 boxShadow: isSelected
                                     ? `0 4px 0 ${GREEN_SHADOW}`
                                     : isVoted ? 'none' : `0 4px 0 ${theme.cardShadow}`,
                             }}
                             onClick={() => handleVote(opt.text, optIndex)}>

                             {/* Percentage fill bar — scaleX for GPU-composited animation */}
                             <div className="option-bar absolute left-0 top-0 h-full w-full rounded-xl"
                                  style={{
                                      transform: isVoted ? `scaleX(${opt.percent / 100})` : undefined,
                                      background: isSelected ? `${DUOLINGO_GREEN}4D` : `${DUOLINGO_GREEN}30`,
                                  }}></div>

                             <div className="relative flex items-center justify-between h-full px-4 z-10">
                                <span className="font-poppins font-bold text-sm tracking-[0.02em]" style={{ color: theme.textPrimary }}>{opt.text}</span>
                                <span className={`percentage font-poppins text-xs tracking-[0.02em] ${isVoted ? 'opacity-100' : 'opacity-0'}`}
                                      style={{ color: theme.textPrimary, fontWeight: isSelected ? 'bold' : 'normal' }}>
                                    {opt.percent}%
                                </span>
                             </div>
                        </button>
                    );
                })}
              </div>

              <div className="flex-1" />

              {/* Footer */}
              <div className="flex flex-col items-center justify-center py-4">

                  {!showFooterAfter ? (
                      <div className="font-poppins text-base text-center leading-6 tracking-[0.02em] max-w-[295px]" style={{ color: theme.textSecondary }}>
                        Vote and see the live results and also gain 1 credits
                      </div>
                  ) : (
                      <>
                        <div className="font-poppins text-base text-center leading-6 tracking-[0.02em] max-w-[309px] mb-6 animate-fade-in" style={{ color: theme.textSecondary }}>
                          {userName}, We would love to answer any follow up question you might have about {category}
                        </div>

                        <button onClick={handleStart}
                                className="px-10 py-3 rounded-xl border-b-[3px] border-solid border-[#D4D4D4] active:border-b-0 active:mt-[3px] animate-fade-in pointer-events-auto"
                                style={{ background: '#FFFFFF', color: DUOLINGO_GREEN }}>
                          <span className="font-jakarta font-extrabold text-[15px] pointer-events-none">Start</span>
                        </button>
                      </>
                  )}

              </div>
            </div>
        </div>
    );
};

export default DailyQuestion;
