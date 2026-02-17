import React, { useState } from 'react';

const OpenQuestion = ({ question, placeholder, charGuidance, previousAnswer, onAnswer }) => {
    const [text, setText] = useState(previousAnswer?.answer || '');

    const handleContinue = () => {
        if (!text.trim()) return;
        onAnswer({ answer: text.trim(), variable: '' });
    };

    return (
        <>
            <div className="flex-1 px-7 pt-8 pb-6 w-full flex flex-col">
                <h1 className="font-bold text-[22px] text-white leading-[30px] tracking-[0.02em] mb-6">
                    {question}
                </h1>

                <div className="relative flex-1 max-h-[220px]">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={placeholder || 'Type your answer...'}
                        className="w-full h-full resize-none rounded-2xl px-5 py-4 bg-white/[0.07] border border-solid border-white/10 text-white text-[15px] leading-[24px] font-medium placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
                    />
                    {charGuidance && (
                        <span className={`absolute bottom-3 right-4 text-[11px] font-medium ${
                            text.length > charGuidance ? 'text-[#FF2258]/70' : 'text-white/25'
                        }`}>
                            {text.length} / {charGuidance}
                        </span>
                    )}
                </div>
            </div>

            {/* Continue Button */}
            <div className="pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={!text.trim()}
                    className={`w-full h-[54px] rounded-[40px] flex items-center justify-center transition-[background-color,opacity] duration-200 ${
                        text.trim()
                            ? 'bg-gradient-to-l from-[#B900B0] to-[#D8003F] shadow-lg active:scale-95'
                            : 'bg-white/10 border border-solid border-white/10'
                    }`}
                >
                    <span className={`font-semibold text-[16px] tracking-[2px] uppercase ${
                        text.trim() ? 'text-white' : 'text-white/30'
                    }`}>
                        Continue
                    </span>
                </button>
            </div>
        </>
    );
};

export default OpenQuestion;
