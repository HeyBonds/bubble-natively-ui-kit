import React, { useState, useEffect, useRef } from 'react';

const SliderSelect = ({ question, stops = [], previousAnswer, theme, onAnswer }) => {
    const ob = theme?.onboarding || {};
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
    }, [previousAnswer, stops]);

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

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 px-7 pt-8 pb-6 w-full flex flex-col">
                <h1 className="font-bold text-[22px] leading-[30px] tracking-[0.02em] mb-6" style={{ color: ob.text }}>
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
                                                className="absolute -top-[10px] w-[3px] h-[10px] rounded-full transition-[background-color] duration-300"
                                                style={{ backgroundColor: isFilled ? ob.sliderFilled : ob.sliderUnfilled }}
                                            />
                                        )}

                                        {/* Dot */}
                                        <button
                                            onClick={() => handleSelect(stop, i)}
                                            className={`relative w-6 h-6 rounded-full border-2 border-solid transition-[background-color,border-color,box-shadow] duration-200 ${isBouncing ? 'dot-pop' : ''}`}
                                            style={{
                                                backgroundColor: isFilled ? ob.sliderFilled : ob.dotEmpty,
                                                borderColor: isFilled ? ob.sliderFilled : ob.dotEmptyBorder,
                                                boxShadow: isFilled ? ob.dotFilledShadow : ob.dotEmptyShadow,
                                            }}
                                        />

                                        {/* Connecting line below (not on last) */}
                                        {i < stops.length - 1 && (
                                            <div
                                                className="absolute -bottom-[10px] w-[3px] h-[10px] rounded-full transition-[background-color] duration-300"
                                                style={{ backgroundColor: (isFilled && i < selectedIndex) ? ob.sliderFilled : ob.sliderUnfilled }}
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
                                        <span
                                            className={`text-[15px] leading-snug transition-colors duration-200 ${isSelected ? 'font-bold' : 'font-medium'}`}
                                            style={{ color: isSelected ? ob.text : isFilled ? ob.labelFilled : ob.labelUnfilled }}
                                        >
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
            <div className="shrink-0 pb-10 px-7 w-full">
                <button
                    onClick={handleContinue}
                    disabled={selectedIndex === null}
                    className={`w-full h-[54px] rounded-2xl flex items-center justify-center transition-[background-color,border-color,box-shadow,transform] duration-200 border-2 border-solid ${
                        selectedIndex !== null ? 'active:translate-y-[2px]' : ''
                    }`}
                    style={selectedIndex !== null
                        ? { background: ob.ctaBg, borderColor: ob.ctaBg, boxShadow: ob.ctaShadow }
                        : { background: ob.ctaDisabledBg, borderColor: ob.ctaDisabledBorder, boxShadow: ob.ctaDisabledShadow }
                    }
                >
                    <span
                        className="font-extrabold text-[16px] tracking-[2px] uppercase"
                        style={{ color: selectedIndex !== null ? ob.ctaText : ob.ctaDisabledText }}
                    >
                        Continue
                    </span>
                </button>
            </div>
        </div>
    );
};

export default SliderSelect;
