'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Landmark, CreditCard, ArrowRight } from 'lucide-react';

export default function FinancePage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-yellow-600" /> Business Finance
                    </h1>
                    <p className="text-slate-500 font-medium">Track your company income, expenses, and financial health.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-yellow-600/20 text-slate-600 hover:bg-yellow-50/50 hover:text-yellow-700 transition-all border-2">
                        <TrendingDown className="h-4 w-4 mr-2 text-red-500" /> Record Expense
                    </Button>
                    <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                        <TrendingUp className="h-4 w-4 mr-2" /> Record Income
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-yellow-50/20 shadow-lg shadow-yellow-600/5 hover:border-yellow-600/40 transition-all group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Balance</CardDescription>
                        <CardTitle className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">$0.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-slate-400 font-bold tracking-tight">
                            <Landmark className="h-3 w-3 mr-1.5 text-yellow-600" /> MAIN BUSINESS ACCOUNT
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-green-50/20 shadow-lg shadow-green-600/5 hover:border-green-600/20 transition-all group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-green-600/60">Monthly Income</CardDescription>
                        <CardTitle className="text-4xl font-black text-green-600">+$0.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-green-500 font-bold tracking-tight">
                            <TrendingUp className="h-3 w-3 mr-1.5" /> 0% FROM LAST MONTH
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-yellow-600/20 bg-gradient-to-br from-white to-red-50/20 shadow-lg shadow-red-600/5 hover:border-red-600/20 transition-all group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-red-600/60">Monthly Expenses</CardDescription>
                        <CardTitle className="text-4xl font-black text-red-600">-$0.00</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-xs text-red-500 font-bold tracking-tight">
                            <TrendingDown className="h-3 w-3 mr-1.5" /> 0% FROM LAST MONTH
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-yellow-600/20 overflow-hidden shadow-xl shadow-yellow-600/5">
                <CardHeader className="bg-slate-950/2 tracking-tight border-b border-yellow-600/10">
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Recent Transactions</CardTitle>
                    <CardDescription className="font-medium text-slate-500">A list of your latest financial activity.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                        <CreditCard className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm italic">No transactions recorded yet.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
