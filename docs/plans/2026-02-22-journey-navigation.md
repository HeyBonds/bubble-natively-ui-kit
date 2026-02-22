# Journey Tab & Navigation Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 4-tab navigation (Home/Learn/Act/Ask) with Journey/Simulator/Fun/Profile, featuring a Duolingo-style winding S-curve path on the Journey tab.

**Architecture:** Journey screen uses absolutely positioned React node components connected by an SVG cubic bezier path. Nodes have 4 states (completed/current/locked/milestone). The path is scrollable vertically. Other tabs are placeholders.

**Tech Stack:** React (aliased to Preact), Tailwind CSS 3, esbuild bundler. No new dependencies.

---

### Task 1: Create mock journey data

**Files:**
- Create: `src/data/mockJourneyData.js`

**Step 1: Create the data file**

```js
const mockJourneyData = {
    chapter: 'Communication',
    chapterIndex: 1,
    nodes: [
        { id: 1, title: 'Trust Basics', status: 'completed', icon: 'heart' },
        { id: 2, title: 'Active Listening', status: 'completed', icon: 'ear' },
        { id: 3, title: 'Love Languages', status: 'completed', icon: 'chat' },
        { id: 4, title: 'Milestone', status: 'completed', milestone: true, icon: 'trophy' },
        { id: 5, title: 'Open Questions', status: 'current', icon: 'star' },
        { id: 6, title: 'Daily Check-in', status: 'locked', icon: 'calendar' },
        { id: 7, title: 'Conflict Styles', status: 'locked', icon: 'lightning' },
        { id: 8, title: 'Milestone', status: 'locked', milestone: true, icon: 'diamond' },
        { id: 9, title: 'Boundaries', status: 'locked', icon: 'shield' },
        { id: 10, title: 'Gratitude', status: 'locked', icon: 'sparkle' },
    ],
};

export default mockJourneyData;
```

**Step 2: Commit**

```bash
git add src/data/mockJourneyData.js
git commit -m "feat: add mock journey data"
```

---

### Task 2: Create JourneyNode component

**Files:**
- Create: `src/components/JourneyNode.jsx`

**Step 1: Build the node component with 4 visual states**

The component renders a circular button with different visuals based on `status` and `milestone` props. It also renders a label below.

Position is controlled by the parent via `style` prop (absolute positioning).

```jsx
import React from 'react';

// Inline SVG icons for node states
const NodeIcons = {
    check: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    star: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    ),
    lock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    trophy: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22h10c0-2-0.85-3.25-2.03-3.79A1.09 1.09 0 0 1 14 17v-2.34" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
    diamond: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
            <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z" />
        </svg>
    ),
};

const JourneyNode = ({ node, style }) => {
    const { title, status, milestone } = node;
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isLocked = status === 'locked';

    // Size
    const size = milestone ? 72 : isCurrent ? 64 : 56;

    // Pick icon
    const icon = isCompleted
        ? (milestone ? NodeIcons.trophy : NodeIcons.check)
        : isCurrent
            ? NodeIcons.star
            : (milestone ? NodeIcons.diamond : NodeIcons.lock);

    // Circle styles
    const circleClass = isCompleted
        ? (milestone
            ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-[0_0_24px_rgba(255,215,0,0.4)]'
            : 'bg-[#FF2258] shadow-[0_0_20px_rgba(255,34,88,0.4)]')
        : isCurrent
            ? 'bg-[#FF2258]/20 border-2 border-solid border-[#FF2258] shadow-[0_0_24px_rgba(255,34,88,0.5)] animate-pulse-slow'
            : (milestone
                ? 'bg-white/5 border border-solid border-white/10'
                : 'bg-white/5 border border-solid border-white/10');

    return (
        <div className="absolute flex flex-col items-center" style={{
            ...style,
            width: size + 40,
            marginLeft: -(size + 40) / 2,
        }}>
            <button
                className={`rounded-full flex items-center justify-center transition-transform duration-200 ${circleClass} ${
                    isCurrent ? 'active:scale-95' : ''
                } ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
                style={{ width: size, height: size }}
                disabled={isLocked}
            >
                {icon}
            </button>
            <span className={`mt-2 text-[11px] font-jakarta font-medium text-center leading-tight ${
                isCompleted ? 'text-white/60' : isCurrent ? 'text-white' : 'text-white/30'
            }`}>
                {title}
            </span>
        </div>
    );
};

