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
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1a3a28] via-[#1e4530] to-[#0f2017] relative overflow-hidden">

            {/* Background decorative blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#307c4c]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#307c4c]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Frosted glass card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 flex flex-col items-center gap-6">

                    {/* Logo + Title */}
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/30">
                            <Image
                                src="/nesr-logo.jpg"
                                alt="NESR Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Welcome to Supply Chain AI
                            </h1>
                            <p className="text-sm text-white/60 mt-1">
                                Intelligent Supply Chain Assistant
                            </p>
                        </div>
                    </div>

                    {/* SSO Button */}
                    <button
                        onClick={handleSSOLogin}
                        className="w-full flex items-center justify-center gap-3 bg-[#307c4c] hover:bg-[#28663E] active:bg-[#1f5232] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#307c4c]/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {/* Microsoft Logo */}
                        <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                        </svg>
                        Continue with SSO
                    </button>

                    {/* Divider */}
                    <div className="w-full flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/20" />
                        <span className="text-xs text-white/40 font-medium tracking-widest uppercase">or</span>
                        <div className="flex-1 h-px bg-white/20" />
                    </div>

                    {/* Password Section */}
                    <div className="w-full flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                                placeholder="Enter password"
                                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#307c4c]/60 focus:border-[#307c4c]/60 transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs text-center font-medium bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handlePasswordLogin}
                            disabled={!password.trim() || loading}
                            className={`w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-200 ${password.trim() && !loading
                                ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Signing in…' : 'Login with Password'}
                        </button>
                    </div>

                    <p className="text-white/25 text-[10px] text-center mt-2">
                        NESR Internal Tool • Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
}
