import React, { useState } from 'react';

const MultiSelect = ({ question, options = [], maxSelections = 3, previousAnswer, theme, onAnswer }) => {
    const ob = theme?.onboarding || {};
    const [selectedIndices, setSelectedIndices] = useState(
        () => previousAnswer?.indices ? new Set(previousAnswer.indices) : new Set()
    );

    const toggleOption = (index) => {
        setSelectedIndices(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else if (next.size < maxSelections) {
                next.add(index);
            }
            return next;
        });
    };

    const handleContinue = () => {
        if (selectedIndices.size !== maxSelections) return;
        const indices = [...selectedIndices].sort((a, b) => a - b);
        const texts = indices.map(i => {
            const opt = options[i];
            return typeof opt === 'string' ? opt : opt.text;
        });
        const vars = indices.map(i => {
            const opt = options[i];
            return typeof opt === 'string' ? '' : (opt.variable || '');
        });
        onAnswer({ answer: texts.join(','), variable: vars.join(','), indices });
    };

    const atMax = selectedIndices.size >= maxSelections;
    const ready = selectedIndices.size === maxSelections;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 px-7 pt-8 pb-6 w-full overflow-y-auto">
                <h1 className="font-bold text-[22px] leading-[30px] tracking-[0.02em] mb-2" style={{ color: ob.text }}>
                    {question}
                </h1>

                <p className="text-[13px] font-medium mb-6" style={{ color: ob.textMuted }}>
                    {selectedIndices.size} / {maxSelections} selected
                </p>

                <div className="flex flex-wrap gap-3">
                    {options.map((opt, i) => {
                        const text = typeof opt === 'string' ? opt : opt.text;
                        const isSelected = selectedIndices.has(i);
                        const isDimmed = atMax && !isSelected;

                        return (
                            <button
                                key={i}
                                onClick={() => toggleOption(i)}
                                className="px-5 py-3 rounded-full border-2 border-solid transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 active:translate-y-[1px]"
                                style={{
                                    background: isSelected ? ob.optionSelectedBg : isDimmed ? ob.optionDimmedBg : ob.optionBg,
                                    borderColor: isSelected ? ob.optionSelectedBorder : isDimmed ? ob.optionDimmedBorder : ob.optionBorder,
                                    boxShadow: isSelected ? ob.optionSelectedShadow : isDimmed ? ob.optionDimmedShadow : ob.optionShadow,
                                    opacity: isDimmed ? 0.4 : 1,
                                }}
                            >
                                <span
                                    className="font-bold text-[14px] leading-[20px] tracking-[0.02em]"
                                    style={{ color: isSelected ? ob.text : ob.textSecondary }}
                                >
                                    {text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Continue Button */}
            <div className="shrink-0 pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={!ready}
                    className={`w-full h-[54px] rounded-2xl flex items-center justify-center transition-[background-color,border-color,box-shadow,transform] duration-200 border-2 border-solid ${
                        ready ? 'active:translate-y-[2px]' : ''
                    }`}
                    style={ready
                        ? { background: ob.ctaBg, borderColor: ob.ctaBg, boxShadow: ob.ctaShadow }
                        : { background: ob.ctaDisabledBg, borderColor: ob.ctaDisabledBorder, boxShadow: ob.ctaDisabledShadow }
                    }
                >
                    <span
                        className="font-extrabold text-[16px] tracking-[2px] uppercase"
                        style={{ color: ready ? ob.ctaText : ob.ctaDisabledText }}
                    >
                        Continue
                    </span>
                </button>
            </div>
        </div>
    );
};

export default MultiSelect;