export default JourneyNode;
```

**Step 2: Commit**

```bash
git add src/components/JourneyNode.jsx
git commit -m "feat: add JourneyNode component with 4 visual states"
```

---

### Task 3: Create JourneyPathSVG component

**Files:**
- Create: `src/components/JourneyPathSVG.jsx`

**Step 1: Build the SVG path that connects node positions**

This component receives an array of `{ x, y }` node center positions and draws a smooth cubic bezier S-curve through them. The stroke transitions from pink (completed) to dim (locked) using a `<linearGradient>`.

```jsx
import React from 'react';

const JourneyPathSVG = ({ points, completedCount, totalHeight }) => {
    if (points.length < 2) return null;

    // Build cubic bezier path through points
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpOffset = Math.abs(curr.y - prev.y) * 0.4;
        // Control points: go straight down from prev, straight up to curr
        const cp1x = prev.x;
        const cp1y = prev.y + cpOffset;
        const cp2x = curr.x;
        const cp2y = curr.y - cpOffset;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    // Gradient stop: transition from completed to locked
    const gradientStop = completedCount > 0
        ? ((completedCount - 0.5) / (points.length - 1)) * 100
        : 0;

    return (
        <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: totalHeight }}
            viewBox={`0 0 375 ${totalHeight}`}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={`${gradientStop}%`} stopColor="#FF2258" stopOpacity="0.6" />
                    <stop offset={`${Math.min(gradientStop + 15, 100)}%`} stopColor="white" stopOpacity="0.08" />
                </linearGradient>
            </defs>
            <path
                d={d}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default JourneyPathSVG;
```

**Step 2: Commit**

```bash
git add src/components/JourneyPathSVG.jsx
git commit -m "feat: add JourneyPathSVG with cubic bezier S-curve"
```

---

### Task 4: Create JourneyPath main screen

**Files:**
- Create: `src/components/JourneyPath.jsx`

**Step 1: Build the main Journey screen**

This component renders the header (title + chapter), the scrollable path area with SVG + positioned nodes. Nodes follow an S-curve pattern: each row alternates horizontal position.

The S-curve positions use 3 columns: left (~25% / 94px), center (50% / 188px), right (~75% / 281px). Nodes snake: right → center → left → center → right → ... with `NODE_SPACING` vertical gap.

```jsx
import React, { useMemo } from 'react';
import JourneyNode from './JourneyNode';
import JourneyPathSVG from './JourneyPathSVG';
import mockJourneyData from '../data/mockJourneyData';

const NODE_SPACING = 120;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 80;

// S-curve horizontal positions (x center in 375px wide container)
const X_POSITIONS = [281, 188, 94, 188]; // right, center, left, center — then repeats

