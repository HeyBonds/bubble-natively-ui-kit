import React from 'react';
import { sendToBubble } from '../utils/bubble';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.1 24.1 0 0 0 0 21.56l7.98-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
);

const SignInScreen = ({ theme, onBack }) => {
    const handleGoogleSignIn = () => {
        localStorage.setItem('bonds_auth_pending', 'true');
        sendToBubble('bubble_fn_signin', 'google_signin');
    };

    return (
        <div style={{ background: theme.bg }} className="relative w-full h-full font-jakarta overflow-hidden">
            <div className="flex flex-col h-full px-6 py-10">

                {/* Back button */}
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
                    style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke={theme.textPrimary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Logo */}
                <div className="mx-auto flex flex-col items-center mt-8">
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                        <circle cx="32" cy="32" r="32" fill={theme.textPrimary} />
                        <rect x="19" y="19" width="26" height="26" fill="#FF2258" />
                    </svg>
                    <div
                        className="text-center mt-2 font-bold tracking-widest text-[0.625rem]"
                        style={{ color: theme.textPrimary }}
                    >
                        BONDS
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-[1.25rem]"></div>

                {/* Welcome back heading */}
                <div className="mb-8">
                    <h1
                        className="text-[2rem] leading-[2.375rem] font-normal mb-3"
                        style={{ color: theme.textPrimary }}
                    >
                        Welcome back
                    </h1>
                    <p
                        className="text-base font-light leading-relaxed"
                        style={{ color: theme.textSecondary }}
                    >
                        Sign in to continue your relationship journey
                    </p>
                </div>

                {/* Continue with Google button */}
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full h-[3.625rem] rounded-[2.5rem] bg-white flex items-center justify-center gap-3 shadow-md transform transition active:scale-95"
                    style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                >
                    <GoogleIcon />
                    <span className="font-jakarta font-semibold text-[1rem] text-[#3c4043] tracking-[0.25px]">
                        Continue with Google
                    </span>
                </button>

                {/* Spacer before terms */}
                <div className="flex-1 min-h-[1.25rem]"></div>

                {/* Terms text */}
                <p
                    className="text-center text-[0.6875rem] leading-relaxed"
                    style={{ color: theme.textMuted }}
                >
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default SignInScreen;
