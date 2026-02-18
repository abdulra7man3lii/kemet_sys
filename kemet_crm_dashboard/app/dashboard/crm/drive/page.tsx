'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Cloud, FileText, Upload, FolderPlus, MoreHorizontal } from 'lucide-react';

export default function DrivePage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <HardDrive className="h-8 w-8 text-yellow-600" /> KEMET Drive
                    </h1>
                    <p className="text-slate-500 font-medium">Secure document storage for your leads and internal assets.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-slate-600 border-yellow-600/10 hover:bg-yellow-50/50 hover:text-yellow-700 border-2 transition-all font-bold">
                        <FolderPlus className="h-4 w-4 mr-2" /> New Folder
                    </Button>
                    <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                        <Upload className="h-4 w-4 mr-2" /> Upload File
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white hover:border-blue-300 transition-colors cursor-pointer group">
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                        <FileText className="h-8 w-8 text-red-500" />
                        <MoreHorizontal className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-xs font-bold text-slate-900 truncate">Marketing_Kit.pdf</p>
                        <p className="text-[10px] text-slate-400 font-medium">2.4 MB • Just now</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                        <Cloud className="h-8 w-8 text-blue-300" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">Your drive is clear</CardTitle>
                    <CardDescription className="max-w-xs mt-2">
                        Drag and drop files here to securely upload them to your organization's private cloud.
                    </CardDescription>
                </CardContent>
            </Card>
        </div>
    );
}
