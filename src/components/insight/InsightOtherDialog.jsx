import React, { useState, useEffect, useRef, useCallback } from 'react';

const InsightOtherDialog = ({ open, questionText, theme, onSubmit, onClose }) => {
  const ins = theme.insight;
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const hasSpeechApi = typeof window !== 'undefined' &&
    (window.webkitSpeechRecognition || window.SpeechRecognition);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      setText('');
      setIsRecording(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsRecording(false);
  }, []);

  const toggleMic = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, stopRecording]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    stopRecording();
    onSubmit(text.trim());
  }, [text, onSubmit, stopRecording]);

  const handleClose = useCallback(() => {
    stopRecording();
    onClose();
  }, [onClose, stopRecording]);

  if (!visible) return null;

  const d = {
    dialogBg: theme.dialogBg,
    dialogBorder: theme.dialogBorder,
    dialogTitle: theme.dialogTitle,
    dialogText: theme.dialogText,
    dialogDimBg: theme.dialogDimBg,
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop — tap to close */}
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 ${closing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
        style={{ background: d.dialogDimBg }}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl p-6 border border-solid ${closing ? 'dialog-card-out' : 'dialog-card-in'}`}
        style={{ background: d.dialogBg, borderColor: d.dialogBorder }}
      >
        {/* Close X */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: theme.border }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h3 className="font-jakarta font-extrabold text-[18px] mb-2 text-center" style={{ color: d.dialogTitle }}>
          Tell us more
        </h3>

        {questionText && (
          <p className="font-poppins text-[13px] leading-relaxed text-center mb-4" style={{ color: d.dialogText }}>
            {questionText}
          </p>
        )}

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your answer..."
          rows={3}
          className="w-full rounded-xl p-3 font-poppins text-[14px] leading-relaxed resize-none border border-solid outline-none"
          style={{
            background: theme.onboarding.inputBg,
            borderColor: theme.onboarding.inputBorder,
            color: theme.textPrimary,
          }}
          onFocus={(e) => { e.target.style.borderColor = ins.micIcon; }}
          onBlur={(e) => { e.target.style.borderColor = theme.onboarding.inputBorder; }}
        />

        {/* Mic button */}
        {hasSpeechApi && (
          <div className="flex justify-center mt-3">
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${isRecording ? 'animate-insight-pulse' : ''}`}
              style={{ background: isRecording ? ins.micActiveBg : ins.micBg }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isRecording ? ins.micActiveIcon : ins.micIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        )}

        {/* Submit only */}
        <div className="mt-5">
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`w-full py-3 rounded-xl font-jakarta font-extrabold text-[14px] border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100 ${!text.trim() ? 'opacity-40' : ''}`}
            style={{ background: '#58CC02', borderColor: '#46A302', color: '#FFFFFF' }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightOtherDialog;
