import React, { useState, useEffect, useCallback, useRef } from 'react';
import { track } from '../../utils/analytics';
import TTS from '../../utils/tts';
import InsightQuestions from '../insight/InsightQuestions';
import InsightLoader from '../insight/InsightLoader';
import InsightPlayback from '../insight/InsightPlayback';

// Bubble CDN video URLs (trusted Natively hosts)
const V1 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711632753753x828041153237036000/pexels-rodnae-productions-8230614%20%28360p%29.mp4';
const V2 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711632678992x377672133566015800/pexels-cottonbro-7496175%20%28360p%29.mp4';
const V3 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711631963407x465209335449551900/pexels-cottonbro-5329478%20%28360p%29.mp4';
const VIDEOS = [V1, V2, V3];
const INSIGHT_VIDEO = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1735211080655x840492595516242600/Generic%201St%20Insight%20Vid%20%281%29%20-%20smaller.mp4';

/**
 * InsightStep — Self-contained insight flow for journey chapters.
 *
 * Renders InsightQuestions → InsightLoader → InsightPlayback inline
 * (no portal — ChapterFlow already provides fullscreen context).
 * Uses chapter-specific mock data directly instead of intercepting BubbleBridge.
 *
 * Props:
 *  - chapter: chapter object
 *  - theme: theme object
 *  - onComplete: (coinsEarned) => void
 *  - onClose: () => void
 */
const InsightStep = ({ chapter, theme, onComplete, onClose }) => {
  const [phase, setPhase] = useState('questions'); // 'questions' | 'loading' | 'playback'
  const [questions] = useState(() =>
    chapter.content.insightQuestions.map((text, i) => ({
      id: `journey-q${i + 1}`,
      text,
      videoUrl: VIDEOS[i % VIDEOS.length],
    }))
  );
  const [answers, setAnswers] = useState([]);
  const [insightData, setInsightData] = useState(null);
  const generateTimerRef = useRef(null);

  useEffect(() => {
    track('Insight Flow Started', { type: 'journey', chapter: chapter.index });
    return () => clearTimeout(generateTimerRef.current);
  }, [chapter.index]);

  const handleAnswer = useCallback((answer) => {
    track('Insight Question Answered', { answer });
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (newAnswers.length >= questions.length) {
      setPhase('loading');
      // Mock generation delay
      generateTimerRef.current = setTimeout(() => {
        setInsightData({
          insightId: `journey-insight-${chapter.index}`,
          title: chapter.title + ' Insight',
          text: `Based on your reflections about ${chapter.title.toLowerCase()}, you show strong self-awareness. Continue exploring these patterns with your partner for deeper connection.`,
          videoUrl: INSIGHT_VIDEO,
          audioUrl: null,
        });
        setPhase('playback');
      }, 2500);
    }
  }, [answers, questions.length, chapter]);

  const handlePlaybackDone = useCallback(() => {
    track('Insight Playback Completed');
    TTS.stop();
    if (onComplete) onComplete(1);
  }, [onComplete]);

  const ins = theme.insight;

  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ background: ins.loaderBg }}
    >
      {phase === 'questions' && questions.length > 0 && (
        <InsightQuestions
          questions={questions}
          theme={theme}
          onAnswer={handleAnswer}
          onBack={onClose}
          onClose={onClose}
        />
      )}

      {phase === 'loading' && (
        <InsightLoader theme={theme} message="Generating your insight..." />
      )}

      {phase === 'playback' && insightData && (
        <InsightPlayback
          insightData={insightData}
          ttsApiKey={null}
          theme={theme}
          onDone={handlePlaybackDone}
        />
      )}
    </div>
  );
};

export default InsightStep;
