import React, { useState, useEffect, useCallback, useRef } from 'react';
import COIN_SOUND_URL from '../../assets/coin-sound';

// Shared AudioContext singleton — reuses the same pattern as FaceOverlay's
// getBeamAudioCtx(). Created once, resumed once, never closed.
let coinAudioCtx = null;
function getCoinAudioCtx() {
  if (coinAudioCtx && coinAudioCtx.state === 'closed') coinAudioCtx = null;
  if (!coinAudioCtx) {
    try {
      coinAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (coinAudioCtx.state === 'suspended') coinAudioCtx.resume();
    } catch { /* audio not available */ }
  }
  return coinAudioCtx;
}

// Decoded AudioBuffer — decoded once, reused for every playback
let coinBuffer = null;

async function loadCoinBuffer() {
  try {
    const ctx = getCoinAudioCtx();
    if (!ctx || coinBuffer) return;
    const res = await fetch(COIN_SOUND_URL);
    const arrayBuf = await res.arrayBuffer();
    coinBuffer = await ctx.decodeAudioData(arrayBuf);
  } catch { /* audio not available */ }
}

const CoinDeduction = ({ coinCount, coinCost = 4, onComplete }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'counting' | 'exit'
  const [showCoin, setShowCoin] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [displayCount, setDisplayCount] = useState(coinCount);
  const [countPulse, setCountPulse] = useState(false);
  const timersRef = useRef([]);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Warm up AudioContext + decode MP3 buffer on mount (~1.6s before sounds needed)
  useEffect(() => { loadCoinBuffer(); }, []);

  const sourcesRef = useRef([]);

  // Schedule all coin sounds at precise offsets on the audio clock
  const scheduleAllSounds = useCallback(() => {
    try {
      const ctx = getCoinAudioCtx();
      if (!ctx || !coinBuffer) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      for (let i = 0; i < coinCost; i++) {
        const when = now + i * 0.22;
        const source = ctx.createBufferSource();
        source.buffer = coinBuffer;
        source.connect(ctx.destination);
        source.start(when);
        sourcesRef.current.push(source);
      }
    } catch {
      /* audio not available */
    }
  }, [coinCost]);

  // Animation sequence — cleanup clears timers + stops scheduled audio on unmount/re-fire
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    let t = 150;

    // Coin pops in
    addTimer(() => setShowCoin(true), t);
    t += 450; // wait for coinPopIn animation

    // "-X" cost label fades in beside coin
    addTimer(() => setShowCost(true), t);
    t += 300;

    // Count fades in
    addTimer(() => setShowCount(true), t);
    t += 300;

    // Schedule sounds on the audio clock (already resumed on mount)
    addTimer(() => scheduleAllSounds(), t);

    // Countdown ticks (visual only — sound is pre-scheduled above)
    for (let i = 0; i < coinCost; i++) {
      const tickIndex = i;
      addTimer(() => {
        setDisplayCount(coinCount - tickIndex - 1);
        setCountPulse(true);
        addTimer(() => setCountPulse(false), 120);
      }, t);
      t += 220;
    }

    // Pause after counting
    t += 300;

    // Exit phase
    addTimer(() => setPhase('exit'), t);
    t += 400;

    // Complete
    addTimer(() => onComplete(), t);

    return () => {
      timersRef.current.forEach(clearTimeout);
      sourcesRef.current.forEach(s => { try { s.stop(); } catch { /* already stopped */ } });
      sourcesRef.current = [];
    };
  }, [coinCount, coinCost, addTimer, onComplete, scheduleAllSounds]);

  const isExit = phase === 'exit';

  return (
    <div
      className="flex flex-col items-center justify-center h-full"
      style={{
        background: isExit ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.85)',
        transition: 'background 0.6s ease',
      }}
    >
      {/* Coin + cost label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: isExit ? 0 : showCoin ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Coin */}
        <div className={showCoin ? 'coin-pop-in' : ''}>
          <div
            className="coin-shimmer"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 30%, #C8C8C8, #8A8A8A 70%, #6E6E6E)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(0,0,0,0.3), 0 2px 0 0 #555',
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '2rem',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              B
            </span>
          </div>
        </div>

        {/* Cost label */}
        <span
          className="font-jakarta font-extrabold"
          style={{
            fontSize: 32,
            color: '#FF4D6A',
            opacity: showCost ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          -{coinCost}
        </span>
      </div>

      {/* Count */}
      <div
        style={{
          opacity: isExit ? 0 : showCount ? 1 : 0,
          transform: `scale(${countPulse ? 1.15 : 1})`,
          transition: 'opacity 0.3s ease, transform 0.15s ease',
          marginTop: 24,
        }}
      >
        <span
          className="font-jakarta font-extrabold"
          style={{ fontSize: 48, color: '#fff' }}
        >
          {displayCount}
        </span>
      </div>

      {/* Label */}
      <p
        style={{
          opacity: isExit ? 0 : showCount ? 1 : 0,
          transition: 'opacity 0.3s ease',
          marginTop: 8,
          color: 'rgba(255,255,255,0.5)',
        }}
        className="font-poppins text-[0.875rem]"
      >
        coins
      </p>
    </div>
  );
};

export default CoinDeduction;
