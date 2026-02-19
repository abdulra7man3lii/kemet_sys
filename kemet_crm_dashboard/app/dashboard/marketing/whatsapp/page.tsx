'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    MessageSquare,
    Zap,
    BarChart3,
    Settings,
    Plus,
    Phone,
    Shield,
    Trash2,
    Edit,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Layers,
    UserCheck,
    Check,
    Loader2,
    Upload,
    Image,
    Video,
    FileText,
    MousePointer2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

// Types
interface WhatsAppAccount {
    id: number;
    phoneNumber: string;
    displayName: string;
    isActive: boolean;
}

interface WhatsAppCampaign {
    id: number;
    name: string;
    status: string;
    createdAt: string;
    list: { name: string };
    totalRecipients: number;
    stats: {
        SENT: number;
        DELIVERED: number;
        READ: number;
        FAILED: number;
    };
    errorList: string[];
}

export default function WhatsAppMarketingPage() {
    const { user } = useAuth();
    const isCEO = user?.role === 'ORG_ADMIN' || user?.role === 'SUPER_ADMIN';

    const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
    const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [wizardLoading, setWizardLoading] = useState(false);

    // Wizard Data
    const [contactLists, setContactLists] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // Wizard Selections
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [campaignName, setCampaignName] = useState<string>('');
    const [templateConfig, setTemplateConfig] = useState<{
        headerType?: string;
        bodyParamsCount: number;
        buttons: any[];
    }>({ bodyParamsCount: 0, buttons: [] });

    const [batchSettings, setBatchSettings] = useState<any>({
        qtyPerSecond: 1,
        batchMode: 'PATCH',
        headerImageUrl: '',
        headerVideoUrl: '',
        headerDocUrl: '',
        bodyParams: [],
        buttonParams: []
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isWizardOpen) {
            fetchWizardData();
        }
    }, [isWizardOpen]);

    const fetchWizardData = async () => {
        try {
            const [lists, allTemplates] = await Promise.all([
                api.get<any[]>('/laundry/lists'),
                api.get<any[]>('/whatsapp/templates')
            ]);
            setContactLists(lists);
            setTemplates(allTemplates);
        } catch (error) {
            toast.error('Failed to load wizard resources');
        }
    };

    const fetchValidTemplates = async () => {
        if (selectedAccountIds.length === 0) return;
        setWizardLoading(true);
        try {
            const data = await api.get<any[]>(`/whatsapp/templates/valid?accountIds=${selectedAccountIds.join(',')}`);
            setTemplates(data);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleNextStep = () => {
        // Step 1: Template
        if (wizardStep === 1 && !selectedTemplateId) {
            toast.error('Please select a message template');
            return;
        }

        if (wizardStep === 1) {
            // Initialize config for Step 2 (Content)
            const temp = templates.find(t => t.id.toString() === selectedTemplateId);
            if (temp) {
                const header = temp.components?.find((c: any) => c.type === 'HEADER');
                const body = temp.components?.find((c: any) => c.type === 'BODY');
                const buttonsComp = temp.components?.find((c: any) => c.type === 'BUTTONS');

                const bodyText = body?.text || '';
                const bodyParamsCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

                setTemplateConfig({
                    headerType: header?.format,
                    bodyParamsCount,
                    buttons: buttonsComp?.buttons || []
                });

                setBatchSettings((prev: any) => ({
                    ...prev,
                    bodyParams: new Array(bodyParamsCount).fill(''),
                    buttonParams: (buttonsComp?.buttons || []).map((btn: any, idx: number) => ({
                        index: idx,
                        type: btn.type,
                        payload: btn.text,
                        text: btn.example?.[0] || ''
                    }))
                }));
            }
        }

        // Step 2: Content (Media/Params) - No hard validation usually needed unless required fields

        // Step 3: Audience
        if (wizardStep === 3 && !selectedListId) {
            toast.error('Please select a target audience');
            return;
        }

        // Step 4: Senders
        if (wizardStep === 4 && selectedAccountIds.length === 0) {
            toast.error('Please select at least one sender identity');
            return;
        }

        if (wizardStep < 5) {
            setWizardStep(prev => prev + 1);
        } else {
            handleCompleteCampaign();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post<{ url: string }>('/storage/upload', formData);
            const url = res.url;

            setBatchSettings((prev: any) => {
                const updates: any = {};
                if (templateConfig.headerType === 'IMAGE') updates.headerImageUrl = url;
                if (templateConfig.headerType === 'VIDEO') updates.headerVideoUrl = url;
                if (templateConfig.headerType === 'DOCUMENT') updates.headerDocUrl = url;
                return { ...prev, ...updates };
            });
            toast.success('Media uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload media');
        } finally {
            setUploading(false);
        }
    };

    const handleCompleteCampaign = async () => {
        setWizardLoading(true);
        try {
            const campaign = await api.post<any>('/whatsapp/campaigns', {
                name: campaignName.trim() || `Campaign ${new Date().toLocaleString()}`,
                listId: selectedListId,
                senderAccountIds: selectedAccountIds,
                templateId: selectedTemplateId,
                batchSettings
            });

            // Initiating sending simulation
            await api.post(`/whatsapp/campaigns/${campaign.id}/send`, {});

            toast.success('Campaign launched successfully');
            setIsWizardOpen(false);
            setWizardStep(1);
            setCampaignName('');
            fetchData();
        } catch (error) {
            toast.error('Failed to launch campaign');
        } finally {
            setWizardLoading(false);
        }
    };

    const handleDeleteCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to delete this campaign? All message logs will be permanently removed.')) return;
        try {
            await api.delete(`/whatsapp/campaigns/${id}`);
            toast.success('Campaign deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            const hasActiveCampaign = campaigns.some(c => c.status === 'SENDING');
            if (hasActiveCampaign) {
                fetchData();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [campaigns.some(c => c.status === 'SENDING')]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [accs, camps, temps] = await Promise.all([
                api.get<WhatsAppAccount[]>('/whatsapp/accounts'),
                api.get<WhatsAppCampaign[]>('/whatsapp/campaigns'),
                api.get<any[]>('/whatsapp/templates')
            ]);
            setAccounts(accs || []);
            setCampaigns(camps || []);
            setTemplates(temps || []);
        } catch (error) {
            console.error('Failed to load WhatsApp data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-800 bg-clip-text text-transparent tracking-tighter flex items-center gap-4 italic uppercase font-serif">
                        <div className="h-12 w-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20 rotate-3 border border-white/10">
                            <MessageSquare className="h-7 w-7 text-white" />
                        </div>
                        WhatsApp Marketing
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Enterprise-Grade Broadcasting & Multi-Account Orchestration
                    </p>
                </div>
                <div className="flex gap-3">
                    {isCEO && (
                        <Button variant="outline" className="border-yellow-600/20 bg-[#111C2E] text-[#D4AF37] font-black italic rounded-xl px-6 border-2 hover:bg-[#1B2A40]">
                            <Settings className="h-4 w-4 mr-2" /> Global Config
                        </Button>
                    )}
                    <Button
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-xl shadow-yellow-600/20 border-none px-8 font-black italic rounded-xl h-11"
                    >
                        <Zap className="h-4 w-4 mr-2" /> NEW CAMPAIGN
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-8">
                <TabsList className="bg-[#070B14] border border-[#1B2A40] p-1.5 h-14 rounded-2xl">
                    <TabsTrigger value="campaigns" className="rounded-xl px-8 font-black italic text-[#8A93A5] data-[state=active]:bg-yellow-600 data-[state=active]:text-white transition-all">
                        CAMPAIGNS
                    </TabsTrigger>
                    {isCEO && (
                        <TabsTrigger value="accounts" className="rounded-xl px-8 font-black italic text-[#8A93A5] data-[state=active]:bg-yellow-600 data-[state=active]:text-white transition-all">
                            MULTI-ACCOUNT MANAGER
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="templates" className="rounded-xl px-8 font-black italic text-[#8A93A5] data-[state=active]:bg-yellow-600 data-[state=active]:text-white transition-all">
                        TEMPLATES
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns" className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard title="Total Broadcasts" value={campaigns.length} icon={Layers} />
                        <StatCard title="Messages Delivered" value="0" icon={UserCheck} />
                        <StatCard title="Avg. Open Rate" value="0%" icon={BarChart3} trend="+0%" color="text-green-500" />
                        <StatCard title="Account Health" value="Excellent" icon={Shield} color="text-yellow-500" />
                    </div>

                    {campaigns.length === 0 ? (
                        <EmptyState onCta={() => setIsWizardOpen(true)} />
                    ) : (
                        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl overflow-hidden rounded-3xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#1B2A40] text-[#8A93A5] text-[10px] uppercase tracking-widest font-black">
                                            <th className="text-left px-6 py-4">Campaign</th>
                                            <th className="text-left px-6 py-4">Status & Progress</th>
                                            <th className="text-left px-6 py-4">Sent</th>
                                            <th className="text-left px-6 py-4">Delivered</th>
                                            <th className="text-left px-6 py-4">Read</th>
                                            <th className="text-right px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaigns.map((campaign: any) => {
                                            const statusColors: Record<string, string> = {
                                                DRAFT: 'bg-slate-700 text-slate-300',
                                                SCHEDULED: 'bg-blue-900 text-blue-300',
                                                SENDING: 'bg-yellow-900 text-yellow-300',
                                                COMPLETED: 'bg-green-900 text-green-300',
                                                FAILED: 'bg-red-900 text-red-300',
                                                PAUSED: 'bg-orange-900 text-orange-300',
                                            };
                                            const statusColor = statusColors[campaign.status] || 'bg-slate-700 text-slate-300';
                                            const total = campaign.totalRecipients || 1;
                                            const processed = (campaign.stats?.SENT || 0) + (campaign.stats?.FAILED || 0);
                                            const progress = Math.min(100, Math.round((processed / total) * 100));
                                            const remaining = Math.max(0, total - processed);

                                            return (
                                                <tr key={campaign.id} className="border-b border-[#1B2A40]/50 hover:bg-[#0E1624]/60 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-black italic text-white tracking-tight">{campaign.name}</div>
                                                        <div className="text-[10px] text-[#8A93A5] uppercase tracking-widest mt-0.5">{campaign.list?.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                                            <div className="flex items-center justify-between">
                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusColor}`}>
                                                                    {campaign.status}
                                                                </span>
                                                                {campaign.status === 'SENDING' && (
                                                                    <span className="text-[9px] font-black text-yellow-500 italic animate-pulse">
                                                                        {remaining} LEFT
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {(campaign.status === 'SENDING' || (campaign.status === 'COMPLETED' && progress < 100)) && (
                                                                <div className="h-1.5 w-full bg-[#070B14] rounded-full overflow-hidden border border-[#1B2A40]">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {campaign.stats?.FAILED > 0 && (
                                                                <div
                                                                    className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase cursor-help group/error relative"
                                                                    title={campaign.errorList?.join('\n')}
                                                                >
                                                                    <AlertCircle className="h-2.5 w-2.5" />
                                                                    {campaign.stats.FAILED} FAILURES
                                                                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-red-950 border border-red-500/50 rounded-lg text-[8px] text-red-200 hidden group-hover/error:block z-50 shadow-2xl backdrop-blur-md">
                                                                        <div className="font-bold mb-1 underline">Error Log:</div>
                                                                        {campaign.errorList?.map((err: string, i: number) => (
                                                                            <div key={i} className="mb-1 truncate">• {err}</div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-white font-black text-xs">{campaign.stats?.SENT || 0}</div>
                                                        <div className="text-[8px] text-[#8A93A5] uppercase font-bold">Processed</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-green-500 font-black text-xs">{campaign.stats?.DELIVERED || 0}</div>
                                                        <div className="text-[8px] text-[#8A93A5] uppercase font-bold">Confirmed</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-[#D4AF37] font-black text-xs">{campaign.stats?.READ || 0}</div>
                                                        <div className="text-[8px] text-[#8A93A5] uppercase font-bold">Engagement</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {(campaign.status === 'DRAFT' || campaign.status === 'FAILED') && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleCompleteCampaign()} // Note: Use the wizard logic or a separate send handler if needed
                                                                    className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#070B14] font-black italic uppercase text-[10px] rounded-xl h-8 px-4"
                                                                >
                                                                    Launch
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteCampaign(campaign.id)}
                                                                className="border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white font-black italic uppercase text-[10px] rounded-xl h-8 px-3"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </TabsContent>

                {isCEO && (
                    <TabsContent value="accounts" className="animate-in slide-in-from-left-4 duration-500">
                        <AccountManager accounts={accounts} onRefresh={fetchData} />
                    </TabsContent>
                )}

                <TabsContent value="templates" className="animate-in fade-in duration-500">
                    {templates.length === 0 ? (
                        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl overflow-hidden rounded-3xl border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-24">
                                <AlertCircle className="h-12 w-12 text-yellow-600/30 mb-4" />
                                <h3 className="text-xl font-bold italic uppercase tracking-tighter text-[#8A93A5]">No Templates Found</h3>
                                <p className="text-[#8A93A5] text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Sync your account to fetch templates from Meta</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((temp) => (
                                <Card key={temp.id} className="bg-[#111C2E] border-[#1B2A40] shadow-xl rounded-3xl overflow-hidden hover:border-[#D4AF37]/40 transition-all group">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-10 w-10 bg-[#070B14] rounded-xl flex items-center justify-center border border-[#1B2A40] text-[#D4AF37]">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-yellow-600/30 text-yellow-600">
                                                {temp.category}
                                            </Badge>
                                        </div>
                                        <h4 className="text-lg font-black italic text-white uppercase tracking-tight truncate">{temp.name}</h4>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="text-[8px] font-black uppercase border-[#1B2A40] text-[#8A93A5]">
                                                {temp.language}
                                            </Badge>
                                            <Badge variant="outline" className={`text-[8px] font-black uppercase ${temp.isActive ? 'border-green-500/20 text-green-500' : 'border-red-500/20 text-red-500'}`}>
                                                {temp.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-[#1B2A40]/50">
                                            <p className="text-[10px] font-black text-[#8A93A5] uppercase tracking-widest mb-2">Structure</p>
                                            <div className="flex gap-1">
                                                {temp.components?.map((c: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-[#070B14] rounded-lg text-[8px] font-black text-white/40 uppercase tracking-tighter">
                                                        {c.type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Campaign Wizard Dialog */}
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                <DialogContent className="sm:max-w-[750px] bg-[#0E1624] border-[#1B2A40] text-white p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="bg-[#070B14] p-10 border-b border-[#1B2A40] flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-3xl font-black italic tracking-tighter text-[#D4AF37] font-serif">CAMPAIGN WIZARD</DialogTitle>
                            <DialogDescription className="font-black text-[#8A93A5] text-[10px] uppercase tracking-[0.3em] mt-2">
                                Stage {wizardStep} of 5: <span className="text-white">
                                    {wizardStep === 1 ? 'CHOOSE MESSAGE' :
                                        wizardStep === 2 ? 'CONFIGURE CONTENT' :
                                            wizardStep === 3 ? 'TARGET AUDIENCE' :
                                                wizardStep === 4 ? 'Sender IDENTITIES' :
                                                    'DISPATCH STRATEGY'}
                                </span>
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <div key={s} className={`h-2 w-14 rounded-full transition-all duration-500 ${s <= wizardStep ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-[#1B2A40]'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="p-12 min-h-[500px] bg-gradient-to-b from-[#0E1624] to-[#070B14]">
                        {wizardStep === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">CAMPAIGN DESIGNATION</Label>
                                    <Input
                                        placeholder="e.g. Ramadan Special Offer Q3"
                                        className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-bold italic focus:border-[#D4AF37] transition-all rounded-xl text-white"
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                    />
                                </div>

                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">SELECT MESSAGE TEMPLATE</Label>
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {templates.length === 0 ? (
                                        <p className="text-center py-10 text-slate-500 font-bold italic">No templates found in your organization.</p>
                                    ) : templates.map(temp => (
                                        <div
                                            key={temp.id}
                                            onClick={() => setSelectedTemplateId(temp.id.toString())}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedTemplateId === temp.id.toString() ? 'border-[#D4AF37] bg-yellow-500/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-[#1B2A40] hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedTemplateId === temp.id.toString() ? 'bg-[#D4AF37] text-[#070B14]' : 'bg-[#111C2E] text-[#8A93A5]'}`}>
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold italic uppercase tracking-tight">{temp.name}</p>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase border-yellow-600/30 text-yellow-600 h-4 px-1">{temp.language}</Badge>
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase border-[#1B2A40] text-[#8A93A5] h-4 px-1">{temp.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedTemplateId === temp.id.toString() && <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">CONFIGURE CONTENT</Label>

                                {templateConfig.headerType && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateConfig.headerType) && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-widest">HEADER MEDIA ({templateConfig.headerType})</Label>
                                        <div className="relative group/upload h-32 w-full border-2 border-dashed border-[#1B2A40] rounded-[2rem] flex flex-col items-center justify-center bg-[#111C2E]/20 hover:border-yellow-600/30 transition-all cursor-pointer overflow-hidden">
                                            {uploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-6 w-6 text-[#D4AF37] animate-spin" />
                                                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Uploading...</span>
                                                </div>
                                            ) : (batchSettings.headerImageUrl || batchSettings.headerVideoUrl || batchSettings.headerDocUrl) ? (
                                                <div className="flex items-center gap-4 text-[#D4AF37]">
                                                    <CheckCircle2 className="h-8 w-8" />
                                                    <div className="text-left">
                                                        <p className="font-black italic text-sm">MEDIA INITIALIZED</p>
                                                        <p className="text-[9px] font-mono opacity-50 truncate max-w-[400px]">
                                                            {batchSettings.headerImageUrl || batchSettings.headerVideoUrl || batchSettings.headerDocUrl}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-[#8A93A5] group-hover/upload:text-white transition-colors">
                                                    <Upload className="h-6 w-6" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Select {templateConfig.headerType}</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept={templateConfig.headerType === 'IMAGE' ? 'image/*' : templateConfig.headerType === 'VIDEO' ? 'video/*' : '*'}
                                            />
                                        </div>
                                    </div>
                                )}

                                {templateConfig.bodyParamsCount > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-widest">TEMPLATE VARIABLES</Label>
                                        <div className="grid grid-cols-1 gap-4">
                                            {Array.from({ length: templateConfig.bodyParamsCount }).map((_, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <Label className="text-[9px] font-black text-[#8A93A5] uppercase tracking-widest">Variable {idx + 1}</Label>
                                                    <Input
                                                        placeholder={`Enter value for {{${idx + 1}}}`}
                                                        className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-bold italic focus:border-[#D4AF37] transition-all rounded-xl"
                                                        value={batchSettings.bodyParams[idx] || ''}
                                                        onChange={(e) => {
                                                            const newParams = [...batchSettings.bodyParams];
                                                            newParams[idx] = e.target.value;
                                                            setBatchSettings({ ...batchSettings, bodyParams: newParams });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {templateConfig.buttons?.length > 0 && (
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-widest">INTERACTIVE BUTTONS</Label>
                                        <div className="grid grid-cols-1 gap-4">
                                            {templateConfig.buttons.map((btn: any, idx: number) => (
                                                <div key={idx} className="bg-[#111C2E]/30 p-6 rounded-2xl border border-[#1B2A40] space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                                                            <MousePointer2 className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black italic text-xs uppercase tracking-tight">{btn.text}</p>
                                                            <p className="text-[8px] font-black text-[#8A93A5] uppercase tracking-widest">{btn.type}</p>
                                                        </div>
                                                    </div>

                                                    {btn.type === 'QUICK_REPLY' && (
                                                        <div className="space-y-2">
                                                            <Label className="text-[9px] font-black text-[#8A93A5] uppercase tracking-widest">Button Payload</Label>
                                                            <Input
                                                                placeholder="Enter reply identifier"
                                                                className="bg-[#070B14] border-[#1B2A40] h-10 px-4 font-bold italic focus:border-[#D4AF37] transition-all rounded-xl text-xs"
                                                                value={batchSettings.buttonParams[idx]?.payload || ''}
                                                                onChange={(e) => {
                                                                    const newParams = [...batchSettings.buttonParams];
                                                                    newParams[idx] = { ...newParams[idx], payload: e.target.value };
                                                                    setBatchSettings({ ...batchSettings, buttonParams: newParams });
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {btn.type === 'URL' && btn.example && (
                                                        <div className="space-y-2">
                                                            <Label className="text-[9px] font-black text-[#8A93A5] uppercase tracking-widest">Dynamic URL Suffix</Label>
                                                            <Input
                                                                placeholder="e.g. tracking/123"
                                                                className="bg-[#070B14] border-[#1B2A40] h-10 px-4 font-bold italic focus:border-[#D4AF37] transition-all rounded-xl text-xs"
                                                                value={batchSettings.buttonParams[idx]?.text || ''}
                                                                onChange={(e) => {
                                                                    const newParams = [...batchSettings.buttonParams];
                                                                    newParams[idx] = { ...newParams[idx], text: e.target.value };
                                                                    setBatchSettings({ ...batchSettings, buttonParams: newParams });
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!templateConfig.headerType && templateConfig.bodyParamsCount === 0 && templateConfig.buttons?.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-[#111C2E]/20 rounded-[2rem] border border-dashed border-[#1B2A40]">
                                        <Check className="h-10 w-10 text-green-500/30 mb-4" />
                                        <p className="text-[10px] font-black text-[#8A93A5] uppercase tracking-[0.3em]">No Configuration Required</p>
                                        <p className="text-[9px] font-bold text-[#8A93A5]/40 mt-1">Static Template Detected</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">SELECT TARGET AUDIENCE</Label>
                                <div className="grid grid-cols-1 gap-3">
                                    {contactLists.map(list => (
                                        <div
                                            key={list.id}
                                            onClick={() => setSelectedListId(list.id.toString())}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${selectedListId === list.id.toString() ? 'border-[#D4AF37] bg-yellow-500/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-[#1B2A40] hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${selectedListId === list.id.toString() ? 'bg-[#D4AF37] text-[#070B14]' : 'bg-[#111C2E] text-[#8A93A5]'}`}>
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold italic uppercase tracking-tight">{list.name}</p>
                                                    <p className="text-[10px] font-black text-[#8A93A5] uppercase tracking-widest">{list._count?.contacts || 0} Contacts</p>
                                                </div>
                                            </div>
                                            {selectedListId === list.id.toString() && <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wizardStep === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">SELECT SENDER IDENTITIES</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {accounts.map(acc => {
                                        const selectedTemplate = templates.find(t => t.id.toString() === selectedTemplateId);
                                        const isRecommended = selectedTemplate?.accounts?.some((a: any) => a.id === acc.id);

                                        return (
                                            <div
                                                key={acc.id}
                                                onClick={() => {
                                                    setSelectedAccountIds(prev =>
                                                        prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                                                    );
                                                }}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 relative overflow-hidden group ${selectedAccountIds.includes(acc.id) ? 'border-[#D4AF37] bg-yellow-500/5 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-[#1B2A40] hover:border-white/10'}`}
                                            >
                                                {isRecommended && (
                                                    <div className="absolute top-0 right-0">
                                                        <Badge className="bg-[#D4AF37] text-[#070B14] text-[8px] font-black italic rounded-bl-xl rounded-tr-none border-none py-1 px-3 shadow-[0_0_15px_rgba(212,175,55,0.4)]">RECOMMENDED</Badge>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${selectedAccountIds.includes(acc.id) ? 'bg-[#D4AF37] text-[#070707]' : 'bg-[#111C2E] text-[#8A93A5]'}`}>
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 truncate">
                                                        <p className="font-bold italic uppercase tracking-tight truncate">{acc.displayName}</p>
                                                        <p className="text-[10px] font-mono text-[#8A93A5]">{acc.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {wizardStep === 5 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">DISPATCH STRATEGY CONFIGURATION</Label>

                                <div className="grid grid-cols-2 gap-6 bg-[#111C2E]/40 p-8 rounded-[2rem] border border-[#1B2A40]">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-widest">SEND MODE</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={batchSettings.batchMode === 'INSTANT' ? 'default' : 'outline'}
                                                onClick={() => setBatchSettings({ ...batchSettings, batchMode: 'INSTANT' })}
                                                className={`flex-1 font-black italic rounded-xl ${batchSettings.batchMode === 'INSTANT' ? 'bg-[#D4AF37] text-[#070B14]' : 'border-[#1B2A40] text-white'}`}
                                            >
                                                INSTANT
                                            </Button>
                                            <Button
                                                variant={batchSettings.batchMode === 'PATCH' ? 'default' : 'outline'}
                                                onClick={() => setBatchSettings({ ...batchSettings, batchMode: 'PATCH' })}
                                                className={`flex-1 font-black italic rounded-xl ${batchSettings.batchMode === 'PATCH' ? 'bg-[#D4AF37] text-[#070B14]' : 'border-[#1B2A40] text-white'}`}
                                            >
                                                BATCH
                                            </Button>
                                        </div>
                                    </div>
                                    {batchSettings.batchMode === 'PATCH' && (
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-widest">MESSAGES PER SECOND</Label>
                                            <Input
                                                type="number"
                                                className="bg-[#070B14] border-[#1B2A40] h-11 text-center font-black text-[#D4AF37]"
                                                value={batchSettings.qtyPerSecond}
                                                onChange={e => setBatchSettings({ ...batchSettings, qtyPerSecond: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 bg-yellow-500/5 rounded-3xl border border-yellow-600/10 flex items-start gap-4">
                                    <Shield className="h-6 w-6 text-[#D4AF37] shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black italic text-[#D4AF37] uppercase tracking-tight">KEMET Dispatch Guard Active</p>
                                        <p className="text-[10px] font-bold text-[#8A93A5] uppercase tracking-widest leading-relaxed">
                                            System will automatically distribute <span className="text-white">even load</span> across {selectedAccountIds.length} accounts.
                                            Only <span className="text-white">Laundered Verified</span> contacts will be targeted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="bg-[#070B14] p-8 border-t border-[#1B2A40] gap-4">
                        <Button variant="ghost" className="font-black text-[#8A93A5] italic uppercase tracking-widest hover:text-white transition-colors" onClick={() => setIsWizardOpen(false)}>ABORT MISSION</Button>
                        <div className="flex gap-4">
                            {wizardStep > 1 && <Button variant="outline" className="border-[#1B2A40] text-[#E6EAF0] font-black italic rounded-xl px-8" onClick={() => setWizardStep(prev => prev - 1)}>BACK</Button>}
                            <Button
                                onClick={handleNextStep}
                                disabled={wizardLoading || uploading}
                                className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#070B14] font-black italic px-12 rounded-xl h-12 shadow-lg shadow-yellow-600/20"
                            >
                                {wizardStep < 5 ? 'NEXT STAGE' : 'LAUNCH BROADCAST'} <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

// Sub-components
function StatCard({ title, value, icon: Icon, trend, color }: any) {
    return (
        <Card className="bg-[#111C2E] border-[#1B2A40] shadow-2xl group hover:border-[#D4AF37]/40 transition-all duration-500 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/50 transition-all duration-500" />
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 bg-[#070B14] rounded-2xl flex items-center justify-center border border-[#1B2A40] group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                    {trend && <span className={`text-[10px] font-black ${color} bg-white/5 px-3 py-1 rounded-full border border-current opacity-60`}>{trend}</span>}
                </div>
                <h4 className="text-[10px] font-black text-[#8A93A5] uppercase tracking-[0.4em] mb-2 opacity-80">{title}</h4>
                <p className={`text-4xl font-black italic tracking-tighter ${color || 'text-white'} font-serif`}>{value}</p>
            </CardContent>
        </Card>
    );
}

function EmptyState({ onCta }: { onCta: () => void }) {
    return (
        <Card className="border-dashed border-2 border-[#1B2A40] bg-[#090D16] relative overflow-hidden group rounded-[3rem] p-12 shadow-inner">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="flex flex-col items-center justify-center py-24 text-center relative z-10 space-y-10">
                <div className="h-32 w-32 bg-gradient-to-br from-[#111C2E] to-[#1B2A40] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 rotate-6 group-hover:rotate-0 transition-all duration-700">
                    <Zap className="h-16 w-16 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-5xl font-black italic bg-gradient-to-r from-white via-[#8A93A5] to-[#40495A] bg-clip-text text-transparent uppercase tracking-tighter font-serif">Ready For Blastoff</h3>
                    <p className="max-w-md mx-auto font-bold text-[#8A93A5] text-xs uppercase tracking-[0.3em] leading-loose opacity-50">
                        Connect your multi-account hierarchy and initialize large-scale conversational outreach protocols.
                    </p>
                </div>
                <Button
                    onClick={onCta}
                    className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#070B14] font-black italic px-16 h-14 shadow-2xl shadow-yellow-600/30 rounded-2xl text-lg group-hover:scale-105 transition-all"
                >
                    LAUNCH FIRST CAMPAIGN
                </Button>
            </CardContent>
        </Card>
    );
}

function AccountManager({ accounts, onRefresh }: { accounts: WhatsAppAccount[], onRefresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [testingId, setTestingId] = useState<number | null>(null);
    const [syncingId, setSyncingId] = useState<number | null>(null);

    const [newAccount, setNewAccount] = useState({
        phoneNumber: '',
        displayName: '',
        apiKey: '',
        phoneId: '',
        businessAccountId: ''
    });

    const handleAdd = async () => {
        if (!newAccount.phoneNumber || !newAccount.apiKey) {
            toast.error('Required fields missing');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/whatsapp/accounts', newAccount);
            toast.success('Account initialized successfully');
            setIsOpen(false);
            setNewAccount({
                phoneNumber: '',
                displayName: '',
                apiKey: '',
                phoneId: '',
                businessAccountId: ''
            });
            onRefresh();
        } catch (error) {
            toast.error('Initialization failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTest = async (id: number) => {
        setTestingId(id);
        try {
            await api.post(`/whatsapp/accounts/${id}/test`, {});
            toast.success('Meta connection verified successfully!');
        } catch (error) {
            toast.error('Meta connection failed. Check your IDs/Token.');
        } finally {
            setTestingId(null);
        }
    };

    const handleSync = async (id: number) => {
        setSyncingId(id);
        try {
            const data: any = await api.post(`/whatsapp/accounts/${id}/sync`, {});
            toast.success(`Synced ${data.count} templates from Meta!`);
            onRefresh();
        } catch (error) {
            toast.error('Template synchronization failed.');
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/whatsapp/accounts/${id}`);
            toast.success('Account removed.');
            onRefresh();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete account.');
        }
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#090D16] p-10 rounded-[2.5rem] border border-[#1B2A40] shadow-2xl backdrop-blur-md">
                <div>
                    <h3 className="text-3xl font-black italic text-white flex items-center gap-4 font-serif uppercase tracking-tight">
                        <Phone className="h-8 w-8 text-[#D4AF37]" /> REGISTERED ASSETS
                    </h3>
                    <p className="text-[#8A93A5] text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-60">Manage multiple business phone lines and provider identities.</p>
                </div>
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-white/5 hover:bg-white/10 text-[#D4AF37] border-2 border-yellow-600/20 font-black italic rounded-2xl h-14 px-10 shadow-xl"
                >
                    <Plus className="h-5 w-5 mr-3" /> REGISTER NEW NUMBER
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {accounts.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-[#1B2A40] rounded-[2.5rem] bg-[#090D16]">
                        <Phone className="h-12 w-12 text-[#1B2A40] mx-auto mb-4" />
                        <p className="text-[#8A93A5] font-black italic uppercase tracking-widest text-xs">No numbers registered yet</p>
                    </div>
                ) : accounts.map(acc => (
                    <Card key={acc.id} className="bg-[#111C2E] border-[#1B2A40] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden group rounded-[2rem] hover:border-[#D4AF37]/50 transition-all duration-500">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="h-16 w-16 bg-[#070B14] rounded-3xl flex items-center justify-center border border-[#1B2A40] shadow-inner group-hover:rotate-6 transition-transform">
                                    <Phone className="h-8 w-8 text-[#D4AF37]" />
                                </div>
                                <Badge className={acc.isActive ? 'bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-black italic rounded-full text-[9px] border' : 'bg-red-500/10 text-red-500 border-red-500/20 px-4 py-1.5 font-black italic rounded-full text-[9px] border'}>
                                    {acc.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                </Badge>
                            </div>
                            <h4 className="text-2xl font-black italic text-white mb-2 uppercase tracking-tighter font-serif">{acc.displayName || 'Unnamed Line'}</h4>
                            <p className="text-[#8A93A5] font-mono text-sm tracking-wider">{acc.phoneNumber}</p>

                            <div className="mt-8 flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTest(acc.id)}
                                    disabled={testingId === acc.id}
                                    className="border-white/5 bg-white/5 text-[10px] font-black italic uppercase tracking-widest text-[#D4AF37] h-9 rounded-xl hover:bg-yellow-600/10"
                                >
                                    {testingId === acc.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                                    Test Meta Connection
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSync(acc.id)}
                                    disabled={syncingId === acc.id}
                                    className="border-white/5 bg-white/5 text-[10px] font-black italic uppercase tracking-widest text-[#D4AF37] h-9 rounded-xl hover:bg-yellow-600/10"
                                >
                                    {syncingId === acc.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Layers className="h-3 w-3 mr-2" />}
                                    Sync Templates
                                </Button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-[#1B2A40] flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-11 w-11 text-[#8A93A5] hover:bg-white/5 hover:text-white rounded-xl"><Edit className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id, acc.displayName || acc.phoneNumber)} className="h-11 w-11 text-red-500/40 hover:bg-red-500/5 hover:text-red-500 rounded-xl"><Trash2 className="h-5 w-5" /></Button>
                                </div>
                                <div className="flex items-center gap-2.5 text-[9px] font-black text-green-500/70 italic bg-green-500/5 px-4 py-2 rounded-xl border border-green-500/10 tracking-[0.1em]">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> META VERIFIED
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[550px] bg-[#0E1624] border-[#1B2A40] text-white overflow-hidden p-0 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                    <DialogHeader className="p-10 bg-[#070B14] border-b border-[#1B2A40]">
                        <DialogTitle className="text-3xl font-black italic tracking-tighter text-[#D4AF37] font-serif uppercase">REGISTER NEW ASSET</DialogTitle>
                        <DialogDescription className="font-black text-[#8A93A5] text-[10px] uppercase tracking-[0.4em] mt-3 opacity-60">Initialize Meta Business Account Gateway</DialogDescription>
                    </DialogHeader>
                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">Identity Label</Label>
                                <Input
                                    placeholder="Sales Division"
                                    className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-bold italic focus:border-[#D4AF37] transition-all rounded-xl"
                                    value={newAccount.displayName}
                                    onChange={e => setNewAccount({ ...newAccount, displayName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">Phone Number</Label>
                                <Input
                                    placeholder="+97150..."
                                    className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-mono focus:border-[#D4AF37] transition-all rounded-xl text-yellow-500/80"
                                    value={newAccount.phoneNumber}
                                    onChange={e => setNewAccount({ ...newAccount, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">System API Access Token</Label>
                            <Input
                                type="password"
                                placeholder="EAAK..."
                                className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-mono focus:border-[#D4AF37] transition-all rounded-xl"
                                value={newAccount.apiKey}
                                onChange={e => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">Phone ID (Meta)</Label>
                                <Input
                                    placeholder="1000..."
                                    className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-mono focus:border-[#D4AF37] transition-all rounded-xl"
                                    value={newAccount.phoneId}
                                    onChange={e => setNewAccount({ ...newAccount, phoneId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-[#8A93A5] tracking-[0.3em]">Business ID (WABA)</Label>
                                <Input
                                    placeholder="5000..."
                                    className="bg-[#070B14] border-[#1B2A40] h-12 px-5 font-mono focus:border-[#D4AF37] transition-all rounded-xl"
                                    value={newAccount.businessAccountId}
                                    onChange={e => setNewAccount({ ...newAccount, businessAccountId: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="bg-[#070B14] p-10 border-t border-[#1B2A40] gap-4">
                        <Button variant="ghost" className="font-black text-[#8A93A5] italic uppercase tracking-[0.2em]" onClick={() => setIsOpen(false)}>ABORT MISSION</Button>
                        <Button
                            className="bg-[#D4AF37] hover:bg-[#B8860B] text-[#070B14] font-black italic px-12 h-14 rounded-2xl shadow-xl shadow-yellow-600/20"
                            onClick={handleAdd}
                            disabled={submitting}
                        >
                            {submitting ? 'COMMITTING ASSET...' : 'INITIALIZE GATEWAY'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
