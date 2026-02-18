'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Customer, Interaction } from '@/types';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Edit, Save, Trash2, X, Phone, Mail, Calendar, MessageSquare, Clock, Users, User as UserIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AddInteractionDialog } from '@/components/add-interaction-dialog';
import { AssignHandlerDialog } from '@/components/assign-handler-dialog';
import { InternalNotes } from '@/components/internal-notes';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Customer>>({});

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [customerData, interactionsData] = await Promise.all([
                api.get<Customer>(`/customers/${id}`),
                api.get<Interaction[]>(`/interactions/customer/${id}`),
            ]);
            setCustomer(customerData);
            setFormData(customerData);
            setInteractions(interactionsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load customer data');
        } finally {
            setLoading(false);
        }
    };

    const fetchInteractions = async () => {
        try {
            const data = await api.get<Interaction[]>(`/interactions/customer/${id}`);
            setInteractions(data);
        } catch (err) {
            console.error('Failed to refresh interactions');
        }
    };

    const handleUpdate = async () => {
        try {
            const updated = await api.put<Customer>(`/customers/${id}`, formData);
            setCustomer(updated);
            setIsEditing(false);
            toast.success('Customer updated successfully');
        } catch (err: any) { }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await api.delete(`/customers/${id}`);
            toast.success('Customer deleted');
            router.push('/dashboard/customers');
        } catch (err: any) { }
    };

    const handleDeleteInteraction = async (intId: number) => {
        if (!confirm('Delete this interaction?')) return;
        try {
            await api.delete(`/interactions/${intId}`);
            toast.success('Interaction deleted');
            fetchInteractions();
        } catch (err: any) { }
    };

    const handleUnassign = async (userId: number) => {
        if (!confirm('Remove this team member from this customer?')) return;
        try {
            await api.post(`/customers/${id}/unassign`, { userId });
            toast.success('Member removed');
            fetchData();
        } catch (err: any) { }
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'CALL': return <Phone className="h-4 w-4 text-blue-500" />;
            case 'EMAIL': return <Mail className="h-4 w-4 text-orange-500" />;
            case 'MEETING': return <Calendar className="h-4 w-4 text-green-500" />;
            default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Loading customer details...</div>;
    if (error) return <Card className="p-8 text-center text-red-500">{error}</Card>;
    if (!customer) return <Card className="p-8 text-center">Customer not found</Card>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12 px-4">
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/customers">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Customers
                    </Link>
                </Button>

                <div className="flex space-x-2">
                    {!isEditing ? (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-yellow-600/20 text-yellow-700 hover:bg-yellow-50 font-bold transition-all">
                                <Edit className="h-4 w-4 mr-2" /> Edit Details
                            </Button>
                            {(user?.role === 'SUPER_ADMIN' || user?.role === 'ORG_ADMIN') && (
                                <Button variant="destructive" size="sm" onClick={handleDelete} className="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border-red-200 font-bold transition-all">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete Lead
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-500 font-bold">
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleUpdate} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg shadow-yellow-600/20 border-none font-bold">
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                                            {isEditing ? 'Edit Customer' : customer.name}
                                        </CardTitle>
                                        {!isEditing && (
                                            <Badge className={`px-3 py-1 font-black uppercase tracking-widest text-[10px] ${customer.status === 'CUSTOMER' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                customer.status === 'PROSPECT' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                                                }`}>
                                                {customer.status}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {isEditing ? 'Update customer information below.' : customer.company || 'Private Customer'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                                        />
                                    ) : (
                                        <div className="flex items-center text-slate-900 group">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-yellow-50 transition-colors">
                                                <Mail className="h-4 w-4 text-slate-400 group-hover:text-yellow-600 transition-colors" />
                                            </div>
                                            <span className="font-bold">{customer.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</Label>
                                    {isEditing ? (
                                        <Input
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="bg-white border-slate-200 focus:border-yellow-600 focus:ring-yellow-600/20"
                                        />
                                    ) : (
                                        <div className="flex items-center text-slate-900 group">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-yellow-50 transition-colors">
                                                <Phone className="h-4 w-4 text-slate-400 group-hover:text-yellow-600 transition-colors" />
                                            </div>
                                            <span className="font-bold">{customer.phone || 'N/A'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="timeline" className="w-full space-y-8">
                        <div className="sticky top-[64px] z-20 py-4 bg-white/80 backdrop-blur-md border-b border-yellow-600/10 -mx-6 px-6 shadow-sm">
                            <TabsList className="bg-slate-950 p-1 border-2 border-yellow-600/50 rounded-2xl shadow-xl h-14 w-full md:w-max flex overflow-x-auto overflow-y-hidden custom-scrollbar justify-start">
                                <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                    <Clock className="h-5 w-5 mr-3" /> Timeline
                                </TabsTrigger>
                                <TabsTrigger value="internal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-700 data-[state=active]:text-black data-[state=active]:shadow-lg text-slate-400 font-black px-8 py-3 rounded-xl transition-all hover:text-yellow-500 text-base">
                                    <Lock className="h-5 w-5 mr-3" /> Team Notes
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="timeline" className="mt-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Interactions History</h3>
                                <AddInteractionDialog
                                    customerId={parseInt(id)}
                                    onSuccess={fetchInteractions}
                                />
                            </div>

                            {interactions.length === 0 ? (
                                <Card className="bg-slate-50 border-dashed border-slate-300">
                                    <CardContent className="py-12 text-center text-slate-400">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p className="italic">No interactions recorded yet. Start tracking communications!</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[1.45rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {interactions.map((interaction) => (
                                        <div key={interaction.id} className="relative flex items-start group pl-3">
                                            <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-yellow-600/20 shadow-sm z-10 group-hover:border-yellow-600/50 transition-colors ring-4 ring-white">
                                                {getInteractionIcon(interaction.type)}
                                            </div>
                                            <div className="flex-1 ml-10">
                                                <Card className="shadow-sm border-slate-200 group-hover:border-slate-300 transition-all group-hover:shadow-md">
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-black text-[9px] text-yellow-800 tracking-widest bg-yellow-100 px-2 py-0.5 rounded uppercase border border-yellow-200">{interaction.type}</span>
                                                                <span className="text-slate-300">•</span>
                                                                <div className="flex items-center text-xs text-slate-500 font-medium">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    {format(new Date(interaction.date), 'PPP')}
                                                                    {interaction.user && (
                                                                        <>
                                                                            <span className="mx-2 text-slate-300 italic">by</span>
                                                                            <span className="font-bold text-slate-700">{interaction.user.name || interaction.user.email}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleDeleteInteraction(interaction.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed border-l-2 border-slate-100 pl-4 py-1 italic">
                                                            "{interaction.notes || 'No details provided.'}"
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="internal" className="mt-6">
                            <InternalNotes customerId={parseInt(id)} />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200 sticky top-6">
                        <CardHeader className="pb-2 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                                    <Users className="h-4 w-4 mr-2 text-yellow-600" /> Team Handlers
                                </CardTitle>
                                <AssignHandlerDialog
                                    customerId={parseInt(id)}
                                    existingHandlerIds={customer.handlers?.map(h => h.id) || []}
                                    onSuccess={fetchData}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {customer.handlers && customer.handlers.length > 0 ? (
                                <div className="space-y-4">
                                    {customer.handlers.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between group">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-9 w-9 border border-yellow-600/10 shadow-sm">
                                                    <AvatarFallback className="bg-yellow-50 text-yellow-800 font-black text-xs">
                                                        {(member.name?.[0] || member.email[0]).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 leading-none mb-1">{member.name || 'Team Member'}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{member.email}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleUnassign(member.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-6 text-center border-2 border-dashed border-slate-50 rounded-xl">
                                    <UserIcon className="h-8 w-8 mx-auto text-slate-100 mb-2" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unassigned</p>
                                </div>
                            )}

                            <Separator className="my-4 bg-slate-50" />

                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Created By</Label>
                                        <div className="flex items-center mt-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mr-2" />
                                            <span className="text-xs font-black text-slate-700 italic uppercase tracking-tighter">{customer.createdBy?.name || customer.createdBy?.email || 'System'}</span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium mt-1 ml-3.5 italic">
                                            {format(new Date(customer.createdAt), 'PPp')}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Activity Stats</Label>
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <div className="bg-white p-2 rounded-lg border border-yellow-600/10 text-center shadow-sm">
                                                <div className="text-lg font-black text-yellow-700 italic">{interactions.length}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Events</div>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                                <div className="text-lg font-bold text-slate-900">
                                                    {Math.floor((new Date().getTime() - new Date(customer.createdAt).getTime()) / (1000 * 3600 * 24))}
                                                </div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Days</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
