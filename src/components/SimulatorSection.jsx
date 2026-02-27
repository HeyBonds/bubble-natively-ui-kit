import React, { useState, useCallback, useEffect, useRef } from 'react';
import RT from '../utils/realtime';
import { sendToBubble } from '../utils/bubble';
import Dialog from './Dialog';
import SimulatorLanding from './simulator/SimulatorLanding';
import SimulatorSession from './simulator/SimulatorSession';
import SimulatorResults from './simulator/SimulatorResults';

/**
 * SimulatorSection — Tab container.
 *
 * Props:
 *  - theme: theme object
 *  - onSessionChange: (active: boolean) => void — notifies MainTabs to lock/unlock tabs
 */
const SimulatorSection = ({ theme, onSessionChange }) => {
  const [phase, setPhase] = useState('landing'); // 'landing' | 'session' | 'results'
  const [evaluation, setEvaluation] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Pending tab switch callback (set by MainTabs when user tries to switch during session)
  const pendingLeaveRef = useRef(null);

  // Notify parent of session state changes
  useEffect(() => {
    if (onSessionChange) onSessionChange(phase === 'session');
  }, [phase, onSessionChange]);

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

  const handleComplete = useCallback((evalData) => {
    setEvaluation(evalData);
    setPhase('results');
    sendToBubble('bubble_fn_simulator', 'session_complete', {
      score: evalData?.overall_score || 0,
      skillLevel: evalData?.skill_level || '',
    });
  }, []);

  const handleClose = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const confirmClose = useCallback(() => {
    RT.stop('stopped');
    setShowCloseDialog(false);
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
    setPhase('landing');
    setEvaluation(null);
  }, []);

  const handleStage2Start = useCallback(() => {
    // Credits deducted when Stage 2 starts
    sendToBubble('bubble_fn_simulator', 'deduct_credits');
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

  return (
    <div className="w-full h-full">
      {phase === 'landing' && (
        <SimulatorLanding onStart={handleStart} theme={theme} />
      )}
      {phase === 'session' && (
        <SimulatorSession
          theme={theme}
          onComplete={handleComplete}
          onClose={handleClose}
          onStage2Start={handleStage2Start}
        />
      )}
      {phase === 'results' && (
        <SimulatorResults
          evaluation={evaluation}
          theme={theme}
          onRetry={handleRetry}
          onDone={handleDone}
        />
      )}

      {/* Close confirmation dialog */}
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
    </div>
  );
};

export default SimulatorSection;
