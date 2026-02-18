'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Zap, BarChart3, Settings } from 'lucide-react';

export default function WhatsAppMarketingPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-green-500" /> WhatsApp Marketing
                    </h1>
                    <p className="text-slate-500 font-medium">Broadcast messages and manage conversational sales.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <Zap className="h-4 w-4 mr-2" /> New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/10 shadow-lg shadow-yellow-600/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Broadcasts</CardTitle>
                        <h3 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h3>
                    </CardHeader>
                </Card>
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/10 shadow-lg shadow-yellow-600/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Messages Sent</CardTitle>
                        <h3 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h3>
                    </CardHeader>
                </Card>
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/10 shadow-lg shadow-yellow-600/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Open Rate</CardTitle>
                        <h3 className="text-3xl font-black bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">0%</h3>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-dashed border-2 border-yellow-600/20 bg-yellow-50/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />
                <CardContent className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-600/10 mb-6 border border-yellow-600/10 rotate-3 group-hover:rotate-0 transition-all duration-500">
                        <MessageSquare className="h-10 w-10 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">No active campaigns</CardTitle>
                    <CardDescription className="max-w-xs mt-3 font-medium text-slate-500">
                        Connect your WhatsApp Business API to start reaching your customers where they are.
                    </CardDescription>
                    <Button variant="outline" className="mt-8 border-yellow-600/20 hover:bg-yellow-600/10 text-yellow-700 font-bold px-8 border-2">
                        <Settings className="h-4 w-4 mr-2" /> Connect API
                    </Button>
                </CardContent>
            </Card>
        </div >
    );
}

function CardMockup({ children }: { children: React.ReactNode }) {
    return <CardHeader className="pb-2">{children}</CardHeader>
}
