'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAccounts, setShowAccounts] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const testAccounts = [
        { email: 'admin@kemet.sys', password: 'kemet123', role: 'SUPER_ADMIN', label: 'Platform Admin' },
        { email: 'ceo@acme.corp', password: 'kemet123', role: 'ORG_ADMIN', label: 'Client CEO' },
        { email: 'agent@acme.corp', password: 'kemet123', role: 'EMPLOYEE', label: 'Agent' },
    ];

    const fillAccount = (account: typeof testAccounts[0]) => {
        setEmail(account.email);
        setPassword(account.password);
        setShowAccounts(false);
        toast.success(`Filled credentials for ${account.label}`);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            const { token, ...userData } = data;
            login(token, userData as any);
            toast.success('Login successful!');
            router.push('/dashboard');
        } catch (err) {
            toast.error('Connection error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 flex items-center justify-center relative overflow-hidden p-6">
            {/* Luxury gold ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-600/10 via-yellow-900/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTgsMTY1LDMyLDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
            </div>

            {/* Back to home link */}
            <Link
                href="/"
                className="absolute top-8 left-8 text-sm text-slate-400 hover:text-yellow-500 transition-colors flex items-center gap-2 group"
            >
                <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to home
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
                                <button
                                    key={account.email}
                                    onClick={() => fillAccount(account)}
                                    className="w-full p-3 bg-yellow-950/30 border border-yellow-600/10 rounded-lg hover:border-yellow-500/30 transition-all group cursor-pointer text-left"
                                >
                                    <p className="text-xs font-bold text-yellow-400 mb-1">{account.label}</p>
                                    <p className="text-[10px] font-mono text-yellow-500/70">{account.email}</p>
                                    <p className="text-[9px] font-mono text-slate-500 mt-1">Password: kemet123</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-slate-950/80 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-8 shadow-2xl shadow-yellow-600/5">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-tight mb-2">
                            KEMET
                        </h1>
                        <p className="text-sm text-slate-400">Premium CRM Platform</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold rounded-lg shadow-lg shadow-yellow-600/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
