# Daily Question Real Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace standalone Bubble-page daily question with context-driven real data inside MainTabs, following the same pattern as UserContext.

**Architecture:** `DailyQuestionProvider` wraps the app alongside `UserProvider`. Loads cached question from localStorage/NativelyStorage on mount, exposes `window.appUI.setDailyQuestion()` for Bubble to push data. Components call `useDailyQuestion()` to read question data. FunZoneSection and DailyQuestion both consume from context instead of props. Standalone `mountDailyQuestion` still works for deep links by wrapping in providers.

**Tech Stack:** React Context, NativelyStorage (existing `useNativelyStorage` hook)

---

### Task 1: Create DailyQuestionContext

**Files:**
- Create: `src/contexts/DailyQuestionContext.jsx`

**Step 1: Create the context, provider, and hook**

Follow the exact same pattern as `src/contexts/UserContext.jsx`.

```jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNativelyStorage } from '../hooks/useNativelyStorage';

const STORAGE_KEY = 'bonds_daily_question';

const DEFAULT_DQ = {
    category: '',
    question: '',
    options: [],
    selectedAnswer: null,
};

const DailyQuestionContext = createContext(DEFAULT_DQ);

export const useDailyQuestion = () => useContext(DailyQuestionContext);

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
    const setDailyQuestion = useCallback((data) => {
        const next = { ...DEFAULT_DQ, ...data };
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

    // Expose to Bubble
    useEffect(() => {
        window.appUI = window.appUI || {};
        window.appUI.setDailyQuestion = setDailyQuestion;
        return () => { delete window.appUI.setDailyQuestion; };
    }, [setDailyQuestion]);

    return (
        <DailyQuestionContext.Provider value={{ ...dq, setDailyQuestion, markAnswered, clearDailyQuestion }}>
            {children}
        </DailyQuestionContext.Provider>
    );
};
```

**Step 2: Verify**

Run: `npx eslint src/contexts/DailyQuestionContext.jsx`
Expected: 0 errors

---

### Task 2: Wire DailyQuestionProvider into App.jsx

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add import**

```js
import { DailyQuestionProvider } from './contexts/DailyQuestionContext';
```

**Step 2: Wrap App in DailyQuestionProvider alongside UserProvider**

Change the `App` component at the bottom of the file from:

```jsx
const App = () => (
    <UserProvider>
        <AppInner />
    </UserProvider>
);
```

To:

```jsx
const App = () => (
    <UserProvider>
        <DailyQuestionProvider>
            <AppInner />
        </DailyQuestionProvider>
    </UserProvider>
);
```

