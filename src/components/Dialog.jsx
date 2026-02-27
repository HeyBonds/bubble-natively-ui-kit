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

  const sim = theme.simulator;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${closing ? 'dialog-overlay-out' : 'dialog-overlay-in'}`}
        style={{ background: sim.dialogDimBg }}
        onClick={handleBackdrop}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl p-6 border border-solid ${closing ? 'dialog-card-out' : 'dialog-card-in'}`}
        style={{ background: sim.dialogBg, borderColor: sim.dialogBorder }}
      >
        {title && (
          <h3 className="font-jakarta font-extrabold text-[18px] mb-3 text-center" style={{ color: sim.dialogTitle }}>
            {title}
          </h3>
        )}

        <div className="font-poppins text-[14px] leading-relaxed text-center" style={{ color: sim.dialogText }}>
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
                  background: sim.dialogBg,
                  borderColor: sim.dialogBorder,
                  color: sim.dialogTitle,
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
