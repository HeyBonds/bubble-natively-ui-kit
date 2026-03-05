import React, { useState, useEffect, useRef, useCallback } from 'react';
import TTS from '../../utils/tts';
import { useTTS } from '../../hooks/useTTS';

const SCORE_COLORS = ['#FF4B4B', '#FF8C00', '#FFD700', '#9ACD32', '#58CC02'];
const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

// Play a short ascending-pitch beep via Web Audio API
function playScoreBeep(index) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    // Ascending pitch: 400Hz → 800Hz across 5 dots
    osc.frequency.value = 400 + index * 100;
    osc.type = 'sine';
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    // Clean up after sound plays
    osc.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

// Compile evaluation data into natural speech text
function buildTTSText({ skill_level, strengths, improvements, summary }) {
  const strip = (s) => s.replace(/[.!?]+\s*$/, '');
  const parts = [skill_level + '.'];
  if (strengths.length) {
    parts.push('What you did well: ' + strengths.map(strip).join('. ') + '.');
  }
  if (improvements.length) {
    parts.push('Areas to improve: ' + improvements.map(strip).join('. ') + '.');
  }
  if (summary) parts.push(summary);
  return parts.join(' ');
}

const SimulatorResults = ({ evaluation, theme, onRetry, onDone }) => {
  const sim = theme.simulator;
  const [expanded, setExpanded] = useState(false);
  const { status: ttsStatus } = useTTS();

  // Animation state
  const [litDots, setLitDots] = useState(0); // how many dots are lit (0→score)
  const [showTitle, setShowTitle] = useState(false);
  const [showFraction, setShowFraction] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState(0);
  const [showStrengthsHeader, setShowStrengthsHeader] = useState(false);
  const [visibleStrengths, setVisibleStrengths] = useState(0);
  const [showImprovementsHeader, setShowImprovementsHeader] = useState(false);
  const [visibleImprovements, setVisibleImprovements] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);

  const timersRef = useRef([]);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const { overall_score = 1, skill_level = 'Getting Started', metrics = [], strengths = [], improvements = [], summary = '' } = evaluation || {};

  // Clean up timers + TTS on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      TTS.stop();
    };
  }, []);

  // Run entrance animation sequence on mount, then trigger TTS
  useEffect(() => {
    if (!evaluation) return;
    let t = 200;

    // 1. Title fades in
    addTimer(() => setShowTitle(true), t);
    t += 400;

    // 2. Score dots light up sequentially
    for (let i = 1; i <= overall_score; i++) {
      addTimer(() => {
        setLitDots(i);
        playScoreBeep(i - 1);
      }, t);
      t += 300;
    }
    t += 200;

    // 3. Score fraction
    addTimer(() => setShowFraction(true), t);
    t += 300;

    // 4. Metrics appear one by one
    for (let i = 1; i <= metrics.length; i++) {
      addTimer(() => setVisibleMetrics(i), t);
      t += 200;
    }
    t += 200;

    // 5. Strengths header + items
    if (strengths.length > 0) {
      addTimer(() => setShowStrengthsHeader(true), t);
      t += 250;
      for (let i = 1; i <= strengths.length; i++) {
        addTimer(() => setVisibleStrengths(i), t);
        t += 200;
      }
      t += 200;
    }

    // 6. Improvements header + items
    if (improvements.length > 0) {
      addTimer(() => setShowImprovementsHeader(true), t);
      t += 250;
      for (let i = 1; i <= improvements.length; i++) {
        addTimer(() => setVisibleImprovements(i), t);
        t += 200;
      }
      t += 200;
    }

    // 7. Summary link
    if (summary) {
      addTimer(() => setShowSummary(true), t);
      t += 200;
    }

    // 8. Footer
    addTimer(() => setShowFooter(true), t);

    // 9. After animation completes, start TTS directly
    t += 500;
    addTimer(() => {
      try {
        const raw = localStorage.getItem('bonds_simulator_templates');
        const apiKey = raw ? JSON.parse(raw).ttsApiKey : null;
        if (apiKey) {
          const text = buildTTSText({ skill_level, strengths, improvements, summary });
          TTS.start({ apiKey, text });
        }
      } catch { /* ignore */ }
    }, t);
  }, [evaluation, overall_score, metrics.length, strengths, improvements, summary, skill_level, addTimer]);

  if (!evaluation) return null;

  // Shared fade-in style generator
  const fadeIn = (visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) translateZ(0)' : 'translateY(0.5em) translateZ(0)',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
  });

  const handlePlayPause = () => {
    if (ttsStatus === 'streaming') TTS.pause();
    else if (ttsStatus === 'paused') TTS.resume();
  };

  const handleSpeedCycle = () => {
    const next = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(next);
    TTS.setSpeed(SPEED_OPTIONS[next]);
  };

  const handleReplay = () => {
    try {
      const raw = localStorage.getItem('bonds_simulator_templates');
      const apiKey = raw ? JSON.parse(raw).ttsApiKey : null;
      if (apiKey) {
        const text = buildTTSText({ skill_level, strengths, improvements, summary });
        TTS.start({ apiKey, text });
      }
    } catch { /* ignore */ }
  };

  const handleRetry = () => {
    if (!onRetry) return;
    TTS.stop();
    onRetry();
  };

  const handleDone = () => {
    TTS.stop();
    onDone();
  };

  const showPlayPause = ttsStatus === 'streaming' || ttsStatus === 'paused';
  const showReplay = ttsStatus === 'done' || ttsStatus === 'idle';

  return (
    <div className="flex flex-col h-full" style={{ background: sim.sessionBg }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-6 pb-4">

        {/* Score header */}
        <div className="text-center mb-6">
          <h2
            className="font-jakarta font-extrabold text-[24px] mb-3"
            style={{ color: sim.resultsTitle, ...fadeIn(showTitle) }}
          >
            {skill_level}
          </h2>

          {/* Score dots */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {SCORE_COLORS.map((color, i) => {
              const lit = i < litDots;
              const isScoreDot = i === overall_score - 1;
              return (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: lit && isScoreDot ? 20 : 16,
                    height: lit && isScoreDot ? 20 : 16,
                    background: lit ? color : sim.dotInactive,
                    border: lit ? 'none' : `1px solid ${sim.dotBorder}`,
                    transition: 'background 0.3s ease, width 0.3s ease, height 0.3s ease',
                  }}
                />
              );
            })}
          </div>
          <p
            className="font-poppins text-[14px]"
            style={{ color: sim.scoreFraction, ...fadeIn(showFraction) }}
          >
            {overall_score}/5
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-2 mb-6">
          {metrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2"
              style={fadeIn(i < visibleMetrics)}
            >
              <span className="text-[18px]" style={{ color: metric.direction === 'up' ? sim.metricUp : sim.metricDown }}>
                {metric.direction === 'up' ? '\u2191' : '\u2193'}
              </span>
              <span className="font-poppins font-medium text-[15px]" style={{ color: sim.metricText }}>
                {metric.name}
              </span>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mb-5">
            <h3
              className="font-jakarta font-bold text-[14px] mb-2"
              style={{ color: sim.sectionTitle, ...fadeIn(showStrengthsHeader) }}
            >
              What you did well
            </h3>
            <ul className="flex flex-col gap-1.5">
              {strengths.map((item, i) => (
                <li
                  key={i}
                  className="font-poppins text-[13px] leading-relaxed"
                  style={{ color: sim.bulletText, ...fadeIn(i < visibleStrengths) }}
                >
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="mb-5">
            <h3
              className="font-jakarta font-bold text-[14px] mb-2"
              style={{ color: sim.sectionTitleImprove, ...fadeIn(showImprovementsHeader) }}
            >
              Areas to improve
            </h3>
            <ul className="flex flex-col gap-1.5">
              {improvements.map((item, i) => (
                <li
                  key={i}
                  className="font-poppins text-[13px] leading-relaxed"
                  style={{ color: sim.bulletText, ...fadeIn(i < visibleImprovements) }}
                >
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary -- expandable */}
        {summary && (
          <div className="mb-4" style={fadeIn(showSummary)}>
            {expanded && (
              <p className="font-poppins text-[13px] leading-relaxed mb-2" style={{ color: sim.bulletText }}>
                {summary}
              </p>
            )}
            <button onClick={() => setExpanded(!expanded)} className="font-jakarta font-bold text-[13px] underline" style={{ color: sim.readMoreText }}>
              {expanded ? 'Read less' : 'Read more'}
            </button>
          </div>
        )}
      </div>

      {/* TTS controls — play/pause + speed while playing, replay when done */}
      {showPlayPause && (
        <div className="shrink-0 flex items-center justify-center gap-3 pb-3">
          <button
            onClick={handlePlayPause}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: sim.dotInactive, border: `1px solid ${sim.resultsBorder}` }}
          >
            {ttsStatus === 'streaming' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={sim.resultsTitle}>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill={sim.resultsTitle}>
                <polygon points="6,4 20,12 6,20" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSpeedCycle}
            className="h-11 px-3 rounded-full flex items-center justify-center font-jakarta font-bold text-[13px]"
            style={{ background: sim.dotInactive, border: `1px solid ${sim.resultsBorder}`, color: sim.resultsTitle }}
          >
            {SPEED_OPTIONS[speedIndex]}x
          </button>
        </div>
      )}
      {showReplay && showFooter && (
        <div className="shrink-0 flex items-center justify-center pb-3">
          <button
            onClick={handleReplay}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: sim.dotInactive, border: `1px solid ${sim.resultsBorder}` }}
          >
            {/* Replay icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sim.resultsTitle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      )}

      {/* Footer -- TRY AGAIN / DONE */}
      <div
        className="shrink-0 flex items-center border-t border-solid"
        style={{
          borderColor: sim.resultsBorder,
          background: sim.resultsBg,
          transform: showFooter ? 'translateY(0) translateZ(0)' : 'translateY(100%) translateZ(0)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {onRetry && (
          <>
            <button
              onClick={handleRetry}
              className="flex-1 py-4 text-center"
            >
              <span className="font-jakarta font-extrabold text-[14px] block" style={{ color: sim.resultsTitle }}>
                TRY AGAIN
              </span>
              <span className="font-poppins text-[11px]" style={{ color: sim.scoreFraction }}>
                Same topic
              </span>
            </button>
            <div style={{ width: 1, height: 40, background: sim.resultsBorder }} />
          </>
        )}
        <button
          onClick={handleDone}
          className="flex-1 py-4 text-center"
        >
          <span className="font-jakarta font-extrabold text-[14px]" style={{ color: sim.resultsTitle }}>
            DONE
          </span>
        </button>
      </div>
    </div>
  );
};

export default SimulatorResults;
