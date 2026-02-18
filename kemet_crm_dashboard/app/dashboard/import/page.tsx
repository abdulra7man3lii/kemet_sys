'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, ChevronRight, Check, AlertCircle, FileText, Database, ArrowRight, Loader2, Eraser } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportPage() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<{ columns: string[], preview: any[], totalRows: number } | null>(null);
    const [mapping, setMapping] = useState<Record<string, string>>({
        name: '',
        email: '',
        phone: '',
        company: ''
    });
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState<{ totalProcessed: number, totalImported: number, duplicatesSkipped: number } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const data = await api.post<any>('/import/preview', formData);
            setPreviewData(data);

            // Auto-map if column names match
            const newMapping = { ...mapping };
            data.columns.forEach((col: string) => {
                const c = col.toLowerCase();
                if (c.includes('name')) newMapping.name = col;
                if (c.includes('mail')) newMapping.email = col;
                if (c.includes('phone') || c.includes('mobile') || c.includes('number')) newMapping.phone = col;
                if (c.includes('company') || c.includes('org')) newMapping.company = col;
            });
            setMapping(newMapping);
            setStep(2);
        } catch (err) {
            toast.error('Failed to parse file');
        } finally {
            setLoading(false);
        }
    };

    const runImport = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mapping', JSON.stringify(mapping));

        try {
            const result = await api.post<any>('/import/process', formData);
            setImportResult(result);
            setStep(3);
            toast.success('Import completed successfully!');
        } catch (err) {
            toast.error('Import failed');
        } finally {
            setLoading(false);
        }
    };

    const isMappingValid = mapping.name && (mapping.email || mapping.phone);

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                    <Eraser className="h-8 w-8 text-yellow-600" /> Data Laundry
                </h1>
                <p className="text-slate-500 font-medium">Upload unorganized Excel sheets and let us clean them for your campaigns.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center justify-between max-w-2xl">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= s ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20' : 'bg-slate-200 text-slate-400'
                            }`}>
                            {step > s ? <Check className="h-4 w-4" /> : s}
                        </div>
                        {s < 3 && <div className={`w-24 h-1 mx-2 rounded ${step > s ? 'bg-yellow-600' : 'bg-slate-200'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card className="border-2 border-dashed border-yellow-600/20 hover:border-yellow-600/50 transition-all cursor-pointer bg-white group shadow-sm">
                    <CardContent className="py-20 text-center relative overflow-hidden">
                        <label className="cursor-pointer block">
                            <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                            <div className="relative z-10">
                                <div className="bg-yellow-50 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-yellow-600/10">
                                    <Upload className="h-8 w-8 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Upload your lead data</h3>
                                <p className="text-slate-500 text-sm mt-1">Excel or CSV files (Up to 10MB)</p>
                            </div>
                        </label>
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                                <Loader2 className="h-10 w-10 text-yellow-600 animate-spin mb-4" />
                                <p className="font-black text-yellow-900 uppercase tracking-widest text-xs">Analyzing your data...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {step === 2 && previewData && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 border-b border-slate-200">
                                <CardTitle className="text-lg font-bold">Column Mapping</CardTitle>
                                <CardDescription>Map your Excel columns to KEMET lead fields.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                {[
                                    { key: 'name', label: 'Customer Name', icon: <FileText className="h-4 w-4" />, required: true },
                                    { key: 'email', label: 'Email Address', icon: <Loader2 className="h-4 w-4" />, required: false },
                                    { key: 'phone', label: 'Phone / WhatsApp', icon: <ArrowRight className="h-4 w-4" />, required: false },
                                    { key: 'company', label: 'Company / Org', icon: <Database className="h-4 w-4" />, required: false }
                                ].map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                        </div>
                                        <Select
                                            value={mapping[field.key as keyof typeof mapping]}
                                            onValueChange={(val) => setMapping({ ...mapping, [field.key]: val })}
                                        >
                                            <SelectTrigger className="bg-white border-slate-200">
                                                <SelectValue placeholder="Select column..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">-- Skip this field --</SelectItem>
                                                {previewData.columns.map(col => (
                                                    <SelectItem key={col} value={col}>{col}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="bg-yellow-50/50 border-t border-yellow-600/10 flex flex-col gap-3">
                                {!isMappingValid && (
                                    <div className="text-[10px] text-yellow-700 font-black uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3" /> Minimum: Name + (Email or Phone)
                                    </div>
                                )}
                                <Button
                                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none h-11 font-bold transition-all"
                                    disabled={!isMappingValid || loading}
                                    onClick={runImport}
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                    Start Data Laundry
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-slate-200 shadow-sm overflow-hidden h-fit">
                            <CardHeader className="bg-white border-b border-slate-100">
                                <CardTitle className="text-base font-bold text-slate-700">File Preview ({previewData.totalRows} rows)</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[500px] overflow-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                            <TableRow>
                                                {previewData.columns.map(col => (
                                                    <TableHead key={col} className="text-[10px] font-extrabold uppercase truncate max-w-[150px]">{col}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.preview.map((row, i) => (
                                                <TableRow key={i} className="hover:bg-slate-50/50">
                                                    {previewData.columns.map(col => (
                                                        <TableCell key={col} className="text-xs text-slate-600 truncate max-w-[150px]">
                                                            {String(row[col] || '')}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {step === 3 && importResult && (
                <div className="max-w-2xl mx-auto">
                    <Card className="border-yellow-600/20 shadow-2xl shadow-yellow-600/10 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 py-12 text-center text-white relative">
                            <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Check className="h-8 w-8" />
                            </div>
                            <h2 className="text-3xl font-black mb-1 italic uppercase tracking-tighter">Laundry Finished!</h2>
                            <p className="text-yellow-100 text-sm font-medium uppercase tracking-widest text-[10px]">Your leads have been cleaned and imported.</p>
                        </div>
                        <CardContent className="pt-8 pb-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-5xl font-black text-yellow-700 mb-1 italic">{importResult.totalImported}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Successfully Imported</div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <div className="text-5xl font-black text-orange-500 mb-1 italic">{importResult.duplicatesSkipped}</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duplicates Skipped</div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-green-50 rounded-xl flex items-center gap-4 border border-green-100">
                                <div className="bg-green-500 p-2 rounded-lg">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-green-800">Ready for Campaigns</h4>
                                    <p className="text-xs text-green-700">Phone numbers were auto-formatted and emails validated.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-950 p-4 flex justify-between gap-4 border-t border-yellow-600/20">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent border-yellow-600/30 text-yellow-500 hover:bg-yellow-600/10 font-black uppercase text-xs">
                                Import Another File
                            </Button>
                            <Button className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-xl shadow-yellow-600/20 border-none font-black uppercase text-xs" asChild>
                                <a href="/dashboard/customers">View Customer List</a>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}
