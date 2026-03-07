import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * LearnQuiz — Multiple-choice question UI for the Learn step.
 *
 * Props:
 *  - questions: [{ question, answers, correctAnswer }]
 *  - theme: theme object
 *  - onComplete: (correctCount) => void
 *  - onClose: () => void
 */
const LearnQuiz = ({ questions, theme, onComplete, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const q = questions[currentIdx];
  const isCorrect = selectedAnswer === q?.correctAnswer;

  const handleSelect = useCallback((answerIdx) => {
    if (showResult) return;
    setSelectedAnswer(answerIdx);
    setShowResult(true);

    const correct = answerIdx === q.correctAnswer;
    const newCount = correct ? correctCount + 1 : correctCount;
    if (correct) setCorrectCount(newCount);

    const delay = correct ? 1000 : 2000;
    timerRef.current = setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        if (onComplete) onComplete(newCount);
      } else {
        setCurrentIdx((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, delay);
  }, [showResult, q, correctCount, currentIdx, questions.length, onComplete]);

  if (!q) return null;

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
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: i === currentIdx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i < currentIdx
                  ? '#58CC02'
                  : i === currentIdx
                    ? '#E44B8E'
                    : theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                transition: 'none',
              }}
            />
          ))}
        </div>

        <div style={{ width: 36 }} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-5 pt-6">
        <h2 className="font-extrabold text-[20px] leading-tight mb-6" style={{ color: theme.textPrimary }}>
          {q.question}
        </h2>

        {/* Answer buttons */}
        <div className="flex flex-col gap-3">
          {q.answers.map((answer, i) => {
            let bgStyle, borderStyle, textColor;

            if (!showResult) {
              // Unselected state
              bgStyle = theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              borderStyle = theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
              textColor = theme.textPrimary;
            } else if (i === q.correctAnswer) {
              // Correct answer highlight
              bgStyle = 'rgba(88,204,2,0.15)';
              borderStyle = '#58CC02';
              textColor = '#58CC02';
            } else if (i === selectedAnswer && !isCorrect) {
              // Wrong selection
              bgStyle = 'rgba(255,75,75,0.15)';
              borderStyle = '#FF4B4B';
              textColor = '#FF4B4B';
            } else {
              // Other options during result
              bgStyle = theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
              borderStyle = theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
              textColor = theme.textMuted;
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 border-solid font-bold text-[14px] leading-snug ${
                  showResult && i === selectedAnswer && !isCorrect ? 'animate-wrong-shake' : ''
                }`}
                style={{
                  background: bgStyle,
                  borderColor: borderStyle,
                  color: textColor,
                }}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className="mt-4 animate-fade-in">
            {isCorrect ? (
              <div className="flex items-center gap-2">
                <div className="coin-pop-in flex items-center justify-center" style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #C8C8C8, #8A8A8A 70%, #6E6E6E)',
                  boxShadow: '0 2px 0 0 #555',
                }}>
                  <span className="font-extrabold text-[10px] text-white">B</span>
                </div>
                <span className="font-extrabold text-[16px]" style={{ color: '#58CC02' }}>
                  +1 Correct!
                </span>
              </div>
            ) : (
              <p className="font-bold text-[14px]" style={{ color: '#FF4B4B' }}>
                The correct answer is: {q.answers[q.correctAnswer]}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnQuiz;
