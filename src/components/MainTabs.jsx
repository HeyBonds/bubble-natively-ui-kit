import React, { useState, useEffect } from 'react';
import JourneyPath from './JourneyPath';
import DailyQuestion from './DailyQuestion';
import FunZoneSection from './FunZoneSection';
import { useNativelyStorage } from '../hooks/useNativelyStorage';
import { THEMES, DARK_MODE_OPTIONS, DARK_MODE_LABELS, getSystemTheme } from '../theme';
import SimulatorSection from './SimulatorSection';
import { APP_VERSION } from '../config';
import { sendToBubble } from '../utils/bubble';
import { useUser } from '../contexts/UserContext';

// ── Reusable profile building blocks ──────────────────────────────────

const glassStyle = (theme) => ({
  background: theme.glassBg,
  borderColor: theme.glassBorder,
});

const SectionLabel = ({ children, theme }) => (
  <p className="font-jakarta font-bold text-[10px] uppercase tracking-[2px] mb-2 px-1" style={{ color: theme.textMuted }}>
    {children}
  </p>
);

const SettingsRow = ({ icon, label, right, theme, last }) => (
  <div
    className={`flex items-center justify-between py-3 px-1 ${last ? '' : 'border-b border-solid'}`}
    style={{ borderColor: last ? 'transparent' : theme.border }}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-semibold text-[14px]" style={{ color: theme.textPrimary }}>{label}</span>
    </div>
    {right}
  </div>
);

