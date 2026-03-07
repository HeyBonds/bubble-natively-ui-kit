import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { track } from '../../utils/analytics';
import Dialog from '../Dialog';
import LearnStep from './LearnStep';
import PracticeStep from './PracticeStep';
import InsightStep from './InsightStep';
import ActStep from './ActStep';

/**
 * ChapterFlow — Fullscreen portal orchestrator for journey step playback.
 *
 * Portal target mirrors InsightFlow: prefer #app-content-area (preview) →
 * #app-root (production) → body. Uses position:absolute when inside a
 * container (avoids the transform-breaks-fixed issue) and position:fixed
 * only when portaling to body.
 *
 * Props:
 *  - chapter: chapter object from mockJourneyData (with content)
 *  - nodeType: 'learn' | 'practice' | 'insight' | 'act'
 *  - theme: theme object
 *  - onStepComplete: (nodeType, coinsEarned) => void
 *  - onClose: () => void
 */
const ChapterFlow = ({ chapter, nodeType, theme, onStepComplete, onClose }) => {
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  useEffect(() => {
    track('Journey Step Started', { step_type: nodeType, chapter: chapter.index, chapter_title: chapter.title });
  }, [nodeType, chapter.index, chapter.title]);

  // Same portal target as InsightFlow
  const portalTarget = useMemo(() =>
    document.getElementById('app-content-area')
    || document.getElementById('app-root')
    || document.body,
  []);

  // Ensure portal target is a positioned containing block
  useEffect(() => {
    if (portalTarget === document.body) return;
    const prev = portalTarget.style.position;
    portalTarget.style.position = 'relative';
    return () => { portalTarget.style.position = prev; };
  }, [portalTarget]);

  const handleStepDone = useCallback((coins) => {
    track('Journey Step Completed', { step_type: nodeType, chapter: chapter.index, coins });
    if (onStepComplete) onStepComplete(nodeType, coins);
    if (onClose) onClose();
  }, [nodeType, chapter.index, onStepComplete, onClose]);

  const handleClose = useCallback(() => {
    setShowCloseDialog(true);
  }, []);

  const confirmClose = useCallback(() => {
    track('Journey Step Abandoned', { step_type: nodeType, chapter: chapter.index });
    setShowCloseDialog(false);
    if (onClose) onClose();
  }, [nodeType, chapter.index, onClose]);

  const cancelClose = useCallback(() => {
    setShowCloseDialog(false);
  }, []);

  const renderStep = () => {
    const common = { chapter, theme, onComplete: handleStepDone, onClose: handleClose };

    switch (nodeType) {
      case 'learn':
        return <LearnStep {...common} />;
      case 'practice':
        return <PracticeStep {...common} />;
      case 'insight':
        return <InsightStep {...common} />;
      case 'act':
        return <ActStep {...common} />;
      default:
        return null;
    }
  };

  const positionStyle = portalTarget === document.body ? 'fixed' : 'absolute';

  const content = (
    <div
      style={{
        position: positionStyle,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
        background: theme.bg,
      }}
    >
      {renderStep()}

      <Dialog
        open={showCloseDialog}
        onClose={cancelClose}
        title="Leave step?"
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

  return createPortal(content, portalTarget);
};

export default ChapterFlow;
