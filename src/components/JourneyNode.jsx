import React, { memo } from 'react';

// ── Inline SVG Icons ──────────────────────────────────────────────────
// Static icons (no theme dependency) — created once at module level
const STATIC_ICONS = {
    check: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polyline points="4 12 10 18 20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    star: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
    ),
    trophy: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M6 2h12v6a6 6 0 0 1-12 0V2z" fill="white" />
            <path d="M6 4H3a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4m12-6h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" stroke="white" strokeWidth="1.5" />
            <path d="M8 21h8m-4-7v7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    clock: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8" />
            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.2" fill="white" />
        </svg>
    ),
};

// Step-type icons — shown for completed/current non-milestone nodes
const STEP_TYPE_ICONS = {
    learn: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 7h8M8 11h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    practice: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10h8M8 14h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    insight: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 18h6M10 22h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    act: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" stroke="white" strokeWidth="2" />
            <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

// Popover subtitles per step type
const STEP_TYPE_SUBTITLES = {
    learn: 'Watch & Learn',
    practice: 'Practice the Skill',
    insight: "Dr Leo's Insight",
    act: 'Take Action',
    milestone: 'Chapter Milestone',
};

// Theme-dependent icons — only lock & diamond use theme colors
const themedIcons = (theme) => ({
    lock: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke={theme.lockedIcon} strokeWidth="2" />
            <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke={theme.lockedIcon} strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    diamond: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M6 3h12l4 7-10 12L2 10l4-7z" stroke={theme.lockedIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
});

const SCREEN_WIDTH = 375;
const POPOVER_WIDTH = 220;
const POPOVER_PADDING = 12;

// ── Floating "START" label above current node ─────────────────────────
const FloatingLabel = ({ text, theme }) => (
    <div className="absolute -top-10 left-1/2 z-10 animate-float">
        <div className="relative border-2 border-solid rounded-xl px-4 py-1.5 whitespace-nowrap" style={{ background: theme.floatBg, borderColor: theme.floatBorder }}>
            <span className="font-jakarta font-extrabold text-[13px] tracking-[1.5px] uppercase" style={{ color: theme.textPrimary }}>
                {text}
            </span>
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px]" style={{ borderTopColor: theme.floatBorder }} />
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" style={{ borderTopColor: theme.floatBg }} />
        </div>
    </div>
);

