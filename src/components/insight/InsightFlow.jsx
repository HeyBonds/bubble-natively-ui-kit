import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { sendToBubble } from '../../utils/bubble';
import TTS from '../../utils/tts';
import Dialog from '../Dialog';
import InsightQuestions from './InsightQuestions';
import InsightLoader from './InsightLoader';
import InsightPlayback from './InsightPlayback';
import { INSIGHT_MOCK_ENABLED, setupInsightMocks } from './insightMocks';

/**
 * InsightFlow — Orchestrator for the Insight Generation feature.
 *
 * Props:
 *  - type: 'learn' | 'activity'
 *  - activityId: string (for activity type)
 *  - theme: theme object
 *  - pop: () => void — go back to FunZone
 *  - onFullScreenChange: (fullScreen: boolean) => void
 */
const InsightFlow = ({ type, activityId, theme, pop, onFullScreenChange }) => {
  const [phase, setPhase] = useState(() => (type === 'learn' ? 'questions' : 'loading'));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [insightData, setInsightData] = useState(null);
  const [ttsApiKey, setTtsApiKey] = useState(() => {
    try {
      const raw = localStorage.getItem('bonds_simulator_templates');
      return raw ? JSON.parse(raw).ttsApiKey : null;
    } catch { return null; }
  });
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const ambientRef = useRef(null);

  // Notify parent about fullscreen state
  useEffect(() => {
    if (onFullScreenChange) onFullScreenChange(true);
    return () => {
      if (onFullScreenChange) onFullScreenChange(false);
    };
  }, [onFullScreenChange]);

  // Mock mode — intercepts BubbleBridge.send for insight actions only
  useEffect(() => {
    if (!INSIGHT_MOCK_ENABLED) return;
    return setupInsightMocks();
  }, []);

  // Register Bubble callbacks
  useEffect(() => {
    window.appUI.onInsightQuestions = (data) => {
      if (data?.questions) setQuestions(data.questions);
      if (data?.ttsApiKey) setTtsApiKey(data.ttsApiKey);
    };

    window.appUI.onInsightData = (data) => {
      setInsightData(data);
      if (data?.ttsApiKey) setTtsApiKey(data.ttsApiKey);
      setPhase('playback');
    };

    return () => {
      delete window.appUI.onInsightQuestions;
      delete window.appUI.onInsightData;
    };
  }, []);

  // Fetch questions on mount for learn type
  useEffect(() => {
    if (type === 'learn') {
      sendToBubble('bubble_fn_insight', 'fetch_questions');
    }
  }, [type]);

  // Trigger generation for activity type on mount
  useEffect(() => {
    if (type === 'activity') {
      sendToBubble('bubble_fn_insight', 'generate', { type: 'activity', activityId });
    }
  }, [type, activityId]);

  const handleAnswer = useCallback((answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Send each answer to Bubble
    sendToBubble('bubble_fn_insight', 'answer', answer);

    // After last question, start generating
    if (newAnswers.length >= questions.length) {
      setPhase('loading');
      sendToBubble('bubble_fn_insight', 'generate', {
        type: 'learn',
        answers: newAnswers,
      });
    }
  }, [answers, questions.length]);

  const handleBack = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const confirmClose = useCallback(() => {
    TTS.stop();
    if (ambientRef.current) { ambientRef.current.pause(); ambientRef.current.src = ''; }
    setShowCloseDialog(false);
    sendToBubble('bubble_fn_insight', 'closed');
    pop();
  }, [pop]);

  const cancelClose = useCallback(() => {
    setShowCloseDialog(false);
  }, []);

  const handlePlaybackDone = useCallback(() => {
    sendToBubble('bubble_fn_insight', 'playback_complete');
    pop();
  }, [pop]);

  const ins = theme.insight;

  const content = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        overflow: 'hidden',
        background: ins.loaderBg,
      }}
    >
      {phase === 'questions' && questions.length > 0 && (
        <InsightQuestions
          questions={questions}
          theme={theme}
          onAnswer={handleAnswer}
          onBack={handleBack}
          onClose={handleClose}
        />
      )}

      {phase === 'questions' && questions.length === 0 && (
        <InsightLoader theme={theme} message="Loading..." />
      )}

      {phase === 'loading' && (
        <InsightLoader theme={theme} message="Generating your insight..." />
      )}

      {phase === 'playback' && insightData && (
        <InsightPlayback
          insightData={insightData}
          ttsApiKey={ttsApiKey}
          theme={theme}
          onDone={handlePlaybackDone}
        />
      )}

      <Dialog
        open={showCloseDialog}
        onClose={cancelClose}
        title="Leave insight?"
        theme={theme}
        closeOnBackdrop={false}
        actions={[
          { label: 'Leave', onClick: confirmClose, primary: true },
          { label: 'Stay', onClick: cancelClose },
        ]}
      >
        <p>Your progress will be lost.</p>
      </Dialog>
    </div>
  );

  return createPortal(content, document.body);
};

export default InsightFlow;
