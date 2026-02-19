'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus, User as UserIcon, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'sonner';

interface AssignHandlerDialogProps {
    customerId: number;
    existingHandlerIds: number[];
    onSuccess: () => void;
}

export function AssignHandlerDialog({ customerId, existingHandlerIds, onSuccess }: AssignHandlerDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const data = await api.get<User[]>('/auth/users');
            // Filter out users already assigned
            setUsers(data.filter(u => !existingHandlerIds.includes(u.id)));
        } catch (error) {
            // Already toasted
        }
    };

    const handleAssign = async () => {
        if (!selectedUserId) return;
        setLoading(true);

        try {
            await api.post(`/customers/${customerId}/assign`, {
                userId: selectedUserId,
            });
            toast.success('Team member assigned');
            setOpen(false);
            onSuccess();
        } catch (error) {
            // Already toasted
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" /> Assign Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white/95 backdrop-blur-xl border-yellow-600/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase text-slate-900 border-b border-yellow-600/10 pb-4">
                        Assign <span className="text-yellow-600">Member</span>
                    </DialogTitle>
                    {/* DialogDescription removed as per instruction */}
                </DialogHeader>
                <div className="grid gap-6 py-8">
                    <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Team Member</Label>
                        <Select
                            value={selectedUserId}
                            onValueChange={setSelectedUserId}
                        >
                            <SelectTrigger className="h-14 bg-white border-slate-200 focus:ring-yellow-600/20 font-bold rounded-xl shadow-sm">
                                <SelectValue placeholder="Select a team member" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-yellow-600/20 shadow-2xl">
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()} className="py-3">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3 border border-yellow-100 font-black text-yellow-700 text-[10px]">
                                                {(user.name?.[0] || user.email[0]).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{user.name || 'Team Member'}</span>
                                                <span className="text-[10px] text-slate-400">{user.email}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                                {users.length === 0 && (
                                    <div className="p-4 text-xs text-center text-slate-500 italic">
                                        No other members available
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="border-t border-slate-100 pt-6">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 h-12 px-8">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedUserId}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-black uppercase text-[10px] tracking-widest h-12 px-10 shadow-xl shadow-yellow-600/20 border-none transition-all rounded-xl"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Assign Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
