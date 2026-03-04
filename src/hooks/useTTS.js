import { useState, useEffect } from 'react';
import { onTTSEvent, offTTSEvent } from '../utils/tts';

export function useTTS() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({ elapsed: 0, total: 0, percent: 0 });
  const [sentences, setSentences] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = (evt) => {
      switch (evt.type) {
        case 'status':
          setStatus(evt.data.status);
          if (evt.data.status === 'streaming') { setError(null); setStats(null); }
          break;
        case 'progress': setProgress(evt.data); break;
        case 'transcript': setSentences(evt.data.sentences); break;
        case 'stats': setStats(evt.data); break;
        case 'error': setError(evt.data.message); break;
      }
    };
    onTTSEvent(handler);
    return () => offTTSEvent(handler);
  }, []);

  return { status, progress, sentences, stats, error };
}
