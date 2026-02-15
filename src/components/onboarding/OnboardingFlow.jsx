import React, { useState, useRef, useCallback } from 'react';
import SingleSelect from './SingleSelect';

const SCREEN_COMPONENTS = {
    'single-select': SingleSelect,
    // Future:
    // 'multi-select': MultiSelect,
    // 'carousel': Carousel,
    // 'open-question': OpenQuestion,
    // 'loading-insight': LoadingInsight,
};

const OnboardingFlow = ({ steps = [], credits: initialCredits = 0, showCredits = true, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [credits, setCredits] = useState(initialCredits);
    const [direction, setDirection] = useState('forward'); // 'forward' | 'back'
    const [animating, setAnimating] = useState(false);
    const creditsCircleRef = useRef(null);

    const step = steps[currentStep];
    const totalSteps = steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const goForward = useCallback(() => {
        if (animating) return;
        if (currentStep >= totalSteps - 1) {
            // Last step — notify Bubble
            if (onComplete) return onComplete(credits);
            if (window.BubbleBridge) {
                window.BubbleBridge.send('bubble_fn_onboarding', { action: 'complete', credits });
            }
            return;
        }
        setDirection('forward');
        setAnimating(true);
        setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setAnimating(false);
        }, 300);
    }, [currentStep, totalSteps, animating, credits, onComplete]);

    const goBack = useCallback(() => {
        if (animating || currentStep === 0) return;
        setDirection('back');
        setAnimating(true);
        setTimeout(() => {
            setCurrentStep(prev => prev - 1);
            setAnimating(false);
        }, 300);
    }, [currentStep, animating]);

    const handleAnswer = useCallback((data) => {
        // Increment credits
        triggerCreditAnimation();

        // Notify Bubble
        if (window.BubbleBridge) {
            window.BubbleBridge.send('bubble_fn_onboarding', {
                action: 'answer',
                step: currentStep,
                stepType: step?.type,
                ...data,
            });
        }

        // Advance after a brief delay for the selection to register visually
        setTimeout(() => goForward(), 600);
    }, [currentStep, step, goForward]);

    const handleRefresh = useCallback(() => {
        if (window.BubbleBridge) {
            window.BubbleBridge.send('bubble_fn_onboarding', {
                action: 'refresh',
                step: currentStep,
            });
        }
    }, [currentStep]);

    const triggerCreditAnimation = () => {
        setCredits(prev => prev + 1);

        // Simple pulse on the circle in place
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

    // Resolve screen component
    const ScreenComponent = step ? SCREEN_COMPONENTS[step.type] : null;

    // Animation classes for content transition
    const getAnimClass = () => {
        if (!animating) return 'animate-fade-in';
        return direction === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right';
    };

    return (
        <div className="flex flex-col w-full h-full overflow-hidden font-jakarta" style={{
            background: 'linear-gradient(160deg, #2E4695 0%, #652664 100%)',
        }}>
            {/* Top Bar */}
            <div className="z-20 px-5 pt-[46px] pb-5 overflow-hidden">
                <div className="flex items-end gap-4">
                    {/* Back Button */}
                    <button
                        onClick={goBack}
                        className={`w-10 h-10 rounded-full border border-solid border-white/40 flex items-center justify-center transition-all shrink-0 ${
                            currentStep === 0 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10'
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