// ── Popover shown below a tapped node ─────────────────────────────────
const NodePopover = ({ node, color, onStart, nodeX }) => {
    // Clamp popover so it stays within screen bounds
    const halfPopover = POPOVER_WIDTH / 2;
    let popoverLeft = nodeX - halfPopover;
    let popoverRight = nodeX + halfPopover;

    let offsetX = 0;
    if (popoverLeft < POPOVER_PADDING) {
        offsetX = POPOVER_PADDING - popoverLeft;
    } else if (popoverRight > SCREEN_WIDTH - POPOVER_PADDING) {
        offsetX = (SCREEN_WIDTH - POPOVER_PADDING) - popoverRight;
    }

    // Triangle offset is inverse of popover shift to keep it pointing at node
    const triangleOffset = -offsetX;

    return (
        <div
            className="absolute z-20 animate-popover-in"
            style={{
                top: '100%',
                marginTop: 12,
                left: '50%',
                '--pop-offset': `${offsetX}px`,
                width: POPOVER_WIDTH,
            }}
        >
            {/* Triangle pointing up */}
            <div
                className="absolute -top-[7px] w-0 h-0 border-solid border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px]"
                style={{ borderBottomColor: color, left: '50%', transform: `translateX(calc(-50% + ${triangleOffset}px))` }}
            />
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: color }}>
                <p className="font-jakarta font-extrabold text-[15px] text-white leading-tight">
                    {node.title}
                </p>
                <p className="font-jakarta font-bold text-[11px] text-white/70 mt-0.5">
                    {node.status === 'paused' ? 'Unlocks tomorrow' : node.status === 'locked' ? 'Locked' : STEP_TYPE_SUBTITLES[node.type] || (node.status === 'completed' ? 'Completed' : 'In progress')}
                </p>
                {node.type !== 'milestone' && node.status !== 'locked' && node.status !== 'paused' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onStart && onStart(node); }}
                        className="mt-2.5 w-full rounded-xl py-2 font-jakarta font-extrabold text-[13px] uppercase tracking-wide"
                        style={{
                            backgroundColor: 'white',
                            color: color,
                            boxShadow: '0 2px 0 0 rgba(0,0,0,0.12)',
                        }}
                    >
                        START +10 XP
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Component ─────────────────────────────────────────────────────────
const JourneyNode = memo(({ node, nodeX, style, isSelected, showFloatingLabel, onTap, onStart, accentColor, accentDark, theme }) => {
    const { title, status, type } = node;
    const isMilestone = type === 'milestone';
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isLocked = status === 'locked';
    const isPaused = status === 'paused';

    const size = isMilestone ? 82 : isCurrent ? 78 : 70;
    const depth = isMilestone ? 6 : 5;

    const chapterColor = accentColor || '#E44B8E';
    const chapterDark = accentDark || '#B83A72';
    const lockedColor = theme.lockedBg;
    const lockedDark = theme.lockedShadow;
    const goldColor = '#FFB800';
    const goldDark = '#CC9300';

    const themed = themedIcons(theme);
    let bgColor, shadowColor, icon;

    if (isMilestone) {
        if (isCompleted) {
            bgColor = goldColor; shadowColor = goldDark; icon = STATIC_ICONS.trophy;
        } else {
            bgColor = lockedColor; shadowColor = lockedDark; icon = themed.diamond;
        }
    } else if (isLocked) {
        bgColor = lockedColor; shadowColor = lockedDark; icon = themed.lock;
    } else if (isPaused) {
        // 50% alpha via 8-digit hex — assumes SECTION_COLORS are always 6-digit hex (#RRGGBB)
        bgColor = chapterColor + '80'; shadowColor = chapterDark + '80'; icon = STATIC_ICONS.clock;
    } else {
        // completed or current — use type-specific icon
        bgColor = chapterColor; shadowColor = chapterDark;
        icon = STEP_TYPE_ICONS[type] || STATIC_ICONS.star;
    }

    const popoverColor = accentColor || bgColor;

    return (
        <div
            className="absolute flex flex-col items-center"
            style={{ ...style, width: size + 40, marginLeft: -(size + 40) / 2 }}
        >
            {showFloatingLabel && !isSelected && <FloatingLabel text="START" theme={theme} />}

            <div className="relative">
                <button
                    disabled={isLocked}
                    onClick={!isLocked ? () => onTap && onTap(node) : undefined}
                    className={`relative rounded-full flex items-center justify-center overflow-hidden ${
                        isLocked ? 'cursor-default' : isPaused ? 'cursor-pointer animate-paused-clock' : 'cursor-pointer transition-transform duration-100 active:translate-y-[2px]'
                    }`}
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: bgColor,
                        boxShadow: `0 ${depth}px 0 0 ${shadowColor}`,
                    }}
                >
                    {/* Subtle top highlight on completed nodes */}
                    {isCompleted && (
                        <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                            background: 'radial-gradient(ellipse 70% 50% at 30% 15%, rgba(255,255,255,0.25), transparent 65%)',
                        }} />
                    )}
                    {icon}
                </button>

                {isSelected && (
                    <NodePopover node={node} color={popoverColor} onStart={onStart} nodeX={nodeX} />
                )}
            </div>

            {!isMilestone && (
                <span className="mt-2 text-[10px] font-jakarta font-bold text-center leading-tight tracking-wide" style={{
                    color: isCompleted ? theme.labelCompleted : (isCurrent || isPaused) ? theme.labelCurrent : theme.labelLocked,
                }}>
                    {title}
                </span>
            )}
        </div>
    );
});
JourneyNode.displayName = 'JourneyNode';

export default JourneyNode;
