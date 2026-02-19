'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { UserPlus, ArrowRight, Building, Mail, Lock, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await api.post<any>('/auth/register', {
                name,
                email,
                password,
                companyName
            });

            login(data.token, data);
            toast.success('Dynasty founded successfully!');
            router.push('/dashboard');
        } catch (err: any) {
            // Error is already handled/toasted by handleResponse in api.ts
            console.error('Registration error:', err);
        } finally {
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

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-xl">
                <div className="bg-slate-950/80 backdrop-blur-xl border border-yellow-600/20 rounded-2xl p-8 shadow-2xl shadow-yellow-600/5">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-600/10 border border-yellow-600/20 mb-4">
                            <UserPlus className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-tight mb-2 uppercase italic">
                            Create Legacy
                        </h1>
                        <p className="text-sm text-slate-400 uppercase tracking-widest font-bold opacity-60">Initialize Your Organization</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <UserIcon size={12} className="text-yellow-600" />
                                Full Name
                            </label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all font-medium"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Mail size={12} className="text-yellow-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all font-medium"
                                placeholder="name@dynasty.com"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Lock size={12} className="text-yellow-600" />
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Building size={12} className="text-yellow-600" />
                                Company Name
                            </label>
                            <input
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-yellow-600/20 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 transition-all font-medium"
                                placeholder="Empire Corp"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="col-span-2 mt-4 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-yellow-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? 'Initializing...' : 'Found Dynasty'}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center pt-8 border-t border-yellow-600/10">
                        <p className="text-slate-500 text-sm font-medium">
                            Already part of the legend?{' '}
                            <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-black uppercase tracking-wider underline-offset-4 hover:underline transition-all">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
