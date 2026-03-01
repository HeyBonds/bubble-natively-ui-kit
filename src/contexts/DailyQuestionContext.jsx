import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNativelyStorage } from '../hooks/useNativelyStorage';
import { sendToBubble } from '../utils/bubble';

const STORAGE_KEY = 'bonds_daily_question';

const DEFAULT_DQ = {
    category: '',
    question: '',
    options: [],
    selectedAnswer: null,
    date: null, // ISO date string, e.g. '2026-03-01'
};

const DailyQuestionContext = createContext(DEFAULT_DQ);

export const useDailyQuestion = () => useContext(DailyQuestionContext);

const todayStr = () => new Date().toISOString().slice(0, 10);

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

    // Full replace — Bubble sends the entire daily question object
    // Date is auto-stamped to today (fresh data = today's question)
    const setDailyQuestion = useCallback((data) => {
        const sa = data.selectedAnswer;
        let opts = data.options || [];
        if (typeof opts === 'string') { try { opts = JSON.parse(`[${opts}]`); } catch { opts = []; } }
        const next = { ...DEFAULT_DQ, ...data, date: todayStr(), options: opts, selectedAnswer: sa != null && sa !== '' ? sa : null };
        setDq(next);
        persist(next);
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
    }, []);

    const isStale = dq.date !== todayStr();

    // Expose to Bubble
    useEffect(() => {
        window.appUI = window.appUI || {};
        window.appUI.setDailyQuestion = setDailyQuestion;
        return () => { delete window.appUI.setDailyQuestion; };
    }, [setDailyQuestion]);

    return (
        <DailyQuestionContext.Provider value={{ ...dq, isStale, setDailyQuestion, markAnswered, clearDailyQuestion, fetchIfStale }}>
            {children}
        </DailyQuestionContext.Provider>
    );
};
