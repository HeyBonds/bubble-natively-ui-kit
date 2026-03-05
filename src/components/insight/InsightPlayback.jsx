import React, { useRef, useEffect, useState, useCallback } from 'react';
import TTS from '../../utils/tts';
import { useTTS } from '../../hooks/useTTS';
import InsightLoader from './InsightLoader';

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

const InsightPlayback = ({ insightData, ttsApiKey, theme, onDone }) => {
  const ins = theme.insight;
  const videoRef = useRef(null);
  const ambientRef = useRef(null);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const { status: ttsStatus, sentences } = useTTS();

  const { title, text, videoUrl, audioUrl } = insightData || {};

  // Start TTS on mount — InsightPlayback owns the TTS lifecycle
  useEffect(() => {
    if (ttsApiKey && text) {
      TTS.start({ apiKey: ttsApiKey, text });
    }
    return () => { TTS.stop(); };
  }, [ttsApiKey, text]);

  // Detect when audio is actually playing (first active sentence = real audio output)
  useEffect(() => {
    if (!audioReady && sentences.some((s) => s.state === 'active')) {
      setAudioReady(true);
    }
  }, [audioReady, sentences]);

  // Sync play state when TTS finishes
  useEffect(() => {
    if (ttsStatus === 'done') {
      setIsPlaying(false);
    }
  }, [ttsStatus]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      if (ttsStatus === 'streaming') TTS.pause();
      if (videoRef.current) videoRef.current.pause();
      if (ambientRef.current) ambientRef.current.pause();
      setIsPlaying(false);
    } else {
      if (ttsStatus === 'paused') {
        TTS.resume();
      } else if (ttsStatus === 'done' || ttsStatus === 'idle') {
        if (ttsApiKey && text) TTS.start({ apiKey: ttsApiKey, text });
      }
      if (videoRef.current) videoRef.current.play().catch(() => {});
      if (ambientRef.current) ambientRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, ttsStatus, ttsApiKey, text]);

  const handleSpeedCycle = useCallback(() => {
    const next = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(next);
    TTS.setSpeed(SPEED_OPTIONS[next]);
  }, [speedIndex]);

  const handleReplay = useCallback(() => {
    if (ttsApiKey && text) {
      TTS.start({ apiKey: ttsApiKey, text });
      if (videoRef.current) videoRef.current.play().catch(() => {});
      if (ambientRef.current) ambientRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [ttsApiKey, text]);

  const handleDone = useCallback(() => {
    TTS.stop();
    if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current.src = ''; }
    onDone();
  }, [onDone]);

  // Find active sentence for subtitle
  const activeSentence = sentences.find((s) => s.state === 'active');
  const showSubtitle = activeSentence && (ttsStatus === 'streaming' || ttsStatus === 'paused');

  const showPlayPause = ttsStatus === 'streaming' || ttsStatus === 'paused';
  const showReplay = ttsStatus === 'done';

  // Show loader overlay until audio is actually playing
  if (!audioReady) {
    return <InsightLoader theme={theme} />;
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* Fullscreen video background */}
      {videoUrl && (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          loop
          playsInline
          webkit-playsinline="true"
        />
      )}

      {/* Ambient audio */}
      {audioUrl && (
        <audio
          ref={ambientRef}
          src={audioUrl}
          loop
          autoPlay
          volume="0.2"
          onLoadedMetadata={(e) => { e.target.volume = 0.2; }}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgba(0,0,0,0.35)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Title at top */}
        {title && (
          <div className="pt-14 px-6">
            <h2 className="font-jakarta font-extrabold text-[20px] text-center" style={{ color: '#FFFFFF' }}>
              {title}
            </h2>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Subtitle */}
        <div className="px-6 mb-4" style={{ minHeight: '4em' }}>
          {showSubtitle && (
            <div
              className="animate-subtitle-slide-up rounded-xl px-4 py-3 text-center"
              style={{ background: ins.subtitleBg }}
            >
              <p className="font-poppins font-medium text-[16px] leading-relaxed" style={{ color: ins.subtitleText }}>
                {activeSentence.text}
              </p>
            </div>
          )}
        </div>

        {/* Controls: play/pause + speed / replay */}
        <div className="flex items-center justify-center gap-3 mb-4 px-6">
          {showPlayPause && (
            <>
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: ins.controlBg }}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={ins.controlIcon}>
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={ins.controlIcon}>
                    <polygon points="6,4 20,12 6,20" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleSpeedCycle}
                className="h-12 px-4 rounded-full flex items-center justify-center font-jakarta font-bold text-[13px]"
                style={{ background: ins.controlBg, color: ins.controlIcon }}
              >
                {SPEED_OPTIONS[speedIndex]}x
              </button>
            </>
          )}
          {showReplay && (
            <button
              onClick={handleReplay}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: ins.controlBg }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ins.controlIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          )}
        </div>

        {/* Footer: Feedback + Continue */}
        <div className="flex items-center gap-3 px-6 pb-10">
          <button
            className="flex-1 py-4 rounded-2xl font-jakarta font-extrabold text-[14px] border border-solid active:translate-y-[1px] transition-[transform] duration-100"
            style={{ background: ins.feedbackBg, borderColor: 'transparent', color: ins.feedbackText }}
          >
            Feedback
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-4 rounded-2xl font-jakarta font-extrabold text-[16px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100"
            style={{ background: ins.continueBg, borderColor: ins.continueShadow }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightPlayback;
