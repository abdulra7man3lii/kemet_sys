'use client';

import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserPlus, User as UserIcon } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Team Member</DialogTitle>
                    <DialogDescription>
                        Select a team member to handle this customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select
                        value={selectedUserId}
                        onValueChange={setSelectedUserId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2 text-slate-400" />
                                        <span>{user.name || user.email}</span>
                                    </div>
                                </SelectItem>
                            ))}
                            {users.length === 0 && (
                                <div className="p-2 text-sm text-center text-slate-500 italic">
                                    No other members available
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedUserId}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
