'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, List, Plus, Search, Trash2, Calendar, User, Building, ArrowRight, Loader2, Eraser, Check, Database } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface ContactList {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    organization?: { name: string };
    createdBy: { name: string };
    _count: { contacts: number };
}

export default function ContactsPage() {
    const [lists, setLists] = useState<ContactList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newList, setNewList] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const data = await api.get<ContactList[]>('/laundry/lists');
            setLists(data);
        } catch (error) {
            toast.error('Failed to fetch lists');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newList.name) return;
        setCreating(true);
        try {
            await api.post('/laundry/lists', newList);
            toast.success('List created successfully');
            setIsCreateOpen(false);
            setNewList({ name: '', description: '' });
            fetchLists();
        } catch (error) {
            toast.error('Failed to create list');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure? All contacts in this list will be deleted.')) return;
        try {
            await api.delete(`/laundry/lists/${id}`);
            toast.success('List deleted');
            fetchLists();
        } catch (error) {
            toast.error('Failed to delete list');
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F5A524] bg-clip-text text-transparent tracking-tighter flex items-center gap-4">
                        <Eraser className="h-10 w-10 text-[#D4AF37]" /> Data Laundry Lists
                    </h1>
                    <p className="text-[#8A93A5] font-medium tracking-tight">Manage your lead databases, normalize formats, and clean duplicates.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#070B14] shadow-xl shadow-[#D4AF37]/10 border-none px-8 font-black uppercase text-xs tracking-widest h-12 transition-all">
                            <Plus className="h-4 w-4 mr-2" /> New Database List
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[#0E1624] border-[#1B2A40] shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-[#E6EAF0] border-b border-[#1B2A40] pb-4">
                                Create New <span className="text-[#D4AF37]">List</span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 pt-8">
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Database List Name *</Label>
                                <Input
                                    placeholder="e.g. Dubai Real Estate Leads Q1"
                                    value={newList.name}
                                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                                    className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 font-bold rounded-xl placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Detailed Description (Optional)</Label>
                                <Textarea
                                    placeholder="Notes about the source, campaign, or specific filters used for this data..."
                                    value={newList.description}
                                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                                    className="bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 min-h-[120px] font-medium rounded-xl text-xs py-3 placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-10 border-t border-[#1B2A40] pt-6">
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] hover:text-[#E6EAF0] h-12 px-8">Cancel</Button>
                            <Button
                                className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#070B14] font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-[#D4AF37]/20 border-none transition-all rounded-xl"
                                onClick={handleCreate}
                                disabled={creating || !newList.name}
                            >
                                {creating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                Create List
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-48 animate-pulse bg-[#111C2E] border-[#1B2A40]" />
                    ))}
                </div>
            ) : lists.length === 0 ? (
                <Card className="border-2 border-dashed border-[#1B2A40] bg-[#0E1624]">
                    <CardContent className="h-80 flex flex-col items-center justify-center text-center">
                        <div className="bg-[#111C2E] p-6 rounded-full mb-6 border border-[#1B2A40]">
                            <List className="h-12 w-12 text-[#8A93A5] opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-[#E6EAF0]">No Lists Found</h3>
                        <p className="text-[#8A93A5] max-w-sm mt-2 font-medium">Create your first database list to start importing and cleaning leads.</p>
                        <Button
                            variant="outline"
                            className="mt-6 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#070B14] font-bold transition-all"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Create First List
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lists.map((list) => (
                        <Card key={list.id} className="group border-[#1B2A40] hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-300 bg-[#111C2E] overflow-hidden flex flex-col">
                            <CardHeader className="relative pb-4">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-[#8A93A5] hover:text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleDelete(list.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="bg-[#070B14] h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-[#D4AF37]/20">
                                    <Database className="h-6 w-6 text-[#D4AF37]" />
                                </div>
                                <CardTitle className="text-xl font-black tracking-tight text-[#E6EAF0] group-hover:text-[#D4AF37] transition-colors uppercase italic">{list.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-[#8A93A5] font-medium h-10">{list.description || 'No description provided.'}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#070B14] rounded-lg p-3 border border-[#1B2A40]">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] opacity-60 mb-1">Contacts</div>
                                        <div className="text-lg font-black text-[#D4AF37] italic">{list._count.contacts}</div>
                                    </div>
                                    <div className="bg-[#070B14] rounded-lg p-3 border border-[#1B2A40] text-right">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] opacity-60 mb-1">Created</div>
                                        <div className="text-xs font-bold text-[#E6EAF0]">{new Date(list.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8A93A5]">
                                        <User className="h-3 w-3 text-[#D4AF37]" /> {list.createdBy.name}
                                    </div>
                                    {list.organization && (
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#8A93A5]">
                                            <Building className="h-3 w-3" /> {list.organization.name}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-[#070B14]/50 p-4 border-t border-[#1B2A40]">
                                <Button className="w-full bg-[#111C2E] hover:bg-[#D4AF37] hover:text-[#070B14] border-[#1B2A40] hover:border-[#D4AF37] text-white font-black uppercase text-[10px] tracking-widest group/btn transition-all shadow-sm" asChild>
                                    <Link href={`/dashboard/laundry/lists/${list.id}`}>
                                        Open Database <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
