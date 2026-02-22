import React from 'react';

const JourneyPathSVG = ({ points, completedCount, totalHeight }) => {
    if (!points || points.length < 2) return null;

    // Build the SVG path using cubic bezier curves
    const buildPath = () => {
        let d = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const dy = curr.y - prev.y;

            // Control point 1: same x as prev, y offset down by 40% of vertical distance
            const cp1x = prev.x;
            const cp1y = prev.y + dy * 0.4;

            // Control point 2: same x as curr, y offset up by 40% of vertical distance
            const cp2x = curr.x;
            const cp2y = curr.y - dy * 0.4;

            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }

        return d;
    };

    // Gradient stop: position the transition based on completed progress
    const gradientStop = ((completedCount - 0.5) / (points.length - 1)) * 100;

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
                    <stop offset={`${gradientStop + 15}%`} stopColor="#FFFFFF" stopOpacity="0.08" />
                </linearGradient>
            </defs>
            <path
                d={buildPath()}
                stroke="url(#pathGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
};

export default JourneyPathSVG;
