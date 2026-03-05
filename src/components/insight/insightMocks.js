/**
 * Insight Mock Data — toggle INSIGHT_MOCK_ENABLED to bypass Bubble.
 *
 * When enabled, InsightFlow self-responds to its own Bubble callbacks
 * after realistic delays. No code changes needed elsewhere.
 *
 * Set to `false` (or delete this file's usage) when Bubble is ready.
 */
export const INSIGHT_MOCK_ENABLED = true;

// Bubble CDN — already a trusted host in Natively
const V1 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711632753753x828041153237036000/pexels-rodnae-productions-8230614%20%28360p%29.mp4';
const V2 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711632678992x377672133566015800/pexels-cottonbro-7496175%20%28360p%29.mp4';
const V3 = 'https://4240869bec55ba9919a61b94d2a6974f.cdn.bubble.io/f1711631963407x465209335449551900/pexels-cottonbro-5329478%20%28360p%29.mp4';

const MOCK_QUESTIONS = [
  {
    id: 'q1',
    text: 'Do you and your partner share your daily highs and lows with each other?',
    videoUrl: V1,
  },
  {
    id: 'q2',
    text: 'When was the last time you tried something completely new together?',
    videoUrl: V2,
  },
  {
    id: 'q3',
    text: 'Do you feel comfortable being vulnerable around your partner?',
    videoUrl: V3,
  },
];

const MOCK_INSIGHT = {
  insightId: 'mock-insight-1',
  title: 'Communication & Connection',
  text: 'Your answers suggest a strong foundation of emotional openness in your relationship. Sharing daily experiences builds a habit of connection that many couples overlook. The willingness to try new things together indicates a growth mindset as a couple. However, vulnerability can always be deepened. Consider setting aside ten minutes each evening for uninterrupted conversation without screens. Small rituals of connection compound over time into something extraordinary.',
  videoUrl: V1,
  audioUrl: null,
};

const MOCK_GENERATE_DELAY = 2500;
const MOCK_QUESTIONS_DELAY = 800;

export function setupInsightMocks() {
  if (!INSIGHT_MOCK_ENABLED) return;

  // Intercept sendToBubble calls for insight
  const origSend = window.BubbleBridge?.send;
  if (!origSend) return;

  const mockSend = (fnName, payload) => {
    if (fnName !== 'bubble_fn_insight') {
      origSend(fnName, payload);
      return;
    }

    const action = payload.output1;
    console.log(`🧪 [MOCK] bubble_fn_insight / ${action}`, JSON.parse(payload.output2 || '{}'));

    if (action === 'fetch_questions') {
      setTimeout(() => {
        if (window.appUI.onInsightQuestions) {
          window.appUI.onInsightQuestions({
            questions: MOCK_QUESTIONS,
            ttsApiKey: getMockTtsApiKey(),
          });
        }
      }, MOCK_QUESTIONS_DELAY);
      return;
    }

    if (action === 'generate') {
      setTimeout(() => {
        if (window.appUI.onInsightData) {
          window.appUI.onInsightData(MOCK_INSIGHT);
        }
      }, MOCK_GENERATE_DELAY);
      return;
    }

    // Other actions (answer, playback_complete, closed) — just log
  };

  window.BubbleBridge.send = mockSend;
  console.log('🧪 Insight mocks ENABLED — set INSIGHT_MOCK_ENABLED = false to disable');

  // Return teardown
  return () => {
    window.BubbleBridge.send = origSend;
  };
}

function getMockTtsApiKey() {
  try {
    const raw = localStorage.getItem('bonds_simulator_templates');
    return raw ? JSON.parse(raw).ttsApiKey : null;
  } catch { return null; }
}
