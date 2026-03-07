import { useState, useCallback, useMemo } from 'react';
import mockJourneyData from '../data/mockJourneyData';

const STORAGE_KEY = 'bonds_journey_progress';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedNodes: [], pausedUntil: null };
    const parsed = JSON.parse(raw);
    return {
      completedNodes: parsed.completedNodes || [],
      pausedUntil: parsed.pausedUntil || null,
    };
  } catch {
    return { completedNodes: [], pausedUntil: null };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * useJourneyState — manages journey node progress with localStorage persistence.
 *
 * Returns:
 *  - chapters: mockJourneyData.chapters with live status derived from progress
 *  - completeStep(chapterIdx, nodeType): marks node completed, advances next
 *  - activeChapter / activeNodeType: currently active chapter index + step type
 *  - resetProgress(): clears all progress
 *  - skipPause(): removes the pausedUntil timer for current session
 */
export function useJourneyState() {
  const [progress, setProgress] = useState(loadProgress);

  const completedSet = useMemo(
    () => new Set(progress.completedNodes),
    [progress.completedNodes]
  );

  const chapters = useMemo(() => {
    const isPaused = progress.pausedUntil && Date.now() < progress.pausedUntil;

    return mockJourneyData.chapters.map((chapter, chapterIdx) => {
      // Check if all previous chapters are fully completed
      const prevChaptersComplete = chapterIdx === 0 || mockJourneyData.chapters
        .slice(0, chapterIdx)
        .every((ch) => ch.nodes.every((n) => completedSet.has(n.id)));

      // Check if all 4 step nodes (non-milestone) in this chapter are completed
      const allStepsDone = chapter.nodes
        .filter((n) => n.type !== 'milestone')
        .every((n) => completedSet.has(n.id));

      let foundCurrent = false;

      const nodes = chapter.nodes.map((node) => {
        if (completedSet.has(node.id)) {
          return { ...node, status: 'completed' };
        }

        // Milestone auto-completes when all 4 steps in this chapter are done
        if (node.type === 'milestone' && allStepsDone && prevChaptersComplete) {
          return { ...node, status: 'completed' };
        }

        if (!foundCurrent && prevChaptersComplete) {
          foundCurrent = true;
          // Pause applies to the first non-completed node of a NEW chapter
          // (i.e. when entering the chapter after completing previous chapter's act)
          if (isPaused && !chapter.nodes.some((n) => n.type !== 'milestone' && completedSet.has(n.id))) {
            return { ...node, status: 'paused' };
          }
          return { ...node, status: 'current' };
        }

        return { ...node, status: 'locked' };
      });

      return { ...chapter, nodes };
    });
  }, [completedSet, progress.pausedUntil]);

  // Derive active chapter and node type
  const { activeChapter, activeNodeType } = useMemo(() => {
    for (let i = 0; i < chapters.length; i++) {
      const currentNode = chapters[i].nodes.find(
        (n) => n.status === 'current' || n.status === 'paused'
      );
      if (currentNode) {
        return { activeChapter: i, activeNodeType: currentNode.type };
      }
    }
    return { activeChapter: 0, activeNodeType: 'learn' };
  }, [chapters]);

  const completeStep = useCallback((chapterIdx, nodeType) => {
    setProgress((prev) => {
      const chapter = mockJourneyData.chapters[chapterIdx];
      if (!chapter) return prev;

      const node = chapter.nodes.find((n) => n.type === nodeType);
      if (!node) return prev;

      const alreadyCompleted = prev.completedNodes.includes(node.id);
      if (alreadyCompleted) return prev;

      const newCompleted = [...prev.completedNodes, node.id];

      // If act step completed, also auto-complete the milestone
      if (nodeType === 'act') {
        const milestone = chapter.nodes.find((n) => n.type === 'milestone');
        if (milestone && !newCompleted.includes(milestone.id)) {
          newCompleted.push(milestone.id);
        }
      }

      const next = {
        completedNodes: newCompleted,
        pausedUntil: prev.pausedUntil,
      };

      // If act step was completed, set pausedUntil to next midnight
      if (nodeType === 'act') {
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        next.pausedUntil = tomorrow.getTime();
      }

      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = { completedNodes: [], pausedUntil: null };
    saveProgress(fresh);
    setProgress(fresh);
  }, []);

  const skipPause = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev, pausedUntil: null };
      saveProgress(next);
      return next;
    });
  }, []);

  return { chapters, completeStep, activeChapter, activeNodeType, resetProgress, skipPause };
}
