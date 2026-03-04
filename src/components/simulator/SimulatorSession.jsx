import React, { useState, useEffect, useCallback, useRef } from 'react';
import RT, { onRTEvent, offRTEvent } from '../../utils/realtime';
import TTS from '../../utils/tts';
import { sendToBubble } from '../../utils/bubble';
import Waveform from './Waveform';
import MicButton from './MicButton';
import Transcript from './Transcript';
import CoinDeduction from './CoinDeduction';

const TOTAL_TURNS = 4; // 2 partner + 2 user turns in Stage 2

const SimulatorSession = ({ theme, coinCount, onComplete, onClose, onStage2Start, onStageChange, onActiveSpeakerChange }) => {
  const sim = theme.simulator;
  const transcriptRef = useRef(null);

  // Session state
  const [stage, setStage] = useState(1); // 1, 'transition', 2, 3
  const [rtState, setRtState] = useState('loading');
  const [micState, setMicState] = useState('hidden');
  const [turnProgress, setTurnProgress] = useState(0);
  const turnProgressRef = useRef(0);
  const [coinAnimDone, setCoinAnimDone] = useState(false);
  const handleCoinAnimComplete = useCallback(() => setCoinAnimDone(true), []);

  // Keep ref in sync for access inside callbacks
  useEffect(() => { turnProgressRef.current = turnProgress; }, [turnProgress]);

  // Notify parent of stage changes
  useEffect(() => {
    if (onStageChange) onStageChange(stage);
  }, [stage, onStageChange]);

  // Status text
  const statusText = micState === 'recording' ? 'Tap when done speaking'
    : micState === 'ready' ? 'Tap to speak'
    : ['COACH_SPEAKING', 'PARTNER_SPEAKING'].includes(rtState) ? 'Listen'
    : rtState === 'loading' ? 'Connecting...'
    : '';

  // Helper to access Transcript imperative API
  const getTranscriptAPI = useCallback(() => {
    return transcriptRef.current?._transcriptAPI;
  }, []);

  // Handle RT events
  const handleRTEvent = useCallback((evt) => {
    const { type, data } = evt;
    const api = getTranscriptAPI();

    switch (type) {
      case 'state': {
        const s = data.state;
        setRtState(s);

        switch (s) {
          case 'SESSION_STARTED':
          case 'BEGIN_SIMULATION':
            setMicState('hidden');
            if (api) api.clearText();
            break;
          case 'COACH_SPEAKING':
            setMicState('hidden');
            break;
          case 'PARTNER_SPEAKING':
            setMicState('hidden');
            if (onActiveSpeakerChange) onActiveSpeakerChange('partner');
            if (data.partnerTurnCount) {
              setTurnProgress((data.partnerTurnCount - 1) * 2 + 1);
            }
            break;
          case 'PUSH_TO_TALK_READY':
            setMicState('ready');
            if (onActiveSpeakerChange) onActiveSpeakerChange('user');
            if (data.userTurnCount) {
              setTurnProgress(data.userTurnCount * 2);
            }
            break;
          case 'PUSH_TO_TALK_ACTIVE':
            setMicState('recording');
            break;
          case 'PUSH_TO_TALK_STOPPED':
            setMicState('waiting');
            // After final user turn, just turn glow off (don't move to partner)
            if (onActiveSpeakerChange) {
              onActiveSpeakerChange(turnProgressRef.current >= TOTAL_TURNS ? null : 'partner');
            }
            break;
          case 'LOADING_SIMULATION':
            setStage('transition');
            setMicState('hidden');
            if (onActiveSpeakerChange) onActiveSpeakerChange(null);
            if (api) api.clearText();
            break;
          case 'SESSION_COMPLETED':
            setStage(3);
            setMicState('hidden');
            if (onActiveSpeakerChange) onActiveSpeakerChange(null);
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
      case 'coach_text_delta':
      case 'partner_text_delta': {
        // Matches original: WaveformComponent.updateText(type, currentAssistantLine, false, { duration_ms })
        const textType = type === 'partner_text_delta' ? 'assistant' : 'coach';
        if (api) api.updateText(textType, data.text || '', false, { duration_ms: data.durationMs });
        break;
      }
      case 'coach_text':
        // Matches original: WaveformComponent.updateText("coach", finalText, true)
        if (api) api.updateText('coach', data.text || '', true);
        break;
      case 'partner_text':
        // Matches original: WaveformComponent.updateText("assistant", finalText, true)
        if (api) api.updateText('assistant', data.text || '', true);
        break;
      case 'user_speaking':
        // Matches original: WaveformComponent.updateText("user", "...", false)
        if (api) api.updateText('user', data.text || '...', false);
        break;
      case 'user_transcript':
        // Matches original: WaveformComponent.updateText("user", text, true)
        if (api) api.updateText('user', data.text || '', true);
        break;
      case 'stage2_token_needed':
        // Tell Bubble to generate Stage 2 token
        if (onStage2Start) onStage2Start();
        sendToBubble('bubble_fn_simulator', 'stage2_token_needed', {
          issue: data.issue,
          jsonContext: data.jsonContext,
        });
        break;
      case 'evaluation_json_received':
        console.log('[Simulator] evaluation data:', JSON.stringify(data));
        if (onComplete) onComplete(data.evaluationJson || data);
        break;
      case 'error':
        console.error('[Simulator] RT error:', data.message, data.code);
        break;
      default:
        break;
    }
  }, [onComplete, onStage2Start, onActiveSpeakerChange, getTranscriptAPI]);

  // Subscribe to RT events
  useEffect(() => {
    onRTEvent(handleRTEvent);
    return () => offRTEvent(handleRTEvent);
  }, [handleRTEvent]);

  // Detect Stage 2 start (LOADING_SIMULATION -> next PARTNER_SPEAKING = stage 2)
  useEffect(() => {
    if (rtState === 'PARTNER_SPEAKING' && stage === 'transition') {
      setCoinAnimDone(true); // mark done even if interrupted mid-animation
      setStage(2);
    }
  }, [rtState, stage]);

  const handleMicPress = () => {
    if (micState === 'ready') {
      TTS.unlockAudio(); // Pre-unlock for results TTS autoplay
      RT.startPushToTalk();
    } else if (micState === 'recording') {
      RT.stopPushToTalk();
    }
  };

  // Transition screen — coin deduction animation, then spinner fallback.
  // coinAnimDone is set true either by onComplete (normal) or by the
  // PARTNER_SPEAKING effect above (interruption), preventing double-play.
  if (stage === 'transition') {
    if (!coinAnimDone) {
      return (
        <CoinDeduction
          coinCount={coinCount}
          coinCost={4}
          onComplete={handleCoinAnimComplete}
        />
      );
    }
    // Fallback: waiting for Stage 2 token
    return (
      <div className="flex flex-col items-center justify-center h-full px-6" style={{ background: sim.sessionBg }}>
        <p className="font-jakarta font-bold text-[1.25rem] text-center" style={{ color: sim.transitionText }}>
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

        {/* Stage indicator (only in Stage 2) — alternating purple/gray to match face colors */}
        {stage === 2 && (
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_TURNS }).map((_, i) => {
              // Alternate: partner (purple/pink) at even indices, user (gray) at odd
              const turnColor = i % 2 === 0 ? '#E1327F' : '#6D6987';
              const active = i < turnProgress;
              return (
                <div
                  key={i}
                  className="rounded-full border border-solid transition-[background-color] duration-300"
                  style={{
                    width: 20,
                    height: 8,
                    borderRadius: 4,
                    background: active ? turnColor : sim.dotInactive,
                    borderColor: active ? turnColor : sim.dotBorder,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Spacer — pushes everything below toward the bottom */}
      <div className="flex-1" />

      {/* Status + waveform + transcript cluster — anchored near bottom */}
      <div className="shrink-0 flex flex-col items-center px-6">
        {/* Status text */}
        <p className="font-jakarta font-bold text-[20px] mb-4" style={{ color: sim.statusText }}>
          {statusText}
        </p>

        {/* Waveform wrapper with mic button centered on top */}
        <div className="relative w-4/5" style={{ height: 72 }}>
          <Waveform
            rtState={rtState}
            buttonVisible={micState !== 'hidden'}
            theme={theme}
          />
          {micState !== 'hidden' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
              <MicButton state={micState} onPress={handleMicPress} theme={theme} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom -- Transcript (fixed height glass box, imperative API via ref) */}
      <div className="shrink-0 px-3 pt-3" style={{ paddingBottom: '1.875em' }}>
        <Transcript ref={transcriptRef} theme={theme} />
      </div>
    </div>
  );
};

export default SimulatorSession;
