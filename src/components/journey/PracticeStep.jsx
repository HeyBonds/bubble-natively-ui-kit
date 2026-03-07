import React, { useState, useCallback, useEffect, useRef } from 'react';
import { track } from '../../utils/analytics';

/**
 * PracticeStep — Guidance screen then mock practice results.
 *
 * Props:
 *  - chapter: chapter object
 *  - theme: theme object
 *  - onComplete: (coinsEarned) => void
 *  - onClose: () => void
 */
const PracticeStep = ({ chapter, theme, onComplete, onClose }) => {
  const [subPhase, setSubPhase] = useState('guidance'); // 'guidance' | 'loading' | 'results'
  const [mockScore, setMockScore] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleStartPractice = useCallback(() => {
    track('Element Clicked', { screen: 'practice', element_type: 'button', element: 'start_practice', chapter: chapter.index });
    setSubPhase('loading');
    timerRef.current = setTimeout(() => {
      const score = 7 + Math.floor(Math.random() * 3); // 7-9
      setMockScore(score);
      setSubPhase('results');
    }, 2000);
  }, [chapter.index]);

  const handleDone = useCallback(() => {
    const coins = mockScore >= 9 ? 3 : mockScore >= 7 ? 2 : 1;
    track('Element Clicked', { screen: 'practice', element_type: 'button', element: 'continue', score: mockScore });
    if (onComplete) onComplete(coins);
  }, [mockScore, onComplete]);

  const { practiceSkills } = chapter.content;

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
            Practice
          </span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {subPhase === 'guidance' && (
        <div className="flex-1 flex flex-col px-6 pt-8">
          <h2 className="font-extrabold text-[22px] mb-2" style={{ color: theme.textPrimary }}>
            {chapter.title}
          </h2>
          <p className="text-[14px] mb-6" style={{ color: theme.textSecondary }}>
            Focus on these skills during your practice session:
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {practiceSkills.map((skill, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-2xl border border-solid"
                style={{ background: theme.glassBg, borderColor: theme.glassBorder }}
              >
                <div
                  className="mt-0.5 flex items-center justify-center rounded-full"
                  style={{ width: 24, height: 24, flexShrink: 0, background: '#58CC02' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <polyline points="4 12 10 18 20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[14px] leading-relaxed" style={{ color: theme.textPrimary }}>
                  {skill}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pb-8">
            <button
              onClick={handleStartPractice}
              className="w-full py-3.5 rounded-xl font-extrabold text-[15px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-transform duration-100"
              style={{ background: '#E44B8E', borderColor: '#B83A72' }}
            >
              Start Practice
            </button>
          </div>
        </div>
      )}

      {subPhase === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-insight-pulse">
            <div className="flex items-center justify-center" style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(228,75,142,0.15)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-insight-spin" stroke="#E44B8E" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
          </div>
          <p className="font-bold text-[16px] mt-4" style={{ color: theme.textSecondary }}>
            Simulating practice...
          </p>
        </div>
      )}

      {subPhase === 'results' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
          {/* Score circle */}
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="#58CC02" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - mockScore / 10)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'none' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-extrabold text-[36px]" style={{ color: theme.textPrimary }}>{mockScore}</span>
              <span className="font-bold text-[12px]" style={{ color: theme.textMuted }}>/10</span>
            </div>
          </div>

          <p className="font-bold text-[18px] mt-4" style={{ color: theme.textPrimary }}>
            {mockScore >= 9 ? 'Excellent!' : mockScore >= 7 ? 'Great job!' : 'Keep practicing!'}
          </p>
          <p className="text-[14px] mt-1" style={{ color: theme.textSecondary }}>
            +{mockScore >= 9 ? 3 : mockScore >= 7 ? 2 : 1} coins earned
          </p>

          <div className="w-full mt-8">
            <button
              onClick={handleDone}
              className="w-full py-3.5 rounded-xl font-extrabold text-[15px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-transform duration-100"
              style={{ background: '#58CC02', borderColor: '#46A302' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeStep;
