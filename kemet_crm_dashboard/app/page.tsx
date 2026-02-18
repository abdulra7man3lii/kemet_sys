'use client';

import Link from 'next/link';
import { LogIn, User } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
    const [showAccounts, setShowAccounts] = useState(false);

    const testAccounts = [
        { email: 'admin@kemet.sys', role: 'SUPER_ADMIN', label: 'Platform Admin' },
        { email: 'ceo@acme.corp', role: 'ORG_ADMIN', label: 'Client CEO' },
        { email: 'agent@acme.corp', role: 'EMPLOYEE', label: 'Agent' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Luxury gold ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-yellow-600/10 via-yellow-900/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTgsMTY1LDMyLDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
            </div>

            {/* Floating Login Button */}
            <Link
                href="/login"
                className="fixed top-8 right-8 z-50 group"
            >
                <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-600/30 rounded-lg backdrop-blur-sm hover:border-yellow-500/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    <LogIn className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-400 tracking-wide">ENTER</span>
                </div>
            </Link>

            {/* Quick Test Accounts Panel */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={() => setShowAccounts(!showAccounts)}
                    className="flex items-center gap-2 px-3 py-2 bg-yellow-950/20 border border-yellow-600/20 rounded-lg backdrop-blur-sm hover:border-yellow-500/40 transition-all duration-300 mb-2"
                >
                    <User className="h-4 w-4 text-yellow-500/70" />
                    <span className="text-xs font-semibold text-yellow-400/70">Test Accounts</span>
                </button>

                {showAccounts && (
                    <div className="bg-slate-950/95 border border-yellow-600/20 rounded-lg p-4 backdrop-blur-md w-72 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <p className="text-xs font-bold text-yellow-500/60 uppercase tracking-wide mb-3">Quick Login</p>
                        <div className="space-y-2">
                            {testAccounts.map((account) => (
                                <div key={account.email} className="p-3 bg-yellow-950/30 border border-yellow-600/10 rounded-lg hover:border-yellow-500/30 transition-all group cursor-pointer">
                                    <p className="text-xs font-bold text-yellow-400 mb-1">{account.label}</p>
                                    <p className="text-[10px] font-mono text-yellow-500/70">{account.email}</p>
                                    <p className="text-[9px] font-mono text-slate-500 mt-1">Password: kemet123</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6">
                {/* Luxury Logo */}
                <div className="mb-8">
                    <h1 className="text-8xl font-black bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        KEMET
                    </h1>
                    <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full" />
                </div>

                {/* Tagline */}
                <p className="text-xl font-light text-slate-400 mb-2 tracking-wide">
                    Premium CRM Platform
                </p>
                <p className="text-sm text-slate-500 font-medium tracking-wider">
                    Enterprise-Grade Customer Management
                </p>

                {/* Version Badge */}
                <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-yellow-600/10 border border-yellow-600/20 rounded-full">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-yellow-500/80 uppercase tracking-widest">Version 2.0.0 — RBAC Edition</span>
                </div>
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/20 to-transparent" />
        </div>
    );
}
