'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, Role } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Shield, UserPlus, Mail, BadgeCheck, Loader2, MoreVertical, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TeamPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        setLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                api.get<User[]>('/auth/users'),
                api.get<Role[]>('/roles')
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (err) {
            console.error('Failed to load team data');
            toast.error('Failed to sync team data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, roleId: number) => {
        try {
            await api.post('/roles/update-user-role', { userId, roleId });
            toast.success('User role updated');
            fetchTeamData();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent tracking-tight flex items-center gap-3">
                        <Shield className="h-8 w-8 text-yellow-600" /> Team Management
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your employees and their access levels.</p>
                </div>
                <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none px-6">
                    <UserPlus className="h-4 w-4 mr-2" /> Invite Member
                </Button>
            </div>

            <Card className="border-yellow-600/20 shadow-xl shadow-yellow-600/5 overflow-hidden bg-white">
                <CardHeader className="bg-slate-950/2 tracking-tight border-b border-yellow-600/10">
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Team Members</CardTitle>
                    <CardDescription className="font-medium text-slate-500">All users associated with your organization.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-yellow-50/30">
                            <TableRow className="border-yellow-600/10 hover:bg-transparent">
                                <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 text-slate-400">User</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 text-slate-400">Assignment</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 text-slate-400">Contact</TableHead>
                                <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 text-right text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((member) => (
                                <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-yellow-600/20 border border-yellow-400 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                                {(member.name || member.email).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 tracking-tight">{member.name || 'Unnamed User'}</div>
                                                <div className="text-[10px] text-yellow-600 font-black uppercase tracking-widest">ID: #{member.id}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                className={member.role === 'ORG_ADMIN' || member.role === 'SUPER_ADMIN'
                                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 border-none font-black text-[9px] uppercase tracking-widest'
                                                    : 'bg-slate-950 text-white border-none font-black text-[9px] uppercase tracking-widest'}
                                            >
                                                {member.role === 'ORG_ADMIN' ? 'Admin' : (member.role === 'SUPER_ADMIN' ? 'Platform' : member.role)}
                                            </Badge>

                                            {member.role !== 'SUPER_ADMIN' && (
                                                <select
                                                    className="bg-slate-100 border-none text-[10px] font-black uppercase tracking-tight rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
                                                    onChange={(e) => handleRoleChange(member.id, parseInt(e.target.value))}
                                                    value={member.roleId || ''}
                                                >
                                                    <option value="">Switch Role...</option>
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Mail className="h-3 w-3 text-slate-400" />
                                            {member.email}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-yellow-600/20 bg-gradient-to-br from-yellow-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-[10px] font-black flex items-center gap-2 text-yellow-800 uppercase tracking-widest">
                            <BadgeCheck className="h-4 w-4" /> Operational Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[11px] font-black text-yellow-900 mb-2 uppercase tracking-wide">
                                    <span>Active Seats</span>
                                    <span>{users.length} Employees</span>
                                </div>
                                <div className="h-2.5 bg-yellow-600/10 rounded-full overflow-hidden border border-yellow-600/5">
                                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 w-[60%] shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-950 text-white">
                    <CardHeader>
                        <CardTitle className="text-[10px] font-black flex items-center gap-2 text-yellow-500 uppercase tracking-widest">
                            <ShieldAlert className="h-4 w-4" /> RBAC Policy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Role changes take effect immediately. Ensure employees have the correct permissions before reassigning them. Custom roles can be managed in <a href="/dashboard/settings" className="text-yellow-500 hover:underline">Settings</a>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
