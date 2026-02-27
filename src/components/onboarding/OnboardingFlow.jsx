import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendToBubble } from '../../utils/bubble';
import { useNativelyStorage } from '../../hooks/useNativelyStorage';
import SingleSelect from './SingleSelect';
import SliderSelect from './SliderSelect';
import MultiSelect from './MultiSelect';
import OpenQuestion from './OpenQuestion';

const SCREEN_COMPONENTS = {
    'single-select': SingleSelect,
    'slider': SliderSelect,
    'multi-select': MultiSelect,
    'open-question': OpenQuestion,
};

const STORAGE_KEY = 'onboarding_state';

const OnboardingFlow = ({
    steps = [],
    credits: initialCredits = 0,
    initialStep = 0,
    initialAnswers = {},
    showCredits = true,
    theme,
    onComplete,
    onBack: onBackOut,
}) => {
    const ob = theme?.onboarding || {};
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [credits, setCredits] = useState(initialCredits);
    const [answers, setAnswers] = useState(initialAnswers);
    const [direction, setDirection] = useState('forward');
    const [animating, setAnimating] = useState(false);
    const [answeredThisVisit, setAnsweredThisVisit] = useState(false);
    const [rotationOffsets, setRotationOffsets] = useState({});
    const [ready, setReady] = useState(false);
    const [creditIntroSeen, setCreditIntroSeen] = useState(false);
    const creditsCircleRef = useRef(null);
    const creditIntroRunningRef = useRef(false);
    const storage = useNativelyStorage();

    // Restore persisted state on mount
    useEffect(() => {
        let cancelled = false;
        Promise.all([
            storage.getItem(STORAGE_KEY),
            storage.getItem('credits_intro_seen'),
        ]).then(([raw, introSeen]) => {
            if (cancelled) return;
            if (introSeen === 'true') setCreditIntroSeen(true);
            if (raw) {
                try {
                    const saved = JSON.parse(raw);
                    if (saved.currentStep != null) setCurrentStep(saved.currentStep);
                    if (saved.answers) setAnswers(saved.answers);
                    if (saved.credits != null) setCredits(saved.credits);
                    if (saved.rotationOffsets) setRotationOffsets(saved.rotationOffsets);
                } catch (e) {
                    console.warn('Failed to restore onboarding state:', e);
                }
            }
            setReady(true);
        });
        return () => { cancelled = true; };
    }, [storage]);

    const step = steps[currentStep];
    const totalSteps = steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    // Get visible options for a step, handling pool rotation
    const getVisibleOptions = useCallback((s, stepIndex) => {
        if (s.optionPool && s.visibleCount) {
            const pool = s.optionPool;
            const count = s.visibleCount;
            const offset = rotationOffsets[stepIndex] || 0;
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(pool[(offset + i) % pool.length]);
            }
            return result;
        }
        return s.options;
    }, [rotationOffsets]);

    // Persist current state to device storage for resume
    const persistState = useCallback((stepIndex, allAnswers, currentCredits, offsets) => {
        const state = {
            currentStep: stepIndex,
            answers: allAnswers,
            credits: currentCredits,
            rotationOffsets: offsets,
        };
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [storage]);

    const goForward = useCallback(() => {
        if (animating || currentStep >= totalSteps - 1) return;
        setDirection('forward');
        setAnimating(true);
        setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setAnimating(false);
            setAnsweredThisVisit(false);
        }, 300);
    }, [currentStep, totalSteps, animating]);

    const goBack = useCallback(() => {
        if (animating || currentStep === 0) return;
        setDirection('back');
        setAnimating(true);
        setTimeout(() => {
            setCurrentStep(prev => prev - 1);
            setAnimating(false);
            setAnsweredThisVisit(false);
        }, 300);
    }, [currentStep, animating]);

    const triggerCreditPulse = useCallback(() => {
        if (showCredits && creditsCircleRef.current) {
            creditsCircleRef.current.style.transition = 'transform 0.3s ease';
            creditsCircleRef.current.style.transform = 'scale(1.3)';
            setTimeout(() => {
                if (creditsCircleRef.current) {
                    creditsCircleRef.current.style.transform = 'scale(1)';
                }
            }, 300);
        }
    }, [showCredits]);

    // First-time credit intro animation (0→1)
    // DailyQ-style coin entry (center pop, "+1") → message + button → tap dismisses → coin flies to target → pulse → increment
    const triggerCreditIntro = useCallback(() => {
        return new Promise((resolve) => {
            if (!creditsCircleRef.current || creditIntroRunningRef.current) { resolve(); return; }
            creditIntroRunningRef.current = true;

            const COIN_BG = 'radial-gradient(circle at 35% 30%, #C8C8C8, #8A8A8A 70%, #6E6E6E)';
            const COIN_SHADOW = '0 2px 0 0 #555';

            // Declare elements first so dismiss() can reference them via closure
            let dimOverlay, coinOverlay, msgPanel;
            let safetyTimer;

            const dismiss = () => {
                clearTimeout(safetyTimer);

                // Hide "+1" via closure reference (no global DOM query)
                const plusEl = coinOverlay.querySelector('.overlay-plus');
                if (plusEl) plusEl.style.opacity = '0';

                // Fade out message panel
                msgPanel.style.opacity = '0';

                // Snapshot current center position before removing animation class
                const coinRect = coinOverlay.getBoundingClientRect();
                coinOverlay.classList.remove('credit-center-animation');

                // Pin to current computed position (preserve center alignment)
                coinOverlay.style.top = coinRect.top + 'px';
                coinOverlay.style.left = coinRect.left + 'px';
                coinOverlay.style.transform = 'none';

                // Now add fly transition and fade dim
                coinOverlay.classList.add('credit-move-animation');
                dimOverlay.classList.remove('active');

                // Force reflow before setting target
                coinOverlay.offsetHeight;

                if (creditsCircleRef.current) {
                    const targetRect = creditsCircleRef.current.getBoundingClientRect();
                    coinOverlay.style.top = targetRect.top + 'px';
                    coinOverlay.style.left = targetRect.left + 'px';

                    const coinEl = coinOverlay.querySelector('.overlay-coin');
                    if (coinEl) {
                        coinEl.style.transition = 'width 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1)';
                        coinEl.style.width = '32px';
                        coinEl.style.height = '32px';
                        const spanEl = coinEl.querySelector('span');
                        if (spanEl) spanEl.style.fontSize = '0.75rem';
                    }
                }

                // Cleanup after fly completes
                setTimeout(() => {
                    coinOverlay.remove();
                    dimOverlay.remove();
                    msgPanel.remove();

                    // Pulse the target coin
                    if (creditsCircleRef.current) {
                        creditsCircleRef.current.style.transition = 'transform 0.3s ease';
                        creditsCircleRef.current.style.transform = 'scale(1.3)';
                        setTimeout(() => {
                            if (creditsCircleRef.current) creditsCircleRef.current.style.transform = 'scale(1)';
                        }, 300);
                    }

                    // Increment credits 0→1
                    setCredits(1);

                    // Mark intro as seen and resolve
                    setCreditIntroSeen(true);
                    storage.setItem('credits_intro_seen', 'true');
                    creditIntroRunningRef.current = false;
                    resolve();
                }, 700);
            };

            // Safety net: auto-dismiss after 10 seconds
            safetyTimer = setTimeout(() => { dismiss(); }, 10000);

            // 1. Dim overlay — fade in via rAF, tappable as fallback dismiss
            dimOverlay = document.createElement('div');
            dimOverlay.className = 'dim-overlay';
            dimOverlay.addEventListener('click', dismiss);
            dimOverlay.addEventListener('touchend', (e) => { e.preventDefault(); dismiss(); });
            document.body.appendChild(dimOverlay);
            requestAnimationFrame(() => dimOverlay.classList.add('active'));

            // 2. B coin + "+1" — center pop via credit-center-animation CSS class
            coinOverlay = document.createElement('div');
            coinOverlay.className = 'credit-center-animation';
            coinOverlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                pointer-events: none;
            `;
            coinOverlay.innerHTML = `
                <div class="overlay-coin" style="width: 80px; height: 80px; border-radius: 50%; background: ${COIN_BG}; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 24px rgba(0,0,0,0.3), ${COIN_SHADOW};">
                    <span style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 2rem; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.3); line-height: 1;">B</span>
                </div>
                <span class="overlay-plus" style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 10px; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 2rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,0.4); opacity: 0; transition: opacity 300ms ease;">+1</span>
            `;
            document.body.appendChild(coinOverlay);

            // 3. Message panel (text + button) — positioned below coin, starts hidden
            msgPanel = document.createElement('div');
            msgPanel.style.cssText = `
                position: fixed;
                top: calc(50% + 64px);
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                opacity: 0;
                transition: opacity 0.4s ease;
                pointer-events: none;
            `;
            msgPanel.innerHTML = `
                <p style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:18px;color:#FFFFFF;margin:0 0 8px 0;line-height:1.4;text-align:center;">
                    Meet your Bonds coins!
                </p>
                <p style="font-family:'Poppins',sans-serif;font-weight:400;font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 24px 0;line-height:1.5;text-align:center;max-width:280px;padding:0 20px;">
                    Every answer earns you a coin.<br/>Use them to unlock experiences in Bonds.
                </p>
                <button style="
                    pointer-events:auto;
                    font-family:'Plus Jakarta Sans',sans-serif;
                    font-weight:700;
                    font-size:16px;
                    color:white;
                    background:#E44B8E;
                    border:none;
                    border-radius:16px;
                    padding:14px 48px;
                    cursor:pointer;
                    letter-spacing:0.5px;
                    box-shadow:0 4px 0 #B83A72;
                    transition:transform 0.15s ease, box-shadow 0.15s ease;
                ">OK, Cool!</button>
            `;
            document.body.appendChild(msgPanel);

            // Wire up CTA button via closure reference
            const cta = msgPanel.querySelector('button');
            if (cta) {
                cta.addEventListener('click', dismiss);
                cta.addEventListener('touchstart', (e) => { e.preventDefault(); dismiss(); });
            }

            // 4. Fade in "+1" at 500ms
            setTimeout(() => {
                const plusEl = coinOverlay.querySelector('.overlay-plus');
                if (plusEl) plusEl.style.opacity = '1';
            }, 500);

            // 5. Fade in message panel at 1000ms
            setTimeout(() => {
                msgPanel.style.opacity = '1';
                msgPanel.style.pointerEvents = 'auto';
            }, 1000);
        });
    }, [storage]);

    const handleAnswer = useCallback((data) => {
        if (answeredThisVisit) return;
        setAnsweredThisVisit(true);

        const isNewAnswer = !answers[currentStep];
        const newCredits = isNewAnswer ? credits + 1 : credits;
        const stepAnswer = {
            questionId: step?.questionId,
            type: step?.type,
            ...data,
        };
        const newAnswers = { ...answers, [currentStep]: stepAnswer };

        // Will the credit intro animation play? (first credit ever, intro not yet seen)
        const willPlayIntro = isNewAnswer && credits === 0 && !creditIntroSeen && !creditIntroRunningRef.current;

        // Update state — defer credit increment if intro will animate it visually (0→1)
        setAnswers(newAnswers);
        if (isNewAnswer && !willPlayIntro) setCredits(newCredits);

        // Persist locally for resume (always persist the final credit count)
        const nextStep = currentStep + 1;
        persistState(nextStep, newAnswers, newCredits, rotationOffsets);

        // Notify Bubble of step completion
        sendToBubble('bubble_fn_onboarding', 'step_complete', {
            step: currentStep,
            answer: data.answer || '',
            variable: data.variable || '',
        });

        // Determine what happens after the answer
        const advanceOrComplete = () => {
            if (currentStep >= totalSteps - 1) {
                storage.removeItem(STORAGE_KEY);
                sendToBubble('bubble_fn_onboarding', 'complete', {
                    answers: JSON.stringify(newAnswers),
                    credits: newCredits,
                });
                if (onComplete) onComplete(newAnswers, newCredits);
            } else {
                setTimeout(() => goForward(), 600);
            }
        };

        // First credit ever → pause, then play coin center-pop animation (mirrors DailyQuestion)
        if (willPlayIntro) {
            setTimeout(() => triggerCreditIntro().then(advanceOrComplete), 500);
        } else {
            if (isNewAnswer) triggerCreditPulse();
            advanceOrComplete();
        }
    }, [currentStep, step, answers, credits, totalSteps, goForward, persistState, storage, answeredThisVisit, rotationOffsets, onComplete, creditIntroSeen, triggerCreditIntro, triggerCreditPulse]);

    const handleRefresh = useCallback(() => {
        const s = steps[currentStep];
        if (!s || !s.optionPool || !s.visibleCount) return;

        setRotationOffsets(prev => {
            const currentOffset = prev[currentStep] || 0;
            return { ...prev, [currentStep]: currentOffset + s.visibleCount };
        });

        sendToBubble('bubble_fn_onboarding', 'refresh', { step: currentStep });
    }, [currentStep, steps]);

    // Wait for persisted state to load before rendering
    // Show matching background while loading persisted state (prevents white flash on mobile)
    if (!ready) return (
        <div className="w-full h-full" style={{ background: ob.bg }} />
    );

    // Resolve screen component
    const ScreenComponent = step ? SCREEN_COMPONENTS[step.type] : null;

    // Animation classes for content transition
    const getAnimClass = () => {
        if (!animating) return 'animate-fade-in';
        return direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
    };

    // Get previous answer for current step (for resume / going back)
    const previousAnswer = answers[currentStep] || null;

    // Build props for the screen component
    const visibleOptions = step ? getVisibleOptions(step, currentStep) : [];

    return (
        <div className="flex flex-col w-full h-full overflow-hidden font-jakarta" style={{
            background: ob.bg,
        }}>
            {/* Top Bar — absolute positioned like DailyQuestion */}
            <div className="relative z-20 shrink-0 pt-[18px] pb-4 px-[18px]">
                {/* Back Button — matches DailyQuestion X button positioning */}
                <button
                    onClick={currentStep === 0 && onBackOut ? onBackOut : goBack}
                    className={`w-8 h-8 rounded-full border border-solid flex items-center justify-center transition-opacity duration-200 ${
                        currentStep === 0 && !onBackOut ? 'opacity-0 pointer-events-none' : ''
                    }`}
                    style={{ background: ob.backBg, borderColor: ob.backBorder }}
                >
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                        <path d="M6 1L1 6L6 11" stroke={ob.backIcon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Progress — centered absolutely */}
                <div className="absolute left-1/2 top-[18px] -translate-x-1/2 flex flex-col gap-1.5 items-center">
                    <span className="font-semibold text-[10px] tracking-[0.5px]" style={{ color: ob.text }}>
                        {currentStep + 1}/{totalSteps}
                    </span>
                    <div className="h-[14px] w-[180px] rounded-[90px] border border-solid overflow-hidden" style={{ borderColor: ob.progressBarBorder, background: ob.progressBarBg }}>
                        <div
                            className="h-full rounded-[90px] transition-[width] duration-500 ease-out"
                            style={{ width: `${progress}%`, background: ob.progressBarFill }}
                        />
                    </div>
                </div>

                {/* Credits — coin + number, matches DailyQuestion / JourneyPath */}
                {showCredits && (
                    <div className="absolute top-[18px] right-[18px] z-10 flex items-center gap-2">
                        <div
                            ref={creditsCircleRef}
                            className="coin-shimmer"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'radial-gradient(circle at 35% 30%, #C8C8C8, #8A8A8A 70%, #6E6E6E)',
                                boxShadow: '0 2px 0 0 #555',
                            }}
                        >
                            <span className="font-jakarta font-extrabold text-[12px] text-white" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.25)' }}>B</span>
                        </div>
                        <span className="font-extrabold text-[16px] min-w-[16px] text-center" style={{ color: theme?.creditsText }}>{credits}</span>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: ob.divider }} />

            {/* Screen Content */}
            <div className={`flex-1 flex flex-col overflow-hidden ${getAnimClass()}`} key={currentStep}>
                {ScreenComponent ? (
                    <ScreenComponent
                        {...step}
                        options={visibleOptions}
                        previousAnswer={previousAnswer}
                        theme={theme}
                        onAnswer={handleAnswer}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-sm" style={{ color: ob.textMuted }}>Unknown step type: {step?.type}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
