import React, { useState } from 'react';

const OpenQuestion = ({ question, placeholder, charGuidance, previousAnswer, theme, onAnswer }) => {
    const ob = theme?.onboarding || {};
    const [text, setText] = useState(previousAnswer?.answer || '');

    const handleContinue = () => {
        if (!text.trim()) return;
        onAnswer({ answer: text.trim(), variable: '' });
    };

    const hasText = !!text.trim();

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 px-7 pt-8 pb-6 w-full flex flex-col">
                <h1 className="font-bold text-[22px] leading-[30px] tracking-[0.02em] mb-6" style={{ color: ob.text }}>
                    {question}
                </h1>

                <div className="relative flex-1 max-h-[220px]">
                    <style>{`.ob-textarea::placeholder { color: ${ob.inputPlaceholder}; }`}</style>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder || 'Type your answer...'}
                        className="ob-textarea w-full h-full resize-none rounded-2xl px-5 py-4 border-2 border-solid text-[15px] leading-[24px] font-medium focus:outline-none transition-colors"
                        style={{
                            background: ob.inputBg,
                            borderColor: ob.inputBorder,
                            color: ob.text,
                        }}
                        onFocus={(e) => { e.target.style.borderColor = ob.inputFocusBorder; }}
                        onBlur={(e) => { e.target.style.borderColor = ob.inputBorder; }}
                    />
                    {charGuidance && (
                        <span
                            className="absolute bottom-3 right-4 text-[11px] font-medium"
                            style={{ color: text.length > charGuidance ? '#E44B8E' : ob.charCount }}
                        >
                            {text.length} / {charGuidance}
                        </span>
                    )}
                </div>
            </div>

            {/* Continue Button */}
            <div className="shrink-0 pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={!hasText}
                    className={`w-full h-[54px] rounded-2xl flex items-center justify-center transition-[background-color,border-color,box-shadow,transform] duration-200 border-2 border-solid ${
                        hasText ? 'active:translate-y-[2px]' : ''
                    }`}
                    style={hasText
                        ? { background: ob.ctaBg, borderColor: ob.ctaBg, boxShadow: ob.ctaShadow }
                        : { background: ob.ctaDisabledBg, borderColor: ob.ctaDisabledBorder, boxShadow: ob.ctaDisabledShadow }
                    }
                >
                    <span
                        className="font-extrabold text-[16px] tracking-[2px] uppercase"
                        style={{ color: hasText ? ob.ctaText : ob.ctaDisabledText }}
                    >
                        Continue
                    </span>
                </button>
            </div>
        </div>
    );
};

export default OpenQuestion;
