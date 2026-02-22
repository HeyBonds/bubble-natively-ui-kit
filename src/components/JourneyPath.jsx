import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import JourneyNode from './JourneyNode';
import mockJourneyData from '../data/mockJourneyData';

const NODE_SPACING = 95;
const CHAPTER_GAP = 40;
const PADDING_TOP = 15;
const PADDING_BOTTOM = 80;

// Wider S-curve swing — nodes go far left and right
const X_POSITIONS = [260, 188, 115, 188];

// Section banner colors — each chapter gets a themed color
const SECTION_COLORS = [
    { bg: '#E44B8E', dark: '#B83A72' },
    { bg: '#F06862', dark: '#C0534E' },
    { bg: '#8558C8', dark: '#6A46A0' },
    { bg: '#4545B5', dark: '#363690' },
    { bg: '#42A8C8', dark: '#348698' },
];

// Determine chapter status from its nodes
const getChapterStatus = (chapter) => {
    const allCompleted = chapter.nodes.every(n => n.status === 'completed');
    const hasCurrent = chapter.nodes.some(n => n.status === 'current');
    if (allCompleted) return 'completed';
    if (hasCurrent) return 'current';
    return 'locked';
};

const ChapterMenuItem = ({ chapter, color, status, isActive, onSelect, theme }) => (
    <button
        onClick={() => onSelect()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
        style={{
            background: isActive ? theme.menuActive : 'transparent',
        }}
    >
        {/* Status indicator */}
        <div
            className="rounded-full flex items-center justify-center"
            style={{
                width: 32,
                height: 32,
                backgroundColor: status === 'locked' ? theme.lockedBg : color.bg,
                boxShadow: status === 'locked' ? `0 2px 0 0 ${theme.lockedShadow}` : `0 2px 0 0 ${color.dark}`,
            }}
        >
            {status === 'completed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="4 12 10 18 20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : status === 'current' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
            ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke={theme.lockedIcon} strokeWidth="2" />
                    <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke={theme.lockedIcon} strokeWidth="2" strokeLinecap="round" />
                </svg>
            )}
        </div>

        {/* Chapter info */}
        <div className="flex-1 text-left">
            <p className="font-bold text-[10px] uppercase tracking-widest" style={{ color: status === 'locked' ? theme.textMuted : theme.textSecondary }}>
                Chapter {chapter.index}
            </p>
            <p className="font-extrabold text-[14px] leading-tight" style={{ color: status === 'locked' ? theme.lockedIcon : theme.textPrimary }}>
                {chapter.title}
            </p>
        </div>

        {/* Active arrow */}
        {isActive && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        )}
    </button>
);

