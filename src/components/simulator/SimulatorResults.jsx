import React, { useState } from 'react';

const SCORE_COLORS = ['#FF4B4B', '#FF8C00', '#FFD700', '#9ACD32', '#58CC02'];

const SimulatorResults = ({ evaluation, theme, onRetry, onDone }) => {
  const sim = theme.simulator;
  const [expanded, setExpanded] = useState(false);

  if (!evaluation) return null;

  const { overall_score = 1, skill_level = 'Getting Started', metrics = [], strengths = [], improvements = [], summary = '' } = evaluation;

  return (
    <div className="flex flex-col h-full" style={{ background: sim.sessionBg }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-6 pb-4">

        {/* Score header */}
        <div className="text-center mb-6">
          <h2 className="font-jakarta font-extrabold text-[24px] mb-3" style={{ color: sim.resultsTitle }}>
            {skill_level}
          </h2>

          {/* Score dots */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {SCORE_COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 16,
                  height: 16,
                  background: i < overall_score ? color : sim.dotInactive,
                  border: i < overall_score ? 'none' : `1px solid ${sim.dotBorder}`,
                }}
              />
            ))}
          </div>
          <p className="font-poppins text-[14px]" style={{ color: sim.scoreFraction }}>
            {overall_score}/5
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-col gap-2 mb-6">
          {metrics.map((metric, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className="text-[18px]" style={{ color: metric.direction === 'up' ? sim.metricUp : sim.metricDown }}>
                {metric.direction === 'up' ? '\u2191' : '\u2193'}
              </span>
              <span className="font-poppins font-medium text-[15px]" style={{ color: sim.metricText }}>
                {metric.name}
              </span>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="mb-5">
            <h3 className="font-jakarta font-bold text-[14px] mb-2" style={{ color: sim.sectionTitle }}>
              What you did well
            </h3>
            <ul className="flex flex-col gap-1.5">
              {strengths.map((item, i) => (
                <li key={i} className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="mb-5">
            <h3 className="font-jakarta font-bold text-[14px] mb-2" style={{ color: sim.sectionTitleImprove }}>
              Areas to improve
            </h3>
            <ul className="flex flex-col gap-1.5">
              {improvements.map((item, i) => (
                <li key={i} className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                  {'\u2022'} {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary -- expandable */}
        {summary && (
          <div className="mb-4">
            {!expanded ? (
              <button onClick={() => setExpanded(true)} className="font-jakarta font-bold text-[13px] underline" style={{ color: sim.readMoreText }}>
                Read more
              </button>
            ) : (
              <p className="font-poppins text-[13px] leading-relaxed" style={{ color: sim.bulletText }}>
                {summary}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer -- TRY AGAIN / DONE */}
      <div className="shrink-0 flex items-center border-t border-solid" style={{ borderColor: sim.resultsBorder, background: sim.resultsBg }}>
        <button
          onClick={onRetry}
          className="flex-1 py-4 text-center"
        >
          <span className="font-jakarta font-extrabold text-[14px] block" style={{ color: sim.resultsTitle }}>
            TRY AGAIN
          </span>
          <span className="font-poppins text-[11px]" style={{ color: sim.scoreFraction }}>
            Same topic
          </span>
        </button>
        <div style={{ width: 1, height: 40, background: sim.resultsBorder }} />
        <button
          onClick={onDone}
          className="flex-1 py-4 text-center"
        >
          <span className="font-jakarta font-extrabold text-[14px]" style={{ color: sim.resultsTitle }}>
            DONE
          </span>
        </button>
      </div>
    </div>
  );
};

export default SimulatorResults;