const JourneyPath = ({ credits = 0 }) => {
    const { chapter, chapterIndex, nodes } = mockJourneyData;

    // Compute node positions
    const { positions, totalHeight, completedCount } = useMemo(() => {
        const pos = nodes.map((node, i) => ({
            x: X_POSITIONS[i % X_POSITIONS.length],
            y: PADDING_TOP + i * NODE_SPACING,
        }));
        const completed = nodes.filter(n => n.status === 'completed').length;
        const height = PADDING_TOP + (nodes.length - 1) * NODE_SPACING + PADDING_BOTTOM;
        return { positions: pos, totalHeight: height, completedCount: completed };
    }, [nodes]);

    return (
        <div className="flex flex-col h-full w-full font-jakarta" style={{
            background: 'linear-gradient(160deg, #2E4695 0%, #652664 100%)',
        }}>
            {/* Header */}
            <div className="shrink-0 pt-[18px] pb-4 px-[18px]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-[20px] text-white leading-tight">
                            Your Journey
                        </h1>
                        <p className="text-white/50 text-[12px] font-medium mt-1">
                            Chapter {chapterIndex}: {chapter}
                        </p>
                    </div>
                    {/* Credits widget */}
                    <div className="relative h-9 rounded-full flex items-center border border-solid border-white/30 pl-1 pr-4 gap-2">
                        <div className="w-7 h-7 bg-[#FF2258] rounded-full flex items-center justify-center shadow-lg">
                            <span className="font-extrabold text-[11px] text-white tracking-wide leading-none">
                                {credits}
                            </span>
                        </div>
                        <span className="font-medium text-[10px] text-white/70 tracking-wide leading-none">
                            Credits
                        </span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/15" />

            {/* Scrollable Path */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="relative w-full" style={{ height: totalHeight }}>
                    {/* SVG connecting path */}
                    <JourneyPathSVG
                        points={positions}
                        completedCount={completedCount}
                        totalHeight={totalHeight}
                    />

                    {/* Nodes */}
                    {nodes.map((node, i) => (
                        <JourneyNode
                            key={node.id}
                            node={node}
                            style={{
                                left: positions[i].x,
                                top: positions[i].y,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JourneyPath;
```

**Step 2: Commit**

```bash
git add src/components/JourneyPath.jsx
git commit -m "feat: add JourneyPath main screen with S-curve layout"
```

---

### Task 5: Add `animate-pulse-slow` to CSS

**Files:**
- Modify: `src/input.css`

**Step 1: Add the slow pulse keyframe**

Add to the `@layer utilities` block in `src/input.css`, after the existing animation definitions:

```css
.animate-pulse-slow {
    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
    0%, 100% { box-shadow: 0 0 20px rgba(255, 34, 88, 0.5); }
    50% { box-shadow: 0 0 32px rgba(255, 34, 88, 0.8); }
}
```

**Step 2: Commit**

```bash
git add src/input.css
git commit -m "feat: add pulse-slow animation for current journey node"
```

---

### Task 6: Update MainTabs with new navigation

**Files:**
- Modify: `src/components/MainTabs.jsx`

**Step 1: Replace the full file**

Update imports, tab definitions, icons, and renderView to use the new 4-tab layout. Journey is the default tab. Simulator/Fun/Profile are placeholders.

Key changes:
- Remove `HomeSection` import, add `JourneyPath` import
- Change `activeTab` default to `'journey'`
- Change `stacks` to `{ journey, simulator, fun, profile }`
- Replace `Icons` object with 4 new SVG icons
- Update `renderView()` switch cases
- Update NavButton instances in JSX

New icons:
- **Journey**: Compass/path icon
- **Simulator**: Chat bubbles icon
- **Fun**: Gift/party icon
- **Profile**: Person icon

New `renderView` switch:
```
journey   → <JourneyPath {...commonProps} />
simulator → <PlaceholderSection title="Simulator" />
fun       → <PlaceholderSection title="Fun" />
profile   → <PlaceholderSection title="Profile" />
```

**Step 2: Build and verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/components/MainTabs.jsx
git commit -m "feat: replace navigation with Journey/Simulator/Fun/Profile tabs"
```

---

### Task 7: Add Journey to preview system

**Files:**
- Modify: `preview/components.js`

**Step 1: Add journey entry to component registry**

Add after the `onboarding` entry:

```js
'journey': {
    name: 'Journey Path',
    renderReact: (container) => window.appUI.mountJourney(container)
}
```

**Step 2: Add `mountJourney` to `src/index.jsx`**

Add after the `mountOnboarding` function:

```js
import JourneyPath from './components/JourneyPath';

window.appUI.mountJourney = (container, props = {}) => {
    const defaults = { credits: 5 };
    const root = createRoot(container);
    root.render(<JourneyPath {...defaults} {...props} />);
    return root;
};
```

**Step 3: Build and test in preview**

```bash
npm run build
npm run preview
# Open http://localhost:8000/preview/index.html and select "Journey Path"
```

**Step 4: Commit**

```bash
git add preview/components.js src/index.jsx
git commit -m "feat: add Journey to preview system"
```

---

### Task 8: Visual polish and build

**Files:**
- All journey files (tuning pass)

**Step 1: Run full build**

```bash
npm run build
```

**Step 2: Test in preview**

```bash
npm run dev
# Open http://localhost:8000/preview/index.html
# Test: Journey Path standalone
# Test: Main App (should open to Journey tab)
# Check all 4 tabs switch correctly
# Check journey scrolls smoothly
# Check node states look correct
# Test at iPhone SE (375x667) and Android Small (360x640)
```

**Step 3: Final commit**

```bash
npm run build
git add bundle.js bundle.css
git commit -m "build: regenerate bundles with journey navigation"
```
