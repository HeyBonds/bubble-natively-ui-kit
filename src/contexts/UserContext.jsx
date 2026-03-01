import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNativelyStorage } from '../hooks/useNativelyStorage';

const STORAGE_KEY = 'bonds_user_data';

const DEFAULT_USER = {
    name: '',
    email: '',
    avatar: null,
    credits: 0,
    partner: null,
    pillars: [],
};

const UserContext = createContext(DEFAULT_USER);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? { ...DEFAULT_USER, ...JSON.parse(cached) } : DEFAULT_USER;
        } catch {
            return DEFAULT_USER;
        }
    });

    const { getItem, setItem, removeItem } = useNativelyStorage();
    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        getItem(STORAGE_KEY).then(val => {
            if (val) {
                try {
                    const parsed = { ...DEFAULT_USER, ...JSON.parse(val) };
                    setUser(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
                } catch { /* ignore parse errors */ }
            }
        });
    }, [getItem]);

    const persist = useCallback((data) => {
        const json = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, json);
        setItem(STORAGE_KEY, json);
    }, [setItem]);

    const updateUser = useCallback((partial) => {
        setUser(prev => {
            const next = { ...prev, ...partial };
            persist(next);
            return next;
        });
    }, [persist]);

    const clearUser = useCallback(() => {
        setUser(DEFAULT_USER);
        localStorage.removeItem(STORAGE_KEY);
        removeItem(STORAGE_KEY);
    }, [removeItem]);

    useEffect(() => {
        window.appUI = window.appUI || {};
        window.appUI.setUserData = updateUser;
        return () => { delete window.appUI.setUserData; };
    }, [updateUser]);

    // Drain the whenReady command queue after all bridge functions are registered.
    // Parent effects run after child effects, so setLoginState (AppInner) and
    // setUserData (above) are both available by now.
    useEffect(() => {
        const q = window.appUI._q;
        if (q) {
            delete window.appUI._q;
            window.appUI.whenReady = function(fn) { fn(); };
            q.forEach(fn => fn());
        }
    }, []);

    return (
        <UserContext.Provider value={{ ...user, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};
