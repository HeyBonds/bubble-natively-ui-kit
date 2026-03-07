/**
 * TTS Streaming Module — singleton, event-driven, reusable.
 *
 * Playback backends (auto-detected):
 *   1. MediaSource / ManagedMediaSource — progressive MP3 streaming (desktop, Android, iOS 17.1+)
 *   2. Web Audio API + raw PCM — chunk-by-chunk playback (iOS 16 and older without MSE)
 *
 * Public API:
 *   TTS.start({ apiKey, text })  — stream audio
 *   TTS.stop()                   — abort + cleanup
 *   TTS.pause()                  — pause playback
 *   TTS.resume()                 — resume playback
 *   TTS.setSpeed(rate)           — set playback speed
 *   TTS.unlockAudio()            — play silent WAV (call from user gesture)
 *
 * Events emitted (shape: { type, ts, data }):
 *   status    → { status: 'idle' | 'streaming' | 'paused' | 'done' | 'error' }
 *   progress  → { elapsed, total, percent }
 *   transcript→ { sentences: [{ text, state }] }
 *   stats     → { firstByte, totalFetch, duration, size, sentenceCount }
 *   error     → { message }
 */

import { logError } from './firebase';

const TTS = {};

const TTS_URL = 'https://daphn-m8o8ki4f-eastus2.openai.azure.com/openai/deployments/gpt-4o-mini-tts/audio/speech?api-version=2025-03-01-preview';
const TTS_VOICE = 'echo';
const PCM_SAMPLE_RATE = 24000; // Azure raw PCM: 24kHz 16-bit mono

// Feature-detect: ManagedMediaSource (iOS 17.1+) → MediaSource (desktop/Android) → null (PCM fallback)
/* global ManagedMediaSource */
const MSConstructor = typeof ManagedMediaSource !== 'undefined' ? ManagedMediaSource
  : typeof MediaSource !== 'undefined' ? MediaSource
  : null;
const _isManagedMS = typeof ManagedMediaSource !== 'undefined';
const TTS_BACKEND = _isManagedMS ? 'mms' : MSConstructor ? 'mse' : 'pcm';
console.log('[TTS] Audio backend:', TTS_BACKEND);

// ── Event emitter ───────────────────────────────────────────────────

const _listeners = new Set();

