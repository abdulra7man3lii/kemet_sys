'use client';

import { useState, useEffect } from 'react';
import { InternalNote } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Lock, Send, Trash2, Clock } from 'lucide-react';
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
        <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-amber-800">Internal Team Notes</h4>
                    <p className="text-xs text-amber-700">These notes are only visible to your team members. Customers never see this content.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                    placeholder="Add a private update about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px] bg-white border-slate-200 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                    <Button
                        disabled={loading || !newNote.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? 'Posting...' : (
                            <>
                                <Send className="h-4 w-4 mr-2" /> Post Note
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="space-y-4">
                {fetching ? (
                    <div className="py-8 text-center text-slate-400 italic">Loading notes...</div>
                ) : notes.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                        <Lock className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 text-sm italic">No internal notes yet.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <Card key={note.id} className="border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Avatar className="h-8 w-8 mt-1 border border-slate-100 shadow-sm">
                                            <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">
                                                {(note.user?.name?.[0] || note.user?.email?.[0] || 'U').toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-900">{note.user?.name || note.user?.email}</span>
                                                <span className="text-[10px] text-slate-400 flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(note.id)}
                                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
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
