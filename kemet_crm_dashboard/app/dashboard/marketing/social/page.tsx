'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, Facebook, Twitter, Layout, BarChart, Plus } from 'lucide-react';

export default function SocialMediaPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <Globe className="h-8 w-8 text-yellow-600" /> Social Media Management
                    </h1>
                    <p className="text-slate-500 font-medium">Manage posts, messages, and engagement across all social platforms.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <Plus className="h-4 w-4 mr-2" /> New Post
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center p-6 gap-4 border-yellow-600/10 shadow-sm hover:border-yellow-600/30 transition-all bg-gradient-to-br from-white to-yellow-50/20 group">
                    <div className="h-12 w-12 bg-yellow-100/50 rounded-2xl flex items-center justify-center text-yellow-700 shadow-sm transition-transform group-hover:scale-110"><Instagram className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</p><h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Not Connected</h4></div>
                </Card>
                <Card className="flex items-center p-6 gap-4 border-yellow-600/10 shadow-sm hover:border-yellow-600/30 transition-all bg-gradient-to-br from-white to-yellow-50/20 group">
                    <div className="h-12 w-12 bg-yellow-100/50 rounded-2xl flex items-center justify-center text-yellow-700 shadow-sm transition-transform group-hover:scale-110"><Facebook className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facebook</p><h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Not Connected</h4></div>
                </Card>
                <Card className="flex items-center p-6 gap-4 border-yellow-600/10 shadow-sm hover:border-yellow-600/30 transition-all bg-gradient-to-br from-white to-yellow-50/20 group">
                    <div className="h-12 w-12 bg-yellow-100/50 rounded-2xl flex items-center justify-center text-yellow-700 shadow-sm transition-transform group-hover:scale-110"><Twitter className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Twitter / X</p><h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Not Connected</h4></div>
                </Card>
            </div>

            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Planned Posts</CardTitle>
                    <CardDescription>Your upcoming social media schedule.</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex flex-col items-center justify-center border-t border-slate-100 bg-slate-50/20">
                    <Layout className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400 italic">No posts scheduled. Connect an account to start planning.</p>
                </CardContent>
            </Card>
        </div>
    );
}
