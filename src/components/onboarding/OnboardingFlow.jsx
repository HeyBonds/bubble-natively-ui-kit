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
    const creditsCircleRef = useRef(null);
    const storage = useNativelyStorage();

    // Restore persisted state on mount
    useEffect(() => {
        let cancelled = false;
        storage.getItem(STORAGE_KEY).then(raw => {
            if (cancelled || !raw) { setReady(true); return; }
            try {
                const saved = JSON.parse(raw);
                if (saved.currentStep != null) setCurrentStep(saved.currentStep);
                if (saved.answers) setAnswers(saved.answers);
                if (saved.credits != null) setCredits(saved.credits);
                if (saved.rotationOffsets) setRotationOffsets(saved.rotationOffsets);
            } catch (e) {
                console.warn('Failed to restore onboarding state:', e);
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
        if (isNewAnswer) {
            setCredits(newCredits);
            triggerCreditPulse();
        }

        // Persist locally for resume
        const nextStep = currentStep + 1;
        persistState(nextStep, newAnswers, newCredits, rotationOffsets);

        // Notify Bubble of step completion
        sendToBubble('bubble_fn_onboarding', 'step_complete', {
            step: currentStep,
            answer: data.answer || '',
            variable: data.variable || '',
        });

        // Last step → complete, otherwise advance
        if (currentStep >= totalSteps - 1) {
            // Clear persisted state — onboarding is done
            storage.removeItem(STORAGE_KEY);

            sendToBubble('bubble_fn_onboarding', 'complete', {
                answers: JSON.stringify(newAnswers),
                credits: newCredits,
            });

            if (onComplete) onComplete(newAnswers, newCredits);
        } else {
            setTimeout(() => goForward(), 600);
        }
    }, [currentStep, step, answers, credits, totalSteps, goForward, persistState, storage, answeredThisVisit, rotationOffsets, onComplete]);

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
            {/* Top Bar */}
            <div className="z-20 px-5 pt-[46px] pb-5 overflow-hidden">
                <div className="flex items-end gap-4">
                    {/* Back Button */}
                    <button
                        onClick={currentStep === 0 && onBackOut ? onBackOut : goBack}
                        className={`w-10 h-10 rounded-full border border-solid border-white/40 flex items-center justify-center transition-all shrink-0 ${
                            currentStep === 0 && !onBackOut ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10'
                        }`}
                    >
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                            <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    {/* Progress — centered in remaining space */}
                    <div className="flex-1 flex flex-col gap-1.5 items-center pb-[3px]">
                        <span className="font-semibold text-[10px] text-white tracking-[0.5px]">
                            {currentStep + 1}/{totalSteps}
                        </span>
                        <div className="h-[14px] w-full max-w-[200px] rounded-[90px] border border-solid border-white/50 backdrop-blur-[15px] shadow-[0_4px_50px_rgba(0,0,0,0.2)] overflow-hidden">
                            <div
                                className="h-full rounded-[90px] bg-white/30 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Credits Widget — in flex flow, extends off-screen right */}
                    {showCredits && (
                        <div className="shrink-0 -mr-[95px]">
                            <div className="relative w-[180px] h-10 rounded-full flex items-center border border-solid border-white/50">
                                <div
                                    ref={creditsCircleRef}
                                    className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <span className="font-jakarta font-extrabold text-xs text-white tracking-wide leading-none">
                                        {credits}
                                    </span>
                                </div>
                                <span className="absolute left-[42px] top-1/2 -translate-y-1/2 font-jakarta font-medium text-[10px] text-white tracking-wide leading-none">
                                    Credits
                                </span>
                            </div>
                        </div>
                    )}
                </div>
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
