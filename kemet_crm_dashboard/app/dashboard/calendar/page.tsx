"use client";

import { useEffect, useState } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    MapPin,
    MessageSquare,
    Phone,
    Video
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewEvent, setShowNewEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: ""
    });

    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        try {
            const data = await api.get<any[]>("/calendar/events");
            setEvents(data);
        } catch (error) {
            toast.error("Failed to load royal schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/calendar/events", newEvent);
            toast.success("Event added to the royal scroll");
            setShowNewEvent(false);
            fetchEvents();
        } catch (error) {
            toast.error("Failed to schedule event");
        }
    };

    // Calendar logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const days = [];
    const totalDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getEventsForDay = (day: number) => {
        return events.filter(e => {
            const date = new Date(e.startTime);
            return date.getDate() === day &&
                date.getMonth() === currentDate.getMonth() &&
                date.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">
                        ROYAL <span className="text-amber-500 font-medium">CALENDAR</span>
                    </h1>
                    <p className="text-zinc-400">Synchronize your ambitions with celestial timing.</p>
                </div>
                <button
                    onClick={() => setShowNewEvent(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
                >
                    <Plus size={20} />
                    Herald Event
                </button>
            </div>

            {/* Calendar Grid Container */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
                {/* Calendar Nav */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                    <h2 className="text-2xl font-light text-white">
                        {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-amber-500 font-medium">{currentDate.getFullYear()}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/20">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">{d}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-[140px]">
                    {days.map((day, idx) => (
                        <div
                            key={idx}
                            className={`border-r border-b border-zinc-800 p-3 group transition-colors ${day ? 'hover:bg-amber-500/5' : 'bg-black/20'}`}
                        >
                            {day && (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-medium ${day === new Date().getDate() &&
                                                currentDate.getMonth() === new Date().getMonth() &&
                                                currentDate.getFullYear() === new Date().getFullYear()
                                                ? 'bg-amber-500 text-black w-7 h-7 flex items-center justify-center rounded-full'
                                                : 'text-zinc-500 group-hover:text-white'
                                            }`}>
                                            {day}
                                        </span>
                                    </div>
                                    <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                                        {getEventsForDay(day).map((event, i) => (
                                            <div
                                                key={i}
                                                className={`text-[10px] p-1.5 rounded-md border truncate leading-tight ${event.type === 'INTERACTION'
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                                                    }`}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar: Upcoming / Today */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 h-fit">
                    <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
                        <Clock className="text-amber-500" size={20} />
                        Today's Agenda
                    </h3>
                    <div className="space-y-4">
                        {getEventsForDay(new Date().getDate()).length > 0 ? (
                            getEventsForDay(new Date().getDate()).map((e, i) => (
                                <div key={i} className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                                    <div className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                                        {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <h4 className="text-white font-medium mb-1">{e.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <MapPin size={12} />
                                        <span>{e.location || "Palace Chamber"}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-zinc-500 text-center py-8 italic text-sm">Quiet reigns supreme today.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-xl font-light text-white mb-6">Upcoming Interactions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {events.filter(e => new Date(e.startTime) > new Date()).slice(0, 4).map((e, i) => (
                            <div key={i} className="p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800 hover:border-amber-500/30 transition-all flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${e.title.includes('Call') ? 'bg-sky-500/10 text-sky-500' :
                                        e.title.includes('Meeting') ? 'bg-purple-500/10 text-purple-500' :
                                            'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    {e.title.includes('Call') ? <Phone size={20} /> :
                                        e.title.includes('Meeting') ? <Video size={20} /> :
                                            <MessageSquare size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-white font-medium truncate">{e.title}</h4>
                                    <p className="text-zinc-500 text-xs">{new Date(e.startTime).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* New Event Modal */}
            {showNewEvent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-light text-white mb-6 tracking-tight">Schedule <span className="text-amber-500">New Decree</span></h2>
                        <form onSubmit={handleCreateEvent} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Event Title</label>
                                <input
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Purpose of the meeting..."
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        value={newEvent.startTime}
                                        onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        value={newEvent.endTime}
                                        onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Location</label>
                                <input
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Where shall this occur?"
                                    value={newEvent.location}
                                    onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewEvent(false)}
                                    className="flex-1 px-6 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-medium"
                                >
                                    Retract
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-6 py-4 rounded-xl font-medium transition-all"
                                >
                                    Decree Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
