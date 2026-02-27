import React from 'react';

/**
 * MicButton — Faithful port of the original waveform-component.html mic button.
 *
 * 60x70 rounded rect with exact SVG icons from the original.
 * States: hidden, waiting (glow pulse), ready (mic icon), recording (stop icon).
 */
const MicButton = ({ state = 'hidden', onPress }) => {
  if (state === 'hidden') return null;

  const isRecording = state === 'recording';
  const isWaiting = state === 'waiting';

  return (
    <div style={{ width: 60, height: 70, position: 'relative', flexShrink: 0 }}>
      <button
        onClick={onPress}
        style={{
          width: 60,
          height: 70,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          position: 'relative',
        }}
      >
        {/* Mic icon — visible when NOT recording */}
        <svg
          width="60"
          height="70"
          viewBox="0 0 60 70"
          fill="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            opacity: isRecording ? 0 : 1,
            transition: 'opacity 0.2s',
            filter: isWaiting
              ? 'drop-shadow(0 0 4px rgba(255,255,255,0.7)) drop-shadow(0 0 8px rgba(255,255,255,0.3))'
              : 'none',
            animation: isWaiting ? 'borderPulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          <rect x="0.5" y="0.5" width="59" height="69" rx="29.5" stroke="white" />
          <path
            d="M21.5625 35V23.75C21.5625 21.5122 22.4514 19.3661 24.0338 17.7838C25.6161 16.2014 27.7622 15.3125 30 15.3125C32.2378 15.3125 34.3839 16.2014 35.9662 17.7838C37.5486 19.3661 38.4375 21.5122 38.4375 23.75V35C38.4375 37.2378 37.5486 39.3839 35.9662 40.9662C34.3839 42.5486 32.2378 43.4375 30 43.4375C27.7622 43.4375 25.6161 42.5486 24.0338 40.9662C22.4514 39.3839 21.5625 37.2378 21.5625 35ZM44.0625 35C44.0625 34.627 43.9143 34.2694 43.6506 34.0056C43.3869 33.7419 43.0292 33.5938 42.6562 33.5938C42.2833 33.5938 41.9256 33.7419 41.6619 34.0056C41.3982 34.2694 41.25 34.627 41.25 35C41.25 37.9837 40.0647 40.8452 37.955 42.955C35.8452 45.0647 32.9837 46.25 30 46.25C27.0163 46.25 24.1548 45.0647 22.045 42.955C19.9353 40.8452 18.75 37.9837 18.75 35C18.75 34.627 18.6018 34.2694 18.3381 34.0056C18.0744 33.7419 17.7167 33.5938 17.3438 33.5938C16.9708 33.5938 16.6131 33.7419 16.3494 34.0056C16.0857 34.2694 15.9375 34.627 15.9375 35C15.9418 38.4849 17.2381 41.8445 19.5759 44.429C21.9136 47.0135 25.1267 48.6394 28.5938 48.9922V53.2812C28.5938 53.6542 28.7419 54.0119 29.0056 54.2756C29.2694 54.5393 29.627 54.6875 30 54.6875C30.373 54.6875 30.7306 54.5393 30.9944 54.2756C31.2581 54.0119 31.4062 53.6542 31.4062 53.2812V48.9922C34.8733 48.6394 38.0863 47.0135 40.4241 44.429C42.7619 41.8445 44.0582 38.4849 44.0625 35Z"
            fill="white"
          />
        </svg>
        {/* Stop icon — visible when recording */}
        <svg
          width="60"
          height="70"
          viewBox="0 0 60 70"
          fill="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            opacity: isRecording ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <rect x="0.5" y="0.5" width="59" height="69" rx="29.5" fill="white" fillOpacity="0.25" />
          <rect x="0.5" y="0.5" width="59" height="69" rx="29.5" stroke="white" />
          <rect x="15" y="20" width="30" height="30" rx="5" fill="#D70146" />
        </svg>
      </button>
    </div>
  );
};

export default MicButton;
