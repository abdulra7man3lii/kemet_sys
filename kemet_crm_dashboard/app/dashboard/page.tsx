'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Users,
    User as UserIcon,
    TrendingUp,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Filter,
    MessageSquare,
    Zap,
    Mail,
    Globe,
    CheckSquare,
    Calendar as CalendarIcon,
    HardDrive,
    Eraser,
    List,
    DollarSign,
    PieChart,
    Shield,
    Activity,
    LayoutDashboard
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Stats {
    totalLeads: number;
    myLeads: number;
    customersCount: number;
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get<Stats>('/customers/stats');
                setStats(data);
            } catch (err) {
                console.error('Failed to load stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* KEMET Luxury Header */}
            <div className="relative overflow-hidden rounded-3xl bg-[#070B14] p-10 border border-[#1B2A40] shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-[#D4AF37] tracking-tighter flex items-center gap-4 font-serif italic">
                            {user?.organizationName ? `${user.organizationName}` : 'KEMET'}
                            <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-md font-mono font-black uppercase tracking-widest border border-[#D4AF37]/20 not-italic">Engine v2.0</span>
                        </h1>
                        <p className="text-[#8A93A5] font-bold text-sm mt-3 uppercase tracking-widest opacity-80">Command Center · <span className="text-[#D4AF37] font-black">{user?.organizationName || 'Master Organization'}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#111C2E] border border-[#1B2A40] rounded-xl">
                            <div className="w-2 h-2 bg-[#1FBF75] rounded-full animate-pulse shadow-[0_0_8px_#1FBF75]" />
                            <span className="text-xs font-black text-[#E6EAF0] uppercase tracking-widest">System Optimal</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-12">
                <div className="sticky top-[64px] z-20 py-6 -mx-8 px-8 bg-[#0E1624]/95 backdrop-blur-xl border-b border-[#1B2A40] transition-all">
                    <TabsList className="bg-[#111C2E] p-1.5 border border-[#1B2A40] rounded-2xl h-14 w-full md:w-max flex justify-start md:justify-center mx-auto shadow-2xl">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#070B14] text-[#8A93A5] font-black px-8 py-2.5 rounded-xl transition-all hover:text-[#D4AF37] text-sm uppercase tracking-widest italic">
                            Overview
                        </TabsTrigger>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <TabsTrigger value="marketing" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#070B14] text-[#8A93A5] font-black px-8 py-2.5 rounded-xl transition-all hover:text-[#D4AF37] text-sm uppercase tracking-widest italic">
                                Marketing
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="crm" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#070B14] text-[#8A93A5] font-black px-8 py-2.5 rounded-xl transition-all hover:text-[#D4AF37] text-sm uppercase tracking-widest italic">
                            CRM Ops
                        </TabsTrigger>
                        <TabsTrigger value="laundry" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#070B14] text-[#8A93A5] font-black px-8 py-2.5 rounded-xl transition-all hover:text-[#D4AF37] text-sm uppercase tracking-widest italic">
                            Data Laundry
                        </TabsTrigger>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <TabsTrigger value="finance" className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#070B14] text-[#8A93A5] font-black px-8 py-2.5 rounded-xl transition-all hover:text-[#D4AF37] text-sm uppercase tracking-widest italic">
                                Finance Hub
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-xl group hover:border-[#D4AF37]/50 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A93A5] group-hover:text-[#D4AF37] transition-colors font-serif italic">
                                    {user?.role === 'EMPLOYEE' ? 'Target Leads' : 'Global Leads'}
                                </CardTitle>
                                <Users className="h-4 w-4 text-[#D4AF37]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-[#E6EAF0] italic tracking-tighter">
                                    {loading ? '...' : stats?.totalLeads || 0}
                                </div>
                                <p className="text-[10px] font-bold text-[#8A93A5] mt-1 uppercase tracking-widest">
                                    {user?.role === 'EMPLOYEE' ? 'Directly Managed' : 'Organization Wide'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-xl border-l-4 border-l-[#D4AF37] group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full -mr-10 -mt-10" />
                            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] font-serif italic">Personalized</CardTitle>
                                <UserIcon className="h-4 w-4 text-[#D4AF37]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-[#E6EAF0] italic tracking-tighter">{loading ? '...' : stats?.myLeads}</div>
                                <p className="text-[10px] font-bold text-[#D4AF37]/80 mt-1 uppercase tracking-widest font-mono">Assigned Assets</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-xl group hover:border-[#1FBF75]/50 transition-all border-l-4 border-l-[#1FBF75]">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A93A5] group-hover:text-[#1FBF75] transition-colors font-serif italic">Converted</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-[#1FBF75]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-[#E6EAF0] italic tracking-tighter">{loading ? '...' : stats?.customersCount}</div>
                                <p className="text-[10px] font-bold text-[#1FBF75]/80 mt-1 uppercase tracking-widest font-mono">Enterprise Clients</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#070B14] border-[#1B2A40] shadow-2xl transition-all border-r-4 border-r-[#D4AF37] group">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] font-serif italic italic">Engine Status</CardTitle>
                                <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-[#D4AF37] italic tracking-tighter">100%</div>
                                <p className="text-[10px] font-bold text-[#D4AF37]/80 mt-1 uppercase tracking-widest font-mono">Optimal Flow</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white border border-yellow-600/20 shadow-2xl shadow-yellow-600/10 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 bg-yellow-600/10 rounded-full blur-3xl transition-transform group-hover:scale-150" />
                            <CardHeader>
                                <CardTitle className="text-2xl font-black bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent italic uppercase tracking-tighter">System Readiness</CardTitle>
                                <CardDescription className="text-slate-400 font-medium">KEMET is expanding. All premium services are now fully isolated and secure.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 font-bold uppercase tracking-widest text-[10px]">CRM: ACTIVE</Badge>
                                    <Badge className="bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase tracking-widest text-[10px]">LAUNDRY: ACTIVE</Badge>
                                    <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-700 text-black border-none font-black italic uppercase tracking-widest text-[10px]">Finance: NEW</Badge>
                                    <Badge className="bg-slate-500 text-black border-none font-black italic uppercase tracking-widest text-[10px]">Marketing: PHARAOH</Badge>
                                </div>
                                <Button asChild className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-xl shadow-yellow-600/20 border-none h-11 font-black uppercase tracking-wider group">
                                    <Link href="/dashboard/customers">
                                        ACCESS ALL SERVICES <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle>System Activity</CardTitle>
                                <CardDescription>Real-time status of modular services.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-slate-600 py-3 border-b border-slate-50 transition-colors hover:bg-yellow-50/30">
                                    <div className="h-8 w-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-700 shadow-sm"><CheckSquare className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        Core <span className="font-bold text-slate-900 uppercase tracking-tighter italic">CRM Engine</span> successfully deployed.
                                    </div>
                                    <span className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">LIVE</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 py-3 border-b border-slate-50 transition-colors hover:bg-yellow-50/30">
                                    <div className="h-8 w-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-700"><Eraser className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <span className="font-bold text-slate-900">Data Laundry</span> list importer is ready for batch processing.
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Online</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 py-3 border-b border-slate-50 transition-colors hover:bg-yellow-50/30">
                                    <div className="h-8 w-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-700"><DollarSign className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <span className="font-bold text-slate-900">Finance Hub</span> initialized with multi-tenant isolation.
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Ready</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* MARKETING TAB */}
                {user?.role !== 'EMPLOYEE' && (
                    <TabsContent value="marketing" className="animate-in slide-in-from-left duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-yellow-600/10 bg-gradient-to-br from-white to-yellow-50/20 group hover:border-yellow-600/30 transition-all">
                                <CardHeader>
                                    <MessageSquare className="h-8 w-8 text-yellow-600 mb-2 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">WhatsApp</CardTitle>
                                    <Badge className="w-fit bg-yellow-600/20 text-yellow-700 border-yellow-600/30 font-black text-[9px] uppercase tracking-widest">BETA</Badge>
                                </CardHeader>
                                <CardContent className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    Broadcast messaging and transactional sales hub. Under final staging.
                                </CardContent>
                            </Card>
                            <Card className="border-yellow-600/10 bg-gradient-to-br from-white to-yellow-50/20 group hover:border-yellow-600/30 transition-all">
                                <CardHeader>
                                    <Mail className="h-8 w-8 text-yellow-600 mb-2 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Email</CardTitle>
                                    <Badge className="w-fit bg-slate-950 text-white border-none font-black text-[9px] uppercase tracking-widest">IN DEVELOPMENT</Badge>
                                </CardHeader>
                                <CardContent className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    Campaign builder and automated drip sequences. Integration in progress.
                                </CardContent>
                            </Card>
                            <Card className="border-yellow-600/10 bg-gradient-to-br from-white to-yellow-50/20 group hover:border-yellow-600/30 transition-all">
                                <CardHeader>
                                    <Globe className="h-8 w-8 text-yellow-600 mb-2 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Social Media</CardTitle>
                                    <Badge className="w-fit bg-slate-100 text-slate-400 border-none font-black text-[9px] uppercase tracking-widest text-xs italic">PLANNED</Badge>
                                </CardHeader>
                                <CardContent className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    Unified posting and message inbox for FB, IG, and X.
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}

                {/* CRM TAB */}
                <TabsContent value="crm" className="animate-in slide-in-from-left duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="hover:border-yellow-600/30 transition-all shadow-sm hover:shadow-md bg-white border-yellow-600/10">
                            <CardHeader className="pb-2">
                                <Users className="h-5 w-5 text-yellow-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-tighter">Leads</CardTitle>
                            </CardHeader>
                            <CardContent className="text-[10px] font-black text-green-600 tracking-widest uppercase">FULLY OPERATIONAL</CardContent>
                        </Card>
                        <Card className="hover:border-yellow-600/30 transition-all shadow-sm hover:shadow-md bg-white border-yellow-600/10">
                            <CardHeader className="pb-2">
                                <CheckSquare className="h-5 w-5 text-yellow-600" />
                                <CardTitle className="text-sm font-black uppercase tracking-tighter">Tasks</CardTitle>
                            </CardHeader>
                            <CardContent className="text-[10px] font-black text-yellow-600/60 italic uppercase tracking-widest">Core Synced</CardContent>
                        </Card>
                        <Card className="hover:border-yellow-600/30 transition-all shadow-sm hover:shadow-md bg-white border-yellow-600/10 opacity-60">
                            <CardHeader className="pb-2">
                                <CalendarIcon className="h-5 w-5 text-slate-400" />
                                <CardTitle className="text-sm font-black uppercase tracking-tighter text-slate-400">Calendar</CardTitle>
                            </CardHeader>
                            <CardContent className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest">Under Construction</CardContent>
                        </Card>
                        <Card className="hover:border-yellow-600/30 transition-all shadow-sm hover:shadow-md bg-white border-yellow-600/10 opacity-60">
                            <CardHeader className="pb-2">
                                <HardDrive className="h-5 w-5 text-slate-400" />
                                <CardTitle className="text-sm font-black uppercase tracking-tighter text-slate-400">Drive</CardTitle>
                            </CardHeader>
                            <CardContent className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest">Staging Area</CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* LAUNDRY TAB */}
                {user?.role !== 'EMPLOYEE' && (
                    <TabsContent value="laundry" className="animate-in slide-in-from-left duration-300">
                        <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/10 shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-yellow-600/5">
                                <div>
                                    <CardTitle className="flex items-center gap-2 font-black uppercase tracking-tighter italic">
                                        <Eraser className="h-6 w-6 text-yellow-600" /> Data Laundry Core
                                    </CardTitle>
                                    <CardDescription>Manage your data quality pipelines.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard/laundry/contacts">View Database</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-8 py-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Repository</p>
                                        <p className="text-2xl font-black text-yellow-700 italic">{stats?.totalLeads || 0} Contacts</p>
                                    </div>
                                    <div className="h-12 w-px bg-slate-100" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Import Status</p>
                                        <p className="text-2xl font-extrabold text-slate-900">{stats?.totalLeads ? 'ACTIVE' : 'READY'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* FINANCE TAB */}
                {user?.role !== 'EMPLOYEE' && (
                    <TabsContent value="finance" className="animate-in slide-in-from-left duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-green-100 bg-green-50/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <DollarSign className="h-8 w-8 text-green-600" />
                                        <Badge className="bg-green-600 text-white border-none text-[10px]">NEW MODULE</Badge>
                                    </div>
                                    <CardTitle className="text-xl font-extrabold mt-2">Company Finance</CardTitle>
                                    <CardDescription>Track income and expenses with organization scoping.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                                        <Link href="/dashboard/finance">Open Finance Hub</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/30 shadow-lg shadow-yellow-600/5 hover:border-yellow-600/40 transition-all group">
                                <CardHeader>
                                    <Shield className="h-8 w-8 text-yellow-600 transition-transform group-hover:scale-110" />
                                    <CardTitle className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase italic mt-2">Team Management</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium">Monitor seat quotas and employee access levels.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full border-yellow-600/20 text-yellow-700 hover:bg-yellow-600 hover:text-white font-bold transition-all" asChild>
                                        <Link href="/dashboard/team">Manage Team</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
