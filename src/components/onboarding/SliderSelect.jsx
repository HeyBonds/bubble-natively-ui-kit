import React, { useState } from 'react';

const SliderSelect = ({ question, stops = [], previousAnswer, onAnswer }) => {
    const [selectedIndex, setSelectedIndex] = useState(previousAnswer?.index ?? null);

    const handleSelect = (stop, index) => {
        setSelectedIndex(index);
    };

    const handleContinue = () => {
        if (selectedIndex === null) return;
        const stop = stops[selectedIndex];
        onAnswer({ answer: stop.label, variable: stop.variable, index: selectedIndex });
    };

    return (
        <>
            <div className="flex-1 px-7 pt-8 pb-6 w-full flex flex-col">
                <h1 className="font-bold text-[22px] text-white leading-[30px] tracking-[0.02em] mb-10">
                    {question}
                </h1>

                {/* Slider Track */}
                <div className="flex-1 flex flex-col justify-center px-2">
                    <div className="relative">
                        {/* Background track */}
                        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-white/15 rounded-full" />

                        {/* Filled track */}
                        {selectedIndex !== null && (
                            <div
                                className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 bg-[#FF2258] rounded-full transition-[width] duration-300"
                                style={{ width: `${(selectedIndex / (stops.length - 1)) * 100}%` }}
                            />
                        )}

                        {/* Stop points */}
                        <div className="relative flex justify-between">
                            {stops.map((stop, i) => {
                                const isSelected = selectedIndex === i;
                                const isFilled = selectedIndex !== null && i <= selectedIndex;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(stop, i)}
                                        className="flex flex-col items-center gap-3 group relative"
                                        style={{ width: `${100 / stops.length}%` }}
                                    >
                                        {/* Dot */}
                                        <div className={`w-5 h-5 rounded-full border-2 border-solid transition-[background-color,border-color,transform,box-shadow] duration-200 ${
                                            isSelected
                                                ? 'bg-[#FF2258] border-[#FF2258] scale-125 shadow-[0_0_12px_rgba(255,34,88,0.5)]'
                                                : isFilled
                                                    ? 'bg-[#FF2258] border-[#FF2258]'
                                                    : 'bg-white/10 border-white/30 group-hover:border-white/50'
                                        }`} />

                                        {/* Label */}
                                        <span className={`text-[11px] leading-tight text-center max-w-[60px] transition-colors duration-200 ${
                                            isSelected
                                                ? 'text-white font-semibold'
                                                : 'text-white/50 font-medium'
                                        }`}>
                                            {stop.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Continue Button */}
            <div className="pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={selectedIndex === null}
                    className={`w-full h-[54px] rounded-[40px] flex items-center justify-center transition-[background-color,opacity] duration-200 ${
                        selectedIndex !== null
                            ? 'bg-gradient-to-l from-[#B900B0] to-[#D8003F] shadow-lg active:scale-95'
                            : 'bg-white/10 border border-solid border-white/10'
                    }`}
                >
                    <span className={`font-semibold text-[16px] tracking-[2px] uppercase ${
                        selectedIndex !== null ? 'text-white' : 'text-white/30'
                    }`}>
                        Continue
                    </span>
                </button>
            </div>
        </>
    );
};

export default SliderSelect;
