'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Upload, Eraser, Trash2, CheckCircle, AlertCircle, Loader2, Shield, ArrowLeft, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface LaundryContact {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    language: string | null;
    city: string | null;
    isClean: boolean;
    isValid: boolean;
    score: number;
    duplicateInfo?: string | null;
}

export default function ListDetailPage() {
    const { id } = useParams();
    const [listName, setListName] = useState('');
    const [contacts, setContacts] = useState<LaundryContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', language: '', city: '' });
    const [adding, setAdding] = useState(false);
    const [cleaning, setCleaning] = useState(false);
    const [auditing, setAuditing] = useState(false);
    const [deletingInvalid, setDeletingInvalid] = useState(false);
    const [filter, setFilter] = useState<'all' | 'invalid' | 'duplicates'>('all');
    const [search, setSearch] = useState('');
    const [searchField, setSearchField] = useState<'all' | 'name' | 'phone' | 'email' | 'city'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState<number | 'all'>(50);

    const { user } = useAuth();

    // Reset to page 1 when filtering/searching
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search, searchField]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const currentList = await api.get<any>(`/laundry/lists/${id}`);
            if (currentList) setListName(currentList.name);

            const contactsData = await api.get<LaundryContact[]>(`/laundry/lists/${id}/contacts`);
            setContacts(contactsData);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newContact.name) return;
        setAdding(true);
        try {
            await api.post(`/laundry/lists/${id}/contacts`, newContact);
            toast.success('Contact added');
            setIsAddOpen(false);
            setNewContact({ name: '', phone: '', email: '', language: '', city: '' });
            fetchData();
        } catch (error) {
            toast.error('Failed to add contact');
        } finally {
            setAdding(false);
        }
    };

    const handleClean = async () => {
        setCleaning(true);
        try {
            const result = await api.post<any>(`/laundry/lists/${id}/clean`, {});
            toast.success(`Cleanup Finished: ${result.cleanedCount} records processed. ${result.duplicatesRemoved} duplicates purged.`);
            fetchData();
        } catch (error) {
            toast.error('Cleaning failed');
        } finally {
            setCleaning(false);
        }
    };

    const handleAudit = async () => {
        setAuditing(true);
        try {
            const result = await api.post<any>(`/laundry/lists/${id}/audit`, {});
            toast.success(`Audit Complete: ${result.auditedCount} records examined. Duplicates flagged but preserved.`);
            fetchData();
        } catch (error) {
            toast.error('Audit failed');
        } finally {
            setAuditing(false);
        }
    };

    const handleDeleteContact = async (contactId: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await api.delete(`/laundry/lists/${id}/contacts/${contactId}`);
            toast.success('Record deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    const handleBulkDeleteInvalid = async () => {
        if (!confirm('Delete all invalid records? This cannot be undone.')) return;
        setDeletingInvalid(true);
        try {
            const result = await api.post<any>(`/laundry/lists/${id}/bulk-delete-invalid`, {});
            toast.success(`Optimization Complete: Removed ${result.count} invalid signal records from this database.`);
            fetchData();
        } catch (error) {
            toast.error('Failed to delete records');
        } finally {
            setDeletingInvalid(false);
        }
    };

    const filteredContacts = contacts
        .filter(c => {
            if (filter === 'invalid') return !c.isValid && !c.duplicateInfo;
            if (filter === 'duplicates') return !!c.duplicateInfo;
            return true;
        })
        .filter(c => {
            if (!search) return true;
            const s = search.toLowerCase();

            // For phone searching, we compare digits only to be more user friendly
            const searchDigits = s.replace(/\D/g, '');
            const phoneDigits = c.phone?.replace(/\D/g, '') || '';

            if (searchField === 'name') return c.name.toLowerCase().includes(s);
            if (searchField === 'phone') return phoneDigits.includes(searchDigits);
            if (searchField === 'email') return c.email?.toLowerCase().includes(s);
            if (searchField === 'city') return c.city?.toLowerCase().includes(s);

            return (
                c.name.toLowerCase().includes(s) ||
                (searchDigits && phoneDigits.includes(searchDigits)) ||
                c.email?.toLowerCase().includes(s) ||
                c.city?.toLowerCase().includes(s)
            );
        });

    const totalFiltered = filteredContacts.length;
    const paginatedContacts = pageSize === 'all'
        ? filteredContacts
        : filteredContacts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any>(null);
    const [mapping, setMapping] = useState({ name: '', phone: '', email: '', language: '', city: '' });
    const [importing, setImporting] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportFile(file);

        const formData = new FormData();
        formData.append('file', file);
        try {
            const data = await api.post<any>('/import/preview', formData);
            setPreview(data);
            // Simple auto-mapping
            const m = { ...mapping };
            data.columns.forEach((c: string) => {
                const low = c.toLowerCase();
                if (low.includes('name') || low.includes('full name')) m.name = c;
                if (low.includes('phone') || low.includes('mobile') || low.includes('tel') || low.includes('gsm') || low.includes('whatsapp') || low.includes('number') || low.includes('contact')) m.phone = c;
                if (low.includes('email') || low.includes('mail') || low.includes('e-mail')) m.email = c;
                if (low.includes('lang')) m.language = c;
                if (low.includes('city') || low.includes('town') || low.includes('location')) m.city = c;
            });
            setMapping(m);
        } catch (error) {
            toast.error('Failed to parse file');
        }
    };

    const handleImport = async () => {
        if (!importFile || !mapping.name) return;
        setImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('mapping', JSON.stringify(mapping));
        try {
            const result = await api.post<any>(`/laundry/lists/${id}/import`, formData);
            toast.success(`Import complete: ${result.count} records added. ${result.duplicatesRemoved} duplicates removed.`);
            setIsImportOpen(false);
            setImportFile(null);
            setPreview(null);
            fetchData();
        } catch (error) {
            toast.error('Import failed');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-0">
            <div className="flex flex-col gap-4">
                <Link href="/dashboard/laundry/contacts" className="flex items-center text-sm font-bold text-[#8A93A5] hover:text-[#D4AF37] transition-colors w-fit">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Lists
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-[#070B14] tracking-tight flex items-center gap-3">
                            <Users className="h-8 w-8 text-[#D4AF37]" /> {listName || 'Loading List...'}
                        </h1>
                        <p className="text-[#8A93A5] font-medium">Manage, clean, and verify records in this database.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-[#1B2A40] bg-[#111C2E] text-[#E6EAF0] hover:bg-[#070B14] font-black uppercase text-[10px] tracking-widest h-11 px-6 shadow-sm transition-all hover:border-[#D4AF37]/50">
                                    <Upload className="h-4 w-4 mr-2 text-[#D4AF37]" /> Import Excel
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl bg-[#0E1624] border-[#1B2A40] shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-[#E6EAF0] border-b border-[#1B2A40] pb-4">
                                        Import <span className="text-[#D4AF37]">Leads</span>
                                    </DialogTitle>
                                </DialogHeader>
                                {!preview ? (
                                    <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-[#1B2A40] rounded-2xl bg-[#070B14]/50 group hover:bg-[#070B14] transition-all cursor-pointer mt-4" onClick={() => (document.getElementById('import-file') as HTMLInputElement)?.click()}>
                                        <div className="bg-[#111C2E] p-4 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform border border-[#D4AF37]/20">
                                            <Upload className="h-10 w-10 text-[#D4AF37]" />
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-widest text-[#8A93A5]">Drop Excel or CSV File</p>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1">Maximum file size: 10MB</p>
                                        <Input type="file" className="hidden" id="import-file" onChange={handleFileSelect} accept=".xlsx,.xls,.csv" />
                                    </div>
                                ) : (
                                    <div className="space-y-6 pt-6">
                                        <div className="bg-[#111C2E] p-5 rounded-2xl border border-[#1B2A40] shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-[#070B14] p-2 rounded-lg text-[#D4AF37] font-black border border-[#D4AF37]/20">
                                                    {preview.totalRows}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]/60">Ready for processing</div>
                                                    <div className="text-xs font-bold text-[#E6EAF0] truncate max-w-[200px] italic">"{importFile?.name}"</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => { setPreview(null); setImportFile(null); }} className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] hover:text-[#E6EAF0] hover:bg-[#1B2A40] rounded-full px-4">Change File</Button>
                                        </div>

                                        <div className="space-y-4 bg-[#070B14] p-6 rounded-2xl border border-[#1B2A40]">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A93A5] opacity-60 mb-4">Column Mapping</h3>
                                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                                {(Object.keys(mapping) as Array<keyof typeof mapping>).map((field) => (
                                                    <div key={field} className="space-y-2">
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">{field === 'name' ? 'Full Name *' : field}</Label>
                                                        <Select value={mapping[field]} onValueChange={(val) => setMapping({ ...mapping, [field]: val })}>
                                                            <SelectTrigger className="h-11 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 text-xs font-bold rounded-xl shadow-sm">
                                                                <SelectValue placeholder="Select column..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-[#0E1624] border-[#1B2A40] shadow-2xl">
                                                                <SelectItem value="none" className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5]">-- Skip Column --</SelectItem>
                                                                {preview.columns.map((c: string) => (
                                                                    <SelectItem key={c} value={c} className="text-xs font-bold text-[#E6EAF0] hover:bg-[#111C2E]">{c}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <DialogFooter className="mt-10 border-t border-[#1B2A40] pt-6">
                                    <Button variant="ghost" onClick={() => setIsImportOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] hover:text-[#E6EAF0] h-12 px-8">Cancel</Button>
                                    <Button
                                        className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#070B14] font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-[#D4AF37]/20 border-none transition-all rounded-xl"
                                        onClick={handleImport}
                                        disabled={importing || !mapping.name}
                                    >
                                        {importing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Start Import
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#070B14] font-black uppercase text-[10px] tracking-widest h-11 px-6 shadow-2xl shadow-[#D4AF37]/10 transition-all hover:-translate-y-0.5 border-none">
                                    <Plus className="h-4 w-4 mr-2" /> Add Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-[#0E1624] border-[#1B2A40] shadow-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-[#E6EAF0] border-b border-[#1B2A40] pb-4">
                                        Manual <span className="text-[#D4AF37]">Entry</span>
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-8">
                                    <div className="col-span-2 space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Full Name *</Label>
                                        <Input
                                            placeholder="e.g. Sultan Ahmed"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 font-bold rounded-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Phone</Label>
                                        <Input
                                            placeholder="+9715..."
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                            className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 font-mono text-xs font-bold rounded-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Email</Label>
                                        <Input
                                            placeholder="mail@kemet.sys"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                            className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 text-xs font-bold rounded-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">Language</Label>
                                        <Input
                                            placeholder="English / Arabic"
                                            value={newContact.language}
                                            onChange={(e) => setNewContact({ ...newContact, language: e.target.value })}
                                            className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 text-xs font-bold rounded-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-[#8A93A5] ml-1">City</Label>
                                        <Input
                                            placeholder="Dubai / Abu Dhabi"
                                            value={newContact.city}
                                            onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                                            className="h-12 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 text-xs font-bold rounded-xl placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="mt-10 border-t border-[#1B2A40] pt-6">
                                    <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5] hover:text-[#E6EAF0] h-12 px-8">Cancel</Button>
                                    <Button
                                        className="bg-[#D4AF37] hover:bg-[#B8962E] text-[#070B14] font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-[#D4AF37]/20 border-none transition-all rounded-xl"
                                        onClick={handleAdd}
                                        disabled={adding || !newContact.name}
                                    >
                                        {adding ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Save <span className="ml-1 opacity-60">Record</span>
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Smart Filters & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-[#1B2A40] bg-[#111C2E] p-6 rounded-2xl">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Smart Filters</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#8A93A5]">Total: {contacts.length}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setFilter('all')}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${filter === 'all' ? 'bg-[#D4AF37] text-[#070B14]' : 'text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'}`}
                            >
                                All Records
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setFilter('invalid')}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${filter === 'invalid' ? 'bg-red-500/80 text-white' : 'text-white hover:text-red-400 hover:bg-red-400/5'}`}
                            >
                                <AlertCircle className="w-3.5 h-3.5 mr-2" /> Invalid Phone
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setFilter('duplicates')}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${filter === 'duplicates' ? 'bg-[#D4AF37] text-[#070B14]' : 'text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'}`}
                            >
                                <Users className="w-3.5 h-3.5 mr-2" /> Duplicates
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="border-[#1B2A40] bg-[#111C2E] p-6 rounded-2xl flex flex-col justify-between gap-4">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Bulk Actions</h3>
                    <div className="flex flex-col gap-2">
                        {user?.role === 'SUPER_ADMIN' && (
                            <Button
                                onClick={handleAudit}
                                disabled={auditing || contacts.length === 0}
                                variant="outline"
                                className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/5 font-black uppercase text-[10px] tracking-widest h-10 transition-all mb-1"
                            >
                                {auditing ? (
                                    <>
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                        Auditing...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-3.5 w-3.5 mr-2" /> Check List
                                    </>
                                )}
                            </Button>
                        )}
                        <Button
                            onClick={handleClean}
                            disabled={cleaning || contacts.length === 0}
                            variant="outline"
                            className="w-full border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 font-black uppercase text-[10px] tracking-widest h-10 transition-all"
                        >
                            {cleaning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eraser className="w-4 h-4 mr-2" />}
                            Re-clean List
                        </Button>
                        <Button
                            onClick={handleBulkDeleteInvalid}
                            disabled={deletingInvalid || contacts.length === 0}
                            variant="destructive"
                            className="w-full bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest h-10 transition-all"
                        >
                            {deletingInvalid ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete All Invalid
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative group flex-1">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A93A5] group-focus-within:text-[#D4AF37] transition-colors" />
                    <Input
                        placeholder={searchField === 'all' ? "Search leads by any field..." : `Search by ${searchField}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-14 pl-12 pr-6 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] focus:ring-[#D4AF37]/20 font-bold rounded-2xl placeholder:text-slate-600 shadow-lg shadow-black/20"
                    />
                </div>
                <Select value={searchField} onValueChange={(val: any) => setSearchField(val)}>
                    <SelectTrigger className="w-full md:w-[200px] h-14 bg-[#111C2E] border-[#1B2A40] text-[#E6EAF0] font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg border-none focus:ring-[#D4AF37]/20">
                        <SelectValue placeholder="Search Field" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0E1624] border-[#1B2A40] shadow-2xl">
                        <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest">All Fields</SelectItem>
                        <SelectItem value="name" className="text-[10px] font-black uppercase tracking-widest">Name</SelectItem>
                        <SelectItem value="phone" className="text-[10px] font-black uppercase tracking-widest">Phone</SelectItem>
                        <SelectItem value="email" className="text-[10px] font-black uppercase tracking-widest">Email</SelectItem>
                        <SelectItem value="city" className="text-[10px] font-black uppercase tracking-widest">City</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-[#1B2A40] bg-[#111C2E] shadow-2xl overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#070B14]/60 border-b border-[#1B2A40]">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[280px] text-[10px] uppercase tracking-[0.2em] font-black py-5 pl-8 text-[#8A93A5]">Entity Identification</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-black py-5 text-[#8A93A5]">Digital Communication</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-black py-5 text-[#8A93A5]">Strategic Intelligence</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-[0.2em] font-black py-5 text-center text-[#8A93A5]">Status</TableHead>
                                <TableHead className="w-[80px] text-right pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i} className="border-b border-[#1B2A40]/30"><TableCell colSpan={5} className="h-20 animate-pulse bg-[#070B14]/20" /></TableRow>
                                ))
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Users className="h-12 w-12 text-[#D4AF37]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Intelligence Found</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Eraser className="h-12 w-12 text-[#D4AF37]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Records Match Your Filters</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedContacts.map((contact) => (
                                    <TableRow key={contact.id} className="border-b border-[#1B2A40]/30 hover:bg-[#D4AF37]/[0.02] transition-colors group">
                                        <TableCell className="py-5 pl-8">
                                            <div className="font-extrabold text-[#E6EAF0] uppercase tracking-tighter text-sm">{contact.name}</div>
                                            <div className="text-[9px] text-[#8A93A5] font-black uppercase tracking-widest mt-1 opacity-50 flex items-center gap-1">
                                                REFID: <span className="text-[#D4AF37]">#{contact.id}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <div className={`flex items-center gap-2 font-mono text-xs font-bold ${contact.phone?.startsWith('+971') ? 'text-[#D4AF37]' : 'text-[#8A93A5]'}`}>
                                                    <Phone className={`h-3 w-3 ${!contact.isValid ? 'text-red-500' : 'opacity-40'}`} />
                                                    <span className={!contact.isValid ? 'text-red-400 italic underline' : ''}>
                                                        {contact.phone || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8A93A5]">
                                                    <Mail className="h-3 w-3 opacity-40" /> {contact.email || 'N/A'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-[#E6EAF0]">
                                                    <MapPin className="h-3 w-3 text-[#D4AF37]/60" /> {contact.city || 'GLOBAL'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#8A93A5] opacity-50">
                                                    <Globe className="h-3 w-3" /> {contact.language || 'ENGLISH'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                {contact.isClean ? (
                                                    <div className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-[#D4AF37]/20 flex items-center gap-2 shadow-sm shadow-[#D4AF37]/5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" /> CLEAN
                                                    </div>
                                                ) : (
                                                    <div className="bg-slate-800/50 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> RAW
                                                    </div>
                                                )}
                                                {!contact.isValid && (
                                                    <div className="text-[8px] text-red-500/80 font-black uppercase tracking-widest flex items-center gap-1 mt-1 max-w-[150px] text-center leading-tight">
                                                        <AlertCircle className="h-2.5 w-2.5 shrink-0" />
                                                        {(contact as any).duplicateInfo || 'Invalid Signal'}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-[#8A93A5] hover:text-red-400 hover:bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteContact(contact.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalFiltered > 0 && (
                    <div className="px-8 py-4 bg-[#070B14]/40 border-t border-[#1B2A40] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A93A5]">Show:</span>
                            <div className="flex gap-2">
                                {[50, 200, 'all'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => { setPageSize(size as any); setCurrentPage(1); }}
                                        className={`px-3 py-1 rounded text-[10px] font-black transition-all ${pageSize === size ? 'bg-[#D4AF37] text-[#070B14]' : 'text-[#8A93A5] hover:text-[#D4AF37]'}`}
                                    >
                                        {size === 'all' ? 'ALL' : size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {pageSize !== 'all' && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="h-8 border-[#1B2A40] bg-[#111C2E] text-[#8A93A5] hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest px-4"
                                >
                                    Prev
                                </Button>
                                <div className="flex items-center gap-2 px-4 shadow-inner bg-[#070B14] rounded-full h-8">
                                    <span className="text-[10px] font-black text-[#D4AF37]">{currentPage}</span>
                                    <span className="text-[9px] font-black text-[#8A93A5] opacity-40">/</span>
                                    <span className="text-[10px] font-black text-[#8A93A5]">{Math.ceil(totalFiltered / (pageSize as number))}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= Math.ceil(totalFiltered / (pageSize as number))}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-8 border-[#1B2A40] bg-[#111C2E] text-[#8A93A5] hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest px-4"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card >
        </div >
    );
}
