import React, { useRef, useEffect, forwardRef } from 'react';

/**
 * Transcript — Faithful React port of the original waveform-component.html text stream.
 *
 * Fixed 72px glass box with sliding window (max 2 messages).
 * AI text paced at ~18 chars/sec, user text shown immediately.
 * Matches original updateText/startPacing/updateDOM logic exactly.
 *
 * This component uses imperative DOM updates (via ref) to match the original's
 * character-by-character pacing without causing React re-renders per character.
 *
 * Parent accesses API via ref: ref.current._transcriptAPI.updateText(type, text, isFinal, options)
 */

const PACING_RATE = 18; // chars/sec — from original

const Transcript = forwardRef(({ theme }, ref) => {
  const containerRef = useRef(null);
  const stateRef = useRef({
    currentLines: { user: null, assistant: null, coach: null },
    pacingBuffer: '',
    pacingTimer: null,
    isFinalLinePending: false,
    lastFullText: '',
  });

  // Expose imperative API on the ref so SimulatorSession can call it
  const apiRef = useRef({
    updateText: null,
    clearText: null,
  });

  // Sync forwarded ref to containerRef
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(containerRef.current);
    } else if (ref) {
      ref.current = containerRef.current;
    }
  }, [ref]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const s = stateRef.current;

    // --- updateDOM: exact port from original ---
    function updateDOM(type, text, isFinal) {
      let inner = container.querySelector('.ts-inner');
      if (!inner) {
        container.innerHTML = '<div class="ts-inner" style="width:100%;height:100%;padding:0.8em 30px;overflow-y:auto;scrollbar-width:none;-webkit-mask-image:linear-gradient(to bottom,transparent 0%,black 15px,black 100%);mask-image:linear-gradient(to bottom,transparent 0%,black 15px,black 100%);box-sizing:border-box;"></div>';
        inner = container.querySelector('.ts-inner');
      }
      let lineEl = s.currentLines[type];

      // Start of a new message
      if (!lineEl) {
        // Sliding window: keep max 2 messages
        while (inner.children.length >= 2) {
          inner.removeChild(inner.firstChild);
        }
        lineEl = document.createElement('div');
        lineEl.style.cssText = 'margin:0;line-height:1.6;font-size:inherit;opacity:0.8;word-wrap:break-word;display:block;text-align:center;color:#ffffff;font-family:Poppins,sans-serif;transition:opacity 0.3s ease;';
        // Active = streaming
        lineEl.style.opacity = '1';
        lineEl.style.fontWeight = '500';
        inner.appendChild(lineEl);
        s.currentLines[type] = lineEl;
      }

      // "..." pending placeholder
      if (type === 'user' && text === '...') {
        lineEl.style.opacity = '0.5';
        lineEl.style.fontStyle = 'italic';
        lineEl.textContent = text;
      } else {
        lineEl.style.opacity = '1';
        lineEl.style.fontStyle = 'normal';
        lineEl.textContent = text;
      }

      // Auto-scroll
      inner.style.scrollBehavior = 'smooth';
      inner.scrollTop = inner.scrollHeight;

      if (isFinal) {
        lineEl.style.opacity = '0.8';
        lineEl.style.fontWeight = '400';
        s.currentLines[type] = null;
      }
    }

    // --- startPacing: exact port from original ---
    function startPacing(type, interval) {
      if (s.pacingTimer) return;
      let displayedText = s.currentLines[type]?.textContent || '';

      s.pacingTimer = setInterval(() => {
        if (s.pacingBuffer.length > 0) {
          displayedText += s.pacingBuffer.charAt(0);
          s.pacingBuffer = s.pacingBuffer.substring(1);
          updateDOM(type, displayedText, false);
        } else if (s.isFinalLinePending) {
          clearInterval(s.pacingTimer);
          s.pacingTimer = null;
          updateDOM(type, displayedText, true);
          s.isFinalLinePending = false;
          s.lastFullText = '';
        } else {
          clearInterval(s.pacingTimer);
          s.pacingTimer = null;
        }
      }, interval);
    }

    // --- updateText: exact port from original ---
    apiRef.current.updateText = function (type, text, isFinal, options) {
      // User text is not paced — shows immediately
      if (type === 'user') {
        updateDOM(type, text, isFinal);
        return;
      }

      // AI text (assistant/coach) uses pacing
      const newContent = text.substring(s.lastFullText.length);
      s.pacingBuffer += newContent;
      s.lastFullText = text;

      if (isFinal) {
        s.isFinalLinePending = true;
      }

      if (!s.pacingTimer && s.pacingBuffer.length > 0) {
        const msPerChar = options?.duration_ms
          ? options.duration_ms / s.pacingBuffer.length
          : 1000 / PACING_RATE;
        startPacing(type, Math.max(10, msPerChar));
      }
    };

    // --- clearText: exact port from original ---
    apiRef.current.clearText = function () {
      const inner = container.querySelector('.ts-inner');
      if (inner) inner.innerHTML = '';
      s.currentLines.user = null;
      s.currentLines.assistant = null;
      s.currentLines.coach = null;
      if (s.pacingTimer) clearInterval(s.pacingTimer);
      s.pacingTimer = null;
      s.pacingBuffer = '';
      s.isFinalLinePending = false;
      s.lastFullText = '';
    };

    // Attach API to container DOM element
    container._transcriptAPI = apiRef.current;

    return () => {
      if (s.pacingTimer) clearInterval(s.pacingTimer);
    };
  }, []);

  const sim = theme.simulator;

  return (
    <div
      ref={containerRef}
      style={{
        width: '95%',
        maxWidth: 900,
        fontSize: 15,
        lineHeight: '1.6',
        height: '6.4em',
        margin: '15px auto 10px',
        padding: 0,
        textAlign: 'center',
        background: sim.transcriptBg,
        borderRadius: 14,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${sim.transcriptBorder}`,
      }}
    >
      <div
        className="ts-inner"
        style={{
          width: '100%',
          height: '100%',
          padding: '0.8em 30px',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15px, black 100%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15px, black 100%)',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
});

Transcript.displayName = 'Transcript';

export default Transcript;
