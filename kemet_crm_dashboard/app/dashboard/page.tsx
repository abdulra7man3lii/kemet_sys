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
            {/* Luxury Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 border border-yellow-600/20 shadow-2xl shadow-yellow-600/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-yellow-600/10 to-transparent blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                            {user?.organizationName ? `${user.organizationName}` : 'KEMET'}
                            <span className="text-xs bg-yellow-600/20 text-yellow-500 px-3 py-1 rounded-full font-mono uppercase tracking-widest border border-yellow-600/30">v2.0</span>
                        </h1>
                        <p className="text-slate-400 font-medium mt-2">Command Center · <span className="text-yellow-500 font-semibold">{user?.organizationName || 'Your Organization'}</span></p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="bg-green-950/30 border-green-600/30 text-green-400 hover:bg-green-950/50 hover:border-green-500/50">
                            <Activity className="h-4 w-4 mr-2" /> System Optimal
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-10">
                <div className="sticky top-[64px] z-20 py-4 -mx-6 px-6 bg-white/80 backdrop-blur-md border-b border-yellow-600/10 shadow-sm transition-all duration-300">
                    <TabsList className="bg-slate-950 p-1 border-2 border-yellow-600/50 rounded-2xl shadow-[0_10px_40px_-10px_rgba(234,179,8,0.3)] h-14 w-full md:w-max flex overflow-x-auto overflow-y-hidden custom-scrollbar justify-start md:justify-center mx-auto">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                            <LayoutDashboard className="h-5 w-5 mr-3" /> Overview
                        </TabsTrigger>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <TabsTrigger value="marketing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                <Zap className="h-5 w-5 mr-3" /> Marketing
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="crm" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                            <CheckSquare className="h-5 w-5 mr-3" /> CRM Ops
                        </TabsTrigger>
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <TabsTrigger value="laundry" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                <Eraser className="h-5 w-5 mr-3" /> Data Laundry
                            </TabsTrigger>
                        )}
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                            <TabsTrigger value="finance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                <DollarSign className="h-5 w-5 mr-3" /> Finance Hub
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/10 shadow-lg shadow-yellow-600/5 group hover:border-yellow-600/40 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-yellow-600 transition-colors">
                                    {user?.role === 'EMPLOYEE' ? 'My Leads' : 'Total Leads'}
                                </CardTitle>
                                <Users className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-slate-900 italic tracking-tighter">
                                    {stats?.totalLeads || 0}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                    {user?.role === 'EMPLOYEE' ? 'Currently Managed' : 'Across Organization'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-600/30 bg-gradient-to-br from-yellow-50 to-white shadow-lg shadow-yellow-600/10 transition-all hover:shadow-xl hover:shadow-yellow-600/20 hover:border-yellow-600/50 border-l-4 border-l-yellow-600 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-yellow-700 uppercase tracking-wider">My Leads</CardTitle>
                                <UserIcon className="h-5 w-5 text-yellow-600 transition-transform group-hover:scale-110" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-600 bg-clip-text text-transparent">{loading ? '...' : stats?.myLeads}</div>
                                <p className="text-xs text-yellow-600 font-bold mt-1">Assigned to you</p>
                            </CardContent>
                        </Card>

                        <Card className="border-green-600/20 bg-gradient-to-br from-white to-green-50/30 shadow-lg shadow-green-600/5 transition-all hover:shadow-xl hover:shadow-green-600/10 hover:border-green-600/40 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customers</CardTitle>
                                <CheckCircle2 className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">{loading ? '...' : stats?.customersCount}</div>
                                <p className="text-xs text-green-600 font-bold mt-1">Successfully closed</p>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-600/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:shadow-slate-900/30 hover:border-yellow-600/40 group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-wider">System Status</CardTitle>
                                <TrendingUp className="h-5 w-5 text-yellow-500 transition-transform group-hover:scale-110" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">100%</div>
                                <p className="text-xs text-yellow-500 font-bold mt-1">All systems operational</p>
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
                                    <Link href="/dashboard/import">Go to Importer</Link>
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
