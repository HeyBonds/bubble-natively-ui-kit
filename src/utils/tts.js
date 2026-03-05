/**
 * TTS Streaming Module — singleton, event-driven, reusable.
 *
 * Pattern mirrors src/utils/realtime.js:
 * - Plain object module (`const TTS = {}`)
 * - Module-level `_listeners` Set for event subscription
 * - All audio / MediaSource / animation state managed internally
 * - React components consume via useTTS hook or direct event subscription
 *
 * Public API:
 *   TTS.start({ apiKey, text })  — stream MP3 via MediaSource
 *   TTS.stop()                   — abort + cleanup
 *   TTS.pause()                  — pause audio + animation loop
 *   TTS.resume()                 — resume audio + animation loop
 *   TTS.setSpeed(rate)            — set playback speed (persists across start/stop)
 *   TTS.unlockAudio()            — play silent WAV (call from user gesture)
 *
 * Events emitted (shape: { type, ts, data }):
 *   status    → { status: 'idle' | 'streaming' | 'paused' | 'done' | 'error' }
 *   progress  → { elapsed, total, percent }
 *   transcript→ { sentences: [{ text, state }] }
 *   stats     → { firstByte, totalFetch, duration, size, sentenceCount }
 *   error     → { message }
 */

const TTS = {};

const TTS_URL = 'https://daphn-m8o8ki4f-eastus2.openai.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';
const TTS_VOICE = 'echo';

// ── Event emitter ───────────────────────────────────────────────────

const _listeners = new Set();

TTS.emit = function (type, data) {
  const evt = { type, ts: Date.now(), data: data || {} };
  _listeners.forEach(fn => {
    try { fn(evt); } catch (e) { console.error('[TTS] Listener error:', e); }
  });
};

export function onTTSEvent(callback) {
  _listeners.add(callback);
}

export function offTTSEvent(callback) {
  _listeners.delete(callback);
}

// ── Module-level state ──────────────────────────────────────────────

const state = {
  audio: null,
  mediaSource: null,
  sourceBuffer: null,
  objectUrl: null,
  abortController: null,
  animFrameId: null,
  pendingChunks: [],
  streamDone: false,
  timings: [],
  totalDuration: 0,
  durationChangeHandler: null,
  endedHandler: null,
  status: 'idle',
  cleaningUp: false,
  speed: 1,
};

// ── Sentence utilities ──────────────────────────────────────────────

function splitSentences(text) {
  const matches = text.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g);
  return matches ? matches.map(s => s.trim()).filter(Boolean) : [text];
}

function calculateTimings(sentences, totalDuration) {
  const totalChars = sentences.reduce((sum, s) => sum + s.length, 0) || 1;
  let cursor = 0;
  return sentences.map(text => {
    const dur = (text.length / totalChars) * totalDuration;
    const start = cursor;
    cursor += dur;
    return { text, start, end: cursor };
  });
}

// ── SourceBuffer chunk flushing ─────────────────────────────────────

function flushPendingChunks() {
  const sb = state.sourceBuffer;
  if (!sb || sb.updating || state.pendingChunks.length === 0) return;
  const chunk = state.pendingChunks.shift();
  try { sb.appendBuffer(chunk); } catch { /* ignore */ }
}

// ── Animation / progress loop ───────────────────────────────────────

function startAnimationLoop() {
  const tick = () => {
    const audio = state.audio;
    if (!audio) return;
    const elapsed = audio.currentTime;
    const total = state.totalDuration || 1;
    const percent = Math.min(elapsed / total, 1);

    TTS.emit('progress', { elapsed, total, percent });

    // Emit transcript with sentence states
    if (state.timings.length) {
      TTS.emit('transcript', {
        sentences: state.timings.map(t => ({
          text: t.text,
          state: elapsed < t.start ? 'upcoming' : elapsed < t.end ? 'active' : 'spoken',
        })),
      });
    }

    // done detection is handled by the 'ended' event on the audio element;
    // the loop just keeps emitting progress/transcript until then
    if (state.status === 'done') return;
    state.animFrameId = requestAnimationFrame(tick);
  };
  tick();
}

// ── Cleanup ─────────────────────────────────────────────────────────