`DailyQuestionProvider` must be inside `UserProvider` so that the `whenReady` queue drain (which runs in UserProvider's effect — the outermost provider) fires after `setDailyQuestion` is registered.

**Step 3: Clear daily question on logout**

In `AppInner`, import and call `clearDailyQuestion` in `handleLogout`:

```js
const { clearUser } = useUser();
const { clearDailyQuestion } = useDailyQuestion();
```

Add `clearDailyQuestion()` to `handleLogout` alongside `clearUser()`.

**Step 4: Verify**

Run: `npx eslint src/App.jsx`
Expected: 0 errors

---

### Task 3: Migrate FunZoneSection to use context

**Files:**
- Modify: `src/components/FunZoneSection.jsx`

**Step 1: Import useDailyQuestion, remove prop**

```js
import { useDailyQuestion } from '../contexts/DailyQuestionContext';
```

**Step 2: Update FunZoneSection signature**

Change:
```js
const FunZoneSection = ({ theme, push, dailyQuestion }) => {
```
To:
```js
const FunZoneSection = ({ theme, push }) => {
  const dailyQuestion = useDailyQuestion();
```

The rest of the component stays the same — `dailyQuestion` is now from context instead of props, same shape.

**Step 3: Update DailyQuestionBanner — handle empty state**

The banner currently checks `dailyQuestion?.selectedAnswer`. With context, `dailyQuestion` is always an object (never null), but `question` may be empty string if Bubble hasn't pushed data yet.

Add an early return in `DailyQuestionBanner` for when no question is available:

```js
const DailyQuestionBanner = ({ dailyQuestion, push, theme: _theme }) => {
  const isAnswered = dailyQuestion?.selectedAnswer !== undefined && dailyQuestion?.selectedAnswer !== null;

  // No question loaded yet — hide banner entirely
  if (!dailyQuestion?.question) return null;
```

**Step 4: Verify**

Run: `npx eslint src/components/FunZoneSection.jsx`
Expected: 0 errors

---

### Task 4: Migrate DailyQuestion to use context

**Files:**
- Modify: `src/components/DailyQuestion.jsx`

**Step 1: Import useDailyQuestion**

```js
import { useDailyQuestion } from '../contexts/DailyQuestionContext';
```

**Step 2: Update component to read from context instead of props**

Change signature from:
```js
const DailyQuestion = ({ category, question, options, selectedAnswer: initialSelectedAnswer, theme, pop: _pop }) => {
```
To:
```js
const DailyQuestion = ({ theme, pop: _pop }) => {
    const { category, question, options, selectedAnswer: initialSelectedAnswer, markAnswered } = useDailyQuestion();
```

**Step 3: Optimistic update on vote**

In `handleVote`, after the existing `sendToBubble` call, add `markAnswered` to update context (so the FunZoneSection banner reflects the answered state when user navigates back):

```js
const handleVote = (answerText, index) => {
    if (isVoted) return;

    setIsVoted(true);
    setSelectedAnswer(index);

    addTimer(() => {
        setShowFooterAfter(true);
    }, 800);

    sendToBubble('bubble_fn_daily_question', 'vote', { answer: answerText, index });
    markAnswered(index);  // ← Add this line

    addTimer(() => {
        triggerCreditAnimation();
    }, 2000);
};
```

**Step 4: Verify**

Run: `npx eslint src/components/DailyQuestion.jsx`
Expected: 0 errors

---

### Task 5: Clean up MainTabs — remove dailyQuestion prop drilling

**Files:**
- Modify: `src/components/MainTabs.jsx`

**Step 1: Verify no dailyQuestion prop passing**

MainTabs currently passes `{...commonProps}` to FunZoneSection. Since `commonProps` is built from `currentViewProps` (stack navigation props), and `dailyQuestion` is no longer a prop on FunZoneSection, no changes should be needed here.

Confirm that `dailyQuestion` does not appear anywhere in MainTabs.jsx (it shouldn't — the exploration confirmed this).

**Step 2: Verify**

Run: `npx eslint src/components/MainTabs.jsx`
Expected: 0 errors

---

### Task 6: Update standalone mount for deep links

**Files:**
- Modify: `src/index.jsx`

**Step 1: Update mountDailyQuestion to wrap in providers**

The standalone `mountDailyQuestion` needs providers so `useDailyQuestion()` and `useUser()` work:

```js
import { UserProvider } from './contexts/UserContext';
import { DailyQuestionProvider } from './contexts/DailyQuestionContext';
```

Change:
```js
window.appUI.mountDailyQuestion = (container, props = {}) => {
    const root = createRoot(container);
    root.render(<DailyQuestion {...props} />);
    return root;
};
```

To:
```js
window.appUI.mountDailyQuestion = (container, props = {}) => {
    const root = createRoot(container);
    root.render(
        <UserProvider>
            <DailyQuestionProvider>
                <DailyQuestion {...props} />
            </DailyQuestionProvider>
        </UserProvider>
    );
    return root;
};
```

Note: DailyQuestion no longer takes question data as props (it reads from context). For the standalone mount, Bubble should call `setDailyQuestion` before or after mount — the context will hydrate from cache or from the Bubble push.

**Step 2: Verify**

Run: `npx eslint src/index.jsx`
Expected: 0 errors

---

### Task 7: Update storage cleanup

**Files:**
- Modify: `src/index.jsx`

**Step 1: Add `bonds_daily_question` to resetAllStorage**

In the `resetAllStorage` function (around line 27), add `'bonds_daily_question'` to the keys array:

```js
const keys = ['bonds_session_active', 'bonds_device_id', 'onboarding_complete', 'onboarding_state', 'credits_intro_seen', 'bonds_user_data', 'bonds_daily_question'];
```

**Step 2: Update SEO doc**

In `docs/bubble-seo-snippets.html`, add `'bonds_daily_question'` to the Storage Dump snippet's keys array.

**Step 3: Verify**

Run: `npx eslint src/`
Expected: 0 errors, 0 warnings

---

### Task 8: Final verification and build

**Step 1: Full lint**

Run: `npx eslint src/`
Expected: 0 errors

**Step 2: Build**

Run: `npm run build`
Expected: No errors, version hash stamped

**Step 3: Verify in preview**

Run: `npm run dev`
Open: `http://localhost:8000/preview/index.html`

Check:
- App loads without console errors
- Fun tab shows no daily question banner (no data pushed yet)
- Open console, run: `window.appUI.setDailyQuestion({ category: 'Communication', question: 'How often do you check in with your partner?', options: [{ text: 'Every day', index: 1, percent: 45 }, { text: 'A few times a week', index: 2, percent: 30 }, { text: 'Once a week', index: 3, percent: 15 }, { text: 'Rarely', index: 4, percent: 10 }] })`
- Banner appears in Fun tab with question text
- Tap banner → navigates to DailyQuestion screen with correct data
- Vote on an option → banner shows "Completed!" when navigating back
- Refresh page → cached data loads instantly, answered state preserved

---

### Bubble-side changes (for reference)

Replace the standalone DailyQuestion page mount with a `whenReady` call on the main app page:

```javascript
window.appUI.whenReady(function() {
    window.appUI.setDailyQuestion({
        category: /* Daily Question's topic */,
        question: /* Daily Question's question */,
        options: /* Daily Question's options as JSON array */,
        selectedAnswer: /* user's answer index or null */
    });
});
```

No more `setInterval` polling, no more `mountDailyQuestion`, no more separate page needed.
