import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNativelyStorage } from '../hooks/useNativelyStorage';
import { sendToBubble } from '../utils/bubble';

const STORAGE_KEY = 'bonds_daily_question';

const DEFAULT_DQ = {
    questionId: null,
    category: '',
    question: '',
    options: [],
    selectedAnswer: null,
    date: null, // ISO date string, e.g. '2026-03-01'
};

const DailyQuestionContext = createContext(DEFAULT_DQ);

export const useDailyQuestion = () => useContext(DailyQuestionContext);

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DailyQuestionProvider = ({ children }) => {
    const [dq, setDq] = useState(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? { ...DEFAULT_DQ, ...JSON.parse(cached) } : DEFAULT_DQ;
        } catch {
            return DEFAULT_DQ;
        }
    });

    const { getItem, setItem, removeItem } = useNativelyStorage();
    const fetchedRef = useRef(false);

    // Hydrate from NativelyStorage (async recovery)
    useEffect(() => {
        getItem(STORAGE_KEY).then(val => {
            if (val) {
                try {
                    const parsed = { ...DEFAULT_DQ, ...JSON.parse(val) };
                    setDq(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
                } catch { /* ignore */ }
            }
        });
    }, [getItem]);

    // Persist helper
    const persist = useCallback((data) => {
        const json = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, json);
        setItem(STORAGE_KEY, json);
    }, [setItem]);

    // Partial merge — send only the fields that changed.
    // Date is auto-stamped to today (fresh data = today's question)
    const setDailyQuestion = useCallback((data) => {
        const overrides = {};
        if ('selectedAnswer' in data) {
            const sa = data.selectedAnswer;
            overrides.selectedAnswer = sa != null && sa !== '' ? sa : null;
        }
        if ('options' in data) {
            let opts = data.options || [];
            if (typeof opts === 'string') {
                try { opts = JSON.parse(opts); } catch {
                    try { opts = JSON.parse(`[${opts}]`); } catch { opts = []; }
                }
                if (!Array.isArray(opts)) opts = [];
            }
            if (opts.length && opts[0].index !== undefined) {
                opts.sort((a, b) => a.index - b.index);
            }
            overrides.options = opts;
        }
        setDq(prev => {
            const next = { ...prev, ...data, ...overrides, date: todayStr() };
            persist(next);
            return next;
        });
    }, [persist]);

    // Optimistic update for selectedAnswer (called locally after voting)
    const markAnswered = useCallback((answerIndex) => {
        setDq(prev => {
            const next = { ...prev, selectedAnswer: answerIndex };
            persist(next);
            return next;
        });
    }, [persist]);

    // Clear on logout
    const clearDailyQuestion = useCallback(() => {
        setDq(DEFAULT_DQ);
        localStorage.removeItem(STORAGE_KEY);
        removeItem(STORAGE_KEY);
    }, [removeItem]);

    // Request fresh data from Bubble (called by consumers when data is stale)
    // Deduped per session via fetchedRef — only fires once
    const fetchIfStale = useCallback(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        sendToBubble('bubble_fn_daily_question', 'fetch');
        // Allow retry if Bubble never responds
        setTimeout(() => { fetchedRef.current = false; }, 10000);
    }, []);

    const isStale = dq.date !== todayStr();

    // Expose to Bubble
    useEffect(() => {
        window.appUI = window.appUI || {};
        window.appUI.setDailyQuestion = setDailyQuestion;
        return () => { delete window.appUI.setDailyQuestion; };
    }, [setDailyQuestion]);

    const value = useMemo(() => ({
        ...dq, isStale, setDailyQuestion, markAnswered, clearDailyQuestion, fetchIfStale
    }), [dq, isStale, setDailyQuestion, markAnswered, clearDailyQuestion, fetchIfStale]);

    return (
        <DailyQuestionContext.Provider value={value}>
            {children}
        </DailyQuestionContext.Provider>
    );
};
