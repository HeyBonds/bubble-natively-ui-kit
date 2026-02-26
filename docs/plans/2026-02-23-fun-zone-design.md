# Fun Zone Section Design

## Overview
Replace the Fun tab placeholder in MainTabs with a Duolingo-inspired scrollable screen containing a Daily Question hero banner and activity cards.

## Structure

### 1. Daily Question Banner (hero card, top)
- Brand gradient background (`from-[#AD256C] to-[#E76B0C]`)
- **Unanswered state**: question text, pulsing "+1 coin" badge, "Answer Now" CTA. Breathing glow effect.
- **Answered state**: muted/desaturated, checkmark, "Completed" label. Still tappable to review.
- Tap → `push('daily-question', { category, question, options, ... })`

### 2. Activities Section (stacked cards below)
- Section header: "Activities"
- Three hardcoded cards: Funky Date, Dialogue Starter, Gift Inspiration
- Each card: name + emoji, subtitle "Answer 3 questions to generate", circular "4 CREDITS" badge on right
- Glassmorphism purple cards with gradient background
- Staggered slide-up + fade-in animation on mount (100ms offset per card)
- Tap → `push('activity-detail', { activityId })` (placeholder detail screen)

## Props
```
FunZoneSection:
  - theme (dark/light)
  - push / pop (stack navigation)
  - userProps (credits, userName)
  - dailyQuestion: { category, question, options, selectedAnswer }
```

## Navigation
- Lives inside the Fun tab of MainTabs (replaces PlaceholderSection)
- DQ banner pushes DailyQuestion component into Fun tab stack
- Activity cards push a placeholder activity-detail view into stack

## Bubble Communication
- `sendToBubble('bubble_fn_fun', 'open_activity', { activityId })`
- `sendToBubble('bubble_fn_fun', 'open_daily_question')`

## Animations
- Cards: staggered fade+slide-in on mount
- DQ banner: breathing glow when unanswered
- Card press: scale-down (btn-pressed)

## Data
- Activities hardcoded for now, will wire to Bubble props later
- DQ data passed via props from MainTabs
