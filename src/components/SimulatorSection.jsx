import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import RT from '../utils/realtime';
import { sendToBubble } from '../utils/bubble';
import Dialog from './Dialog';
import SimulatorLanding from './simulator/SimulatorLanding';
import SimulatorSession from './simulator/SimulatorSession';
import SimulatorResults from './simulator/SimulatorResults';
import FaceOverlay from './simulator/FaceOverlay';

// Map AI evaluation JSON to the shape SimulatorResults expects
function normalizeEvaluation(raw) {
  if (!raw) return null;

  // Scale score to 1–5 range
  const rawScore = raw.score ?? raw.overall_score ?? 0;
  // AI returns 1–10; map to 1–5 (1-2→1, 3-4→2, 5-6→3, 7-8→4, 9-10→5)
  const score = raw.overall_score ?? Math.max(1, Math.min(5, Math.ceil(rawScore / 2)));

  // Derive skill level from 5-point score
  const levels = ['Getting Started', 'Warming Up', 'Finding Your Groove', 'Nice work!', 'Nailed It'];
  const skillLevel = raw.skill_level || levels[Math.max(0, Math.min(score, 5) - 1)] || levels[0];

  // dimensions object → metrics array
  const metrics = raw.metrics ?? (raw.dimensions
    ? Object.entries(raw.dimensions).map(([name, direction]) => ({ name, direction }))
    : []);

  return {
    overall_score: score,
    skill_level: skillLevel,
    metrics,
    strengths: raw.strengths ?? raw.what_went_well ?? [],
    improvements: raw.improvements ?? raw.what_could_be_better ?? [],
    summary: raw.summary ?? raw.next_time_tip ?? '',
  };
}

// Module-level: survives tab switches (component unmount/remount)
let templatesFetched = false;

/**
 * SimulatorSection — Tab container.
 *
 * Props:
 *  - theme: theme object
 *  - onSessionChange: (active: boolean) => void — notifies MainTabs to lock/unlock tabs
 *  - onFullScreenChange: (fullScreen: boolean) => void — notifies MainTabs to hide/show tab bar
 */
