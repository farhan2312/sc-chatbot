'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordLogin = async () => {
        if (!password.trim()) return;
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            password,
            redirect: false,
            callbackUrl: '/',
        });

        if (result?.error) {
            setError('Incorrect password. Please try again.');
            setLoading(false);
        } else {
            window.location.href = result?.url || '/';
        }
    };

    const handleSSOLogin = () => {
        signIn('azure-ad', { callbackUrl: '/' });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#162a1e] to-slate-950 relative overflow-hidden">

            {/* Subtle background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#307c4c]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-sm mx-4">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center gap-7">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-5">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(48,124,76,0.35)]">
                            <Image
                                src="/nesr-logo.jpg"
                                alt="Supply Chain AI"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-semibold text-white tracking-tight">
                                Welcome to Supply Chain AI
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Intelligent Supply Chain Assistant
                            </p>
                        </div>
                    </div>

                    {/* SSO Button */}
                    <button
                        onClick={handleSSOLogin}
                        className="w-full flex items-center justify-center gap-3 bg-[#307c4c] hover:bg-[#25603a] active:bg-[#1f5232] text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#307c4c]/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
                    >
                        <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                        </svg>
                        Continue with SSO
                    </button>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {/* Password Section */}
                    <div className="w-full flex flex-col gap-3">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                            placeholder="Enter password"
                            className="w-full bg-slate-950/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#307c4c] focus:border-transparent transition-all"
                        />

                        {error && (
                            <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handlePasswordLogin}
                            disabled={!password.trim() || loading}
                            className={`w-full py-3 px-5 rounded-xl text-sm font-semibold transition-all duration-200 border ${password.trim() && !loading
                                    ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Signing in…' : 'Login with Password'}
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-slate-500 text-xs text-center">
                        NESR Internal Tool • Authorized Personnel Only
                    </p>

                </div>
            </div>
        </div>
    );
}
