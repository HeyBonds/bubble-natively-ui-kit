import React, { useMemo } from 'react';
import JourneyNode from './JourneyNode';
import JourneyPathSVG from './JourneyPathSVG';
import mockJourneyData from '../data/mockJourneyData';

const NODE_SPACING = 120;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 80;
const X_POSITIONS = [281, 188, 94, 188];

const JourneyPath = ({ credits = 0 }) => {
  const { chapter, chapterIndex, nodes } = mockJourneyData;

  const { points, totalHeight, completedCount } = useMemo(() => {
    const pts = nodes.map((_, i) => ({
      x: X_POSITIONS[i % 4],
      y: PADDING_TOP + i * NODE_SPACING,
    }));
    const height = PADDING_TOP + (nodes.length - 1) * NODE_SPACING + PADDING_BOTTOM;
    const completed = nodes.filter((n) => n.status === 'completed').length;
    return { points: pts, totalHeight: height, completedCount: completed };
  }, [nodes]);

  return (
    <div
      className="flex flex-col h-full font-jakarta"
      style={{ background: 'linear-gradient(160deg, #2E4695 0%, #652664 100%)' }}
    >
      {/* Header */}
      <div className="shrink-0 pt-[18px] pb-4 px-[18px] flex items-center justify-between">
        {/* Left side */}
        <div>
          <h1 className="font-bold text-[20px] text-white leading-tight">Your Journey</h1>
          <p className="text-white/50 text-[12px] font-medium mt-1">
            Chapter {chapterIndex}: {chapter}
          </p>
        </div>

        {/* Right side — Credits widget */}
        <div className="h-9 rounded-full border border-solid border-white/30 pl-1 pr-4 gap-2 flex items-center">
          <div className="w-7 h-7 bg-[#FF2258] rounded-full flex items-center justify-center">
            <span className="font-extrabold text-[11px] text-white">{credits}</span>
          </div>
          <span className="font-medium text-[10px] text-white/70">Credits</span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/15" />

      {/* Scrollable path area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="relative w-full" style={{ height: totalHeight }}>
          {/* SVG curve behind nodes */}
          <JourneyPathSVG
            points={points}
            completedCount={completedCount}
            totalHeight={totalHeight}
          />

          {/* Positioned nodes */}
          {nodes.map((node, i) => (
            <JourneyNode
              key={node.id}
              node={node}
              style={{
                left: points[i].x,
                top: points[i].y,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyPath;
