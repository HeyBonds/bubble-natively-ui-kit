import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Waveform — Faithful React port of waveform-component.html.
 *
 * Manages its own AudioContext and AnalyserNode internally, just like the original.
 * During COACH/PARTNER_SPEAKING, captures audio from RT's audio element srcObject.
 * During PUSH_TO_TALK_ACTIVE, captures mic stream.
 *
 * Props:
 *  - rtState: string — current RT state (COACH_SPEAKING, PUSH_TO_TALK_READY, etc.)
 *  - buttonVisible: boolean — whether mic button is visible (for gap calculation)
 *  - theme: theme object
 */

// Exact constants from original waveform-component.html
const CONFIG = {
  FFT_SIZE: 2048,
  SIMULATED_SAMPLES: 512,
  WAVEFORM_AMPLITUDE: 30,
  FADE_DISTANCE: 20,
  LINE_WIDTH: 2,
  BUTTON_RADIUS: 30,
  BUTTON_STROKE_WIDTH: 1,
  BUTTON_VISUAL_GAP: 2,
  PHASE_INCREMENT: 0.05,
  PHASE_MULTIPLIER: 0.3,
  ENVELOPE_AMPLITUDE: 0.4,
  ENVELOPE_OFFSET: 0.6,
  WAVE_FREQUENCIES: [5, 13, 21],
  WAVE_AMPLITUDES: [0.25, 0.15, 0.1],
  LOCAL_PHASE_MULTIPLIER: 0.1,
  NOISE_AMPLITUDE: 0.08,
  SIMULATED_RANGE: 70,
};

