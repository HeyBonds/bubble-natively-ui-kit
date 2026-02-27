import React from 'react';
import { sendToBubble } from '../utils/bubble';
import { BUBBLE_CDN } from '../config';

const leoThink = `${BUBBLE_CDN}/f1772112702436x988725373375085300/leo_think.png`;
const leoYay = `${BUBBLE_CDN}/f1772112696167x295067163375400700/leo_yay.png`;

const ACTIVITIES = [
  { id: 'funky-date', name: 'Funky Date', emoji: '\uD83D\uDCC5', subtitle: 'Spark something new together', cost: 4, accent: '#FF9600' },
  { id: 'dialogue-starter', name: 'Dialogue Starter', emoji: '\uD83D\uDCAC', subtitle: 'Great conversations start here', cost: 4, accent: '#1CB0F6' },
  { id: 'gift-inspiration', name: 'Gift Inspiration', emoji: '\uD83C\uDF81', subtitle: 'Find the perfect surprise', cost: 4, accent: '#CE82FF' },
];

const DailyQuestionBanner = ({ dailyQuestion, push, theme: _theme }) => {
  const isAnswered = dailyQuestion?.selectedAnswer !== undefined && dailyQuestion?.selectedAnswer !== null;

  const handleTap = () => {
    if (!dailyQuestion) return;
    sendToBubble('bubble_fn_fun', 'open_daily_question');
    push('daily-question', {
      category: dailyQuestion.category,
      question: dailyQuestion.question,
      options: dailyQuestion.options,
      selectedAnswer: dailyQuestion.selectedAnswer,
    });
  };

  if (isAnswered) {
    return (
      <button
        onClick={handleTap}
        className="w-full rounded-2xl text-left relative overflow-hidden border-2 border-solid"
        style={{
          background: '#1A3A2A',
          borderColor: '#2ECC71',
          boxShadow: '0 4px 0 #145A2A',
        }}
      >
        <div className="flex items-center p-4 pr-2">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#2ECC71" />
                <polyline points="8 12 11 15 16 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-jakarta font-extrabold text-[14px] text-[#2ECC71]">
                Completed!
              </span>
            </div>
            <p className="font-poppins text-[13px] text-white/50 leading-snug">
              Daily Question
            </p>
            <p className="font-poppins font-medium text-[13px] text-white/40 leading-snug mt-1 line-clamp-1">
              Come back tomorrow for a new one
            </p>
          </div>

          {/* Leo celebrating */}
          <img
            src={leoYay}
            alt="Leo celebrating"
            className="w-20 h-20 object-contain flex-shrink-0 -mr-1"
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleTap}
      className="w-full rounded-2xl text-left relative overflow-hidden border-2 border-solid animate-breathing-glow"
      style={{
        background: 'linear-gradient(135deg, #58CC02 0%, #46A302 100%)',
        borderColor: '#58CC02',
        boxShadow: '0 4px 0 #3A8A01',
      }}
    >
      <div className="flex items-center p-4 pr-2">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-jakarta font-extrabold text-[11px] text-white/80 uppercase tracking-widest">
              Daily Question
            </span>
            <span className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
                <text x="12" y="16" textAnchor="middle" fill="#8B6914" fontSize="12" fontWeight="bold">$</text>
              </svg>
              <span className="font-jakarta font-bold text-[10px] text-white">+1</span>
            </span>
          </div>

          <p className="font-poppins font-bold text-[15px] text-white leading-snug line-clamp-2 mb-3 pr-2">
            {dailyQuestion?.question || 'No question available today'}
          </p>

          <span
            className="inline-block font-jakarta font-extrabold text-[13px] text-[#58CC02] rounded-xl px-5 py-2 border-b-[3px] border-solid border-[#D4D4D4] active:border-b-0 active:mt-[3px]"
            style={{ background: '#FFFFFF' }}
          >
            Answer Now
          </span>
        </div>

        {/* Leo thinking */}
        <img
          src={leoThink}
          alt="Dr. Leo thinking"
          className="w-24 h-24 object-contain flex-shrink-0 -mr-1 -mb-2"
        />
      </div>
    </button>
  );
};

const ActivityCard = ({ activity, index, push, theme }) => {
  const handleTap = () => {
    sendToBubble('bubble_fn_fun', 'open_activity', { activityId: activity.id });
    push('activity-detail', { activityId: activity.id, name: activity.name });
  };

  return (
    <button
      onClick={handleTap}
      className="w-full rounded-2xl text-left relative overflow-hidden border-2 border-solid animate-fade-in"
      style={{
        opacity: 0,
        animationDelay: `${index * 100}ms`,
        background: theme.surface,
        borderColor: theme.border,
        boxShadow: `0 4px 0 ${theme.cardShadow}`,
      }}
    >
      <div className="py-5 pl-5 pr-24 min-h-[100px]">
        <p className="font-jakarta font-extrabold text-[18px] mb-1.5" style={{ color: theme.textPrimary }}>
          {activity.name}
        </p>
        <p className="font-poppins text-[13px] leading-snug" style={{ color: theme.textSecondary }}>
          {activity.subtitle}
        </p>
        <p className="font-poppins text-[11px] mt-2" style={{ color: theme.textMuted }}>
          {activity.cost} credits
        </p>
      </div>

      {/* Large emoji on colored circle — clipped at bottom-right */}
      <div
        className="absolute -bottom-2 -right-2 w-[80px] h-[80px] rounded-full flex items-center justify-center"
        style={{ background: activity.accent }}
      >
        <span className="text-[36px] leading-none">{activity.emoji}</span>
      </div>
    </button>
  );
};

const FunZoneSection = ({ theme, push, dailyQuestion }) => {
  return (
    <div className="px-5 pt-6 pb-10 font-poppins">
      {/* Daily Question Banner */}
      <DailyQuestionBanner dailyQuestion={dailyQuestion} push={push} theme={theme} />

      {/* Activities Section */}
      <div className="mt-8">
        <h2 className="font-jakarta font-bold text-[18px] mb-4" style={{ color: theme.textPrimary }}>
          Activities
        </h2>
        <div className="flex flex-col gap-4">
          {ACTIVITIES.map((activity, i) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={i}
              push={push}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunZoneSection;
