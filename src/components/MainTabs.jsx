import React, { useState, useEffect, useMemo } from 'react';
import JourneyPath from './JourneyPath';
import NativeStorageManager from './NativeStorageManager';
import { useNativelyStorage } from '../hooks/useNativelyStorage';

const THEMES = {
  dark: {
    bg: '#1B1B2F',
    surface: '#252538',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    textMuted: 'rgba(255,255,255,0.3)',
    border: 'rgba(255,255,255,0.1)',
    navInactive: 'rgba(255,255,255,0.6)',
    lockedBg: '#3C3C4E',
    lockedShadow: '#2A2A3A',
    lockedIcon: 'rgba(255,255,255,0.35)',
    labelCompleted: 'rgba(255,255,255,0.5)',
    labelCurrent: '#FFFFFF',
    labelLocked: 'rgba(255,255,255,0.25)',
    floatBg: '#2B2B3D',
    floatBorder: '#4A4A5E',
    menuActive: 'rgba(255,255,255,0.1)',
    menuShadow: '0 8px 24px rgba(0,0,0,0.4)',
    backdrop: 'rgba(0,0,0,0.4)',
    creditsText: '#D4D4D4',
  },
  light: {
    bg: '#F0F0F5',
    surface: '#FFFFFF',
    textPrimary: '#1B1B2F',
    textSecondary: 'rgba(0,0,0,0.55)',
    textMuted: 'rgba(0,0,0,0.3)',
    border: 'rgba(0,0,0,0.08)',
    navInactive: 'rgba(0,0,0,0.45)',
    lockedBg: '#D0D0D8',
    lockedShadow: '#B0B0B8',
    lockedIcon: 'rgba(0,0,0,0.25)',
    labelCompleted: 'rgba(0,0,0,0.45)',
    labelCurrent: '#1B1B2F',
    labelLocked: 'rgba(0,0,0,0.2)',
    floatBg: '#FFFFFF',
    floatBorder: '#D0D0D8',
    menuActive: 'rgba(0,0,0,0.06)',
    menuShadow: '0 8px 24px rgba(0,0,0,0.12)',
    backdrop: 'rgba(0,0,0,0.25)',
    creditsText: '#555555',
  },
};

// Dark mode options: system follows OS preference, on = always dark, off = always light
const DARK_MODE_OPTIONS = ['system', 'on', 'off'];
const DARK_MODE_LABELS = { system: 'System', on: 'On', off: 'Off' };

