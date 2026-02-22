import React from 'react';

// ── Inline SVG Icons ──────────────────────────────────────────────────
const NodeIcons = {
  check: (size) => (
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none">
      <polyline
        points="4 12 10 18 20 6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  star: (size) => (
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="white">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  ),
  lock: (size) => (
    <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" opacity="0.4">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  trophy: (size) => (
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 21h8m-4-4v4m-4-8c-2.5 0-5-1-5-5V4h5m6 4c2.5 0 5-1 5-5V4h-5m-6 0h6a1 1 0 0 1 0 9h-6a1 1 0 0 1 0-9z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  diamond: (size) => (
    <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" opacity="0.4">
      <path
        d="M6 3h12l4 7-10 12L2 10l4-7z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10h20M9 3l-3 7 6 12 6-12-3-7"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// ── Size + style config per state ─────────────────────────────────────
const getNodeConfig = (status, milestone) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';

  if (milestone) {
    const size = 72;
    if (isCompleted) {
      return {
        size,
        circleClass:
          'bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-[0_0_24px_rgba(255,215,0,0.4)]',
        icon: NodeIcons.trophy(size),
        labelClass: 'text-white/60',
      };
    }
    // Milestone locked (or any non-completed milestone)
    return {
      size,
      circleClass: 'bg-white/5 border border-solid border-white/10',
      icon: NodeIcons.diamond(size),
      labelClass: 'text-white/30',
    };
  }

  if (isCompleted) {
    return {
      size: 56,
      circleClass: 'bg-[#FF2258] shadow-[0_0_20px_rgba(255,34,88,0.4)]',
      icon: NodeIcons.check(56),
      labelClass: 'text-white/60',
    };
  }

  if (isCurrent) {
    return {
      size: 64,
      circleClass:
        'bg-[#FF2258]/20 border-2 border-solid border-[#FF2258] shadow-[0_0_24px_rgba(255,34,88,0.5)] animate-pulse-slow',
      icon: NodeIcons.star(64),
      labelClass: 'text-white',
    };
  }

  // Locked (default)
  return {
    size: 56,
    circleClass: 'bg-white/5 border border-solid border-white/10',
    icon: NodeIcons.lock(56),
    labelClass: 'text-white/30',
  };
};

// ── Component ─────────────────────────────────────────────────────────
const JourneyNode = ({ node, style, onClick }) => {
  const { title, status, milestone } = node;
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';

  const { size, circleClass, icon, labelClass } = getNodeConfig(status, milestone);

  // Wrapper width = circle size + 40px for label overflow
  const wrapperWidth = size + 40;

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        ...style,
        width: wrapperWidth,
        marginLeft: -(wrapperWidth / 2),
      }}
    >
      {/* Circle button */}
      <button
        disabled={isLocked}
        onClick={!isLocked && onClick ? () => onClick(node) : undefined}
        className={[
          'rounded-full flex items-center justify-center transition-transform',
          circleClass,
          isLocked ? 'cursor-default' : 'cursor-pointer',
          isCurrent ? 'active:scale-95' : '',
        ].join(' ')}
        style={{ width: size, height: size }}
      >
        {icon}
      </button>

      {/* Label */}
      <span
        className={`mt-1.5 text-[11px] font-jakarta font-medium text-center leading-tight ${labelClass}`}
      >
        {title}
      </span>
    </div>
  );
};

export default JourneyNode;