const Chevron = ({ theme }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Profile Section ─────────────────────────────────────────────────

const ProfileSection = ({ theme, darkModePref, setDarkModePref, onLogout }) => {
  const glass = glassStyle(theme);
  const { name, email, pillars } = useUser();

  const handleLogout = () => {
    sendToBubble('bubble_fn_profile', 'logout');
    localStorage.clear();
    if (onLogout) onLogout();
  };

  return (
    <div className="px-5 pt-6 pb-10 font-jakarta">

      {/* ── Header: Avatar + Name + Partner ── */}
      <div className="flex items-center gap-4 mb-2">
        {/* Avatar */}
        <div className="rounded-full flex items-center justify-center" style={{ width: 56, height: 56, background: theme.border }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <p className="font-extrabold text-[20px]" style={{ color: theme.textPrimary }}>{name}</p>
          <p className="text-[12px]" style={{ color: theme.textSecondary }}>{email}</p>
        </div>
      </div>

      {/* Partner status */}
      <div className="rounded-2xl p-4 mt-4 border border-solid" style={glass}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, border: `1.5px dashed ${theme.textMuted}` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="font-semibold text-[14px]" style={{ color: theme.textSecondary }}>No partner connected</span>
          </div>
          <button className="rounded-full px-4 py-1.5 text-[12px] font-bold border border-solid" style={{ borderColor: '#E44B8E', color: '#E44B8E' }}>
            Invite
          </button>
        </div>
      </div>

      {/* ── Relationship ── */}
      <div className="mt-6">
        <SectionLabel theme={theme}>Relationship</SectionLabel>
        <div className="rounded-2xl p-4 border border-solid" style={glass}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-semibold text-[14px] mb-2" style={{ color: theme.textPrimary }}>Your Pillars</p>
              <div className="flex flex-wrap gap-2">
                {pillars.map(p => (
                  <span key={p} className="rounded-full px-3 py-1 text-[11px] font-bold border border-solid" style={{ borderColor: theme.border, color: theme.textSecondary }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <Chevron theme={theme} />
          </div>
        </div>
      </div>

      {/* ── Preferences ── */}
      <div className="mt-6">
        <SectionLabel theme={theme}>Preferences</SectionLabel>
        <div className="rounded-2xl px-4 border border-solid" style={glass}>
          <SettingsRow
            theme={theme}
            last
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
            label="Dark Mode"
            right={
              <div className="flex rounded-xl overflow-hidden" style={{ background: theme.border }}>
                {DARK_MODE_OPTIONS.map((opt, i) => {
                  const active = darkModePref === opt;
                  const nextActive = darkModePref === DARK_MODE_OPTIONS[i + 1];
                  const showDivider = i < DARK_MODE_OPTIONS.length - 1 && !active && !nextActive;
                  return (
                    <div key={opt} className="flex items-center">
                      <button
                        onClick={() => setDarkModePref(opt)}
                        className="px-3 py-1.5 text-[12px] font-bold transition-colors duration-200"
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
            }
          />
        </div>
      </div>

      {/* ── Account ── */}
      <div className="mt-6">
        <SectionLabel theme={theme}>Account</SectionLabel>
        <div className="rounded-2xl px-4 border border-solid" style={glass}>
          <SettingsRow
            theme={theme}
            last
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
              </svg>
            }
            label="Account Info"
            right={<Chevron theme={theme} />}
          />
        </div>
      </div>

      {/* ── Support ── */}
      <div className="mt-6">
        <SectionLabel theme={theme}>Support</SectionLabel>
        <div className="rounded-2xl px-4 border border-solid" style={glass}>
          <SettingsRow
            theme={theme}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            label="Share Feedback"
            right={<Chevron theme={theme} />}
          />
          <SettingsRow
            theme={theme}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            }
            label="Terms of Service"
            right={<Chevron theme={theme} />}
          />
          <SettingsRow
            theme={theme}
            last
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            label="Privacy Policy"
            right={<Chevron theme={theme} />}
          />
        </div>
      </div>

      {/* ── Bottom actions ── */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <button onClick={handleLogout} className="font-bold text-[14px] py-2 px-8 rounded-full border border-solid" style={{ borderColor: theme.border, color: theme.textSecondary }}>
          Log Out
        </button>
        <button className="text-[12px] font-semibold" style={{ color: theme.textMuted }}>
          Delete Account
        </button>
        <p className="text-[10px] mt-2" style={{ color: theme.textMuted }}>{APP_VERSION}</p>
      </div>

    </div>
  );
};

// Placeholder components for other sections
const PlaceholderSection = ({ title, theme }) => (
  <div className="p-8 text-center" style={{ color: theme.textPrimary }}>
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p style={{ opacity: 0.7 }}>Coming Soon</p>
  </div>
);

const STORAGE_KEY = 'bonds_dark_mode';

const MainTabs = ({ onLogout }) => {
  const storage = useNativelyStorage();

  // Dark mode preference: 'system' | 'on' | 'off'
  const [darkModePref, setDarkModePrefRaw] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  const setDarkModePref = (val) => {
    setDarkModePrefRaw(val);
    storage.setItem(STORAGE_KEY, val);
  };

  // Hydrate from native storage (handles OS clearing localStorage)
  useEffect(() => {
    storage.getItem(STORAGE_KEY).then(val => {
      if (val) setDarkModePrefRaw(prev => val !== prev ? val : prev);
    });
  }, [storage]);

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
  const [simulatorActive, setSimulatorActive] = useState(false);

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

    // If simulator session is active, ask for confirmation
    if (simulatorActive && activeTab === 'simulator') {
      if (window.appUI._simulatorRequestLeave) {
        const allowed = window.appUI._simulatorRequestLeave(() => {
          // Callback: user confirmed leave
          setNavAction('tab');
          setActiveTab(tabId);
        });
        if (!allowed) return; // blocked, dialog shown
      }
    }

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
        content = <SimulatorSection theme={t} onSessionChange={setSimulatorActive} />;
        break;
      case 'fun':
        if (currentViewId === 'daily-question') {
          content = <DailyQuestion {...commonProps} />;
        } else if (currentViewId === 'activity-detail') {
          content = <PlaceholderSection title={currentViewProps.name || 'Activity'} theme={t} />;
        } else {
          content = <FunZoneSection {...commonProps} />;
        }
        break;
      case 'profile':
        content = <ProfileSection theme={t} darkModePref={darkModePref} setDarkModePref={setDarkModePref} onLogout={onLogout} />;
        break;
      default:
        content = <PlaceholderSection title="Not Found" theme={t} />;
    }

    // Wrap in animated container
    // The key ensures React recreates the container (triggering CSS animation) on every stack change
    const animationClass = navAction === 'push' ? 'animate-slide-in-right' :
                          navAction === 'pop' ? 'animate-slide-in-left' :
                          navAction === 'tab' ? 'animate-tab-switch' : '';

    return (
      <div key={`${activeTab}-${currentStack.length}`} className={`w-full flex-1 ${animationClass}`}>
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
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide relative overflow-x-hidden flex flex-col">
         {/* Simple header if deep in stack */}
         {currentStack.length > 1 && (
             <div className="absolute top-4 left-4 z-50">
                 <button onClick={pop} className="p-2 rounded-full border border-solid transition-colors" style={{ background: t.glassBg, borderColor: t.glassBorder, color: t.textPrimary }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 </button>
             </div>
         )}

         {renderView()}
      </div>

      {/* Bottom Navigation — flex child, never overflows */}
      <div className="shrink-0 h-20 border-t border-solid" style={{ background: t.glassBg, borderColor: t.glassBorder, transition: 'background 0.3s ease, border-color 0.3s ease' }}>
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
