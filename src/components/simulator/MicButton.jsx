import React from 'react';

/**
 * MicButton — Push-to-talk toggle.
 *
 * Props:
 *  - state: 'hidden' | 'waiting' | 'ready' | 'recording'
 *  - onPress: () => void
 *  - theme: theme object
 */
const MicButton = ({ state = 'hidden', onPress, theme }) => {
  if (state === 'hidden') return null;

  const sim = theme.simulator;

  if (state === 'waiting') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-solid animate-paused-clock"
          style={{ background: sim.micBg, borderColor: sim.micBorder }}
        >
          {/* Spinner */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ animationDuration: '1.5s' }}>
            <circle cx="12" cy="12" r="10" stroke={sim.micIcon} strokeWidth="2" strokeDasharray="50 20" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  const isRecording = state === 'recording';

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onPress}
        className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-solid transition-[transform,background-color] duration-150 active:scale-95"
        style={{
          background: isRecording ? sim.micStopBg : sim.micBg,
          borderColor: isRecording ? sim.micActiveBorder : sim.micBorder,
        }}
      >
        {isRecording ? (
          /* Stop icon */
          <div className="w-5 h-5 rounded-sm" style={{ background: sim.micStopIcon }} />
        ) : (
          /* Mic icon */
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sim.micIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default MicButton;