TTS.emit = function (type, data) {
  const evt = { type, ts: Date.now(), data: data || {} };
  _listeners.forEach(fn => {
    try { fn(evt); } catch (e) { console.error('[TTS] Listener error:', e); logError('tts', e, 'event listener'); }
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
  // Shared
  abortController: null,
  animFrameId: null,
  timings: [],
  totalDuration: 0,
  status: 'idle',
  cleaningUp: false,
  speed: 1,

  // MediaSource path
  audio: null,
  mediaSource: null,
  sourceBuffer: null,
  objectUrl: null,
  pendingChunks: [],
  streamDone: false,
  durationChangeHandler: null,
  endedHandler: null,

  // PCM / Web Audio path
  audioCtx: null,
  pcmNextPlayTime: 0,       // AudioContext time for next chunk
  pcmStartCtxTime: 0,       // AudioContext time when first chunk started
  pcmAudioOffset: 0,        // accumulated audio seconds at last speed change
  pcmScheduledDuration: 0,  // total audio seconds scheduled
  pcmStreamDone: false,
  pcmLeftover: null,         // leftover byte from odd-length chunk
  pcmSources: [],            // active AudioBufferSourceNodes (for speed changes)
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

// ── SourceBuffer chunk flushing (MediaSource path) ──────────────────

function flushPendingChunks() {
  const sb = state.sourceBuffer;
  if (!sb || sb.updating || state.pendingChunks.length === 0) return;
  const chunk = state.pendingChunks.shift();
  try { sb.appendBuffer(chunk); } catch { /* ignore */ }
}

// ── Animation / progress loop ───────────────────────────────────────

function getElapsed() {
  if (state.audioCtx) {
    // PCM path: compute from AudioContext clock
    return state.pcmAudioOffset
      + (state.audioCtx.currentTime - state.pcmStartCtxTime) * state.speed;
  }
  return state.audio ? state.audio.currentTime : 0;
}

function startAnimationLoop() {
  const tick = () => {
    const elapsed = getElapsed();
    const total = state.totalDuration || 1;
    const percent = Math.min(elapsed / total, 1);

    TTS.emit('progress', { elapsed, total, percent });

    if (state.timings.length) {
      TTS.emit('transcript', {
        sentences: state.timings.map(t => ({
          text: t.text,
          state: elapsed < t.start ? 'upcoming' : elapsed < t.end ? 'active' : 'spoken',
        })),
      });
    }

    // PCM done detection: all chunks scheduled + playback past last scheduled time
    if (state.audioCtx && state.pcmStreamDone) {
      if (state.audioCtx.currentTime >= state.pcmNextPlayTime) {
        if (state.status === 'streaming' || state.status === 'paused') {
          state.status = 'done';
          TTS.emit('progress', { elapsed: state.totalDuration, total: state.totalDuration, percent: 1 });
          TTS.emit('status', { status: 'done' });
        }
        return;
      }
    }

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

  // ── MediaSource path cleanup ──
  state.pendingChunks = [];
  state.streamDone = false;

  if (state.sourceBuffer) {
    try { state.sourceBuffer.removeEventListener('updateend', flushPendingChunks); } catch { /* ignore */ }
  }

  if (state.audio) {
    if (state.durationChangeHandler) {
      try { state.audio.removeEventListener('durationchange', state.durationChangeHandler); } catch { /* ignore */ }
      state.durationChangeHandler = null;
    }
    if (state.endedHandler) {
      try { state.audio.removeEventListener('ended', state.endedHandler); } catch { /* ignore */ }
      state.endedHandler = null;
    }
    try { state.audio.pause(); state.audio.src = ''; } catch { /* ignore */ }
  }

  if (state.mediaSource && state.mediaSource.readyState === 'open') {
    try { state.mediaSource.endOfStream(); } catch { /* ignore */ }
  }
  state.mediaSource = null;
  state.sourceBuffer = null;

  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  if (state.audio && state.audio.parentNode) {
    state.audio.remove();
  }
  state.audio = null;

  // ── PCM / Web Audio path cleanup ──
  if (state.audioCtx) {
    try { state.audioCtx.close(); } catch { /* ignore */ }
    state.audioCtx = null;
  }
  state.pcmSources = [];
  state.pcmNextPlayTime = 0;
  state.pcmStartCtxTime = 0;
  state.pcmAudioOffset = 0;
  state.pcmScheduledDuration = 0;
  state.pcmStreamDone = false;
  state.pcmLeftover = null;

  // ── Shared ──
  state.timings = [];
  state.totalDuration = 0;
  state.status = 'idle';
  state.cleaningUp = false;
  TTS.emit('status', { status: 'idle' });
}

// ── Audio element management (MediaSource path) ─────────────────────

function getOrCreateAudio() {
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
  const prev = state.speed;
  state.speed = rate;

  if (state.audio) {
    // MediaSource path
    state.audio.playbackRate = rate;
  } else if (state.audioCtx) {
    // PCM path: update elapsed tracking
    state.pcmAudioOffset += (state.audioCtx.currentTime - state.pcmStartCtxTime) * prev;
    state.pcmStartCtxTime = state.audioCtx.currentTime;
    // Update all active source nodes
    state.pcmSources.forEach(s => { s.playbackRate.value = rate; });
  }
};

TTS.stop = function () {
  cleanup();
};

TTS.pause = function () {
  if (state.status !== 'streaming') return;
  if (state.audioCtx) {
    state.audioCtx.suspend();
  } else if (state.audio) {
    state.audio.pause();
  }
  if (state.animFrameId) {
    cancelAnimationFrame(state.animFrameId);
    state.animFrameId = null;
  }
  state.status = 'paused';
  TTS.emit('status', { status: 'paused' });
};

TTS.resume = function () {
  if (state.status !== 'paused') return;
  if (state.audioCtx) {
    state.audioCtx.resume();
  } else if (state.audio) {
    state.audio.play().catch(() => {});
  }
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

  // Clean up previous MediaSource + object URL
  if (state.mediaSource && state.mediaSource.readyState === 'open') {
    try { state.mediaSource.endOfStream(); } catch { /* ignore */ }
  }
  if (state.objectUrl) {
    URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = null;
  }

  const abort = new AbortController();
  state.abortController = abort;
  if (state.animFrameId) cancelAnimationFrame(state.animFrameId);

  const startTime = performance.now();

  try {
    if (MSConstructor) {
      const audio = getOrCreateAudio();
      await _startStreaming(audio, sentences, apiKey, text, abort, startTime);
    } else {
      await _startPCM(sentences, apiKey, text, abort, startTime);
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
      state.animFrameId = null;
      return;
    }
    console.error('TTS error:', e);
    logError('tts', e, `TTS.start (${TTS_BACKEND})`);
    state.status = 'error';
    TTS.emit('status', { status: 'error' });
    TTS.emit('error', { message: e.message });
  }
};

// ── Streaming path (MediaSource / ManagedMediaSource) ────────────────

async function _startStreaming(audio, sentences, apiKey, text, abort, startTime) {
  const mediaSource = new MSConstructor();
  state.mediaSource = mediaSource;

  if (_isManagedMS) audio.disableRemotePlayback = true;

  const url = URL.createObjectURL(mediaSource);
  state.objectUrl = url;
  audio.src = url;

  let firstByteTime = null;
  let totalBytes = 0;

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

  const res = await _fetchTTS(apiKey, text, abort, 'mp3');
  const reader = res.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!firstByteTime) {
      firstByteTime = performance.now();
      _attachEndedHandler(audio);
      audio.playbackRate = state.speed;
      audio.play().catch((err) => {
        if (err.name === 'NotAllowedError') TTS.emit('autoplay_blocked', {});
      });
      startAnimationLoop();
    }

    totalBytes += value.length;
    state.pendingChunks.push(value);
    flushPendingChunks();
  }

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
  _finalizeStreamingDuration(audio, sentences, startTime, firstByteTime, totalBytes);
}

// ── PCM + Web Audio path (iOS without MSE) ───────────────────────────

async function _startPCM(sentences, apiKey, text, abort, startTime) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx({ sampleRate: PCM_SAMPLE_RATE });
  state.audioCtx = audioCtx;
  state.pcmSources = [];
  state.pcmNextPlayTime = 0;
  state.pcmStartCtxTime = 0;
  state.pcmAudioOffset = 0;
  state.pcmScheduledDuration = 0;
  state.pcmStreamDone = false;
  state.pcmLeftover = null;

  // Resume context (autoplay policy — should be fine since called from user gesture flow)
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const res = await _fetchTTS(apiKey, text, abort, 'pcm');
  const reader = res.body.getReader();

  let firstByteTime = null;
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (!firstByteTime) {
      firstByteTime = performance.now();
      state.pcmStartCtxTime = audioCtx.currentTime;
      state.pcmNextPlayTime = audioCtx.currentTime;
      startAnimationLoop();
    }

    totalBytes += value.length;
    _schedulePCMChunk(audioCtx, value);
  }

  // Flush any leftover byte (shouldn't happen with Azure PCM, but just in case)
  state.pcmLeftover = null;
  state.pcmStreamDone = true;

  // Finalize duration from total scheduled audio
  const realDuration = state.pcmScheduledDuration;
  state.totalDuration = realDuration;
  state.timings = calculateTimings(sentences, realDuration);
  state.streamDone = true;

  const fetchDone = performance.now();
  TTS.emit('stats', {
    firstByte: firstByteTime ? Math.round(firstByteTime - startTime) : null,
    totalFetch: Math.round(fetchDone - startTime),
    duration: realDuration.toFixed(1),
    size: `${(totalBytes / 1024).toFixed(0)}KB`,
    sentenceCount: sentences.length,
  });
}

