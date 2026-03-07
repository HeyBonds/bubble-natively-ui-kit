import React, { useState, useRef, useEffect, useCallback } from 'react';
import { track } from '../../utils/analytics';
import InsightOtherDialog from './InsightOtherDialog';
import MicIcon from './MicIcon';

const InsightQuestions = ({ questions, theme, onAnswer, onBack, onClose }) => {
  const ins = theme.insight;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOtherDialog, setShowOtherDialog] = useState(false);
  const [micExpanding, setMicExpanding] = useState(false);
  const [pillsReady, setPillsReady] = useState(false);
  const [nudgeAnswer, setNudgeAnswer] = useState(null);
  const [nudgeClosing, setNudgeClosing] = useState(false);
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const [activeVideo, setActiveVideo] = useState('a');
  const pillsTimerRef = useRef(null);
  const micTapTimerRef = useRef(null);

  // Per-session nudge: resets every time InsightQuestions mounts
  const nudgeShownRef = useRef(false);
  const nudgeTimerRef = useRef(null);

  // Nudge open/close animation
  useEffect(() => {
    if (nudgeAnswer) {
      setNudgeVisible(true);
      setNudgeClosing(false);
    } else if (nudgeVisible) {
      setNudgeClosing(true);
      nudgeTimerRef.current = setTimeout(() => {
        setNudgeVisible(false);
        setNudgeClosing(false);
      }, 150);
    }
    return () => clearTimeout(nudgeTimerRef.current);
  }, [nudgeAnswer]); // eslint-disable-line react-hooks/exhaustive-deps

  const question = questions[currentIndex];
  const total = questions.length;

  const videoASrcRef = useRef(null);
  const videoBSrcRef = useRef(null);

  const hasSpeechApi = typeof window !== 'undefined' &&
    (window.webkitSpeechRecognition || window.SpeechRecognition);

  // Enable pills interaction after animation delay
  useEffect(() => {
    setPillsReady(false);
    pillsTimerRef.current = setTimeout(() => setPillsReady(true), 5000);
    return () => clearTimeout(pillsTimerRef.current);
  }, [currentIndex]);

  // Cleanup mic-tap expand timer on unmount
  useEffect(() => {
    return () => clearTimeout(micTapTimerRef.current);
  }, []);

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
  }, [currentIndex, question, total, onAnswer]);

  const handleBack = useCallback(() => {
    track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: 'back' });
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

  const handleMicTap = useCallback(() => {
    track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: 'mic' });
    setMicExpanding(true);
    micTapTimerRef.current = setTimeout(() => {
      setShowOtherDialog(true);
      setMicExpanding(false);
    }, 150);
  }, []);

  const handleYesNo = useCallback((answer) => {
    track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: answer === 'yes' ? 'yes' : 'no' });
    if (!nudgeShownRef.current) {
      setNudgeAnswer(answer);
      return;
    }
    handleAnswer(answer);
  }, [handleAnswer]);

  const handleNudgeConfirm = useCallback(() => {
    track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: 'nudge_continue' });
    nudgeShownRef.current = true;
    const answer = nudgeAnswer;
    setNudgeAnswer(null);
    handleAnswer(answer);
  }, [nudgeAnswer, handleAnswer]);

  const handleNudgeCustom = useCallback(() => {
    // Track nudge_custom only — handleMicTap also fires 'mic', intentional double-fire
    // (nudge decision + resulting mic open are distinct user actions)
    track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: 'nudge_custom' });
    nudgeShownRef.current = true;
    setNudgeAnswer(null);
    handleMicTap();
  }, [handleMicTap]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Video backgrounds */}
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

      <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-14 pb-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: ins.navBg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ins.navIcon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

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

          <button
            onClick={() => { track('Element Clicked', { screen: 'insight_questions', element_type: 'button', element: 'close' }); onClose(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: ins.navBg }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ins.navIcon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Question + answer area */}
        <div key={currentIndex} className="flex-1 flex flex-col items-center justify-center px-6">
          <h2
            className="animate-fade-in font-jakarta font-extrabold text-[1.375rem] text-center leading-tight mb-8"
            style={{ color: '#FFFFFF' }}
          >
            {question?.text || ''}
          </h2>

          {/* Mic CTA — invisible (but keeps layout space) while sheet is open */}
          <div
            className={`insight-mic-in flex flex-col items-center ${micExpanding ? 'insight-mic-expand' : ''}`}
            style={{
              animationDelay: micExpanding ? '0ms' : '500ms',
              visibility: showOtherDialog ? 'hidden' : 'visible',
              pointerEvents: showOtherDialog ? 'none' : 'auto',
            }}
          >
            <div className="relative flex items-center justify-center" style={{ width: '9rem', height: '9rem' }}>
              <div
                className="insight-ripple absolute rounded-full border-2 border-solid"
                style={{ width: '4.5rem', height: '4.5rem', borderColor: ins.micIcon, inset: 0, margin: 'auto' }}
              />
              <div
                className="insight-ripple-2 absolute rounded-full border-2 border-solid"
                style={{ width: '4.5rem', height: '4.5rem', borderColor: ins.micIcon, inset: 0, margin: 'auto' }}
              />

              <button
                onClick={handleMicTap}
                className="insight-mic-breathe relative z-10 rounded-full flex items-center justify-center"
                style={{ width: '4.5rem', height: '4.5rem', background: ins.micIcon }}
              >
                <MicIcon size={30} />
              </button>
            </div>

            <p
              className="animate-fade-in font-poppins text-[0.8125rem] mt-3"
              style={{ color: 'rgba(255,255,255,0.7)', animationDelay: '700ms', opacity: 0 }}
            >
              {hasSpeechApi ? 'Tap to share your thoughts' : 'Tap to type your thoughts'}
            </p>
          </div>

          {/* Ghost YES / NO pills — pointer-events disabled until animation finishes */}
          <div
            className="insight-pills-in flex items-center gap-4 mt-8"
            style={{ animationDelay: '4500ms', pointerEvents: pillsReady ? 'auto' : 'none' }}
          >
            <button
              onClick={() => handleYesNo('yes')}
              className="px-6 py-2 rounded-full font-jakarta font-bold text-[0.8125rem] border border-solid active:scale-95 transition-transform duration-100"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}
            >
              YES
            </button>
            <button
              onClick={() => handleYesNo('no')}
              className="px-6 py-2 rounded-full font-jakarta font-bold text-[0.8125rem] border border-solid active:scale-95 transition-transform duration-100"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}
            >
              NO
            </button>
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <InsightOtherDialog
        open={showOtherDialog}
        questionText={question?.text}
        theme={theme}
        onSubmit={handleOtherSubmit}
        onClose={handleOtherClose}
      />

      {/* First-time YES/NO nudge */}
      {nudgeVisible && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center p-6">
          <div
            className={`absolute inset-0 ${nudgeClosing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
            style={{ background: theme.dialogDimBg }}
            onClick={() => setNudgeAnswer(null)}
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl p-6 ${nudgeClosing ? 'dialog-card-out' : 'dialog-card-in'} border border-solid`}
            style={{
              background: theme.isDark ? 'rgba(37,37,56,0.97)' : 'rgba(255,255,255,0.97)',
              borderColor: theme.dialogBorder,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <h3
              className="font-jakarta font-extrabold text-[1.125rem] text-center mb-3"
              style={{ color: theme.dialogTitle }}
            >
              Your thoughts make the difference
            </h3>
            <p
              className="font-poppins text-[0.8125rem] leading-relaxed text-center mb-6"
              style={{ color: theme.dialogText }}
            >
              Quick answers are fine, but sharing your perspective in your own words helps us
              create insights that truly reflect your relationship.
            </p>

            <button
              onClick={handleNudgeCustom}
              className="w-full py-3 rounded-xl font-jakarta font-bold text-[0.875rem] mb-3 active:scale-[0.98] transition-transform duration-100"
              style={{ background: ins.micIcon, color: '#FFFFFF' }}
            >
              Share my thoughts instead
            </button>

            <button
              onClick={handleNudgeConfirm}
              className="w-full py-3 rounded-xl font-jakarta font-bold text-[0.875rem] border border-solid active:scale-[0.98] transition-transform duration-100"
              style={{
                background: 'transparent',
                borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                color: theme.textSecondary,
              }}
            >
              Continue with {nudgeAnswer === 'yes' ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightQuestions;