function cleanup() {
  if (state.cleaningUp) return;
  state.cleaningUp = true;

  // Abort fetch
  if (state.abortController) {
    try { state.abortController.abort(); } catch { /* ignore */ }
    state.abortController = null;
  }

  // Cancel animation
  if (state.animFrameId) {
    cancelAnimationFrame(state.animFrameId);
    state.animFrameId = null;
  }

  // Drain pending chunks
  state.pendingChunks = [];
  state.streamDone = false;

  // Remove updateend listener
  if (state.sourceBuffer) {
    try { state.sourceBuffer.removeEventListener('updateend', flushPendingChunks); } catch { /* ignore */ }
  }

  // Remove durationchange + ended listeners
  if (state.audio) {
    if (state.durationChangeHandler) {
      try { state.audio.removeEventListener('durationchange', state.durationChangeHandler); } catch { /* ignore */ }
      state.durationChangeHandler = null;
    }
    if (state.endedHandler) {
      try { state.audio.removeEventListener('ended', state.endedHandler); } catch { /* ignore */ }
      state.endedHandler = null;
    }
  }

  // Pause audio
  if (state.audio) {
    try {
      state.audio.pause();
      state.audio.src = '';
    } catch { /* ignore */ }
  }

  // End MediaSource stream
  if (state.mediaSource && state.mediaSource.readyState === 'open') {
    try { state.mediaSource.endOfStream(); } catch { /* ignore */ }
  }
  state.mediaSource = null;
  state.sourceBuffer = null;

  // Revoke object URL
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  // Remove audio element from DOM
  if (state.audio && state.audio.parentNode) {
    state.audio.remove();
  }
  state.audio = null;

  state.timings = [];
  state.totalDuration = 0;

  state.status = 'idle';
  state.cleaningUp = false;
  TTS.emit('status', { status: 'idle' });
}

// ── Audio element management ────────────────────────────────────────

function getOrCreateAudio() {
  // Reuse existing element (e.g. from unlockAudio)
  let el = document.getElementById('ttsAudio');
  if (el) {
    state.audio = el;
    return el;
  }
  el = document.createElement('audio');
  el.id = 'ttsAudio';
  el.setAttribute('playsinline', 'true');
  el.setAttribute('webkit-playsinline', 'true');
  document.body.appendChild(el);
  state.audio = el;
  return el;
}

// ── Public API ──────────────────────────────────────────────────────

TTS.unlockAudio = function () {
  const audio = getOrCreateAudio();
  audio.src = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAA';
  const p = audio.play();
  if (p) p.then(() => { audio.pause(); audio.src = ''; }).catch(() => {});
};

TTS.setSpeed = function (rate) {
  state.speed = rate;
  if (state.audio) state.audio.playbackRate = rate;
};

TTS.stop = function () {
  cleanup();
};

TTS.pause = function () {
  if (state.status !== 'streaming') return;
  if (state.audio) state.audio.pause();
  if (state.animFrameId) {
    cancelAnimationFrame(state.animFrameId);
    state.animFrameId = null;
  }
  state.status = 'paused';
  TTS.emit('status', { status: 'paused' });
};

TTS.resume = function () {
  if (state.status !== 'paused' || !state.audio) return;
  state.audio.play().catch(() => {});
  startAnimationLoop();
  state.status = 'streaming';
  TTS.emit('status', { status: 'streaming' });
};

