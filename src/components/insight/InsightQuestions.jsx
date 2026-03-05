import React, { useState, useRef, useEffect, useCallback } from 'react';
import InsightOtherDialog from './InsightOtherDialog';

const InsightQuestions = ({ questions, theme, onAnswer, onBack, onClose }) => {
  const ins = theme.insight;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  // Two video refs for crossfade
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [activeVideo, setActiveVideo] = useState('a'); // 'a' or 'b'

  const question = questions[currentIndex];
  const total = questions.length;

  // Track which URL each video element is showing
  const videoASrcRef = useRef(null);
  const videoBSrcRef = useRef(null);

  // Load the active video element whenever the question changes
  useEffect(() => {
    const url = question?.videoUrl;
    if (!url) return;

    const ref = activeVideo === 'a' ? videoARef : videoBRef;
    const srcRef = activeVideo === 'a' ? videoASrcRef : videoBSrcRef;

    if (ref.current && srcRef.current !== url) {
      ref.current.src = url;
      ref.current.load();
      ref.current.play().catch(() => {});
      srcRef.current = url;
    }
  }, [currentIndex, question?.videoUrl, activeVideo]);

  const handleAnswer = useCallback((answer, otherText) => {
    const result = {
      questionIndex: currentIndex,
      questionId: question.id,
      answer,
      ...(otherText ? { otherText } : {}),
    };

    onAnswer(result);

    if (currentIndex < total - 1) {
      setActiveVideo((prev) => (prev === 'a' ? 'b' : 'a'));
      setCurrentIndex((prev) => prev + 1);
    }
    // If last question, InsightFlow will advance phase
  }, [currentIndex, question, total, onAnswer]);

  const handleBack = useCallback(() => {
    if (currentIndex === 0) {
      onBack();
    } else {
      setActiveVideo((prev) => (prev === 'a' ? 'b' : 'a'));
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, onBack]);

  const handleOtherSubmit = useCallback((text) => {
    setShowOtherDialog(false);
    handleAnswer('other', text);
  }, [handleAnswer]);

  const handleOtherClose = useCallback(() => {
    setShowOtherDialog(false);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Video backgrounds (two layers for crossfade) */}
      <video
        ref={videoARef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: activeVideo === 'a' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        muted
        loop
        playsInline
        webkit-playsinline="true"
      />
      <video
        ref={videoBRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: activeVideo === 'b' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        muted
        loop
        playsInline
        webkit-playsinline="true"
      />

      {/* Dark overlay for readability */}
      <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top bar: back + progress + close */}
        <div className="flex items-center justify-between px-4 pt-14 pb-4">
          {/* Back */}
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: ins.navBg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ins.navIcon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i === currentIndex ? 28 : 8,
                  height: 8,
                  borderRadius: i === currentIndex ? 4 : '50%',
                  background: i <= currentIndex ? ins.progressFill : ins.progressBg,
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: ins.navBg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ins.navIcon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Question text */}
        <div className="flex-1 flex items-center justify-center px-8">
          <h2 className="font-jakarta font-extrabold text-[22px] text-center leading-tight" style={{ color: '#FFFFFF' }}>
            {question?.text || ''}
          </h2>
        </div>

        {/* Answer buttons */}
        <div className="flex items-center justify-center gap-3 px-6 pb-12">
          {/* NO */}
          <button
            onClick={() => handleAnswer('no')}
            className="flex-1 py-4 rounded-2xl font-jakarta font-extrabold text-[16px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100"
            style={{ background: ins.btnNoBg, borderColor: ins.btnNoShadow }}
          >
            NO
          </button>

          {/* OTHER */}
          <button
            onClick={() => setShowOtherDialog(true)}
            className="flex-1 py-4 rounded-2xl font-jakarta font-extrabold text-[16px] text-white border border-solid active:translate-y-[1px] transition-[transform] duration-100"
            style={{ background: ins.btnOtherBg, borderColor: ins.btnOtherBorder }}
          >
            OTHER
          </button>

          {/* YES */}
          <button
            onClick={() => handleAnswer('yes')}
            className="flex-1 py-4 rounded-2xl font-jakarta font-extrabold text-[16px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100"
            style={{ background: ins.btnYesBg, borderColor: ins.btnYesShadow }}
          >
            YES
          </button>
        </div>
      </div>

      {/* Other dialog */}
      <InsightOtherDialog
        open={showOtherDialog}
        questionText={question?.text}
        theme={theme}
        onSubmit={handleOtherSubmit}
        onClose={handleOtherClose}
      />
    </div>
  );
};

export default InsightQuestions;
