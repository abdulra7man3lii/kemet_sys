'use client';

import { useState, useEffect } from 'react';
import { InternalNote } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Lock, Send, Trash2, Clock, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface InternalNotesProps {
    customerId: number;
}

export function InternalNotes({ customerId }: InternalNotesProps) {
    const [notes, setNotes] = useState<InternalNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, [customerId]);

    const fetchNotes = async () => {
        setFetching(true);
        try {
            const data = await api.get<InternalNote[]>(`/internal-notes/customer/${customerId}`);
            setNotes(data);
        } catch (error) {
            console.error('Failed to fetch internal notes');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setLoading(true);
        try {
            const created = await api.post<InternalNote>('/internal-notes', {
                customerId,
                content: newNote.trim(),
            });
            setNotes([created, ...notes]);
            setNewNote('');
            toast.success('Internal note added');
        } catch (error) {
            // Already toasted
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (noteId: number) => {
        if (!confirm('Delete this internal note?')) return;
        try {
            await api.delete(`/internal-notes/${noteId}`);
            setNotes(notes.filter(n => n.id !== noteId));
            toast.success('Note removed');
        } catch (error) {
            // Already toasted
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-[#111C2E] border border-[#1B2A40] rounded-xl p-5 flex items-start gap-4 shadow-xl">
                <Shield className="h-6 w-6 text-[#D4AF37] mt-0.5" />
                <div>
                    <h4 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest italic font-serif">Secure Team Annotations</h4>
                    <p className="text-xs text-[#8A93A5] font-medium leading-relaxed mt-1">
                        Encrypted internal documentation. These records are strictly restricted to enterprise personnel.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                    placeholder="Enter strategic observation..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[120px] bg-[#0E1624] border-[#1B2A40] text-[#E6EAF0] focus:ring-1 focus:ring-[#D4AF37] rounded-xl transition-all placeholder:text-[#8A93A5]/50"
                />
                <div className="flex justify-end">
                    <Button
                        disabled={loading || !newNote.trim()}
                        className="bg-[#D4AF37] hover:bg-[#E6C35A] text-[#070B14] font-black uppercase tracking-widest px-8"
                    >
                        {loading ? 'SYNCING...' : (
                            <>
                                <Send className="h-4 w-4 mr-2" /> RECORD NOTE
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="space-y-5">
                {fetching ? (
                    <div className="py-10 text-center text-[#8A93A5] uppercase tracking-widest text-[10px] font-black opacity-50 animate-pulse italic">Retrieving secure logs...</div>
                ) : notes.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-[#1B2A40] rounded-2xl bg-[#0E1624]/30">
                        <Lock className="h-12 w-12 mx-auto text-[#1B2A40] mb-4 opacity-50" />
                        <p className="text-[#8A93A5] text-[10px] font-black uppercase tracking-widest italic">Vault Empty</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <Card key={note.id} className="bg-[#111C2E] border-[#1B2A40] shadow-xl hover:border-[#D4AF37]/30 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <Avatar className="h-10 w-10 border border-[#1B2A40] shadow-2xl relative overflow-hidden group-hover:border-[#D4AF37]/50 transition-colors">
                                            <AvatarFallback className="bg-[#070B14] text-[#D4AF37] text-xs font-black italic">
                                                {(note.user?.name?.[0] || note.user?.email?.[0] || 'U').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-[#E6EAF0] tracking-tight">{note.user?.name || note.user?.email}</span>
                                                <span className="text-[10px] text-[#8A93A5] flex items-center font-bold font-mono">
                                                    <Clock className="h-3 w-3 mr-1.5 text-[#D4AF37]" />
                                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true }).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#8A93A5] font-medium leading-relaxed">{note.content}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(note.id)}
                                        className="h-10 w-10 text-[#8A93A5] hover:text-[#E5484D] hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
