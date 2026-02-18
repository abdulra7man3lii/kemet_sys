'use client';

import { useEffect, useState, useCallback } from 'react';
import { Customer } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, User as UserIcon, Filter, Layers, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CustomerListPage() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'mine'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Simple debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        fetchCustomers();
    }, [filter, statusFilter, debouncedSearch]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            let queryParams = new URLSearchParams();
            if (filter === 'mine') queryParams.append('handlerId', 'me');
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            if (debouncedSearch) queryParams.append('search', debouncedSearch);

            const endpoint = `/customers?${queryParams.toString()}`;
            const data = await api.get<Customer[]>(endpoint);
            setCustomers(data);
        } catch (err) {
            console.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CUSTOMER': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3"><CheckCircle2 className="h-3 w-3 mr-1" /> {status}</Badge>;
            case 'PROSPECT': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3"><Clock className="h-3 w-3 mr-1" /> {status}</Badge>;
            case 'LEAD': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none px-3 font-bold"><Filter className="h-3 w-3 mr-1" /> {status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setFilter('all');
    };

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || filter !== 'all';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent tracking-tight">Customers</h1>
                    <p className="text-slate-600">Manage and track your leads and clients.</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 transition-all hover:scale-105 border-none">
                    <Link href="/dashboard/customers/new">
                        <Plus className="h-4 w-4 mr-2" /> Add Customer
                    </Link>
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {user?.role !== 'EMPLOYEE' ? (
                                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full lg:w-auto">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 p-1">
                                        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-yellow-700 data-[state=active]:shadow-sm font-bold">
                                            <Layers className="h-4 w-4 mr-2" /> All Leads
                                        </TabsTrigger>
                                        <TabsTrigger value="mine" className="data-[state=active]:bg-white data-[state=active]:text-yellow-700 data-[state=active]:shadow-sm font-bold">
                                            <UserIcon className="h-4 w-4 mr-2" /> My Customers
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-700 font-bold bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                                    <Users className="h-5 w-5" />
                                    <span>My Assignments & Leads</span>
                                </div>
                            )}

                            <div className="flex flex-1 items-center gap-3 max-w-2xl">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by name, email, or company..."
                                        className="pl-10 bg-white border-slate-200 focus:ring-yellow-600/20 focus:border-yellow-600"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] bg-white border-slate-200">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="LEAD">Leads</SelectItem>
                                        <SelectItem value="PROSPECT">Prospects</SelectItem>
                                        <SelectItem value="CUSTOMER">Customers</SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-yellow-700 hover:bg-yellow-50 font-bold">
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 italic">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-4"></div>
                            <p>Searching database...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="py-4 font-bold text-slate-700">Name</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-700">Status</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-700">Company</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-700">Handlers</TableHead>
                                        <TableHead className="py-4 font-bold text-slate-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                                                No customers found matching your criteria. Try adjusting your filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map((customer) => (
                                            <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <TableCell className="py-4 font-medium text-slate-900">
                                                    <div className="flex flex-col">
                                                        <span>{customer.name}</span>
                                                        <span className="text-xs text-slate-400 font-normal">{customer.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {getStatusBadge(customer.status)}
                                                </TableCell>
                                                <TableCell className="py-4 text-slate-600">
                                                    {customer.company || <span className="text-slate-300 italic">Private</span>}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex -space-x-2">
                                                        {customer.handlers && customer.handlers.length > 0 ? (
                                                            customer.handlers.map((h, i) => (
                                                                <div key={h.id} className="h-8 w-8 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-yellow-800 ring-1 ring-slate-100 shadow-sm" title={h.name || h.email}>
                                                                    {(h.name?.[0] || h.email[0]).toUpperCase()}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-slate-300">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <Button variant="ghost" size="sm" asChild className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50 font-bold transition-colors">
                                                        <Link href={`/dashboard/customers/${customer.id}`}>View Details</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
