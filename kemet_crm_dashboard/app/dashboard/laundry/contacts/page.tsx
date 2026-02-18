'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, List, Filter, Search, Download } from 'lucide-react';

export default function ContactsPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-yellow-600" /> All Normalized Contacts
                    </h1>
                    <p className="text-slate-500 font-medium">A global view of your clean, standardized contact database.</p>
                </div>
                <Button variant="outline" className="border-yellow-600/10 hover:bg-yellow-50/50 text-slate-600 hover:text-yellow-700 border-2 font-bold transition-all">
                    <Download className="h-4 w-4 mr-2" /> Export All
                </Button>
            </div>

            <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-lg font-bold">Contact Repository</CardTitle>
                        <CardDescription>Search across all imported lists.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                placeholder="Search contacts..."
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600"
                            />
                        </div>
                        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="h-40 flex flex-col items-center justify-center text-slate-400">
                    <List className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm italic">The master contact repository is empty. Import a list to get started.</p>
                </CardContent>
            </Card>
        </div>
    );
}
