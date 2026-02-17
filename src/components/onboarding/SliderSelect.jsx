import React, { useState, useEffect, useRef } from 'react';

const SliderSelect = ({ question, stops = [], previousAnswer, onAnswer }) => {
    const [selectedIndex, setSelectedIndex] = useState(previousAnswer?.index ?? null);
    const [revealed, setRevealed] = useState(previousAnswer ? stops.length : 0);
    const [bounceIndex, setBounceIndex] = useState(null);
    const prevSelectedRef = useRef(previousAnswer?.index ?? null);

    // Staggered reveal on mount
    useEffect(() => {
        if (previousAnswer) return; // skip animation on resume
        stops.forEach((_, i) => {
            setTimeout(() => setRevealed(r => Math.max(r, i + 1)), 120 * (i + 1));
        });
    }, []);

    const handleSelect = (stop, index) => {
        prevSelectedRef.current = selectedIndex;
        setSelectedIndex(index);
        setBounceIndex(index);
        setTimeout(() => setBounceIndex(null), 600);
    };

    const handleContinue = () => {
        if (selectedIndex === null) return;
        const stop = stops[selectedIndex];
        onAnswer({ answer: stop.label, variable: stop.variable, index: selectedIndex });
    };

    // Calculate filled track height based on stop positions
    const getTrackHeight = () => {
        if (selectedIndex === null || stops.length <= 1) return 0;
        // Each stop is evenly distributed; track goes from first dot center to selected dot center
        return (selectedIndex / (stops.length - 1)) * 100;
    };

    return (
        <>
            <div className="flex-1 px-7 pt-8 pb-6 w-full flex flex-col">
                <h1 className="font-bold text-[22px] text-white leading-[30px] tracking-[0.02em] mb-6">
                    {question}
                </h1>

                {/* Vertical Slider */}
                <div className="flex-1 flex items-center">
                    <div className="relative w-full py-2">
                        {stops.map((stop, i) => {
                            const isSelected = selectedIndex === i;
                            const isFilled = selectedIndex !== null && i <= selectedIndex;
                            const isRevealed = i < revealed;
                            const isBouncing = bounceIndex === i;

                            return (
                                <div
                                    key={i}
                                    className={`stop-reveal flex items-center gap-4 py-[10px] ${isRevealed ? '' : 'invisible'}`}
                                    style={{ animationDelay: previousAnswer ? '0ms' : `${120 * i}ms` }}
                                >
                                    {/* Track segment + Dot column */}
                                    <div className="relative flex flex-col items-center shrink-0 w-6">
                                        {/* Connecting line above (not on first) */}
                                        {i > 0 && (
                                            <div
                                                className={`absolute -top-[10px] w-[3px] h-[10px] rounded-full transition-[background-color] duration-300 ${
                                                    isFilled ? 'bg-[#FF2258]' : 'bg-white/15'
                                                }`}
                                            />
                                        )}

                                        {/* Dot */}
                                        <button
                                            onClick={() => handleSelect(stop, i)}
                                            className={`relative w-6 h-6 rounded-full border-2 border-solid transition-[background-color,border-color,box-shadow] duration-200 ${
                                                isSelected
                                                    ? 'bg-[#FF2258] border-[#FF2258] shadow-[0_0_16px_rgba(255,34,88,0.6)]'
                                                    : isFilled
                                                        ? 'bg-[#FF2258] border-[#FF2258]'
                                                        : 'bg-white/10 border-white/30'
                                            } ${isBouncing ? 'dot-pop' : ''}`}
                                        />

                                        {/* Connecting line below (not on last) */}
                                        {i < stops.length - 1 && (
                                            <div
                                                className={`absolute -bottom-[10px] w-[3px] h-[10px] rounded-full transition-[background-color] duration-300 ${
                                                    isFilled && i < selectedIndex ? 'bg-[#FF2258]' : 'bg-white/15'
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* Emoji + Label */}
                                    <button
                                        onClick={() => handleSelect(stop, i)}
                                        className="flex items-center gap-3 flex-1 min-w-0"
                                    >
                                        <span
                                            className={`text-2xl select-none ${isBouncing ? 'emoji-bounce' : ''}`}
                                            style={{ display: 'inline-block' }}
                                        >
                                            {stop.emoji || ''}
                                        </span>
                                        <span className={`text-[15px] leading-snug transition-colors duration-200 ${
                                            isSelected
                                                ? 'text-white font-bold'
                                                : isFilled
                                                    ? 'text-white/80 font-medium'
                                                    : 'text-white/40 font-medium'
                                        }`}>
                                            {stop.label}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Continue Button */}
            <div className="pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={selectedIndex === null}
                    className={`w-full h-[54px] rounded-[40px] flex items-center justify-center transition-[background-color,opacity,transform] duration-200 ${
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
