import React, { useState, useEffect, useRef } from 'react';

// Beam-in sound: ethereal chord shimmer with noise burst
function playBeamIn() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const dur = 0.7;

    // White noise burst for initial "whoosh"
    const bufLen = ctx.sampleRate * 0.15;
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const noiseFilt = ctx.createBiquadFilter();
    noiseFilt.type = 'bandpass';
    noiseFilt.frequency.setValueAtTime(2000, now);
    noiseFilt.frequency.exponentialRampToValueAtTime(6000, now + 0.12);
    noiseFilt.Q.value = 1.5;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(noiseFilt).connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    // Layer 1: root note sweep (C5→G5)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(261, now);
    osc1.frequency.exponentialRampToValueAtTime(784, now + dur);
    g1.gain.setValueAtTime(0.0, now);
    g1.gain.linearRampToValueAtTime(0.07, now + 0.08);
    g1.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc1.connect(g1).connect(ctx.destination);

    // Layer 2: major third (E5→B5)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(330, now);
    osc2.frequency.exponentialRampToValueAtTime(988, now + dur);
    g2.gain.setValueAtTime(0.0, now);
    g2.gain.linearRampToValueAtTime(0.05, now + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc2.connect(g2).connect(ctx.destination);

    // Layer 3: fifth (G5→D6) — delayed entry for spread
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(392, now + 0.05);
    osc3.frequency.exponentialRampToValueAtTime(1175, now + dur);
    g3.gain.setValueAtTime(0.0, now);
    g3.gain.linearRampToValueAtTime(0.04, now + 0.15);
    g3.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc3.connect(g3).connect(ctx.destination);

    // Layer 4: high shimmer octave (sparkle)
    const osc4 = ctx.createOscillator();
    const g4 = ctx.createGain();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(523, now + 0.1);
    osc4.frequency.exponentialRampToValueAtTime(2093, now + dur);
    g4.gain.setValueAtTime(0.0, now);
    g4.gain.linearRampToValueAtTime(0.025, now + 0.2);
    g4.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc4.connect(g4).connect(ctx.destination);

    [osc1, osc2, osc3, osc4].forEach((o) => { o.start(now); o.stop(now + dur); });
    osc4.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

// Beam-out sound: descending dissolve with reverb tail
function playBeamOut() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const dur = 0.5;

    // Layer 1: descending root
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(784, now);
    osc1.frequency.exponentialRampToValueAtTime(196, now + dur);
    g1.gain.setValueAtTime(0.06, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc1.connect(g1).connect(ctx.destination);

    // Layer 2: descending third
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(988, now);
    osc2.frequency.exponentialRampToValueAtTime(247, now + dur);
    g2.gain.setValueAtTime(0.04, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.8);
    osc2.connect(g2).connect(ctx.destination);

    // Layer 3: filtered noise tail
    const bufLen = ctx.sampleRate * 0.3;
    const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(4000, now);
    filt.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.04, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    noise.connect(filt).connect(ng).connect(ctx.destination);
    noise.start(now + 0.02);

    [osc1, osc2].forEach((o) => { o.start(now); o.stop(now + dur); });
    osc2.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

// Phase 1 faces — smaller gray silhouettes (127x276)
// Left face: flat edge on left (x=0), profile extends right
const Phase1Left = ({ fill = '#6D6987', fillOpacity = 0.7 }) => (
  <svg width="127" height="276" viewBox="0 0 127 276" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M122.919 58.6497L81.0704 0H0V276H16.5548C18.4716 276 19.4299 276 20.3842 275.939C21.2322 275.885 22.0776 275.795 22.918 275.669C23.8634 275.527 24.8 275.325 26.6727 274.921L32.7096 273.62C37.2347 272.644 39.4973 272.156 41.6315 271.342C43.5265 270.619 45.3434 269.706 47.0541 268.616C48.9807 267.389 50.7223 265.865 54.2052 262.816L55.8845 261.346C57.8955 259.586 58.9006 258.706 59.8178 257.747C61.0747 256.434 62.2095 255.009 63.2084 253.49C63.9375 252.381 64.5701 251.204 65.8353 248.851C67.2239 246.268 67.9181 244.977 68.4796 243.635C69.2488 241.797 69.8331 239.888 70.2237 237.934C70.5088 236.508 70.6558 235.049 70.9499 232.132L71.0654 230.986C71.2537 229.118 71.3478 228.184 71.3834 227.249C71.4151 226.417 71.4121 225.584 71.3745 224.753C71.3322 223.817 71.2315 222.884 71.0299 221.018L70.3609 214.823C70.1583 212.948 69.7378 211.102 69.1079 209.323L67.5803 205.01C65.1272 198.083 67.2177 190.362 72.83 185.619L79.54 179.948C85.1426 175.213 84.6554 166.433 78.5634 162.347L76.709 161.103C68.9965 155.93 71.6771 143.977 80.8599 142.593C87.7076 141.562 91.5457 134.138 88.429 127.954L79.7675 110.769C73.6455 98.622 85.0616 85.0585 98.0752 89.0177C100.203 89.6649 102.445 89.8457 104.648 89.5476L109.33 88.9142C111.359 88.6397 113.334 88.0548 115.186 87.1801L115.528 87.0186C120.282 84.7728 123.9 80.6671 125.53 75.6685C127.41 69.9027 126.441 63.5866 122.919 58.6497Z" fill={fill} fillOpacity={fillOpacity}/>
  </svg>
);

// Right face: flat edge on right (x=126), profile extends left
const Phase1Right = ({ fill = '#6D6987', fillOpacity = 0.7 }) => (
  <svg width="127" height="276" viewBox="0 0 127 276" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.55213 58.6497L45.4004 0H126.471V276H109.916C107.999 276 107.041 276 106.087 275.939C105.238 275.885 104.393 275.795 103.553 275.669C102.607 275.527 101.671 275.325 99.798 274.921L93.7611 273.62C89.236 272.644 86.9734 272.156 84.8392 271.342C82.9442 270.619 81.1273 269.706 79.4166 268.616C77.49 267.389 75.7484 265.865 72.2655 262.816L70.5862 261.346C68.5752 259.586 67.5701 258.706 66.6529 257.747C65.396 256.434 64.2612 255.009 63.2623 253.49C62.5332 252.381 61.9006 251.204 60.6354 248.851C59.2468 246.268 58.5526 244.977 57.9911 243.635C57.2219 241.797 56.6376 239.888 56.247 237.934C55.9619 236.508 55.8149 235.049 55.5208 232.132L55.4053 230.986C55.217 229.118 55.1229 228.184 55.0873 227.249C55.0556 226.417 55.0586 225.584 55.0962 224.753C55.1385 223.817 55.2392 222.884 55.4408 221.018L56.1098 214.823C56.3124 212.948 56.7329 211.102 57.3628 209.323L58.8904 205.01C61.3435 198.083 59.253 190.362 53.6407 185.619L46.9307 179.948C41.3281 175.213 41.8153 166.433 47.9073 162.347L49.7617 161.103C57.4742 155.93 54.7936 143.977 45.6108 142.593C38.7631 141.562 34.925 134.138 38.0417 127.954L46.7032 110.769C52.8252 98.622 41.4091 85.0585 28.3955 89.0177C26.268 89.6649 24.026 89.8457 21.8223 89.5476L17.1408 88.9142C15.1115 88.6397 13.1364 88.0548 11.2848 87.1801L10.9429 87.0186C6.18901 84.7728 2.57088 80.6671 0.940765 75.6685C-0.939575 69.9027 0.0295715 63.5866 3.55213 58.6497Z" fill={fill} fillOpacity={fillOpacity}/>
  </svg>
);

// Phase 2 faces — larger pink + gray silhouettes (~122x511)
const Phase2Left = ({ fill = '#E1327F', fillOpacity = 0.3 }) => (
  <svg width="122" height="511" viewBox="0 0 122 511" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M117.739 299.361L69.3659 231.025C66.1098 226.425 64.4817 224.125 63.5621 221.587C62.7473 219.339 62.3423 216.963 62.3663 214.572C62.3933 211.874 63.1674 209.164 64.7156 203.745L66.5 197.5L70 175L72.0228 159.223C72.2015 157.828 72.2908 157.131 72.3311 156.432C72.3668 155.81 72.3736 155.187 72.3512 154.565C72.326 153.864 72.2517 153.166 72.103 151.768L70 132L61.4583 96.9341C61.0995 95.4611 60.9201 94.7247 60.6864 94.0062C60.4788 93.3677 60.2391 92.7401 59.9683 92.1257C59.6635 91.4343 59.3064 90.7657 58.592 89.4286L41 56.5L20.5 25L0 0V507.5L20.3595 510.195C22.8917 510.53 24.1579 510.697 25.411 510.784C31.0144 511.17 36.6365 510.372 41.911 508.441C43.0903 508.009 44.2595 507.496 46.5976 506.469C48.0591 505.828 48.7893 505.507 49.4744 505.141C52.5438 503.498 55.1313 501.083 56.981 498.134C57.3939 497.475 57.7638 496.769 58.5037 495.357L62.6225 487.493C63.6975 485.441 64.2351 484.415 64.6483 483.342C65.0155 482.389 65.3091 481.409 65.5265 480.411C65.7713 479.287 65.8865 478.135 66.1171 475.829L66.6702 470.298C66.7938 469.062 66.8555 468.445 66.8789 467.826C66.8997 467.276 66.8977 466.725 66.8731 466.175C66.8453 465.556 66.7792 464.939 66.647 463.705L65.9846 457.523C65.8475 456.243 65.779 455.604 65.6704 454.974C65.4493 453.691 65.1033 452.432 64.6375 451.216C64.4087 450.619 64.1408 450.034 63.6049 448.865L59.5858 440.096C56.5985 433.578 58.4407 425.864 64.0505 421.399L68.6263 417.757C73.9841 413.492 74.0834 405.386 68.8316 400.992L68.3237 400.567C62.1708 395.418 63.8852 385.542 71.4132 382.769C77.4738 380.536 80.0719 373.39 76.8607 367.786L72.0905 359.462C65.3164 347.64 73.1749 332.794 86.7596 331.749L94.5273 331.152C94.8187 331.129 94.9644 331.118 95.1097 331.105C96.0331 331.02 96.9494 330.872 97.8521 330.66C97.9941 330.626 98.1359 330.591 98.4195 330.52L106.984 328.379C112.945 326.889 117.797 322.573 119.971 316.826C122.177 310.996 121.341 304.449 117.739 299.361Z" fill={fill} fillOpacity={fillOpacity}/>
  </svg>
);

const Phase2Right = ({ fill = '#6D6987', fillOpacity = 0.3 }) => (
  <svg width="126" height="518" viewBox="0 0 126 518" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5253 300.159L48.5929 236.492C55.9971 226.032 55.9251 212.02 48.4139 201.637C45.5002 197.609 43.635 192.919 42.9865 187.991L42.2985 182.762C41.9901 180.418 41.8359 179.246 41.7743 178.069C41.7195 177.024 41.7195 175.976 41.7743 174.931C41.8359 173.754 41.9901 172.582 42.2985 170.238L43.9746 157.5L48.3418 132.607C48.579 131.255 48.6975 130.579 48.8467 129.91C48.9793 129.316 49.1299 128.725 49.2985 128.14C49.4881 127.481 49.7078 126.831 50.1473 125.531L59.706 97.253C60.1814 95.8466 60.4191 95.1434 60.6909 94.4538C60.9324 93.8408 61.1941 93.2359 61.4755 92.6402C61.792 91.9699 62.1418 91.3152 62.8413 90.0057L80.4746 57L98.5001 29.3024C99.4272 27.8778 99.8907 27.1655 100.393 26.4817C100.839 25.874 101.308 25.2834 101.799 24.7111C102.351 24.0671 102.94 23.4543 104.118 22.2286L125.475 0V517.5H109.132C107.2 517.5 106.234 517.5 105.273 517.438C104.418 517.383 103.566 517.292 102.719 517.164C101.767 517.02 100.824 516.815 98.9378 516.405L93.1743 515.152C88.6296 514.164 86.3572 513.67 84.2152 512.847C82.3133 512.117 80.4907 511.194 78.7757 510.094C76.8443 508.856 75.1005 507.317 71.6131 504.24L70.0654 502.874C68.0499 501.096 67.0422 500.207 66.1236 499.238C64.8843 497.931 63.7651 496.515 62.7798 495.008C62.0494 493.89 61.417 492.704 60.1521 490.333C58.7705 487.742 58.0799 486.447 57.5223 485.102C56.77 483.288 56.1978 481.403 55.814 479.476C55.5295 478.049 55.3834 476.588 55.0913 473.667L54.9693 472.447C54.784 470.594 54.6913 469.667 54.6563 468.739C54.6251 467.914 54.628 467.087 54.665 466.263C54.7066 465.334 54.8058 464.409 55.0042 462.557L55.6724 456.32C55.8732 454.446 56.2901 452.602 56.9149 450.824L58.443 446.474C60.8721 439.561 58.7946 431.865 53.2163 427.113L46.5512 421.436C40.983 416.692 41.4692 407.947 47.529 403.851L49.4437 402.556C57.1055 397.376 54.4233 385.486 45.2798 384.097C38.462 383.061 34.6353 375.679 37.7193 369.511L46.4442 352.061C52.4834 339.982 41.1155 326.55 28.2048 330.509C26.0768 331.162 23.8323 331.344 21.6269 331.043L17.0337 330.417C15.0065 330.141 13.0343 329.552 11.1871 328.673L10.9325 328.551C6.17203 326.284 2.55495 322.157 0.931908 317.141C-0.929359 311.388 0.0317917 305.094 3.5253 300.159Z" fill={fill} fillOpacity={fillOpacity}/>
  </svg>
);

/**
 * FaceOverlay — Renders animated face silhouettes on left/right edges.
 *
 * Props:
 *  - facePhase: 1 | 2 | null — which pair to show (null = hide all)
 *  - glowSide: 'left' | 'right' | null — which side glows (Phase 2 active speaker)
 */
const FaceOverlay = ({ facePhase, glowSide, theme }) => {
  const sim = theme.simulator;
  // Track previous phase for exit animations
  const [displayPhase, setDisplayPhase] = useState(null);
  const [animState, setAnimState] = useState('idle'); // 'idle' | 'entering' | 'exiting'
  const prevPhaseRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = facePhase;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (facePhase && !prev) {
      // Entering from nothing
      setDisplayPhase(facePhase);
      setAnimState('entering');
      playBeamIn();
    } else if (facePhase && prev && facePhase !== prev) {
      // Switching phases — exit old, then enter new
      setAnimState('exiting');
      playBeamOut();
      timeoutRef.current = setTimeout(() => {
        setDisplayPhase(facePhase);
        setAnimState('entering');
        playBeamIn();
      }, 400); // match exit animation duration
    } else if (!facePhase && prev) {
      // Exiting to nothing
      setAnimState('exiting');
      playBeamOut();
      timeoutRef.current = setTimeout(() => {
        setDisplayPhase(null);
        setAnimState('idle');
      }, 400);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [facePhase]);

  if (!displayPhase && animState === 'idle') return null;

  const leftClass = animState === 'entering' ? 'face-slide-in-left'
    : animState === 'exiting' ? 'face-slide-out-left' : '';
  const rightClass = animState === 'entering' ? 'face-slide-in-right'
    : animState === 'exiting' ? 'face-slide-out-right' : '';

  const isPhase2 = displayPhase === 2;

  // Glow style — radial gradient behind face, animates in/out + pulses when active
  const glowBase = {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: '70%',
    pointerEvents: 'none',
    transition: 'opacity 0.5s ease',
  };

  return (
    <>
      {/* Left glow (behind left face) — pulses when active */}
      {isPhase2 && (
        <div
          className={`pointer-events-none ${glowSide === 'left' ? 'face-glow-pulse' : ''}`}
          style={{
            ...glowBase,
            left: 0,
            zIndex: 0,
            opacity: glowSide === 'left' ? 1 : 0,
            background: sim.glowPartner,
          }}
        />
      )}
      {/* Left face */}
      <div
        className={`absolute left-0 top-0 pointer-events-none ${leftClass}`}
        style={{ zIndex: 1 }}
      >
        {isPhase2 ? <Phase2Left fill={sim.facePartnerFill} fillOpacity={sim.facePartnerOpacity} /> : <Phase1Left fill={sim.facePhase1Fill} fillOpacity={sim.facePhase1Opacity} />}
      </div>
      {/* Right glow (behind right face) — pulses when active */}
      {isPhase2 && (
        <div
          className={`pointer-events-none ${glowSide === 'right' ? 'face-glow-pulse' : ''}`}
          style={{
            ...glowBase,
            right: 0,
            zIndex: 0,
            opacity: glowSide === 'right' ? 1 : 0,
            background: sim.glowUser,
          }}
        />
      )}
      {/* Right face */}
      <div
        className={`absolute right-0 top-0 pointer-events-none ${rightClass}`}
        style={{ zIndex: 1 }}
      >
        {isPhase2 ? <Phase2Right fill={sim.faceUserFill} fillOpacity={sim.faceUserOpacity} /> : <Phase1Right fill={sim.facePhase1Fill} fillOpacity={sim.facePhase1Opacity} />}
      </div>
    </>
  );
};

export default FaceOverlay;
