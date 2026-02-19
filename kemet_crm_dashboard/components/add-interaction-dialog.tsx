'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MessageSquare, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AddInteractionDialogProps {
    customerId: number;
    onSuccess: () => void;
}

export function AddInteractionDialog({ customerId, onSuccess }: AddInteractionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'NOTE',
        notes: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/interactions', {
                ...formData,
                customerId,
            });
            toast.success('Interaction logged successfully');
            setOpen(false);
            setFormData({
                type: 'NOTE',
                notes: '',
                date: new Date().toISOString().split('T')[0],
            });
            onSuccess();
        } catch (error) {
            // Already toasted by API layer
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" /> Log Interaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white/95 backdrop-blur-xl border-yellow-600/20 shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-slate-900 border-b border-yellow-600/10 pb-4">
                            Log <span className="text-yellow-600">Interaction</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Interaction Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-yellow-600/20 font-bold rounded-xl shadow-sm">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-yellow-600/20 shadow-2xl">
                                    <SelectItem value="CALL" className="py-3 font-bold">
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-3 text-blue-500" /> Call
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="EMAIL" className="py-3 font-bold">
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-3 text-orange-500" /> Email
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEETING" className="py-3 font-bold">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-3 text-green-500" /> Meeting
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="NOTE" className="py-3 font-bold">
                                        <div className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-3 text-slate-400" /> General Note
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Activity</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="h-12 bg-white border-slate-200 focus:ring-yellow-600/20 font-bold rounded-xl shadow-sm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes" className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes & Outcome</Label>
                            <Textarea
                                id="notes"
                                placeholder="Describe the outcome of this interaction..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="min-h-[120px] bg-white border-slate-200 focus:ring-yellow-600/20 font-medium rounded-xl text-xs py-3"
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t border-slate-100 pt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 h-12 px-8">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-yellow-600/20 border-none transition-all rounded-xl"
                        >
                            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Save Interaction
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
