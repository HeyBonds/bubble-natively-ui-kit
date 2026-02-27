import React, { useState, useEffect, useRef, useCallback } from 'react';
import RT, { onRTEvent, offRTEvent } from '../../utils/realtime';
import { sendToBubble } from '../../utils/bubble';
import Waveform from './Waveform';
import MicButton from './MicButton';
import Transcript from './Transcript';

const TOTAL_TURNS = 4; // 2 partner + 2 user turns in Stage 2

const SimulatorSession = ({ theme, onComplete, onClose, onStage2Start }) => {
  const sim = theme.simulator;

  // Session state
  const [stage, setStage] = useState(1); // 1, 'transition', 2, 3
  const [rtState, setRtState] = useState('loading');
  const [transcript, setTranscript] = useState('');
  const [micState, setMicState] = useState('hidden');
  const [turnProgress, setTurnProgress] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);

  // Audio context for waveform
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  // Waveform mode
  const waveformMode = rtState === 'PUSH_TO_TALK_ACTIVE' ? 'recording'
    : ['COACH_SPEAKING', 'PARTNER_SPEAKING'].includes(rtState) ? 'speaking'
    : 'idle';

  // Status text
  const statusText = micState === 'recording' ? 'Tap when done speaking'
    : micState === 'ready' ? 'Tap to speak'
    : ['COACH_SPEAKING', 'PARTNER_SPEAKING'].includes(rtState) ? 'Listen'
    : rtState === 'loading' ? 'Connecting...'
    : '';

  // Handle RT events
  const handleRTEvent = useCallback((evt) => {
    const { type, data } = evt;

    switch (type) {
      case 'state': {
        const s = data.state;
        setRtState(s);

        switch (s) {
          case 'SESSION_STARTED':
          case 'BEGIN_SIMULATION':
            setMicState('hidden');
            break;
          case 'COACH_SPEAKING':
            setMicState('hidden');
            setIsStreaming(true);
            setTranscript('');
            break;
          case 'PARTNER_SPEAKING':
            setMicState('hidden');
            setIsStreaming(true);
            setTranscript('');
            if (data.partnerTurnCount) {
              setTurnProgress((data.partnerTurnCount - 1) * 2 + 1);
            }
            break;
          case 'PUSH_TO_TALK_READY':
            setMicState('ready');
            setIsStreaming(false);
            if (data.userTurnCount) {
              setTurnProgress(data.userTurnCount * 2);
            }
            break;
          case 'PUSH_TO_TALK_ACTIVE':
            setMicState('recording');
            break;
          case 'PUSH_TO_TALK_STOPPED':
            setMicState('waiting');
            break;
          case 'LOADING_SIMULATION':
            setStage('transition');
            setMicState('hidden');
            setTranscript('');
            break;
          case 'SESSION_COMPLETED':
            setStage(3);
            setMicState('hidden');
            break;
          case 'SESSION_ERROR':
          case 'SESSION_STOPPED':
            setMicState('hidden');
            break;
          default:
            break;
        }
        break;
      }
      case 'coach_text':
      case 'partner_text':
        setTranscript(data.text || '');
        setIsStreaming(false);
        break;
      case 'user_transcript':
        // Show user's own speech as transcript briefly
        break;
      case 'stage2_token_needed':
        // Tell Bubble to generate Stage 2 token
        if (onStage2Start) onStage2Start();
        sendToBubble('bubble_fn_simulator', 'stage2_token_needed', {
          voice: data.voice,
          userName: data.userName,
          issue: data.issue,
          jsonContext: data.jsonContext,
        });
        break;
      case 'evaluation_json_received':
        if (onComplete) onComplete(data.evaluationJson || data);
        break;
      case 'error':
        console.error('[Simulator] RT error:', data.message, data.code);
        break;
      default:
        break;
    }
  }, [onComplete, onStage2Start]);

  // Subscribe to RT events
  useEffect(() => {
    onRTEvent(handleRTEvent);
    return () => offRTEvent(handleRTEvent);
  }, [handleRTEvent]);

  // Setup AudioContext for recording waveform
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) { /* noop */ }
      }
    };
  }, []);

  // When mic becomes active, connect to analyser
  useEffect(() => {
    if (micState === 'recording') {
      const micStream = RT.getMicStream();
      if (micStream && !audioCtxRef.current) {
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const source = ctx.createMediaStreamSource(micStream);
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
    }
  }, [micState]);

  // Detect Stage 2 start (LOADING_SIMULATION -> next PARTNER_SPEAKING = stage 2)
  useEffect(() => {
    if (rtState === 'PARTNER_SPEAKING' && stage === 'transition') {
      setStage(2);
    }
  }, [rtState, stage]);

  const handleMicPress = () => {
    if (micState === 'ready') {
      RT.startPushToTalk();
    } else if (micState === 'recording') {
      RT.stopPushToTalk();
    }
  };

  // Transition screen
  if (stage === 'transition') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6" style={{ background: sim.sessionBg }}>
        <p className="font-jakarta font-bold text-[20px] text-center" style={{ color: sim.transitionText }}>
          Your simulation will begin shortly
        </p>
        <div className="mt-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="animate-spin" style={{ animationDuration: '1.5s' }}>
            <circle cx="12" cy="12" r="10" stroke={sim.transitionSubtext} strokeWidth="2" strokeDasharray="50 20" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: sim.sessionBg }}>
      {/* Top bar -- close button */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose} className="p-2 rounded-full" style={{ color: sim.statusText }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Stage indicator (only in Stage 2) */}
        {stage === 2 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_TURNS }).map((_, i) => (
              <div
                key={i}
                className="rounded-full border border-solid transition-[background-color] duration-300"
                style={{
                  width: i < turnProgress ? 20 : 16,
                  height: 8,
                  borderRadius: 4,
                  background: i < turnProgress ? sim.dotActive : sim.dotInactive,
                  borderColor: i < turnProgress ? sim.dotActive : sim.dotBorder,
                }}
              />
            ))}
          </div>
        )}

        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Center content -- status + waveform */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {/* Status text */}
        <p className="font-jakarta font-bold text-[20px]" style={{ color: sim.statusText }}>
          {statusText}
        </p>

        {/* Waveform + Mic */}
        <div className="w-full flex items-center gap-0">
          <div className="flex-1">
            <Waveform mode={waveformMode} analyserNode={analyserRef.current} theme={theme} height={48} />
          </div>
          {micState !== 'hidden' && (
            <div className="shrink-0 -ml-4">
              <MicButton state={micState} onPress={handleMicPress} theme={theme} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom -- Transcript */}
      <div className="shrink-0 px-5 pb-6 pt-2">
        <Transcript text={transcript} streaming={isStreaming} theme={theme} />
      </div>
    </div>
  );
};

export default SimulatorSession;