const Waveform = ({ rtState, buttonVisible = false, theme }) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mode: 'idle',        // idle | baseline | simulated | real
    running: false,
    rafId: null,
    phase: 0,
    audioCtx: null,
    analyser: null,
    dataArray: null,
    micStream: null,
    simulatedData: new Array(CONFIG.SIMULATED_SAMPLES).fill(128),
  });

  // --- Audio handling (ported from original) ---

  const cleanupAudioSource = useCallback(() => {
    const s = stateRef.current;
    if (s.analyser?._source) {
      try { s.analyser._source.disconnect(); } catch { /* noop */ }
      s.analyser._source = null;
    }
  }, []);

  const getAudioContext = useCallback(async () => {
    const s = stateRef.current;
    if (!s.audioCtx || s.audioCtx.state === 'closed') {
      s.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (s.audioCtx.state === 'suspended') {
      try { await s.audioCtx.resume(); } catch { /* noop */ }
    }
    return s.audioCtx;
  }, []);

  const startRealAudioFromElement = useCallback(async () => {
    const s = stateRef.current;
    try {
      const audioEl = window.RT?.state?.connection?.audioEl || document.getElementById('rtAudio');
      if (!audioEl?.srcObject) {
        // Fallback to simulated
        s.mode = 'simulated';
        return;
      }
      const mediaStream = audioEl.srcObject;
      const tracks = mediaStream?.getAudioTracks() || [];
      if (!mediaStream || tracks.length === 0) {
        s.mode = 'simulated';
        return;
      }
      const context = await getAudioContext();
      cleanupAudioSource();
      const src = context.createMediaStreamSource(mediaStream);
      s.analyser = context.createAnalyser();
      s.analyser.fftSize = CONFIG.FFT_SIZE;
      src.connect(s.analyser);
      s.analyser._source = src;
      s.dataArray = new Uint8Array(s.analyser.frequencyBinCount);
      if (context.state === 'suspended') {
        try { await context.resume(); } catch { /* noop */ }
      }
      s.mode = 'real';
    } catch {
      s.mode = 'simulated';
    }
  }, [getAudioContext, cleanupAudioSource]);

  const startRealAudioFromMic = useCallback(async () => {
    const s = stateRef.current;
    try {
      const stream = window.RT?.getMicStream?.() || window.RT?.state?.connection?.micStream;
      if (!stream) return;
      s.micStream = stream;
      const context = await getAudioContext();
      cleanupAudioSource();
      const src = context.createMediaStreamSource(stream);
      s.analyser = context.createAnalyser();
      s.analyser.fftSize = CONFIG.FFT_SIZE;
      src.connect(s.analyser);
      s.analyser._source = src;
      s.dataArray = new Uint8Array(s.analyser.frequencyBinCount);
      s.mode = 'real';
    } catch {
      // silent
    }
  }, [getAudioContext, cleanupAudioSource]);

  const stopAnimation = useCallback(() => {
    const s = stateRef.current;
    s.running = false;
    s.mode = 'idle';
    if (s.rafId) {
      cancelAnimationFrame(s.rafId);
      s.rafId = null;
    }
    cleanupAudioSource();
  }, [cleanupAudioSource]);

  // --- Drawing (ported verbatim from original) ---

  const drawFrame = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !s.running) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const centerY = h / 2;
    const strokeColor = theme.simulator.waveformLine;
    const strokeColorTransparent = 'rgba(255,255,255,0)';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = CONFIG.LINE_WIDTH;
    ctx.lineCap = 'round';

    // Button gap calculation — exact from original
    const buttonCenterX = w / 2;
    const buttonGap = CONFIG.BUTTON_RADIUS + CONFIG.BUTTON_STROKE_WIDTH / 2 + CONFIG.LINE_WIDTH / 2 + CONFIG.BUTTON_VISUAL_GAP;
    const leftGap = buttonVisible ? buttonCenterX - buttonGap : w;
    const rightGap = buttonVisible ? buttonCenterX + buttonGap : w;

    const createFadeGradient = (startX, endX, fadeLeft, fadeRight) => {
      const length = endX - startX;
      if (length <= CONFIG.FADE_DISTANCE * 2 && (fadeLeft || fadeRight)) return null;
      const gradient = ctx.createLinearGradient(startX, centerY, endX, centerY);
      const fadeRatio = CONFIG.FADE_DISTANCE / length;
      if (fadeLeft && fadeRight) {
        gradient.addColorStop(0, strokeColorTransparent);
        gradient.addColorStop(fadeRatio, strokeColor);
        gradient.addColorStop(1 - fadeRatio, strokeColor);
        gradient.addColorStop(1, strokeColorTransparent);
      } else if (fadeLeft) {
        gradient.addColorStop(0, strokeColorTransparent);
        gradient.addColorStop(fadeRatio, strokeColor);
        gradient.addColorStop(1, strokeColor);
      } else if (fadeRight) {
        gradient.addColorStop(0, strokeColor);
        gradient.addColorStop(1 - fadeRatio, strokeColor);
        gradient.addColorStop(1, strokeColorTransparent);
      } else {
        return null;
      }
      return gradient;
    };

    const drawBaseline = (startX, endX, fadeLeft, fadeRight) => {
      const gradient = createFadeGradient(startX, endX, fadeLeft, fadeRight);
      ctx.strokeStyle = gradient || strokeColor;
      ctx.beginPath();
      ctx.moveTo(startX, centerY);
      ctx.lineTo(endX, centerY);
      ctx.stroke();
    };

    const drawWaveform = (audioData, startX, endX, fadeLeft, fadeRight) => {
      const length = endX - startX;
      if (length <= 0 || audioData.length === 0) return;
      const gradient = createFadeGradient(startX, endX, fadeLeft, fadeRight);
      ctx.strokeStyle = gradient || strokeColor;
      ctx.beginPath();
      for (let x = startX; x < endX; x++) {
        const i = Math.floor((x / w) * audioData.length);
        const value = (audioData[i] - 128) / 128;
        const y = centerY + value * CONFIG.WAVEFORM_AMPLITUDE;
        if (x === startX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    if (s.mode === 'baseline') {
      if (buttonVisible) {
        if (leftGap > 0) drawBaseline(0, leftGap, true, false);
        if (rightGap < w) drawBaseline(rightGap, w, false, true);
      } else {
        drawBaseline(0, w, true, true);
      }
    } else if (s.mode === 'simulated' || s.mode === 'real') {
      let audioData = [];
      if (s.mode === 'real' && s.analyser && s.dataArray) {
        s.analyser.getByteTimeDomainData(s.dataArray);
        audioData = Array.from(s.dataArray);
      } else if (s.mode === 'simulated') {
        // generateSimulatedAudio — exact from original
        s.phase += CONFIG.PHASE_INCREMENT;
        const timeEnvelope = Math.sin(s.phase * CONFIG.PHASE_MULTIPLIER) * CONFIG.ENVELOPE_AMPLITUDE + CONFIG.ENVELOPE_OFFSET;
        for (let i = 0; i < CONFIG.SIMULATED_SAMPLES; i++) {
          const t = (i / CONFIG.SIMULATED_SAMPLES) * Math.PI * 2;
          let combined = 0;
          for (let j = 0; j < CONFIG.WAVE_FREQUENCIES.length; j++) {
            combined += Math.sin(t * CONFIG.WAVE_FREQUENCIES[j]) * CONFIG.WAVE_AMPLITUDES[j];
          }
          const localPhase = Math.sin(i * CONFIG.LOCAL_PHASE_MULTIPLIER + s.phase * 0.2) * 0.1;
          const noise = (Math.random() - 0.5) * CONFIG.NOISE_AMPLITUDE;
          combined = (combined + localPhase + noise) * timeEnvelope;
          s.simulatedData[i] = Math.round(128 + combined * CONFIG.SIMULATED_RANGE);
        }
        audioData = s.simulatedData;
      }

      if (audioData.length > 0) {
        if (buttonVisible) {
          if (leftGap > 0) drawWaveform(audioData, 0, leftGap, true, false);
          if (rightGap < w) drawWaveform(audioData, rightGap, w, false, true);
        } else {
          drawWaveform(audioData, 0, w, true, true);
        }
      }
    }

    ctx.strokeStyle = strokeColor;
    s.rafId = requestAnimationFrame(drawFrame);
  }, [theme, buttonVisible]);

  // --- State handling (ported from original stateHandlers) ---

  useEffect(() => {
    const s = stateRef.current;

    // Try to resume suspended AudioContext on any state change (from original)
    if (s.audioCtx && s.audioCtx.state === 'suspended') {
      s.audioCtx.resume().catch(() => {});
    }

    const startLoop = () => {
      if (s.running) return;
      s.running = true;
      s.rafId = requestAnimationFrame(drawFrame);
    };

    switch (rtState) {
      case 'COACH_SPEAKING':
      case 'PARTNER_SPEAKING':
        startRealAudioFromElement().then(() => {
          startLoop();
        });
        break;
      case 'PUSH_TO_TALK_READY':
      case 'PUSH_TO_TALK_STOPPED':
        cleanupAudioSource();
        s.mode = 'baseline';
        startLoop();
        break;
      case 'PUSH_TO_TALK_ACTIVE':
        startRealAudioFromMic().then(() => {
          startLoop();
        });
        break;
      case 'LOADING_SIMULATION':
      case 'SESSION_STOPPED':
      case 'SESSION_ERROR':
      case 'SESSION_COMPLETED':
      case 'SESSION_STARTED':
      case 'BEGIN_SIMULATION':
        stopAnimation();
        break;
      default:
        if (!s.running) {
          s.mode = 'idle';
        }
        break;
    }
  }, [rtState, drawFrame, startRealAudioFromElement, startRealAudioFromMic, cleanupAudioSource, stopAnimation]);

  // Canvas setup and resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const s = stateRef.current;
    return () => {
      s.running = false;
      if (s.rafId) cancelAnimationFrame(s.rafId);
      cleanupAudioSource();
      if (s.audioCtx && s.audioCtx.state !== 'closed') {
        try { s.audioCtx.close(); } catch { /* noop */ }
      }
    };
  }, [cleanupAudioSource]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: 72, display: 'block' }}
    />
  );
};

export default Waveform;
