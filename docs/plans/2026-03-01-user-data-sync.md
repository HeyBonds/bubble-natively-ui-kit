# User Data Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace hardcoded mock user data with real Bubble-synced user data via React Context.

**Architecture:** `UserProvider` wraps the app, loads cached user from NativelyStorage on mount, exposes `window.appUI.setUserData()` for Bubble to push updates. Components call `useUser()` to read user data. Partial updates are shallow-merged.

**Tech Stack:** React Context, NativelyStorage (existing `useNativelyStorage` hook)

---

### Task 1: Create UserContext

**Files:**
- Create: `src/contexts/UserContext.jsx`

**Step 1: Create the context, provider, and hook**

```jsx
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
        // Instant hydration from localStorage (sync)
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

    // Hydrate from NativelyStorage (async, may recover data after OS clears localStorage)
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

    // Persist helper
    const persist = useCallback((data) => {
        const json = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, json);
        setItem(STORAGE_KEY, json);
    }, [setItem]);

    // Shallow merge update — supports partial updates like { credits: 5 }
    const updateUser = useCallback((partial) => {
        setUser(prev => {
            const next = { ...prev, ...partial };
            persist(next);
            return next;
        });
    }, [persist]);

    // Clear on logout
    const clearUser = useCallback(() => {
        setUser(DEFAULT_USER);
        localStorage.removeItem(STORAGE_KEY);
        removeItem(STORAGE_KEY);
    }, [removeItem]);

    // Register window.appUI.setUserData for Bubble to call
    useEffect(() => {
        window.appUI = window.appUI || {};
        window.appUI.setUserData = updateUser;
        return () => { delete window.appUI.setUserData; };
    }, [updateUser]);

    return (
        <UserContext.Provider value={{ ...user, updateUser, clearUser }}>
            {children}
        </UserContext.Provider>
    );
};
```

**Step 2: Verify**

Run: `npx eslint src/contexts/UserContext.jsx`
Expected: 0 errors

---

### Task 2: Wire UserProvider into App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import**

```js
import { UserProvider, useUser } from './contexts/UserContext';
```

**Step 2: Wrap the entire return in UserProvider**

The `UserProvider` must wrap everything (including loading state) so that `window.appUI.setUserData` is registered early.

Change the App component to split into `AppInner` (current logic) wrapped by `UserProvider`:

```jsx
const App = () => (
    <UserProvider>
        <AppInner />
    </UserProvider>
);
```

Move all current App logic into `AppInner`. Inside `AppInner`, call `const { clearUser } = useUser();` and use `clearUser()` in `handleLogout`.

**Step 3: Remove hardcoded userProps**

Delete the entire `userProps` object (lines ~220-230 with userName, userAvatar, credits, dailyQuestion).

**Step 4: Remove userProps from MainTabs**

Change:
```jsx
<MainTabs userProps={userProps} onLogout={handleLogout} />
```
To:
```jsx
<MainTabs onLogout={handleLogout} />
```

**Step 5: Update handleLogout to clear user data**

Add `clearUser()` call alongside existing storage cleanup. Also remove `bonds_user_data` from the NativelyStorage removes.

**Step 6: Verify**

Run: `npx eslint src/App.jsx`
Expected: 0 errors

---

### Task 3: Migrate MainTabs

**Files:**
- Modify: `src/components/MainTabs.jsx`

**Step 1: Import useUser, remove userProps**

```js
import { useUser } from '../contexts/UserContext';
```

**Step 2: Delete MOCK_PROFILE constant** (lines 43-48)

**Step 3: Update ProfileSection**

Change signature from `({ theme, darkModePref, setDarkModePref, onLogout })` — add `useUser()` inside:

```js
const ProfileSection = ({ theme, darkModePref, setDarkModePref, onLogout }) => {
  const glass = glassStyle(theme);
  const { name, email, partner, pillars } = useUser();
  // ... rest uses name, email, partner, pillars directly (was profile.name, profile.email, etc.)
```

Update all references: `profile.name` → `name`, `profile.email` → `email`, `profile.pillars` → `pillars`, `profile.partner` → `partner`. The partner card already handles the null case visually.

**Step 4: Update MainTabs signature and renderView**

Change `const MainTabs = ({ userProps, onLogout })` → `const MainTabs = ({ onLogout })`.

Remove `...userProps` from `commonProps`:

```js
const commonProps = {
    push,
    pop,
    theme: t,
    ...currentViewProps
};
```

**Step 5: Verify**

Run: `npx eslint src/components/MainTabs.jsx`
Expected: 0 errors

---

### Task 4: Migrate HomeSection

**Files:**
- Modify: `src/components/HomeSection.jsx`

**Step 1: Import useUser, update signature**

```js
import { useUser } from '../contexts/UserContext';

const HomeSection = ({ push }) => {
    const { name, avatar, credits } = useUser();
```

**Step 2: Update references**

- `userName` → `name`
- `userAvatar` → `avatar`
- `credits` stays as-is (same name from destructure)

**Step 3: Verify**

Run: `npx eslint src/components/HomeSection.jsx`
Expected: 0 errors

---

### Task 5: Migrate JourneyPath

**Files:**
- Modify: `src/components/JourneyPath.jsx`

**Step 1: Import useUser, update signature**

```js
import { useUser } from '../contexts/UserContext';

const JourneyPath = ({ theme }) => {
    const { credits } = useUser();
```

Remove `credits = 0` from the parameter list.

**Step 2: Verify**

Run: `npx eslint src/components/JourneyPath.jsx`
Expected: 0 errors

---

### Task 6: Migrate DailyQuestion

**Files:**
- Modify: `src/components/DailyQuestion.jsx`

**Step 1: Import useUser, update signature**

```js
import { useUser } from '../contexts/UserContext';
```

Change the destructured props — remove `userName` and `credits: initialCredits`, get them from context:

```js
const DailyQuestion = ({ category, question, options, selectedAnswer: initialSelectedAnswer, theme, pop: _pop }) => {
    const { name: userName, credits: userCredits } = useUser();
    const [credits, setCredits] = useState(userCredits || 0);
```

This keeps the local credits state (DailyQuestion has its own increment animation) but seeds it from the user context instead of props.

**Step 2: Verify**

Run: `npx eslint src/components/DailyQuestion.jsx`
Expected: 0 errors

---

### Task 7: Final verification and build

**Step 1: Full lint**

Run: `npx eslint src/`
Expected: 0 errors, 0 warnings

**Step 2: Build**

Run: `npm run build`
Expected: No errors, version hash stamped

**Step 3: Verify in preview**

Run: `npm run dev`
Open: `http://localhost:8000/preview/index.html`

Check:
- App loads without errors in console
- Profile section shows empty/default user data (no more mock "Testjan28")
- Open browser console, run: `window.appUI.setUserData({ name: 'Ido', email: 'ido@test.com', credits: 10, pillars: ['Trust'] })`
- Profile section updates reactively with the new data
- Refresh page — cached data loads instantly
