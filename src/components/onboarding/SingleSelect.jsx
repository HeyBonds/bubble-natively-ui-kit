import React, { useState } from 'react';

const SingleSelect = ({ question, options = [], refreshable = true, onAnswer, onRefresh }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleSelect = (text, index) => {
        if (selectedIndex !== null) return;
        setSelectedIndex(index);
        if (onAnswer) onAnswer({ answer: text, index });
    };

    const handleRefresh = () => {
        setSelectedIndex(null);
        if (onRefresh) onRefresh();
    };

    return (
        <>
            {/* Content */}
            <div className="flex-1 px-7 pt-8 pb-6 w-full">
                <h1 className="font-bold text-[22px] text-white leading-[30px] tracking-[0.02em] mb-8">
                    {question}
                </h1>

                <div className="space-y-4">
                    {options.map((opt, i) => {
                        const text = typeof opt === 'string' ? opt : opt.text;
                        const isSelected = selectedIndex === i;

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(text, i)}
                                className={`w-full text-left px-5 py-4 rounded-xl border border-solid backdrop-blur-md transition-all duration-300
                                    ${isSelected
                                        ? 'bg-white/20 border-white/30 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <span className="font-medium text-[14px] text-white leading-[22px] tracking-[0.02em]">
                                    {text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            {refreshable && (
                <div className="pb-10 w-full flex flex-col items-center gap-1">
                    <span className="font-medium text-[14px] text-white tracking-[0.5px]">
                        Choose the most relevant option
                    </span>
                    <span className="font-medium text-[10px] text-white tracking-[0.5px]">
                        or
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 mt-1 group"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:rotate-[-45deg] transition-transform duration-300">
                            <path d="M1.667 3.333v5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.51 12.5a7.5 7.5 0 1 0 1.14-7.833L1.667 8.333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium text-[14px] text-white tracking-[0.5px] underline decoration-solid">
                            Refresh answers
                        </span>
                    </button>
                </div>
            )}
        </>
    );
};

export default SingleSelect;
