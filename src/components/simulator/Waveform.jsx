import React, { useRef, useEffect, useCallback } from 'react';

/**
 * Waveform — Canvas-based audio visualization.
 *
 * Props:
 *  - mode: 'idle' | 'speaking' | 'recording'
 *  - analyserNode: AnalyserNode | null (for 'recording' mode)
 *  - theme: theme object
 *  - height: number (default 48)
 */
const Waveform = ({ mode = 'idle', analyserNode = null, theme, height = 48 }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const sim = theme.simulator;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = sim.waveformLine;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const midY = h / 2;

    if (mode === 'idle') {
      // Flat line
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
    } else if (mode === 'speaking') {
      // Simulated wave — sine with noise
      phaseRef.current += 0.06;
      const phase = phaseRef.current;
      for (let x = 0; x < w; x++) {
        const t = x / w;
        // Envelope — taper at edges
        const envelope = Math.sin(t * Math.PI);
        // Composite wave
        const wave = (
          Math.sin(t * 8 + phase) * 0.4 +
          Math.sin(t * 14 + phase * 1.3) * 0.25 +
          Math.sin(t * 22 + phase * 0.7) * 0.15 +
          (Math.random() - 0.5) * 0.1
        );
        const y = midY + wave * envelope * (h * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (mode === 'recording' && analyserNode) {
      // Real mic data
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      for (let i = 0; i < bufferLength; i++) {
        const t = i / bufferLength;
        const v = dataArray[i] / 128.0; // normalize to 0-2
        const y = midY + (v - 1) * (h * 0.45);
        if (i === 0) ctx.moveTo(t * w, y);
        else ctx.lineTo(t * w, y);
      }
    } else {
      // Fallback: flat line
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
    }

    ctx.stroke();
    rafRef.current = requestAnimationFrame(draw);
  }, [mode, analyserNode, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height, display: 'block' }}
    />
  );
};

export default Waveform;
