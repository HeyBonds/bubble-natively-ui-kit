# Journey Tab & Navigation Redesign

**Date**: 2026-02-22
**Status**: Approved

## Summary

Replace the current 4-tab navigation (Home, Learn, Act, Ask) with a new 4-tab layout (Journey, Simulator, Fun, Profile). The Journey tab features a Duolingo-style winding S-curve path with interactive nodes. Other tabs render placeholders for now.

## Design Decisions

- **Approach**: Pure CSS positioning + SVG path (Approach A). No canvas, no heavy libs.
- **Aesthetic**: Matches onboarding dark gradient theme (`linear-gradient(160deg, #2E4695, #652664)`), glassmorphism, same fonts/colors.
- **Content**: Visual mock with placeholder data. Node content types TBD in future iteration.

## Navigation Bar

4 tabs in this order: Journey, Simulator, Fun, Profile.

- Same bottom bar style: `h-20`, `bg-[#1F1A2E]`, top border `border-white/10`.
- **Active state**: Pink pill background behind icon, label text below in `#FF2258`, shimmer animation.
- **Inactive state**: White/60 icon, no label.
- Fresh inline SVG icons: path/compass (Journey), chat bubbles (Simulator), gift/party (Fun), person (Profile).
- Journey is the default active tab.

## Journey Screen Layout

### Fixed Header
- "Your Journey" title + credits widget (reuse onboarding pattern).
- Current chapter name (e.g. "Chapter 1: Communication").

### Scrollable Path Area
- Onboarding gradient background.
- SVG `<path>` drawn as a winding S-curve connecting node centers using cubic bezier curves.
- 8-10 mock nodes positioned along the curve.
- Nodes snake: right-aligned -> center -> left-aligned -> center -> repeat.
- Vertical spacing ~120px between nodes.
- Path stroke: gradient from completed (pink `#FF2258`) to upcoming (`white/20`).

## Journey Node States

| State | Size | Visual |
|-------|------|--------|
| Completed | 56px circle | Solid pink fill, white checkmark, subtle glow |
| Current | 64px circle | Pulsing pink border, star/play icon, glow effect |
| Locked | 56px circle | Dark glass `bg-white/5`, lock icon, `border-white/20` |
| Milestone | 72px circle | Trophy/diamond icon, golden accent border, chapter divider |

Each node has a small label below (title like "Trust Basics") in `white/60`.

## Mock Data

```js
const mockJourneyData = {
  chapter: "Communication",
  chapterIndex: 1,
  nodes: [
    { id: 1, title: "Trust Basics", status: "completed" },
    { id: 2, title: "Active Listening", status: "completed" },
    { id: 3, title: "Love Languages", status: "completed" },
    { id: 4, title: "Milestone", status: "completed", milestone: true },
    { id: 5, title: "Open Questions", status: "current" },
    { id: 6, title: "Daily Check-in", status: "locked" },
    { id: 7, title: "Conflict Styles", status: "locked" },
    { id: 8, title: "Milestone", status: "locked", milestone: true },
  ]
};
```

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/components/JourneyPath.jsx` | Create | Main journey screen (header + scrollable path) |
| `src/components/JourneyNode.jsx` | Create | Individual node component (3 states + milestone) |
| `src/components/JourneyPathSVG.jsx` | Create | SVG curve rendering between nodes |
| `src/data/mockJourneyData.js` | Create | Mock chapter/nodes data |
| `src/components/MainTabs.jsx` | Modify | 4 new tabs, new icons, Journey as default |
| `preview/components.js` | Modify | Add Journey preview entry |
| `src/components/HomeSection.jsx` | Keep | No longer mounted, kept for reference |
