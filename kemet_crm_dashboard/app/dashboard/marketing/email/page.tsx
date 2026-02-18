'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Send, Filter, BarChart } from 'lucide-react';

export default function EmailMarketingPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <Mail className="h-8 w-8 text-yellow-600" /> Email Campaigns
                    </h1>
                    <p className="text-slate-500 font-medium">Design, send, and track professional email marketing.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <Send className="h-4 w-4 mr-2" /> Start Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-yellow-600/10 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscribers</p><h4 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
                <Card className="border-yellow-600/10 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Rate</p><h4 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0%</h4></CardHeader></Card>
                <Card className="border-yellow-600/10 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click Rate</p><h4 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0%</h4></CardHeader></Card>
                <Card className="border-yellow-600/10 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unsubscribes</p><h4 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
            </div>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Recent Campaigns</CardTitle>
                    <CardDescription>Performance of your latest email blasts.</CardDescription>
                </CardHeader>
                <CardContent className="h-32 flex items-center justify-center border-t border-slate-100 bg-slate-50/30">
                    <p className="text-sm text-slate-400 italic">No campaigns found. Start by importing a mailing list.</p>
                </CardContent>
            </Card>
        </div>
    );
}
