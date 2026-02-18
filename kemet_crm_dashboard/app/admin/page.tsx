'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ShieldAlert,
    Building2,
    Users as UsersIcon,
    Database,
    ArrowUpRight,
    Activity,
    Loader2,
    Globe,
    Zap,
    Plus,
    CreditCard,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformStats {
    orgCount: number;
    userCount: number;
    customerCount: number;
    interactionCount: number;
}

interface Plan {
    id: number;
    name: string;
    description: string;
    price: number;
    userLimit: number;
    features: string[];
}

interface Organization {
    id: number;
    name: string;
    createdAt: string;
    subscription?: {
        status: string;
        plan: {
            name: string;
        };
    };
    _count: {
        users: number;
        customers: number;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlatformData();
    }, []);

    const fetchPlatformData = async () => {
        setLoading(true);
        try {
            const [statsData, orgsData, plansData] = await Promise.all([
                api.get<PlatformStats>('/admin/stats'),
                api.get<Organization[]>('/admin/organizations'),
                api.get<Plan[]>('/admin/plans')
            ]);
            setStats(statsData);
            setOrgs(orgsData);
            setPlans(plansData);
        } catch (err) {
            console.error('Failed to load admin data');
            toast.error('Failed to sync platform data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignPlan = async (orgId: number, planId: number) => {
        try {
            await api.post(`/admin/organizations/${orgId}/subscription`, { planId });
            toast.success('Subscription updated');
            fetchPlatformData();
        } catch (err) {
            toast.error('Failed to update subscription');
        }
    };

    const handleInitializeDefaults = async () => {
        try {
            await api.post('/admin/plans/initialize-defaults', {});
            toast.success('Luxury Tiers initialized');
            fetchPlatformData();
        } catch (err) {
            toast.error('Failed to initialize tiers');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">KEMET Platform Admin</span>
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tighter">System Overview</h1>
                <p className="text-slate-500 font-medium">Manage all organizations and monitor platform-wide activity.</p>
            </div>

            <Tabs defaultValue="organizations" className="space-y-8">
                <TabsList className="bg-slate-950 p-1 border border-yellow-600/20 rounded-xl h-12">
                    <TabsTrigger value="organizations" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white font-bold px-6">
                        <Building2 className="h-4 w-4 mr-2" /> Organizations
                    </TabsTrigger>
                    <TabsTrigger value="plans" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white font-bold px-6">
                        <Zap className="h-4 w-4 mr-2" /> Plan Manager
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="organizations" className="space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Companies', value: stats?.orgCount, icon: <Building2 className="h-5 w-5" />, color: 'bg-gradient-to-br from-yellow-600 to-yellow-700' },
                            { label: 'Total Users', value: stats?.userCount, icon: <UsersIcon className="h-5 w-5" />, color: 'bg-gradient-to-br from-slate-800 to-slate-950' },
                            { label: 'Total Leads', value: stats?.customerCount, icon: <Database className="h-5 w-5" />, color: 'bg-gradient-to-br from-yellow-700 to-yellow-800' },
                            { label: 'Total Interactions', value: stats?.interactionCount, icon: <Activity className="h-5 w-5" />, color: 'bg-gradient-to-br from-slate-700 to-slate-900' },
                        ].map((stat, i) => (
                            <Card key={i} className="border-yellow-600/10 shadow-sm hover:shadow-yellow-600/5 transition-all group overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                                        </div>
                                        <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-yellow-600/5 group-hover:scale-110 transition-transform`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Organizations Table */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Registered Organizations</CardTitle>
                                    <CardDescription>Comprehensive list of all business tenants on the platform.</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-white px-3 py-1 text-slate-600 font-bold">
                                    {orgs.length} Active Tenants
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-wider py-4">Company Name</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-wider py-4">Subscription</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-wider py-4">Employees</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-wider py-4">Total Leads</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-wider py-4 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orgs.map((org) => (
                                        <TableRow key={org.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-bold text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <Building2 className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    {org.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant={org.subscription?.status === 'ACTIVE' ? 'default' : 'secondary'} className={org.subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}>
                                                        {org.subscription?.plan?.name || 'NO PLAN'}
                                                    </Badge>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{org.subscription?.status || 'PENDING'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <UsersIcon className="h-3 w-3" />
                                                    {org._count.users}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Database className="h-3 w-3" />
                                                    {org._count.customers}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        className="text-[10px] font-bold border-none bg-slate-100 rounded px-2 py-1 outline-none"
                                                        onChange={(e) => handleAssignPlan(org.id, parseInt(e.target.value))}
                                                        value={plans.find(p => p.name === org.subscription?.plan?.name)?.id || ''}
                                                    >
                                                        <option value="">Set Plan...</option>
                                                        {plans.map(plan => (
                                                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                                                        ))}
                                                    </select>
                                                    <button className="text-yellow-600 hover:text-yellow-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors">
                                                        Manage <ArrowUpRight className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="plans" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter">Luxury Tiers</h2>
                            <p className="text-slate-500 font-medium">Define product packages and feature availability.</p>
                        </div>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
                            <Plus className="h-4 w-4 mr-2" /> Create New Tier
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="border-yellow-600/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <CreditCard className="h-8 w-8 text-yellow-600/20 group-hover:text-yellow-600/40 transition-colors" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{plan.name}</CardTitle>
                                    <CardDescription className="font-medium text-slate-500">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-yellow-700">${plan.price}</span>
                                        <span className="text-slate-400 text-xs font-bold font-mono">/MO</span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Features</p>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                {feature}
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            Up to {plan.userLimit} Users
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {plans.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <Globe className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">No Plans Defined</h3>
                                <p className="text-slate-500 mb-6">Start by creating your first subscription tier.</p>
                                <Button
                                    variant="outline"
                                    className="border-yellow-600/50 text-yellow-700 hover:bg-yellow-50"
                                    onClick={handleInitializeDefaults}
                                >
                                    Initialize Defaults
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
