# User Data Sync Design

## Problem
React app uses hardcoded mock user data. Need to sync real user data from Bubble to React.

## Approach
Bubble pushes user data to React via `window.appUI.setUserData()`. React stores it in a Context provider with local caching via NativelyStorage.

## Data Structure

```js
{
  name: string,
  email: string,
  avatar: string | null,
  credits: number,
  partner: { name: string, avatar: string | null } | null,
  pillars: string[],
}
```

Default (empty): `{ name: '', email: '', avatar: null, credits: 0, partner: null, pillars: [] }`

## Architecture

### New file: `src/contexts/UserContext.jsx`
- `UserProvider` wraps the app in App.jsx
- On mount, loads cached user from NativelyStorage (`bonds_user_data` key)
- Exposes `window.appUI.setUserData(data)` — Bubble calls this
- `setUserData` does shallow merge (supports partial updates)
- Every update auto-persists to NativelyStorage
- Components call `useUser()` to read user data

### Bubble integration
- After login: `window.appUI.setUserData({ name, email, avatar, credits, partner, pillars })`
- On credit change: `window.appUI.setUserData({ credits: 12 })`
- On partner connect: `window.appUI.setUserData({ partner: { name, avatar } })`

### Cleanup on logout
`handleLogout` clears `bonds_user_data` from storage.

## Component migration

| Component | Before | After |
|-----------|--------|-------|
| App.jsx | Hardcoded `userProps`, passes down | Wraps in `UserProvider`, removes `userProps` |
| MainTabs.jsx | Receives `userProps`, has `MOCK_PROFILE` | `useUser()`, delete `MOCK_PROFILE` |
| HomeSection.jsx | Props: `userName`, `userAvatar`, `credits` | `useUser()` |
| DailyQuestion.jsx | Props: `userName`, `credits` | `useUser()` for name; keeps local credits state |
| JourneyPath.jsx | Props: `credits` | `useUser()` |
| FunZoneSection.jsx | Props via spread | `useUser()` |
| OnboardingFlow.jsx | No change | Keeps own local credits counter |
| SimulatorSection, SignInScreen, WelcomeScreen | No change | No user data needed |
