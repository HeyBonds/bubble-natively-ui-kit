import React, { useState, useEffect, useRef, useCallback } from 'react';
import { track } from '../../utils/analytics';
import MicIcon from './MicIcon';

const InsightOtherDialog = ({ open, questionText, theme, onSubmit, onClose }) => {
  const ins = theme.insight;
  const isDark = theme.isDark;
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const wantRecordingRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Theme-derived styles for sheet elements
  const sheetBg = isDark ? 'rgba(37,37,56,0.95)' : 'rgba(255,255,255,0.95)';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  const hasSpeechApi = typeof window !== 'undefined' &&
    (window.webkitSpeechRecognition || window.SpeechRecognition);

  // Auto-start recording when opening (if speech API available)
  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      setText('');
      finalTranscriptRef.current = '';
      setShowTextarea(!hasSpeechApi);

      if (hasSpeechApi) {
        // Small delay so sheet animation starts first
        const startTimer = setTimeout(() => startRecording(), 200);
        return () => clearTimeout(startTimer);
      }
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setShowTextarea(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      wantRecordingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    wantRecordingRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsRecording(false);
    setShowTextarea(true);
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setText(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (e) => {
      // 'no-speech' is normal on Android — onend will fire and auto-restart
      if (e.error === 'no-speech' && wantRecordingRef.current) return;
      wantRecordingRef.current = false;
      setIsRecording(false);
      setShowTextarea(true);
    };

    recognition.onend = () => {
      // Auto-restart with a fresh instance if user hasn't explicitly stopped
      if (wantRecordingRef.current) {
        const next = createRecognition();
        if (next) {
          recognitionRef.current = next;
          try { next.start(); } catch {
            wantRecordingRef.current = false;
            setIsRecording(false);
            setShowTextarea(true);
          }
        } else {
          wantRecordingRef.current = false;
          setIsRecording(false);
          setShowTextarea(true);
        }
        return;
      }
      setIsRecording(false);
      setShowTextarea(true);
    };

    return recognition;
  }, []);

  const startRecording = useCallback(() => {
    finalTranscriptRef.current = '';
    wantRecordingRef.current = true;

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setShowTextarea(false);
  }, [createRecognition]);

  const toggleMic = useCallback(() => {
    track('Element Clicked', { screen: 'insight_other', element_type: 'button', element: isRecording ? 'mic_stop' : 'mic_start' });
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, startRecording]);

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;
    track('Element Clicked', { screen: 'insight_other', element_type: 'button', element: 'submit' });
    stopRecording();
    onSubmit(text.trim());
  }, [text, onSubmit, stopRecording]);

  const handleClose = useCallback(() => {
    stopRecording();
    onClose();
  }, [onClose, stopRecording]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-[9999] flex flex-col justify-end">
      {/* Backdrop — tap to close */}
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 ${closing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
        style={{ background: theme.dialogDimBg }}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className={`relative w-full rounded-t-3xl px-6 pt-3 pb-8 ${closing ? 'insight-sheet-out' : 'insight-sheet-in'}`}
        style={{
          background: sheetBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: theme.textMuted }} />
        </div>

        {/* Question text */}
        {questionText && (
          <p className="font-poppins text-[0.8125rem] leading-relaxed text-center mb-5" style={{ color: theme.dialogText }}>
            {questionText}
          </p>
        )}

        {/* Recording state — large mic + live transcript */}
        {isRecording && (
          <div className="flex flex-col items-center">
            {/* Pulsing mic */}
            <div className="relative flex items-center justify-center mb-4" style={{ width: '5rem', height: '5rem' }}>
              {/* Pulse ring */}
              <div
                className="insight-ripple absolute rounded-full border-2 border-solid"
                style={{ width: '4rem', height: '4rem', borderColor: ins.micActiveBg, inset: 0, margin: 'auto' }}
              />
              <button
                onClick={toggleMic}
                className="animate-insight-pulse relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: ins.micActiveBg }}
              >
                <MicIcon size={28} stroke={ins.micActiveIcon} />
              </button>
            </div>

            <span className="font-poppins text-[0.75rem] mb-4" style={{ color: ins.micActiveBg }}>
              Listening...
            </span>

            {/* Live transcript */}
            <div
              className="w-full min-h-[4rem] rounded-xl p-3 font-poppins text-[0.875rem] leading-relaxed"
              style={{
                background: inputBg,
                color: theme.textPrimary,
              }}
            >
              {text || <span style={{ color: theme.textMuted }}>Start speaking...</span>}
            </div>

            {/* Tap to stop hint */}
            <p className="font-poppins text-[0.6875rem] mt-3" style={{ color: theme.textMuted }}>
              Tap mic to stop recording
            </p>
          </div>
        )}

        {/* Edit state — textarea + mic toggle */}
        {!isRecording && showTextarea && (
          <div>
            {/* Mic toggle — small, above textarea */}
            {hasSpeechApi && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={toggleMic}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: ins.micBg }}
                >
                  <MicIcon size={20} stroke={ins.micIcon} />
                </button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={hasSpeechApi ? 'Or type your answer...' : 'Type your answer...'}
              rows={3}
              className="w-full rounded-xl p-3 font-poppins text-[0.875rem] leading-relaxed resize-none border border-solid outline-none"
              style={{
                background: inputBg,
                borderColor: inputBorder,
                color: theme.textPrimary,
              }}
              onFocus={(e) => { e.target.style.borderColor = ins.micIcon; }}
              onBlur={(e) => { e.target.style.borderColor = inputBorder; }}
            />

            {/* Submit */}
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className={`w-full py-3 rounded-xl font-jakarta font-extrabold text-[0.875rem] border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100 ${!text.trim() ? 'opacity-40' : ''}`}
                style={{ background: '#58CC02', borderColor: '#46A302', color: '#FFFFFF' }}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Initial state before recording starts — brief loading indicator */}
        {!isRecording && !showTextarea && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: ins.micBg }}>
              <MicIcon size={28} stroke={ins.micIcon} />
            </div>
            <span className="font-poppins text-[0.75rem] mt-2" style={{ color: theme.textMuted }}>
              Starting...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightOtherDialog;
