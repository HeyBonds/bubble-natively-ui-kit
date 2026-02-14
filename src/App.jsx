import React, { useState, useEffect } from 'react';
import HomeSection from './components/HomeSection';

// Placeholder components for other sections
const PlaceholderSection = ({ title }) => (
  <div className="p-8 text-white text-center">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="opacity-70">Coming Soon</p>
  </div>
);

const App = () => {
  // Navigation State
  // We maintain a stack for each tab to allow independent navigation history
  const [activeTab, setActiveTab] = useState('home');
  const [stacks, setStacks] = useState({
    home: ['home'],
    learn: ['learn'],
    act: ['act'],
    ask: ['ask']
  });
  const [navAction, setNavAction] = useState(null); // 'push', 'pop', or null

  // Mock Props
  const [userProps, setUserProps] = useState({
    userName: 'Jonathan',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    credits: 23
  });

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
    setNavAction(null); // No animation for tab switching for now
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
        ...currentViewProps
    };

    let content;
    switch (activeTab) {
      case 'home':
        if (currentViewId === 'home') content = <HomeSection {...commonProps} />;
        else if (currentViewId === 'details') content = <PlaceholderSection title="Details View (Pushed)" {...commonProps} />;
        else content = <PlaceholderSection title="Unknown View" />;
        break;
      case 'learn':
        content = <PlaceholderSection title="Learn" />;
        break;
      case 'act':
        content = <PlaceholderSection title="Act" />;
        break;
      case 'ask':
        content = <PlaceholderSection title="Ask" />;
        break;
      default:
        content = <PlaceholderSection title="Not Found" />;
    }

    // Wrap in animated container
    // The key ensures React recreates the container (triggering CSS animation) on every stack change
    const animationClass = navAction === 'push' ? 'animate-slide-in-right' : 
                          navAction === 'pop' ? 'animate-slide-in-left' : '';

    return (
      <div key={`${activeTab}-${currentStack.length}`} className={`w-full h-full ${animationClass}`}>
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
        className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out transform ${
            isActive ? 'text-[#FF2258] font-bold scale-110 active-tab-shimmer' : 'text-white/60 font-medium scale-100 opacity-70'
        }`}
      >
        {icon}
        <span className="font-jakarta text-[10px] tracking-wide">{label}</span>
      </button>
    );
  };

  // SVG Icons
  const Icons = {
    home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    learn: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
    act: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>,
    ask: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#2E2740] to-[#1F1A2E] font-poppins overflow-hidden flex flex-col">
      
      {/* Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide relative overflow-x-hidden">
         {/* Simple header if deep in stack */}
         {currentStack.length > 1 && (
             <div className="absolute top-4 left-4 z-50">
                 <button onClick={pop} className="bg-black/20 p-2 rounded-full backdrop-blur-md text-white hover:bg-black/40 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 </button>
             </div>
         )}
         
         {renderView()}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1F1A2E]/95 backdrop-blur-md border-t border-solid border-white/10 z-50">
        <div className="flex items-center justify-around h-full max-w-[500px] mx-auto px-4">
            <NavButton id="home" label="Home" icon={Icons.home} />
            <NavButton id="learn" label="Learn" icon={Icons.learn} />
            <NavButton id="act" label="Act" icon={Icons.act} />
            <NavButton id="ask" label="Ask" icon={Icons.ask} />
        </div>
      </div>

    </div>
  );
};

export default App;
