import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkBanner = ({ theme }) => {
  const { isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setDismissing(false);
    } else if (visible) {
      setDismissing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setDismissing(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOnline, visible]);

  if (!visible) return null;

  const isDark = theme.isDark;

  return createPortal(
    <div
      className={`fixed top-0 left-0 right-0 z-[10000] ${dismissing ? 'network-banner-out' : 'network-banner-in'}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className="flex items-center justify-center gap-2 px-4 py-3 font-poppins text-[0.8125rem] font-medium"
        style={{
          background: isDark ? 'rgba(180,40,40,0.95)' : 'rgba(220,50,50,0.95)',
          color: '#FFFFFF',
        }}
      >
        {/* Warning icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>No internet connection</span>
      </div>
    </div>,
    document.body
  );
};

export default NetworkBanner;
