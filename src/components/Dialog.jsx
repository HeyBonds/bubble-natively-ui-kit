import React, { useState, useEffect, useCallback } from 'react';

/**
 * Dialog — Reusable themed modal.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void (called on backdrop tap or cancel action)
 *  - title: string
 *  - children: React node (body content)
 *  - actions: [{ label, onClick, primary?, disabled? }]
 *  - theme: theme object (from MainTabs)
 *  - closeOnBackdrop: boolean (default true)
 */
const Dialog = ({ open, onClose, title, children, actions = [], theme, closeOnBackdrop = true }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, visible]);

  const handleBackdrop = useCallback(() => {
    if (closeOnBackdrop && onClose) onClose();
  }, [closeOnBackdrop, onClose]);

  if (!visible) return null;

  const d = {
    dialogBg: theme.dialogBg || theme.simulator?.dialogBg,
    dialogBorder: theme.dialogBorder || theme.simulator?.dialogBorder,
    dialogTitle: theme.dialogTitle || theme.simulator?.dialogTitle,
    dialogText: theme.dialogText || theme.simulator?.dialogText,
    dialogDimBg: theme.dialogDimBg || theme.simulator?.dialogDimBg,
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={`absolute top-0 left-0 right-0 bottom-0 ${closing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
        style={{ background: d.dialogDimBg }}
        onClick={handleBackdrop}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl p-6 border border-solid ${closing ? 'dialog-card-out' : 'dialog-card-in'}`}
        style={{ background: d.dialogBg, borderColor: d.dialogBorder }}
      >
        {title && (
          <h3 className="font-jakarta font-extrabold text-[18px] mb-3 text-center" style={{ color: d.dialogTitle }}>
            {title}
          </h3>
        )}

        <div className="font-poppins text-[14px] leading-relaxed text-center" style={{ color: d.dialogText }}>
          {children}
        </div>

        {actions.length > 0 && (
          <div className="flex flex-col gap-3 mt-6">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`w-full py-3 rounded-xl font-jakarta font-extrabold text-[14px] border-b-[4px] border-solid active:border-b-0 active:translate-y-[1px] transition-[transform] duration-100 ${
                  action.disabled ? 'opacity-40' : ''
                }`}
                style={action.primary ? {
                  background: '#58CC02',
                  borderColor: '#46A302',
                  color: '#FFFFFF',
                } : {
                  background: d.dialogBg,
                  borderColor: d.dialogBorder,
                  color: d.dialogTitle,
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
