# Analytics Event Taxonomy

Reference for all Mixpanel events tracked in the app. Module: `src/utils/analytics.js`.

## Conventions

- **Event names**: Title Case, Object-Action, past tense (`Screen Viewed`, `Element Clicked`, `Daily Question Voted`)
- **Property names**: snake_case (`element_type`, `screen`, `activityId`)
- **Generic events**: Use for variations of the same action type (viewing screens, clicking UI elements)
- **Domain events**: Use for distinct business/funnel actions (voting, completing onboarding, starting a session)

Rule: if it's a funnel step or domain action → own event name. If it's a UI interaction → `Element Clicked` with properties.

## Super Properties (auto-attached to every event)

| Property | Values | Set by |
|----------|--------|--------|
| `app_version` | e.g. `v1.0.0-alpha-abc123` | `initAnalytics()` |
| `platform` | `ios` / `android` / `web` | `initAnalytics()` |
| `user_type` | `anonymous` / `authenticated` | `initAnalytics()` / `identifyUser()` |

## People Properties (user profile)

| Property | When set |
|----------|----------|
| `$name`, `$email` | `identifyUser()` |
| `coins` | Every `setUserData` call |
| `partner_connected` | Every `setUserData` call |
| `onboarding_complete` | `identifyUser()` |
| `signup_date` | `identifyUser()` via `set_once` |

---

## Generic Events

### Screen Viewed

Fires when a screen becomes visible. One event, `screen` property distinguishes which.

| Property | Values |
|----------|--------|
| `screen` | `welcome`, `signin`, `onboarding`, `journey`, `simulator`, `fun`, `profile` |

**Where:** App.jsx (phase transitions), MainTabs.jsx (initial tab + tab switches)

### Element Clicked

Fires on any UI interaction. Properties provide context.

| Property | Description |
|----------|-------------|
| `screen` | Which screen the element is on |
| `element_type` | `button`, `tab`, `banner`, `card`, `toggle`, `link` |
| `element` | Identifier for the specific element |
| *(extra)* | Additional context (e.g. `activityId`, `preference`) |

**Current elements:**

| Screen | Type | Element | Extra | File |
|--------|------|---------|-------|------|
| `welcome` | `button` | `lets_go` | — | WelcomeScreen |
| `welcome` | `button` | `sign_in` | — | WelcomeScreen |
| `signin` | `button` | `back` | — | SignInScreen |
| `main` | `tab` | `journey`/`simulator`/`fun`/`profile` | — | MainTabs |
| `{activeTab}` | `button` | `back` | — | MainTabs (stack) |
| `onboarding` | `button` | `back` | `step` | OnboardingFlow |
| `journey` | `button` | `chapter_menu` | — | JourneyPath |
| `journey` | `button` | `chapter_select` | `chapter` | JourneyPath |
| `journey` | `button` | `node` | `node_id`, `node_type` | JourneyPath |
| `journey` | `button` | `start_lesson` | `node_id` | JourneyPath (popover) |
| `journey` | `button` | `select_journey` | — | HomeSection |
| `journey` | `button` | `send`/`chat`/`notifications`/`previous_journey`/`next_journey`/`change_topic`/`conversation_coach`/`practical_actions`/`ask_question` | — | HomeSection |
| `fun` | `banner` | `daily_question` | — | FunZoneSection |
| `fun` | `card` | `activity` | `activityId`, `activityName` | FunZoneSection |
| `fun` | `card` | `learn_insight` | — | FunZoneSection |
| `daily_question` | `button` | `start_planning` | `questionId` | DailyQuestion |
| `insight_questions` | `button` | `back` | — | InsightQuestions |
| `insight_questions` | `button` | `close` | — | InsightQuestions |
| `insight_questions` | `button` | `mic` | — | InsightQuestions |
| `insight_questions` | `button` | `yes`/`no` | — | InsightQuestions |
| `insight_questions` | `button` | `nudge_continue` | — | InsightQuestions |
| `insight_questions` | `button` | `nudge_custom` | — | InsightQuestions |
| `insight_other` | `button` | `mic_start`/`mic_stop` | — | InsightOtherDialog |
| `insight_other` | `button` | `submit` | — | InsightOtherDialog |
| `insight_playback` | `button` | `play`/`pause` | — | InsightPlayback |
| `insight_playback` | `button` | `speed` | `speed` | InsightPlayback |
| `insight_playback` | `button` | `replay` | — | InsightPlayback |
| `insight_playback` | `button` | `feedback` | — | InsightPlayback |
| `insight_playback` | `button` | `continue` | — | InsightPlayback |
| `simulator_results` | `button` | `play`/`pause` | — | SimulatorResults |
| `simulator_results` | `button` | `speed` | `speed` | SimulatorResults |
| `simulator_results` | `button` | `replay` | — | SimulatorResults |
| `simulator_results` | `button` | `retry` | — | SimulatorResults |
| `simulator_results` | `button` | `done` | — | SimulatorResults |
| `simulator_results` | `link` | `read_more`/`read_less` | — | SimulatorResults |
| `profile` | `button` | `invite_partner` | — | MainTabs |
| `profile` | `button` | `delete_account` | — | MainTabs |
| `profile` | `toggle` | `dark_mode` | `preference` | MainTabs |

