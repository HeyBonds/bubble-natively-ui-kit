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
    onComplete,
    onBack: onBackOut,
}) => {
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
    }, []);

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

        // Update state
        setAnswers(newAnswers);
        if (isNewAnswer) setCredits(newCredits);

        // Persist locally for resume
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

        // First credit ever + not seen intro → play the full intro animation
        if (isNewAnswer && credits === 0 && !creditIntroSeen && !creditIntroRunningRef.current) {
            triggerCreditIntro().then(advanceOrComplete);
        } else {
            if (isNewAnswer) triggerCreditPulse();
            advanceOrComplete();
        }
    }, [currentStep, step, answers, credits, totalSteps, goForward, persistState, storage, answeredThisVisit, rotationOffsets, onComplete, creditIntroSeen]);

    const handleRefresh = useCallback(() => {
        const s = steps[currentStep];
        if (!s || !s.optionPool || !s.visibleCount) return;

        setRotationOffsets(prev => {
            const currentOffset = prev[currentStep] || 0;
            return { ...prev, [currentStep]: currentOffset + s.visibleCount };
        });

        sendToBubble('bubble_fn_onboarding', 'refresh', { step: currentStep });
    }, [currentStep, steps]);

    const triggerCreditPulse = () => {
        if (showCredits && creditsCircleRef.current) {
            creditsCircleRef.current.style.transition = 'transform 0.3s ease';
            creditsCircleRef.current.style.transform = 'translateY(-50%) scale(1.2)';
            setTimeout(() => {
                if (creditsCircleRef.current) {
                    creditsCircleRef.current.style.transform = 'translateY(-50%) scale(1)';
                }
            }, 300);
        }
    };

    // First-time credit intro animation (0→1)
    // Returns a Promise that resolves when the animation is done
    const triggerCreditIntro = () => {
        return new Promise((resolve) => {
            if (!creditsCircleRef.current || creditIntroRunningRef.current) { resolve(); return; }
            creditIntroRunningRef.current = true;

            // Get the starting position of the real credits circle
            const startRect = creditsCircleRef.current.getBoundingClientRect();

            // 1. Create dim overlay
            const dim = document.createElement('div');
            dim.className = 'dim-overlay';
            document.body.appendChild(dim);
            requestAnimationFrame(() => dim.classList.add('active'));

            // 2. Create the floating credit circle at the bar position
            const circle = document.createElement('div');
            circle.style.cssText = `
                position: fixed;
                top: ${startRect.top}px;
                left: ${startRect.left}px;
                width: ${startRect.width}px;
                height: ${startRect.height}px;
                z-index: 9999;
                pointer-events: none;
                transition: top 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                            left 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                            width 0.7s cubic-bezier(0.16, 1, 0.3, 1),
                            height 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            circle.innerHTML = `
                <div style="width:100%;height:100%;background:#FF2258;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(255,34,88,0.5);">
                    <span id="credit-intro-num" style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:0.75rem;color:white;letter-spacing:0.05em;line-height:1;transition:font-size 0.7s cubic-bezier(0.16,1,0.3,1);">0</span>
                </div>
            `;
            document.body.appendChild(circle);

            // 3. Create text + button container (hidden initially)
            const textEl = document.createElement('div');
            textEl.style.cssText = `
                position: fixed;
                top: calc(50% + 70px);
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                text-align: center;
                max-width: 280px;
                opacity: 0;
                transition: opacity 0.5s ease;
            `;
            textEl.innerHTML = `
                <p style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:18px;color:white;margin:0 0 8px 0;line-height:1.4;">
                    Meet your Credits! &#x1F389;
                </p>
                <p style="font-family:'Poppins',sans-serif;font-weight:400;font-size:14px;color:rgba(255,255,255,0.7);margin:0 0 24px 0;line-height:1.5;">
                    Every answer earns you a credit.<br/>Use them to unlock experiences in Bonds.
                </p>
                <button id="credit-intro-cta" style="
                    font-family:'Plus Jakarta Sans',sans-serif;
                    font-weight:700;
                    font-size:16px;
                    color:#FF2258;
                    background:white;
                    border:none;
                    border-radius:40px;
                    padding:14px 48px;
                    cursor:pointer;
                    letter-spacing:0.5px;
                    box-shadow:0 4px 20px rgba(255,34,88,0.3);
                    transition:transform 0.15s ease, box-shadow 0.15s ease;
                ">OK, Cool!</button>
            `;
            document.body.appendChild(textEl);

            // Dismiss handler — triggered by the CTA button
            const dismiss = () => {
                // Fade out text + button
                textEl.style.opacity = '0';

                // After fade, fly circle back to bar
                setTimeout(() => {
                    dim.classList.remove('active');

                    const endRect = creditsCircleRef.current?.getBoundingClientRect();
                    if (endRect) {
                        circle.style.top = endRect.top + 'px';
                        circle.style.left = endRect.left + 'px';
                        circle.style.width = endRect.width + 'px';
                        circle.style.height = endRect.height + 'px';
                        const numEl = document.getElementById('credit-intro-num');
                        if (numEl) numEl.style.fontSize = '0.75rem';
                    }
                }, 500);

                // Cleanup + pulse
                setTimeout(() => {
                    circle.remove();
                    textEl.remove();
                    dim.remove();

                    triggerCreditPulse();

                    setCreditIntroSeen(true);
                    storage.setItem('credits_intro_seen', 'true');
                    creditIntroRunningRef.current = false;

                    resolve();
                }, 1300);
            };

            // 4. After a tick, fly circle to center + grow
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const size = 96;
                    circle.style.top = `calc(50% - ${size / 2}px)`;
                    circle.style.left = `calc(50% - ${size / 2}px)`;
                    circle.style.width = size + 'px';
                    circle.style.height = size + 'px';
                    const numEl = document.getElementById('credit-intro-num');
                    if (numEl) numEl.style.fontSize = '2.5rem';
                });
            });

            // 5. After circle arrives at center, increment 0→1
            setTimeout(() => {
                const numEl = document.getElementById('credit-intro-num');
                if (numEl) numEl.innerText = '1';
            }, 800);

            // 6. Fade in text + button
            setTimeout(() => {
                textEl.style.opacity = '1';
                // Wire up the CTA
                const cta = document.getElementById('credit-intro-cta');
                if (cta) {
                    cta.addEventListener('click', dismiss);
                    cta.addEventListener('touchend', (e) => { e.preventDefault(); dismiss(); });
                }
            }, 1100);
        });
    };

    // Wait for persisted state to load before rendering
    if (!ready) return null;

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
            background: 'linear-gradient(160deg, #2E4695 0%, #652664 100%)',
        }}>
            {/* Top Bar — absolute positioned like DailyQuestion */}
            <div className="relative z-20 shrink-0 pt-[18px] pb-4 px-[18px]">
                {/* Back Button — matches DailyQuestion X button positioning */}
                <button
                    onClick={currentStep === 0 && onBackOut ? onBackOut : goBack}
                    className={`w-8 h-8 rounded-full border border-solid border-white/40 flex items-center justify-center transition-opacity duration-200 ${
                        currentStep === 0 && !onBackOut ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10'
                    }`}
                >
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                        <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Progress — centered absolutely */}
                <div className="absolute left-1/2 top-[18px] -translate-x-1/2 flex flex-col gap-1.5 items-center">
                    <span className="font-semibold text-[10px] text-white tracking-[0.5px]">
                        {currentStep + 1}/{totalSteps}
                    </span>
                    <div className="h-[14px] w-[180px] rounded-[90px] border border-solid border-white/50 bg-white/[0.06] overflow-hidden">
                        <div
                            className="h-full rounded-[90px] bg-white/30 transition-[width] duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Credits Widget — same pattern as DailyQuestion */}
                {showCredits && (
                    <div className="absolute top-4 -right-[95px] z-10">
                        <div className="relative w-[180px] h-10 rounded-full flex items-center border border-solid border-white/50">
                            <div
                                ref={creditsCircleRef}
                                className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center shadow-lg"
                            >
                                <span className="font-jakarta font-extrabold text-xs text-white tracking-wide leading-none">
                                    {credits}
                                </span>
                            </div>
                            <span className="absolute left-[42px] top-1/2 translate-y-[6px] font-jakarta font-medium text-[10px] text-white tracking-wide leading-none">
                                Credits
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/15" />

            {/* Screen Content */}
            <div className={`flex-1 flex flex-col overflow-hidden ${getAnimClass()}`} key={currentStep}>
                {ScreenComponent ? (
                    <ScreenComponent
                        {...step}
                        options={visibleOptions}
                        previousAnswer={previousAnswer}
                        onAnswer={handleAnswer}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-white/50 text-sm">Unknown step type: {step?.type}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
