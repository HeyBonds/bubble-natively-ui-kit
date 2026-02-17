import React, { useState } from 'react';

const MultiSelect = ({ question, options = [], maxSelections = 3, previousAnswer, onAnswer }) => {
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

    return (
        <>
            <div className="flex-1 px-7 pt-8 pb-6 w-full overflow-y-auto">
                <h1 className="font-bold text-[22px] text-white leading-[30px] tracking-[0.02em] mb-2">
                    {question}
                </h1>

                <p className="text-white/50 text-[13px] font-medium mb-6">
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
                                className={`px-5 py-3 rounded-full border border-solid transition-colors duration-200 ${
                                    isSelected
                                        ? 'bg-white/20 border-white/40 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)]'
                                        : isDimmed
                                            ? 'bg-white/[0.02] border-white/[0.06] opacity-40'
                                            : 'bg-white/[0.07] border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <span className={`font-medium text-[14px] leading-[20px] tracking-[0.02em] ${
                                    isSelected ? 'text-white' : 'text-white/70'
                                }`}>
                                    {text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Continue Button */}
            <div className="pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={selectedIndices.size !== maxSelections}
                    className={`w-full h-[54px] rounded-[40px] flex items-center justify-center transition-[background-color,opacity] duration-200 ${
                        selectedIndices.size === maxSelections
                            ? 'bg-gradient-to-l from-[#B900B0] to-[#D8003F] shadow-lg active:scale-95'
                            : 'bg-white/10 border border-solid border-white/10'
                    }`}
                >
                    <span className={`font-semibold text-[16px] tracking-[2px] uppercase ${
                        selectedIndices.size === maxSelections ? 'text-white' : 'text-white/30'
                    }`}>
                        Continue
                    </span>
                </button>
            </div>
        </>
    );
};

export default MultiSelect;
