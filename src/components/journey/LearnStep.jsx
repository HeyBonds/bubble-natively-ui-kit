import React, { useState, useRef, useCallback, useEffect } from 'react';
import { track } from '../../utils/analytics';
import LearnQuiz from './LearnQuiz';
import { getLearnVideoUrl } from './journeyMocks';

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];
const CONTROL_BG = 'rgba(255,255,255,0.15)';
const CONTROL_ICON = '#FFFFFF';
const WATCHED_KEY = 'bonds_learn_watched';

/**
 * LearnStep — Video player with playback controls, then quiz sequence.
 *
 * First watch: user must watch the full video before continuing to questions.
 * After replay: a "Skip" button appears so they can jump to questions.
 *
 * Props:
 *  - chapter: chapter object
 *  - theme: theme object
 *  - onComplete: (coinsEarned) => void
 *  - onClose: () => void
 */
const LearnStep = ({ chapter, theme, onComplete, onClose }) => {
  const [subPhase, setSubPhase] = useState('video'); // 'video' | 'quiz'
  const [progress, setProgress] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [hasWatchedOnce, setHasWatchedOnce] = useState(() => {
    try {
      const watched = JSON.parse(localStorage.getItem(WATCHED_KEY) || '[]');
      return watched.includes(chapter.index);
    } catch { return false; }
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(0);
  const videoRef = useRef(null);

  const videoUrl = getLearnVideoUrl(chapter);

  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v && v.duration) {
      setProgress(v.currentTime / v.duration);
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true);
    setIsPlaying(false);
    setHasWatchedOnce(true);
    track('Journey Video Watched', { chapter: chapter.index });
    try {
      const watched = JSON.parse(localStorage.getItem(WATCHED_KEY) || '[]');
      if (!watched.includes(chapter.index)) {
        watched.push(chapter.index);
        localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
      }
    } catch { /* noop */ }
  }, [chapter.index]);

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
      track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: 'pause' });
    } else {
      v.play().catch(() => {});
      setIsPlaying(true);
      track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: 'play' });
    }
  }, [isPlaying]);

  const handleSpeedCycle = useCallback(() => {
    const next = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = SPEED_OPTIONS[next];
    }
    track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: 'speed', speed: SPEED_OPTIONS[next] });
  }, [speedIndex]);

  const handleRewind = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = Math.max(0, v.currentTime - 5);
      track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: 'rewind' });
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setVideoEnded(false);
      setIsPlaying(true);
      track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: 'replay' });
    }
  }, []);

  const handleContinueToQuiz = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setSubPhase('quiz');
    track('Element Clicked', { screen: 'learn_video', element_type: 'button', element: hasWatchedOnce ? 'skip_to_questions' : 'continue_to_questions' });
  }, [hasWatchedOnce]);

  const handleQuizComplete = useCallback((correctCount) => {
    if (onComplete) onComplete(correctCount);
  }, [onComplete]);

  if (subPhase === 'quiz') {
    return (
      <LearnQuiz
        questions={chapter.content.lessonQuestions}
        theme={theme}
        onComplete={handleQuizComplete}
        onClose={onClose}
      />
    );
  }

  // Show skip button if user has watched this video before (persisted)
  const canSkip = hasWatchedOnce && !videoEnded;

  return (
    <div className="h-full flex flex-col font-jakarta" style={{ background: '#000' }}>
      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 10, background: 'rgba(255,255,255,0.2)' }}>
        <div style={{
          height: '100%',
          background: '#E44B8E',
          transform: `scaleX(${progress})`,
          transformOrigin: 'left',
          transition: 'transform 0.2s linear',
        }} />
      </div>

      {/* Close button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Chapter title overlay */}
      <div className="absolute top-4 left-0 right-0 z-10 text-center pointer-events-none">
        <p className="font-bold text-[12px] text-white/60 uppercase tracking-widest">{chapter.title}</p>
      </div>


      {/* Video */}
      <div className="flex-1 flex items-center justify-center relative">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          webkit-playsinline=""
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          className="w-full h-full object-contain"
          style={{ background: '#000' }}
        />

        {/* End screen overlay */}
        {videoEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)' }}>
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-[14px] text-white/80 mb-4"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Replay
            </button>
            <button
              onClick={handleContinueToQuiz}
              className="w-[80%] py-3.5 rounded-xl font-extrabold text-[15px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-transform duration-100"
              style={{ background: '#E44B8E', borderColor: '#B83A72' }}
            >
              Continue to Questions
            </button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {!videoEnded && (
        <div className="flex items-center justify-center gap-3 pb-8 pt-3" style={{ flexShrink: 0 }}>
          <button
            onClick={handleRewind}
            className="w-11 h-11 rounded-full flex items-center justify-center relative"
            style={{ background: CONTROL_BG }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CONTROL_ICON} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span className="absolute font-extrabold text-[8px]" style={{ color: CONTROL_ICON, top: '50%', left: '53%', transform: 'translate(-50%, -38%)' }}>5</span>
          </button>
          <button
            onClick={handlePlayPause}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: CONTROL_BG }}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={CONTROL_ICON}>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={CONTROL_ICON}>
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSpeedCycle}
            className="h-11 px-3.5 rounded-full flex items-center justify-center font-jakarta font-bold text-[12px]"
            style={{ background: CONTROL_BG, color: CONTROL_ICON }}
          >
            {SPEED_OPTIONS[speedIndex]}x
          </button>
          {canSkip && (
            <button
              onClick={handleContinueToQuiz}
              className="h-11 flex items-center gap-1.5 px-4 rounded-full font-jakarta font-bold text-[12px] text-white"
              style={{ background: 'rgba(255,255,255,0.18)' }}
            >
              Skip
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LearnStep;
