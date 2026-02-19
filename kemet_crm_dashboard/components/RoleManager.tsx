'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Role, Permission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Plus,
    Shield,
    Trash2,
    Edit,
    Check,
    X,
    Loader2,
    Lock,
    Settings,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export function RoleManager() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRoleData();
    }, []);

    const fetchRoleData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                api.get<Role[]>('/roles'),
                api.get<Permission[]>('/roles/permissions')
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (error) {
            toast.error('Failed to load role management data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setEditingRole(null);
        setNewRoleName('');
        setNewRoleDesc('');
        setSelectedPermissionIds([]);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (role: Role) => {
        if (role.isGlobal) {
            toast.error('Global roles cannot be modified.');
            return;
        }
        setEditingRole(role);
        setNewRoleName(role.name);
        setNewRoleDesc(role.description || '');
        setSelectedPermissionIds(role.permissions.map(p => p.id));
        setIsDialogOpen(true);
    };

    const handleTogglePermission = (id: number) => {
        setSelectedPermissionIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!newRoleName.trim()) {
            toast.error('Role name is required');
            return;
        }

        setSubmitting(true);
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, {
                    name: newRoleName,
                    description: newRoleDesc,
                    permissionIds: selectedPermissionIds
                });
                toast.success('Role updated successfully');
            } else {
                await api.post('/roles', {
                    name: newRoleName,
                    description: newRoleDesc,
                    permissionIds: selectedPermissionIds
                });
                toast.success('Role created successfully');
            }
            setIsDialogOpen(false);
            fetchRoleData();
        } catch (error) {
            toast.error('Failed to save role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            await api.delete(`/roles/${id}`);
            toast.success('Role deleted');
            fetchRoleData();
        } catch (error) {
            toast.error('Failed to delete role');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5 text-yellow-600" /> Custom Role Manager
                    </h3>
                    <p className="text-sm text-slate-500">Define specialized access levels for your team members.</p>
                </div>
                <Button
                    onClick={handleOpenCreateDialog}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Role
                </Button>
            </div>

            <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl">
                <Table>
                    <TableHeader className="bg-[#0E1624]">
                        <TableRow className="border-[#1B2A40] hover:bg-transparent">
                            <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-[#8A93A5]">Role Identity</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-[#8A93A5]">Description</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-[#8A93A5]">Permissions</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-[#8A93A5]">Users</TableHead>
                            <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-[#8A93A5] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id} className="border-[#1B2A40] hover:bg-[#1B2A40]/50 transition-colors">
                                <TableCell className="font-bold text-[#E6EAF0]">
                                    <div className="flex items-center gap-2">
                                        {role.name}
                                        {role.isGlobal && (
                                            <Badge variant="outline" className="text-[8px] bg-[#1B2A40] text-[#D4AF37] border-[#D4AF37]/30 font-black h-4 px-1">GLOBAL</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-[#8A93A5] text-xs max-w-[200px] truncate font-medium">
                                    {role.description || 'No description provided.'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                                        {role.permissions.map((p) => (
                                            <Badge key={p.id} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20">
                                                {p.action}:{p.subject}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-[#8A93A5]">
                                    {role._count?.users || 0} users
                                </TableCell>
                                <TableCell className="text-right">
                                    {!role.isGlobal ? (
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[#8A93A5] hover:text-[#D4AF37] hover:bg-[#1B2A40]"
                                                onClick={() => handleOpenEditDialog(role)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[#8A93A5] hover:text-[#E5484D] hover:bg-red-950/20"
                                                onClick={() => handleDeleteRole(role.id)}
                                                disabled={role._count?.users! > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Lock className="h-4 w-4 ml-auto text-[#1B2A40] mr-3" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden border-[#1B2A40] bg-[#0E1624] text-[#E6EAF0]">
                    <DialogHeader className="p-8 bg-[#070B14] border-b border-[#1B2A40]">
                        <DialogTitle className="text-2xl font-black italic tracking-tighter flex items-center gap-3 text-[#D4AF37]">
                            <Shield className="h-6 w-6" />
                            {editingRole ? 'RECONFIGURE TIER' : 'INITIALIZE ROLE'}
                        </DialogTitle>
                        <DialogDescription className="text-[#8A93A5] font-medium text-sm mt-1">
                            Establish specialized permission matrices for enterprise-level operations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role Identity</Label>
                                <Input
                                    placeholder="e.g. Senior Marketing Clerk"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="font-bold border-yellow-600/10 focus-visible:ring-yellow-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brief Description</Label>
                                <Input
                                    placeholder="What does this role handle?"
                                    value={newRoleDesc}
                                    onChange={(e) => setNewRoleDesc(e.target.value)}
                                    className="font-medium border-yellow-600/10 focus-visible:ring-yellow-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Permission Matrix</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {permissions.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`flex items-start gap-4 p-3 rounded-xl border transition-all cursor-pointer ${selectedPermissionIds.includes(p.id)
                                            ? 'bg-yellow-50/50 border-yellow-600/30'
                                            : 'bg-slate-50 border-slate-200 hover:border-yellow-600/20'
                                            }`}
                                        onClick={() => handleTogglePermission(p.id)}
                                    >
                                        <div className="pt-0.5">
                                            <Checkbox
                                                checked={selectedPermissionIds.includes(p.id)}
                                                onCheckedChange={() => handleTogglePermission(p.id)}
                                                className="data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 tracking-tight uppercase">
                                                {p.action}:{p.subject}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-500 leading-tight mt-0.5">
                                                {p.description || `Grants ${p.action} rights for ${p.subject} data.`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 border-t border-slate-200 gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="font-bold text-slate-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-black px-8 italic shadow-lg shadow-yellow-600/20"
                        >
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingRole ? 'COMMIT CHANGES' : 'INITIALIZE ROLE'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