TTS.start = async function ({ apiKey, text }) {
  if (!text || !text.trim()) {
    state.status = 'error';
    TTS.emit('status', { status: 'error' });
    TTS.emit('error', { message: 'No text provided.' });
    return;
  }

  // Stop any existing stream
  if (state.status === 'streaming' || state.status === 'paused') {
    cleanup();
  }

  state.status = 'streaming';
  state.streamDone = false;
  state.pendingChunks = [];
  TTS.emit('status', { status: 'streaming' });

  const sentences = splitSentences(text);
  const wordCount = text.split(/\s+/).length;
  const estimatedDuration = (wordCount / 150) * 60;
  state.timings = calculateTimings(sentences, estimatedDuration);
  state.totalDuration = estimatedDuration;

  TTS.emit('transcript', {
    sentences: sentences.map(s => ({ text: s, state: 'upcoming' })),
  });

  // Clean up previous MediaSource + object URL (in case cleanup didn't run)
  if (state.mediaSource && state.mediaSource.readyState === 'open') {
    try { state.mediaSource.endOfStream(); } catch { /* ignore */ }
  }
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  // Set up audio + MediaSource
  const audio = getOrCreateAudio();
  const mediaSource = new MediaSource();
  state.mediaSource = mediaSource;
  const url = URL.createObjectURL(mediaSource);
  state.objectUrl = url;
  audio.src = url;

  const abort = new AbortController();
  state.abortController = abort;
  if (state.animFrameId) cancelAnimationFrame(state.animFrameId);

  const startTime = performance.now();
  let firstByteTime = null;
  let totalBytes = 0;

  try {
    // Wait for MediaSource to open (with abort + timeout safety)
    await new Promise((resolve, reject) => {
      if (mediaSource.readyState === 'open') { resolve(); return; }
      const onOpen = () => { clearTimeout(timer); resolve(); };
      const timer = setTimeout(() => {
        mediaSource.removeEventListener('sourceopen', onOpen);
        reject(new Error('MediaSource sourceopen timed out'));
      }, 10000);
      abort.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        mediaSource.removeEventListener('sourceopen', onOpen);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
      mediaSource.addEventListener('sourceopen', onOpen, { once: true });
    });

    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
    state.sourceBuffer = sourceBuffer;
    sourceBuffer.addEventListener('updateend', flushPendingChunks);

    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice: TTS_VOICE,
        response_format: 'mp3',
      }),
      signal: abort.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`${res.status}: ${errText.slice(0, 300)}`);
    }

    const reader = res.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (!firstByteTime) {
        firstByteTime = performance.now();
        // Register ended handler as authoritative done signal
        const onEnded = () => {
          if (state.status === 'streaming' || state.status === 'paused') {
            if (state.animFrameId) { cancelAnimationFrame(state.animFrameId); state.animFrameId = null; }
            state.status = 'done';
            TTS.emit('progress', { elapsed: state.totalDuration, total: state.totalDuration, percent: 1 });
            TTS.emit('status', { status: 'done' });
          }
        };
        state.endedHandler = onEnded;
        audio.addEventListener('ended', onEnded, { once: true });
        audio.playbackRate = state.speed;
        audio.play().catch((err) => {
          if (err.name === 'NotAllowedError') {
            TTS.emit('autoplay_blocked', {});
          }
        });
        startAnimationLoop();
      }

      totalBytes += value.length;
      state.pendingChunks.push(value);
      flushPendingChunks();
    }

    // Wait for all pending chunks to be appended
    await new Promise(resolve => {
      const check = () => {
        if (state.pendingChunks.length === 0 && state.sourceBuffer && !state.sourceBuffer.updating) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });

    if (mediaSource.readyState === 'open' && state.sourceBuffer && !state.sourceBuffer.updating) {
      try { mediaSource.endOfStream(); } catch { /* ignore */ }
    }

    sourceBuffer.removeEventListener('updateend', flushPendingChunks);

    const fetchDone = performance.now();
    const realDuration = audio.duration && isFinite(audio.duration) ? audio.duration : state.totalDuration;
    state.totalDuration = realDuration;
    state.timings = calculateTimings(sentences, realDuration);
    state.streamDone = true;

    // Update timings as browser resolves MP3 duration (fires multiple times with MediaSource)
    const onDurationChange = () => {
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== state.totalDuration) {
        state.totalDuration = audio.duration;
        state.timings = calculateTimings(sentences, audio.duration);
      }
    };
    state.durationChangeHandler = onDurationChange;
    audio.addEventListener('durationchange', onDurationChange);

    TTS.emit('stats', {
      firstByte: firstByteTime ? Math.round(firstByteTime - startTime) : null,
      totalFetch: Math.round(fetchDone - startTime),
      duration: realDuration.toFixed(1),
      size: `${(totalBytes / 1024).toFixed(0)}KB`,
      sentenceCount: sentences.length,
    });
  } catch (e) {
    if (e.name === 'AbortError') {
      // Abort path — cleanup handles everything
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
      return;
    }
    console.error('TTS stream error:', e);
    state.status = 'error';
    TTS.emit('status', { status: 'error' });
    TTS.emit('error', { message: e.message });
  }
};

export default TTS;