---

## Domain Events

### App Lifecycle

| Event | Properties | File |
|-------|------------|------|
| `App Opened` | — | App.jsx |
| `Logged Out` | — | App.jsx |

### Authentication

| Event | Properties | File |
|-------|------------|------|
| `Sign In Started` | `method` (google/apple) | SignInScreen |

### Onboarding

| Event | Properties | File |
|-------|------------|------|
| `Onboarding Step Completed` | `step`, `questionId`, `type` | OnboardingFlow |
| `Onboarding Completed` | `totalSteps`, `coins` | OnboardingFlow |
| `Onboarding Abandoned` | — | App.jsx |
| `Onboarding Resumed` | `step` | App.jsx |

### Daily Question

| Event | Properties | File |
|-------|------------|------|
| `Daily Question Viewed` | `questionId`, `category` | DailyQuestion |
| `Daily Question Voted` | `questionId`, `index` | DailyQuestion |

### Simulator

| Event | Properties | File |
|-------|------------|------|
| `Simulator Session Started` | — | SimulatorSection |
| `Simulator Session Completed` | `score`, `skillLevel` | SimulatorSection |
| `Simulator Session Closed` | — | SimulatorSection |
| `Simulator Session Retried` | — | SimulatorSection |
| `Simulator Session Error` | `code`, `message` | SimulatorSection |
| `Coins Deducted` | — | SimulatorSection |

### Insight Flow

| Event | Properties | File |
|-------|------------|------|
| `Insight Flow Started` | `type` (learn/activity), `activityId` | InsightFlow |
| `Insight Question Answered` | `answer` | InsightFlow |
| `Insight Generated` | `type` | InsightFlow |
| `Insight Flow Closed` | — | InsightFlow |
| `Insight Playback Completed` | — | InsightFlow |

---

## Adding New Events

### New UI interaction
```js
import { track } from '../utils/analytics';

track('Element Clicked', {
    screen: 'screen_name',
    element_type: 'button',  // button | tab | banner | card | toggle | link
    element: 'element_name',
    // ...extra context
});
```

### New domain event
```js
track('Object Action', { property: value });
// e.g. track('Partner Invited', { method: 'link' });
```

### Checklist
- [ ] Event name is Title Case, Object-Action, past tense
- [ ] Property names are snake_case
- [ ] Import `track` from `src/utils/analytics.js` (never import `mixpanel-browser` directly)
- [ ] UI interactions use `Element Clicked` with `screen`, `element_type`, `element`
- [ ] Business actions get their own event name
- [ ] Update this doc