const JourneyPath = ({ credits = 0, theme }) => {
    const { chapters } = mockJourneyData;
    const scrollRef = useRef(null);
    const [activeChapterIdx, setActiveChapterIdx] = useState(() => {
        for (let i = 0; i < chapters.length; i++) {
            if (chapters[i].nodes.some(n => n.status === 'current')) return i;
        }
        return 0;
    });
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    // Compute all node positions with chapter gaps
    const { nodePositions, chapterYStarts, totalHeight } = useMemo(() => {
        const nodePositions = [];
        const chapterYStarts = [];
        let y = PADDING_TOP;

        chapters.forEach((chapter, chapterIdx) => {
            if (chapterIdx > 0) y += CHAPTER_GAP;
            chapterYStarts.push(y);

            chapter.nodes.forEach((node, nodeIdx) => {
                nodePositions.push({
                    node,
                    x: X_POSITIONS[nodeIdx % X_POSITIONS.length],
                    y,
                    chapterIdx,
                });
                y += NODE_SPACING;
            });
        });

        return {
            nodePositions,
            chapterYStarts,
            totalHeight: y + PADDING_BOTTOM,
        };
    }, [chapters]);

    // Auto-scroll to current node on mount
    useEffect(() => {
        if (!scrollRef.current) return;
        const current = nodePositions.find(n => n.node.status === 'current');
        if (current) {
            scrollRef.current.scrollTop = Math.max(0, current.y - 200);
        }
    }, []);

    // Update active chapter on scroll — only set state when value changes
    const activeChapterRef = useRef(activeChapterIdx);
    const selectedNodeRef = useRef(null);

    const handleScrollWithDismiss = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollTop = scrollRef.current.scrollTop + 150;
        let idx = 0;
        for (let i = chapterYStarts.length - 1; i >= 0; i--) {
            if (scrollTop >= chapterYStarts[i]) {
                idx = i;
                break;
            }
        }
        if (idx !== activeChapterRef.current) {
            activeChapterRef.current = idx;
            setActiveChapterIdx(idx);
        }
        if (selectedNodeRef.current !== null) {
            selectedNodeRef.current = null;
            setSelectedNodeId(null);
        }
    }, [chapterYStarts]);

    // Toggle popover on node tap
    const handleNodeTap = useCallback((node) => {
        setSelectedNodeId(prev => {
            const next = prev === node.id ? null : node.id;
            selectedNodeRef.current = next;
            return next;
        });
        setMenuOpen(false);
    }, []);

    const handleStartLesson = useCallback((node) => {
        setSelectedNodeId(null);
    }, []);

    // Navigate to chapter
    const handleChapterSelect = useCallback((chapterIdx) => {
        setMenuOpen(false);
        setSelectedNodeId(null);
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: Math.max(0, chapterYStarts[chapterIdx] - 20),
                behavior: 'smooth',
            });
        }
    }, [chapterYStarts]);

    const activeChapter = chapters[activeChapterIdx];
    const activeColor = SECTION_COLORS[activeChapterIdx % SECTION_COLORS.length];

    return (
        <div
            className="font-jakarta"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: theme.bg,
                transition: 'background 0.3s ease',
            }}
        >
            {/* Top stats bar */}
            <div className="flex items-center justify-center gap-7 px-4 pt-3 pb-4" style={{ flexShrink: 0 }}>
                {/* Coins */}
                <div className="flex items-center gap-2">
                    <div className="coin-shimmer" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 35% 30%, #E0E0E0, #A0A0A0 70%, #888)', boxShadow: '0 2px 0 0 #707070' }}>
                        <span className="font-extrabold text-[14px] text-white" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>B</span>
                    </div>
                    <span className="font-extrabold text-[18px]" style={{ color: theme.creditsText }}>{credits}</span>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #FF9600 0%, #FF7A00 100%)', boxShadow: '0 2px 0 0 #CC6600' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22c-4.4 0-7-2.7-7-6.2 0-2.2 1.3-4.2 2.6-5.7l1.3 1.3c.35.35.9.1.9-.45V4c0-.5.35-.85.8-.8C14.5 4 19 7.8 19 12.8c0 4.8-3 9.2-7 9.2z" fill="white" />
                            <path d="M12 22c-2.2 0-3.5-1.6-3.5-3.5 0-1.3.7-2.5 1.6-3.4l.6.6c.18.18.45.08.45-.18V12.5c0-.25.18-.45.45-.42 1.8.45 4 2.5 4 5.7 0 2.5-1.3 4.2-3.6 4.2z" fill="#FFF3D6" />
                        </svg>
                    </div>
                    <span className="font-extrabold text-[18px] text-[#FF9600]">3</span>
                </div>

                {/* Premium badge */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8558C8 0%, #4545B5 100%)', boxShadow: '0 2px 0 0 #363690' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                    </svg>
                </div>
            </div>

            {/* Chapter banner + expandable menu (overlays content) */}
            <div style={{ flexShrink: 0, marginLeft: 12, marginRight: 12, marginBottom: 8, position: 'relative', zIndex: 20 }}>
                {/* Banner (clickable) */}
                <button
                    onClick={() => { setMenuOpen(prev => !prev); setSelectedNodeId(null); }}
                    className="w-full rounded-2xl px-5 py-3 flex items-center justify-between"
                    style={{
                        position: 'relative',
                        zIndex: 22,
                        backgroundColor: activeColor.bg,
                        boxShadow: menuOpen ? 'none' : `0 4px 0 0 ${activeColor.dark}`,
                        borderRadius: menuOpen ? '16px 16px 0 0' : '16px',
                        transition: 'background-color 0.3s ease, box-shadow 0.2s ease, border-radius 0.2s ease',
                    }}
                >
                    <div className="text-left">
                        <p className="font-bold text-[11px] text-white/70 uppercase tracking-widest">
                            Chapter {activeChapter.index}
                        </p>
                        <p className="font-extrabold text-[17px] text-white leading-tight mt-0.5">
                            {activeChapter.title}
                        </p>
                    </div>
                    {/* Chevron */}
                    <div
                        className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                        style={{
                            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </button>

                {/* Expandable chapter list — positioned absolute to overlay */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        zIndex: 21,
                        maxHeight: menuOpen ? 400 : 0,
                        opacity: menuOpen ? 1 : 0,
                        overflowY: menuOpen ? 'auto' : 'hidden',
                        overflowX: 'hidden',
                        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, background-color 0.3s ease',
                        backgroundColor: theme.glassBg,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: '0 0 16px 16px',
                        border: `1px solid ${theme.glassBorder}`,
                        borderTop: 'none',
                        boxShadow: menuOpen ? theme.menuShadow : 'none',
                    }}
                >
                    <div className="py-2 px-1">
                        {chapters.map((chapter, idx) => {
                            const color = SECTION_COLORS[idx % SECTION_COLORS.length];
                            const status = getChapterStatus(chapter);
                            return (
                                <ChapterMenuItem
                                    key={chapter.index}
                                    chapter={chapter}
                                    color={color}
                                    status={status}
                                    isActive={idx === activeChapterIdx}
                                    onSelect={() => handleChapterSelect(idx)}
                                    theme={theme}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Backdrop to close menu */}
            {menuOpen && (
                <div
                    onClick={() => setMenuOpen(false)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 15,
                        background: theme.backdrop,
                    }}
                />
            )}

            {/* Scrollable path area */}
            <div
                ref={scrollRef}
                className="scrollbar-hide"
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}
                onScroll={handleScrollWithDismiss}
            >
                <div className="relative w-full" style={{ height: totalHeight }}>
                    {nodePositions.map((item) => {
                        const chapterColor = SECTION_COLORS[item.chapterIdx % SECTION_COLORS.length];
                        return (
                            <JourneyNode
                                key={item.node.id}
                                node={item.node}
                                nodeX={item.x}
                                isSelected={selectedNodeId === item.node.id}
                                showFloatingLabel={item.node.status === 'current'}
                                onTap={handleNodeTap}
                                onStart={handleStartLesson}
                                accentColor={chapterColor.bg}
                                accentDark={chapterColor.dark}
                                theme={theme}
                                style={{
                                    left: item.x,
                                    top: item.y,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default JourneyPath;
