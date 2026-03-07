import React, { useState, useCallback, useRef, useEffect } from 'react';
import { track } from '../../utils/analytics';

/**
 * ActStep — Commitment card with "I'm in!" / "Not now".
 *
 * Props:
 *  - chapter: chapter object
 *  - theme: theme object
 *  - onComplete: (coinsEarned) => void
 *  - onClose: () => void
 */
const ActStep = ({ chapter, theme, onComplete, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const { actDescription, actDaysToPerform } = chapter.content;
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleAccept = useCallback(() => {
    track('Element Clicked', { screen: 'act', element_type: 'button', element: 'accept', chapter: chapter.index });
    setAccepted(true);
    timerRef.current = setTimeout(() => {
      if (onComplete) onComplete(2);
    }, 2000);
  }, [chapter.index, onComplete]);

  const handleDecline = useCallback(() => {
    track('Element Clicked', { screen: 'act', element_type: 'button', element: 'decline', chapter: chapter.index });
    if (onComplete) onComplete(0);
  }, [chapter.index, onComplete]);

  return (
    <div className="h-full flex flex-col font-jakarta" style={{ background: theme.bg }}>
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2" style={{ flexShrink: 0 }}>
        <button
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: theme.glassBg }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <span className="font-bold text-[12px] uppercase tracking-widest" style={{ color: theme.textMuted }}>
            Act
          </span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {!accepted ? (
          <div
            className="w-full rounded-3xl p-6 border border-solid text-center"
            style={{
              background: theme.glassBg,
              borderColor: theme.glassBorder,
            }}
          >
            {/* Act icon */}
            <div
              className="mx-auto mb-4 flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#58CC02',
                boxShadow: '0 4px 0 0 #46A302',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" stroke="white" strokeWidth="2" />
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Chapter title */}
            <h2 className="font-extrabold text-[20px] mb-2" style={{ color: theme.textPrimary }}>
              {chapter.title}
            </h2>

            {/* Description */}
            <p className="text-[14px] leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
              {actDescription}
            </p>

            {/* Timeframe badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 mb-6"
              style={{ background: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="font-bold text-[12px]" style={{ color: theme.textMuted }}>
                Over {actDaysToPerform} day{actDaysToPerform > 1 ? 's' : ''}
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAccept}
                className="w-full py-3.5 rounded-xl font-extrabold text-[15px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-transform duration-100"
                style={{ background: '#58CC02', borderColor: '#46A302' }}
              >
                I'm in!
              </button>
              <button
                onClick={handleDecline}
                className="w-full py-2.5 font-bold text-[14px]"
                style={{ color: theme.textMuted }}
              >
                Not now
              </button>
            </div>
          </div>
        ) : (
          /* Commitment accepted */
          <div className="text-center animate-fade-in">
            <div
              className="mx-auto mb-4 flex items-center justify-center coin-pop-in"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#58CC02',
                boxShadow: '0 4px 0 0 #46A302',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-extrabold text-[22px] mb-2" style={{ color: theme.textPrimary }}>
              Challenge accepted!
            </h2>
            <p className="text-[14px]" style={{ color: theme.textSecondary }}>
              We'll check in with you tomorrow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActStep;