// Profile section with dark mode selector
const ProfileSection = ({ theme, darkModePref, setDarkModePref }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6" style={{ color: theme.textPrimary }}>Profile</h2>
    <div className="rounded-2xl p-4" style={{ background: theme.surface, transition: 'background 0.3s ease' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="font-semibold text-[15px]" style={{ color: theme.textPrimary }}>Dark Mode</span>
        </div>
        {/* Segmented control */}
        <div className="flex rounded-xl overflow-hidden" style={{ background: theme.border }}>
          {DARK_MODE_OPTIONS.map((opt, i) => {
            const active = darkModePref === opt;
            const nextActive = darkModePref === DARK_MODE_OPTIONS[i + 1];
            const showDivider = i < DARK_MODE_OPTIONS.length - 1 && !active && !nextActive;
            return (
              <div key={opt} className="flex items-center">
                <button
                  onClick={() => setDarkModePref(opt)}
                  className="px-3 py-1.5 text-[12px] font-bold transition-all duration-200"
                  style={{
                    background: active ? '#E44B8E' : 'transparent',
                    color: active ? '#fff' : theme.textSecondary,
                  }}
                >
                  {DARK_MODE_LABELS[opt]}
                </button>
                {showDivider && <div style={{ width: 1, height: 14, background: theme.textMuted }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// Placeholder components for other sections
const PlaceholderSection = ({ title, theme }) => (
  <div className="p-8 text-center" style={{ color: theme.textPrimary }}>
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p style={{ opacity: 0.7 }}>Coming Soon</p>
  </div>
);

const STORAGE_KEY = 'bonds_dark_mode';

const getSystemTheme = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const resolveTheme = (pref) =>
  pref === 'on' ? 'dark' : pref === 'off' ? 'light' : getSystemTheme();

const MainTabs = ({ userProps }) => {
  const storage = useNativelyStorage();

  // Dark mode preference: 'system' | 'on' | 'off'
  const [darkModePref, setDarkModePrefRaw] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  const setDarkModePref = (val) => {
    setDarkModePrefRaw(val);
    storage.setItem(STORAGE_KEY, val);
  };

  // Listen to OS theme changes when pref is 'system'
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const themeKey = darkModePref === 'on' ? 'dark' : darkModePref === 'off' ? 'light' : systemTheme;
  const t = THEMES[themeKey];

  // Navigation State
  // We maintain a stack for each tab to allow independent navigation history
  const [activeTab, setActiveTab] = useState('journey');
  const [stacks, setStacks] = useState({
    journey: ['journey'],
    simulator: ['simulator'],
    fun: ['fun'],
    profile: ['profile']
  });
  const [navAction, setNavAction] = useState(null); // 'push', 'pop', or null

  // Navigation Logic
  const push = (viewId, props = {}) => {
    setNavAction('push');
    setStacks(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], { id: viewId, ...props }]
    }));
  };

  const pop = () => {
    setNavAction('pop');
    setStacks(prev => {
      const currentStack = prev[activeTab];
      if (currentStack.length <= 1) return prev;
      return {
        ...prev,
        [activeTab]: currentStack.slice(0, -1)
      };
    });
  };

  const switchTab = (tabId) => {
    if (tabId === activeTab) return;
    setNavAction('tab');
    setActiveTab(tabId);
  };

  // Render Current View
  const currentStack = stacks[activeTab];
  const currentViewItem = currentStack[currentStack.length - 1];
  const currentViewId = typeof currentViewItem === 'string' ? currentViewItem : currentViewItem.id;
  const currentViewProps = typeof currentViewItem === 'object' ? currentViewItem : {};

  const renderView = () => {
    const commonProps = {
        ...userProps,
        push,
        pop,
        theme: t,
        ...currentViewProps
    };

    let content;
    switch (activeTab) {
      case 'journey':
        content = <JourneyPath {...commonProps} />;
        break;
      case 'simulator':
        content = <PlaceholderSection title="Simulator" theme={t} />;
        break;
      case 'fun':
        content = <PlaceholderSection title="Fun" theme={t} />;
        break;
      case 'profile':
        content = <ProfileSection theme={t} darkModePref={darkModePref} setDarkModePref={setDarkModePref} />;
        break;
      default:
        content = <PlaceholderSection title="Not Found" />;
    }

    // Wrap in animated container
    // The key ensures React recreates the container (triggering CSS animation) on every stack change
    const animationClass = navAction === 'push' ? 'animate-slide-in-right' :
                          navAction === 'pop' ? 'animate-slide-in-left' :
                          navAction === 'tab' ? 'animate-tab-switch' : '';

    return (
      <div key={`${activeTab}-${currentStack.length}`} className={`w-full min-h-full ${animationClass}`}>
        {content}
      </div>
    );
  };

  // Navigation Button Component
  const NavButton = ({ id, label, icon }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => switchTab(id)}
        className={`flex flex-col items-center justify-center gap-1 transition-[color,transform,opacity] duration-200 ease-out ${
            isActive ? 'font-bold scale-110 active-tab-shimmer' : 'font-medium scale-100'
        }`}
        style={{ color: isActive ? '#E44B8E' : t.navInactive, opacity: isActive ? 1 : 0.7 }}
      >
        {icon}
        <span className="font-jakarta text-[10px] tracking-wide">{label}</span>
      </button>
    );
  };

  // SVG Icons
  const Icons = {
    journey: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>,
    simulator: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>,
    fun: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
    profile: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };

  return (
    <div className="w-full h-full font-poppins flex flex-col overflow-hidden" style={{ background: t.bg, transition: 'background 0.3s ease' }}>

      {/* Content Area (Scrollable) */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative overflow-x-hidden">
         {/* Simple header if deep in stack */}
         {currentStack.length > 1 && (
             <div className="absolute top-4 left-4 z-50">
                 <button onClick={pop} className="p-2 rounded-full transition-colors" style={{ background: t.backdrop, color: t.textPrimary }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 </button>
             </div>
         )}

         {renderView()}
      </div>

      {/* Bottom Navigation — flex child, never overflows */}
      <div className="shrink-0 h-20 border-t border-solid" style={{ background: t.bg, borderColor: t.border, transition: 'background 0.3s ease, border-color 0.3s ease' }}>
        <div className="flex items-center justify-around h-full max-w-[500px] mx-auto px-4">
            <NavButton id="journey" label="Journey" icon={Icons.journey} />
            <NavButton id="simulator" label="Simulator" icon={Icons.simulator} />
            <NavButton id="fun" label="Fun" icon={Icons.fun} />
            <NavButton id="profile" label="Profile" icon={Icons.profile} />
        </div>
      </div>

    </div>
  );
};

export default MainTabs;
