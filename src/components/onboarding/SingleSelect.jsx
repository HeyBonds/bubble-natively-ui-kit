import React, { useState, useRef } from 'react';

const SingleSelect = ({ question, options = [], refreshable = true, previousAnswer, theme, onAnswer, onRefresh }) => {
    const ob = theme?.onboarding || {};
    const [selectedIndex, setSelectedIndex] = useState(previousAnswer?.index ?? null);
    const [refreshAnim, setRefreshAnim] = useState(''); // '', 'out', 'in'
    const [refreshKey, setRefreshKey] = useState(0);
    const iconRef = useRef(null);

    const handleSelect = (opt, index) => {
        setSelectedIndex(index);

        const text = typeof opt === 'string' ? opt : opt.text;
        const variable = typeof opt === 'string' ? '' : (opt.variable || '');

        if (onAnswer) onAnswer({ answer: text, variable, index });
    };

    const handleRefresh = () => {
        // Phase 1: animate out
        setRefreshAnim('out');
        if (iconRef.current) {
            iconRef.current.classList.remove('refresh-spin');
            void iconRef.current.offsetWidth; // force reflow
            iconRef.current.classList.add('refresh-spin');
        }

        // Phase 2: after exit completes, swap data + animate in
        setTimeout(() => {
            setSelectedIndex(null);
            if (onRefresh) onRefresh();
            setRefreshKey(k => k + 1);
            setRefreshAnim('in');

            // Phase 3: clear animation class after enter completes
            setTimeout(() => setRefreshAnim(''), 450);
        }, 300);
    };

    const listClass = refreshAnim === 'out' ? 'refresh-out' : refreshAnim === 'in' ? 'refresh-in' : '';

    return (
        <div className="flex flex-col h-full w-full">
            {/* Content */}
            <div className="flex-1 px-7 pt-8 pb-6 w-full overflow-hidden">
                <h1 className="font-bold text-[22px] leading-[30px] tracking-[0.02em] mb-8" style={{ color: ob.text }}>
                    {question}
                </h1>

                <div className={`space-y-5 ${listClass}`} key={refreshKey}>
                    {options.map((opt, i) => {
                        const text = typeof opt === 'string' ? opt : opt.text;
                        const isSelected = selectedIndex === i;

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(opt, i)}
                                className="w-full text-left px-5 py-4 rounded-2xl border-2 border-solid transition-[background-color,border-color,box-shadow,transform] duration-200 active:translate-y-[2px]"
                                style={{
                                    background: isSelected ? ob.optionSelectedBg : ob.optionBg,
                                    borderColor: isSelected ? ob.optionSelectedBorder : ob.optionBorder,
                                    boxShadow: isSelected ? ob.optionSelectedShadow : ob.optionShadow,
                                }}
                            >
                                <span className="font-bold text-[14px] leading-[22px] tracking-[0.02em]" style={{ color: ob.text }}>
                                    {text}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            {refreshable && (
                <div className="shrink-0 pb-10 w-full flex flex-col items-center gap-1">
                    <span className="font-medium text-[14px] tracking-[0.5px]" style={{ color: ob.textSecondary }}>
                        Choose the most relevant option
                    </span>
                    <span className="font-medium text-[10px] tracking-[0.5px]" style={{ color: ob.textMuted }}>
                        or
                    </span>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 mt-1 group"
                        disabled={refreshAnim !== ''}
                    >
                        <svg ref={iconRef} width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ willChange: 'transform' }}>
                            <path d="M1.667 3.333v5h5" stroke={ob.refreshIcon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3.51 12.5a7.5 7.5 0 1 0 1.14-7.833L1.667 8.333" stroke={ob.refreshIcon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-bold text-[14px] tracking-[0.5px] underline decoration-solid" style={{ color: ob.refreshIcon }}>
                            Refresh answers
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SingleSelect;
