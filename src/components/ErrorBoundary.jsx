import React from 'react';
import { logCrash } from '../utils/firebase';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // componentStack is passed as sourceFile — it gets truncated to 100 chars by logCrash
    logCrash('react_boundary', error, errorInfo?.componentStack || '');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="absolute inset-0 bg-[#1F1A2E] flex flex-col items-center justify-center font-jakarta text-center px-8"
          onClick={() => window.location.reload()}
        >
          <div className="w-16 h-16 rounded-full bg-[#FF2258]/20 flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF2258" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-white/60 text-sm mb-8">An unexpected error occurred.</p>
          <button className="bg-[#FF2258] text-white font-medium py-3 px-8 rounded-full text-sm">
            Tap to reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
