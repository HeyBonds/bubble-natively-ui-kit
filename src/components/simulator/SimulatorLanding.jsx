import React, { useState } from 'react';
import Dialog from '../Dialog';

// Module-level: audio check shown once per session
let audioCheckShown = false;

const isAndroid = () => /android/i.test(navigator.userAgent);

/**
 * SimulatorLanding — Pre-session intro screen.
 *
 * Props:
 *  - onStart: () => void (called after audio check, begins session)
 *  - creditCost: number (default 4)
 *  - theme: theme object
 */
const SimulatorLanding = ({ onStart, creditCost = 4, theme }) => {
  const [showAudioCheck, setShowAudioCheck] = useState(false);
  const sim = theme.simulator;

  const handleStart = () => {
    if (isAndroid() && !audioCheckShown) {
      audioCheckShown = true;
      setShowAudioCheck(true);
      return;
    }
    onStart();
  };

  const handleAudioCheckDismiss = () => {
    setShowAudioCheck(false);
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Illustration area — placeholder for now */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ background: sim.micBg, borderColor: sim.micBorder }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={sim.micIcon} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="font-jakarta font-extrabold text-[28px] text-center mb-3" style={{ color: sim.landingTitle }}>
        Conversation
      </h1>
      <h1 className="font-jakarta font-extrabold text-[28px] text-center mb-6 -mt-2" style={{ color: sim.landingTitle }}>
        Simulator
      </h1>

      {/* Description */}
      <p className="font-poppins text-[15px] text-center leading-relaxed mb-auto px-4" style={{ color: sim.landingSubtitle }}>
        Practice what you want to say, and how you say it. Get honest and objective guidance.
      </p>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center gap-3 mt-8">
        <p className="font-poppins text-[13px]" style={{ color: sim.landingHint }}>
          Find a quiet place to start
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full max-w-[260px] py-3.5 rounded-xl font-jakarta font-extrabold text-[16px] text-white border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100"
          style={{ background: '#58CC02', borderColor: '#46A302' }}
        >
          Start
        </button>

        <p className="font-poppins text-[12px]" style={{ color: sim.creditCost }}>
          Uses {creditCost} credits
        </p>
      </div>

      {/* Audio check dialog — Android only */}
      <Dialog
        open={showAudioCheck}
        onClose={handleAudioCheckDismiss}
        title="Let's make sure you can hear us!"
        theme={theme}
        closeOnBackdrop={false}
        actions={[{ label: 'Got it', onClick: handleAudioCheckDismiss, primary: true }]}
      >
        <p className="mb-3">
          This experience includes audio. Some devices may experience low or no audio output.
        </p>
        <p>
          Use the side buttons to turn up your volume. Please ensure both Media and Ringer levels are active.
        </p>
      </Dialog>
    </div>
  );
};

export default SimulatorLanding;
