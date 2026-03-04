import React, { useState, useEffect } from 'react';
import { sendToBubble } from '../utils/bubble';
import TTS from '../utils/tts';
import { useTTS } from '../hooks/useTTS';

/**
 * TestTTSScreen — thin UI shell for TTS streaming test.
 *
 * All streaming logic lives in src/utils/tts.js (singleton module).
 * React state comes from the useTTS hook.
 *
 * Flow:
 * 1. User taps Start → unlockAudio + sendToBubble('bubble_fn_test', 'start_tts')
 * 2. Bubble calls window.appUI.startTTSStream({ apiKey, text })
 * 3. TTS module streams MP3, emits events; useTTS hook feeds React state
 */

const TestTTSScreen = ({ pop, theme }) => {
  const { status, progress, sentences, stats, error } = useTTS();
  const [waitingForBubble, setWaitingForBubble] = useState(false);

  useEffect(() => {
    if (status === 'streaming') setWaitingForBubble(false);
  }, [status]);

  const displayStatus = waitingForBubble ? 'waiting' : status;
  const isActive = displayStatus === 'waiting' || displayStatus === 'streaming';

  const handleStart = () => {
    TTS.unlockAudio();
    setWaitingForBubble(true);
    sendToBubble('bubble_fn_test', 'start_tts');
  };

  const handleStop = () => TTS.stop();

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  };

  const sentenceColor = (state) =>
    state === 'active' ? theme.textPrimary
      : state === 'spoken' ? theme.textMuted
        : theme.textSecondary;

  return (
    <div className="w-full h-full font-jakarta overflow-y-auto" style={{ background: theme.bg }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={pop} className="w-9 h-9 rounded-full flex items-center justify-center border border-solid" style={{ borderColor: theme.border, background: theme.surface }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-extrabold text-[18px]" style={{ color: theme.textPrimary }}>Test TTS Streaming</h1>
      </div>

      <div className="px-5 pb-10">
        {/* Status + Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{
                background: displayStatus === 'streaming' ? '#58CC02'
                  : displayStatus === 'waiting' ? '#FF9600'
                  : displayStatus === 'done' ? '#1CB0F6'
                  : displayStatus === 'error' ? '#FF4B4B'
                  : theme.textMuted,
              }} />
              <span className="text-[13px] font-semibold" style={{ color: theme.textSecondary }}>
                {displayStatus === 'idle' ? 'Ready' : displayStatus === 'waiting' ? 'Waiting for Bubble...' : displayStatus === 'streaming' ? 'Streaming...' : displayStatus === 'done' ? 'Done' : 'Error'}
              </span>
            </div>
            {(displayStatus === 'streaming' || displayStatus === 'done') && (
              <span className="text-[12px] font-mono" style={{ color: theme.textMuted }}>
                {formatTime(progress.elapsed)} / {formatTime(progress.total)}
              </span>
            )}
          </div>
          {(displayStatus === 'streaming' || displayStatus === 'done') && (
            <div className="h-1 rounded-full overflow-hidden" style={{ background: theme.border }}>
              <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${progress.percent * 100}%`, background: '#E44B8E' }} />
            </div>
          )}
        </div>

        {/* Start / Stop */}
        {isActive ? (
          <button
            onClick={handleStop}
            className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] border-b-[3px] border-solid active:border-b-0 active:mt-[3px]"
            style={{ background: '#FF4B4B', borderColor: '#CC3333', color: '#FFFFFF' }}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] border-b-[3px] border-solid active:border-b-0 active:mt-[3px]"
            style={{ background: '#E44B8E', borderColor: '#B83A72', color: '#FFFFFF' }}
          >
            {displayStatus === 'done' ? 'Play Again' : 'Start TTS'}
          </button>
        )}

        {/* Transcript */}
        <div
          className="mt-5 rounded-2xl p-4 min-h-[10em] border border-solid"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
            Transcript
          </p>
          <div className="font-poppins text-[14px] leading-relaxed">
            {sentences.length > 0 ? sentences.map((s, i) => (
              <span
                key={i}
                className="transition-colors duration-200"
                style={{
                  color: sentenceColor(s.state),
                  fontWeight: s.state === 'active' ? 600 : 400,
                }}
              >
                {s.text}{' '}
              </span>
            )) : (
              <span style={{ color: theme.textMuted }}>
                {displayStatus === 'idle' ? 'Press Start to begin...' : displayStatus === 'waiting' ? 'Waiting...' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl p-3 border border-solid" style={{ borderColor: '#FF4B4B', background: 'rgba(255,75,75,0.1)' }}>
            <p className="text-[12px] font-mono break-all" style={{ color: '#FF4B4B' }}>{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { label: 'First Byte', value: stats.firstByte != null ? `${stats.firstByte}ms` : '-' },
              { label: 'Total Fetch', value: `${stats.totalFetch}ms` },
              { label: 'Audio Duration', value: `${stats.duration}s` },
              { label: 'Size', value: stats.size },
              { label: 'Sentences', value: stats.sentenceCount },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 border border-solid" style={{ borderColor: theme.border, background: theme.surface }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: theme.textMuted }}>{s.label}</p>
                <p className="text-[16px] font-extrabold font-mono" style={{ color: theme.textPrimary }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Bubble script reference */}
        <div className="mt-6 rounded-xl p-4 border border-solid" style={{ borderColor: theme.border, background: theme.surface }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.textMuted }}>
            Bubble Run JavaScript
          </p>
          <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto" style={{ color: theme.textSecondary }}>
{`window.appUI.startTTSStream({
  apiKey: "<api-key>",
  text: "Text to speak..."
})`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestTTSScreen;