function _schedulePCMChunk(audioCtx, rawChunk) {
  // Handle leftover byte from previous chunk (16-bit samples = 2 bytes each)
  let data;
  if (state.pcmLeftover) {
    data = new Uint8Array(state.pcmLeftover.length + rawChunk.length);
    data.set(state.pcmLeftover, 0);
    data.set(rawChunk, state.pcmLeftover.length);
    state.pcmLeftover = null;
  } else {
    data = rawChunk;
  }

  // If odd number of bytes, save the last byte for next chunk
  if (data.length % 2 !== 0) {
    state.pcmLeftover = data.slice(-1);
    data = data.slice(0, -1);
  }

  if (data.length === 0) return;

  // Copy into aligned buffer — fetch chunks may have non-zero byteOffset
  // which breaks Int16Array (requires 2-byte alignment)
  const aligned = new Uint8Array(data.length);
  aligned.set(data);
  const int16 = new Int16Array(aligned.buffer, 0, aligned.length / 2);

  // Convert 16-bit signed integers to 32-bit floats
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }

  // Create AudioBuffer and schedule
  const audioBuffer = audioCtx.createBuffer(1, float32.length, PCM_SAMPLE_RATE);
  audioBuffer.getChannelData(0).set(float32);

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = state.speed;
  source.connect(audioCtx.destination);

  // Track active source for speed changes; remove when done
  state.pcmSources.push(source);
  source.onended = () => {
    const idx = state.pcmSources.indexOf(source);
    if (idx !== -1) state.pcmSources.splice(idx, 1);
  };

  const currentTime = audioCtx.currentTime;
  if (state.pcmNextPlayTime < currentTime) {
    state.pcmNextPlayTime = currentTime;
  }

  source.start(state.pcmNextPlayTime);
  state.pcmNextPlayTime += audioBuffer.duration / state.speed;
  state.pcmScheduledDuration += audioBuffer.duration;
}

// ── Shared helpers ───────────────────────────────────────────────────

async function _fetchTTS(apiKey, text, abort, format) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      input: text,
      voice: TTS_VOICE,
      response_format: format,
    }),
    signal: abort.signal,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status}: ${errText.slice(0, 300)}`);
  }
  return res;
}

function _attachEndedHandler(audio) {
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
}

function _finalizeStreamingDuration(audio, sentences, startTime, firstByteTime, totalBytes) {
  const fetchDone = performance.now();
  const realDuration = audio.duration && isFinite(audio.duration) ? audio.duration : state.totalDuration;
  state.totalDuration = realDuration;
  state.timings = calculateTimings(sentences, realDuration);
  state.streamDone = true;

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
}

export { TTS_BACKEND };
export default TTS;
