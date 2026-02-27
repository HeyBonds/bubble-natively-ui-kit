import React, { useState, useEffect, useRef } from 'react';

/**
 * Transcript — Streaming text display.
 *
 * Props:
 *  - text: string (full text to display)
 *  - streaming: boolean (if true, reveal character by character)
 *  - theme: theme object
 */
const Transcript = ({ text = '', streaming = false, theme }) => {
  const [displayedLen, setDisplayedLen] = useState(text.length);
  const prevTextRef = useRef(text);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!streaming) {
      setDisplayedLen(text.length);
      return;
    }

    // If text grew (new characters appended), animate from where we were
    const prevLen = prevTextRef.current.length;
    if (text.length > prevLen && text.startsWith(prevTextRef.current)) {
      // Reveal new chars at ~30 chars/sec
      let current = prevLen;
      const reveal = () => {
        current++;
        setDisplayedLen(current);
        if (current < text.length) {
          timerRef.current = setTimeout(reveal, 33);
        }
      };
      timerRef.current = setTimeout(reveal, 33);
    } else {
      // Text replaced entirely — show immediately
      setDisplayedLen(text.length);
    }

    prevTextRef.current = text;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, streaming]);

  const sim = theme.simulator;
  const visibleText = text.slice(0, displayedLen);

  if (!text) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 border border-solid"
      style={{ background: sim.transcriptBg, borderColor: sim.transcriptBorder }}
    >
      <p className="font-poppins text-[14px] leading-relaxed text-center" style={{ color: sim.transcriptText }}>
        {visibleText}
      </p>
    </div>
  );
};

export default Transcript;
