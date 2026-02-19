'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, ResponsiveContainer, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, Users, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#D4AF37', '#3B82F6', '#1FBF75', '#F5A524', '#E5484D'];

interface LeadAnalysisProps {
    stats: {
        statusBreakdown: { status: string; count: number }[];
        recentGrowth: { date: string; count: number }[];
    };
}

export function LeadAnalysis({ stats }: LeadAnalysisProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-150" />
                <CardHeader>
                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-[#D4AF37]">
                        <PieIcon className="h-5 w-5" /> Pipeline Distribution
                    </CardTitle>
                    <CardDescription className="text-[#8A93A5] font-medium text-sm">Strategic breakdown of contact lifecycle stages.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.statusBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="count"
                                nameKey="status"
                                stroke="none"
                            >
                                {stats.statusBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#070B14', border: '1px solid #1B2A40', borderRadius: '12px', color: '#E6EAF0' }}
                                itemStyle={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-150" />
                <CardHeader>
                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-[#D4AF37]">
                        <TrendingUp className="h-5 w-5" /> Acquisition Trend
                    </CardTitle>
                    <CardDescription className="text-[#8A93A5] font-medium text-sm">Chronological development of lead acquisition.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.recentGrowth}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B2A40" strokeOpacity={0.4} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 'black', fill: '#8A93A5' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 'black', fill: '#8A93A5' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#0E1624' }}
                                contentStyle={{ backgroundColor: '#070B14', border: '1px solid #1B2A40', borderRadius: '12px', color: '#E6EAF0' }}
                            />
                            <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
