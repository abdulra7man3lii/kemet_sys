'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function CalendarPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <CalendarIcon className="h-8 w-8 text-yellow-600" /> CRM Calendar
                    </h1>
                    <p className="text-slate-500 font-medium">Schedule meetings, follow-ups, and business events.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <Plus className="h-4 w-4 mr-2" /> Schedule Event
                </Button>
            </div>

            <Card className="border-slate-200 bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-slate-900">February 2026</h3>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider">Today</Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-wider"><Filter className="h-3 w-3 mr-1" /> View</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-0">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 h-[400px]">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="border-r border-b border-slate-100 p-2 text-[10px] font-bold text-slate-300 hover:bg-slate-50 transition-colors">
                                {i + 1}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