const SimulatorSection = ({ theme, onSessionChange, onFullScreenChange }) => {
  const [phase, setPhase] = useState('landing'); // 'landing' | 'session' | 'results'
  const [evaluation, setEvaluation] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [simStage, setSimStage] = useState(null); // 1, 'transition', 2, 3
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'partner' | 'user' | null

  // Pending tab switch callback (set by MainTabs when user tries to switch during session)
  const pendingLeaveRef = useRef(null);
  const [instructionsReady, setInstructionsReady] = useState(() => {
    try {
      const raw = localStorage.getItem('bonds_simulator_templates');
      if (raw) { const t = JSON.parse(raw); return !!(t.simulationJsonInstructions && t.scoreInstructions); }
    } catch { /* ignore */ }
    return false;
  });

  // Fetch + cache instruction templates (once per session)
  useEffect(() => {
    if (templatesFetched) return;
    templatesFetched = true;
    sendToBubble('bubble_fn_simulator', 'fetch_instructions');
  }, []);

  // Bubble callback to cache templates
  useEffect(() => {
    window.appUI.setSimulatorTemplates = (data) => {
      if (!data) return;
      const templates = {
        simulationJsonInstructions: data.simulationJsonInstructions || null,
        scoreInstructions: data.scoreInstructions || null,
        ttsApiKey: data.ttsApiKey || null,
      };
      localStorage.setItem('bonds_simulator_templates', JSON.stringify(templates));
      setInstructionsReady(!!(templates.simulationJsonInstructions && templates.scoreInstructions));
    };
    return () => { delete window.appUI.setSimulatorTemplates; };
  }, []);

  // Full-screen: active during session and results
  const isFullScreen = phase === 'session' || phase === 'results';
  useEffect(() => {
    if (onFullScreenChange) onFullScreenChange(isFullScreen);
  }, [isFullScreen, onFullScreenChange]);

  // Notify parent of session state changes (tab locking)
  useEffect(() => {
    if (onSessionChange) onSessionChange(phase === 'session');
  }, [phase, onSessionChange]);

  // Determine which face phase to show
  // Phase 1 faces during stage 1, Phase 2 faces during stage 2, hide during results/transition
  const facePhase = phase === 'session'
    ? (simStage === 1 ? 1 : simStage === 2 ? 2 : null)
    : null;

  // Glow behind active speaker's face (Phase 2 only)
  const glowSide = facePhase === 2
    ? (activeSpeaker === 'partner' ? 'left' : activeSpeaker === 'user' ? 'right' : null)
    : null;

  const handleStart = useCallback(() => {
    setPhase('session');
    // Tell Bubble to start generating the token
    sendToBubble('bubble_fn_simulator', 'start_session');
  }, []);

  // Bubble will call this with the token
  useEffect(() => {
    window.appUI.onSimulatorToken = (token) => {
      if (token) RT.start(token);
    };
    // Stage 2 token (partner voice)
    window.appUI.onSimulatorStage2Token = (token) => {
      if (token) RT.start(token);
    };
    return () => {
      delete window.appUI.onSimulatorToken;
      delete window.appUI.onSimulatorStage2Token;
    };
  }, []);

  const handleStageChange = useCallback((stage) => {
    setSimStage(stage);
  }, []);

  const handleComplete = useCallback((evalData) => {
    const normalized = normalizeEvaluation(evalData);
    setEvaluation(normalized);
    setSimStage(null);
    setPhase('results');
    sendToBubble('bubble_fn_simulator', 'session_complete', {
      score: normalized?.overall_score || 0,
      skillLevel: normalized?.skill_level || '',
    });
  }, []);

  const handleClose = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const confirmClose = useCallback(() => {
    RT.stop('stopped');
    setShowCloseDialog(false);
    setSimStage(null);
    setPhase('landing');
    setEvaluation(null);
    sendToBubble('bubble_fn_simulator', 'session_closed');

    // If there was a pending tab switch, execute it
    if (pendingLeaveRef.current) {
      pendingLeaveRef.current();
      pendingLeaveRef.current = null;
    }
  }, []);

  const cancelClose = useCallback(() => {
    setShowCloseDialog(false);
    pendingLeaveRef.current = null;
  }, []);

  const handleRetry = useCallback(() => {
    setPhase('session');
    setEvaluation(null);
    RT.retrySimulation();
  }, []);

  const handleDone = useCallback(() => {
    setSimStage(null);
    setPhase('landing');
    setEvaluation(null);
  }, []);

  const handleStage2Start = useCallback(() => {
    // Coins deducted when Stage 2 starts
    sendToBubble('bubble_fn_simulator', 'deduct_coins');
  }, []);

  // Public method for MainTabs to request leave (returns false if blocked)
  useEffect(() => {
    window.appUI._simulatorRequestLeave = (onConfirm) => {
      if (phase !== 'session') return true; // allow immediately
      pendingLeaveRef.current = onConfirm;
      setShowCloseDialog(true);
      return false; // blocked, will call onConfirm if user confirms
    };
    return () => { delete window.appUI._simulatorRequestLeave; };
  }, [phase]);

  const sim = theme.simulator;

  // Full-screen content — portalled to document.body to escape ancestor transforms
  // (animate-tab-switch applies transform which breaks position:fixed for descendants)
  const fullScreenContent = isFullScreen ? createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, overflow: 'hidden', background: sim.sessionBg }}
    >
      {phase === 'session' && (
        <SimulatorSession
          theme={theme}
          onComplete={handleComplete}
          onClose={handleClose}
          onStage2Start={handleStage2Start}
          onStageChange={handleStageChange}
          onActiveSpeakerChange={setActiveSpeaker}
        />
      )}
      <FaceOverlay facePhase={facePhase} glowSide={glowSide} theme={theme} />
      {phase === 'results' && (
        <SimulatorResults
          evaluation={evaluation}
          theme={theme}
          onRetry={handleRetry}
          onDone={handleDone}
        />
      )}
      <Dialog
        open={showCloseDialog}
        onClose={cancelClose}
        title="End session?"
        theme={theme}
        closeOnBackdrop={false}
        actions={[
          { label: 'End Session', onClick: confirmClose, primary: true },
          { label: 'Continue', onClick: cancelClose },
        ]}
      >
        <p>This will close your current simulation. Your progress will be lost.</p>
      </Dialog>
    </div>,
    document.body
  ) : null;

  return (
    <div className="w-full h-full relative">
      {phase === 'landing' && (
        <SimulatorLanding onStart={handleStart} theme={theme} disabled={!instructionsReady} />
      )}
      {fullScreenContent}
    </div>
  );
};

export default SimulatorSection;
