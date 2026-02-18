'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus, Clock, AlertCircle } from 'lucide-react';

export default function TasksPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <CheckSquare className="h-8 w-8 text-yellow-600" /> Task Management
                    </h1>
                    <p className="text-slate-500 font-medium">Coordinate team activities and lead follow-ups.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <Plus className="h-4 w-4 mr-2" /> New Task
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-l-4 border-l-yellow-500 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p><h4 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
                <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Progress</p><h4 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
                <Card className="bg-white border-l-4 border-l-green-500 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p><h4 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
                <Card className="bg-white border-l-4 border-l-red-500 shadow-sm"><CardHeader className="p-4"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue</p><h4 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">0</h4></CardHeader></Card>
            </div>

            <Card className="border-yellow-600/10 bg-yellow-50/5 relative overflow-hidden group">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-600/5 mb-6 border border-yellow-600/10 group-hover:scale-110 transition-all duration-500">
                        <CheckSquare className="h-10 w-10 text-yellow-600/30" />
                    </div>
                    <CardTitle className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Your task list is empty</CardTitle>
                    <CardDescription className="max-w-xs mt-3 font-medium text-slate-500">
                        Stay on top of your work by creating tasks for yourself or assigning them to your team.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
