'use client';

import Link from 'next/link';
import { LogIn, Rocket, Shield, BarChart3, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-yellow-500/30">
            {/* Dynamic Luxury Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Main Radial Ambient */}
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.08)_0%,rgba(15,23,42,0)_50%)]" />

                {/* Animated Light Streaks */}
                <div className="absolute top-0 left-1/4 w-[1px] h-screen bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent" />
                <div className="absolute top-0 right-1/4 w-[1px] h-screen bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTgsMTY1LDMyLDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

                {/* Floating Bokeh Effects */}
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-yellow-600/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-yellow-900/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Premium Navigation Header */}
            <nav className="w-full max-w-7xl px-8 py-8 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-transform group-hover:scale-110">
                        <Sparkles className="text-black h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-widest uppercase italic">Kemet</span>
                </div>

                <Link href="/login" className="group">
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all duration-500 shadow-xl">
                        <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase">Private Access</span>
                    </div>
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center pt-24 pb-32">
                {/* Founder's Edition Badge */}
                <div className="mb-10 inline-flex items-center gap-3 px-5 py-2 bg-yellow-500/5 border border-yellow-500/20 rounded-full animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308]" />
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em]">Foundation Series v2.1</span>
                    <div className="h-[1px] w-8 bg-yellow-500/20" />
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Limited Access</span>
                </div>

                {/* Main Headline */}
                <div className="text-center space-y-6 max-w-4xl">
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none animate-in fade-in zoom-in duration-1000">
                        <span className="bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent">THE NEW STANDARD IN</span>
                        <br />
                        <span className="text-white relative">
                            INTELLECTUAL
                            <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            GROWTH
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        KEMET delivers an elite ecosystem for data architecture,
                        <span className="text-white font-medium"> automated WhatsApp intelligence</span>,
                        and high-velocity lead acquisition.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <Link
                        href="/register"
                        className="group relative px-10 py-5 bg-yellow-500 text-black font-black uppercase tracking-[0.2em] text-sm rounded-sm hover:bg-white transition-all duration-500 shadow-[0_20px_40px_-15px_rgba(234,179,8,0.4)]"
                    >
                        Establish Presence
                        <div className="absolute inset-0 border border-black/10 scale-90 group-hover:scale-100 transition-transform opacity-0 group-hover:opacity-100" />
                    </Link>

                    <Link
                        href="/login"
                        className="px-10 py-5 border border-white/10 text-white font-bold uppercase tracking-[0.2em] text-sm rounded-sm hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-500 flex items-center gap-3"
                    >
                        Sign In <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Feature Grid - The "Elite Capabilities" */}
                <div className="mt-48 w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {[
                        {
                            icon: MessageSquare,
                            title: 'Neural WhatsApp',
                            desc: 'Architect localized marketing campaigns with zero latency and automated lead harvesting.',
                            color: 'from-yellow-500/20'
                        },
                        {
                            icon: Shield,
                            title: 'Legacy CRM',
                            desc: 'Sovereign data management with RBAC protocols and enterprise-grade relationship tracking.',
                            color: 'from-blue-500/20'
                        },
                        {
                            icon: BarChart3,
                            title: 'Velocity Analytics',
                            desc: 'Real-time performance metrics and predictive growth insights across all client touchpoints.',
                            color: 'from-purple-500/20'
                        }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl hover:border-yellow-500/30 hover:bg-yellow-500/[0.02] transition-all duration-500"
                        >
                            <div className={`w-12 h-12 mb-6 bg-gradient-to-br ${feature.color} to-transparent border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <feature.icon className="h-6 w-6 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 tracking-wider uppercase italic">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-light">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer Signature */}
            <footer className="w-full py-16 px-8 border-t border-white/5 bg-slate-950/30 relative z-10 text-center">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 opacity-30 grayscale saturate-0 mb-4 transition-all hover:opacity-100 hover:grayscale-0 hover:saturate-100">
                        <Rocket className="h-4 w-4 text-yellow-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Project Kemet</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium uppercase tracking-[0.4em]">
                        &copy; 2026 KEMET GLOBAL ADVERTISING & TECHNOLOGY ACQUISITIONS
                    </p>
                </div>
            </footer>
        </div>
    );
}

