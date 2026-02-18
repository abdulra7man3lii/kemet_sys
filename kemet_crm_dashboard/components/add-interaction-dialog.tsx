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
import { Plus, MessageSquare, Phone, Mail, Calendar } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Log Interaction</DialogTitle>
                        <DialogDescription>
                            Record a new communication with this customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Interaction Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CALL">
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-blue-500" /> Call
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="EMAIL">
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-2 text-orange-500" /> Email
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEETING">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-green-500" /> Meeting
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="NOTE">
                                        <div className="flex items-center">
                                            <MessageSquare className="h-4 w-4 mr-2 text-gray-500" /> Note
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes & Summary</Label>
                            <Textarea
                                id="notes"
                                placeholder="Describe the outcome of this interaction..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                            {loading ? 'Saving...' : 'Save Interaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
