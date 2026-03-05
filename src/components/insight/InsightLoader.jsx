import React from 'react';

const InsightLoader = ({ theme, message }) => {
  const ins = theme.insight;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: ins.loaderBg }}>
      {/* Rotating spinner */}
      <div className="animate-insight-spin mb-6">
        <div
          className="w-14 h-14 rounded-full border-[3px] border-solid"
          style={{ borderColor: `${ins.loaderSpinner}33`, borderTopColor: ins.loaderSpinner }}
        />
      </div>
      <p className="font-jakarta font-bold text-[16px]" style={{ color: ins.loaderText }}>
        {message || 'Loading...'}
      </p>
    </div>
  );
};

export default InsightLoader;
