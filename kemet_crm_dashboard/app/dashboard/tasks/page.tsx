"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Plus,
    Filter,
    User as UserIcon,
    Calendar as CalendarIcon,
    MoreVertical,
    Check
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        assignedToId: ""
    });
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        try {
            const data = await api.get<any[]>("/tasks");
            setTasks(data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await api.get<any[]>("/auth/users");
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users");
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/tasks", newTask);
            toast.success("Task created successfully");
            setShowNewTask(false);
            setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedToId: "" });
            fetchTasks();
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const toggleStatus = async (task: any) => {
        const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
        try {
            await api.put(`/tasks/${task.id}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "URGENT": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            case "MEDIUM": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === "all") return true;
        if (filter === "completed") return t.status === "COMPLETED";
        if (filter === "pending") return t.status !== "COMPLETED";
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2">
                        KEMET <span className="text-amber-500 font-medium">TASKS</span>
                    </h1>
                    <p className="text-zinc-400">Streamline your workflow with royal precision.</p>
                </div>
                <button
                    onClick={() => setShowNewTask(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
                >
                    <Plus size={20} />
                    New Command
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800">
                {["all", "pending", "completed"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-lg capitalize transition-all ${filter === f
                                ? "bg-amber-500 text-black font-medium shadow-lg"
                                : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                    ))
                ) : filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`group bg-zinc-900/40 border transition-all duration-300 rounded-2xl p-6 flex items-center gap-6 ${task.status === 'COMPLETED' ? 'border-zinc-800/50 opacity-60' : 'border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/60'
                                }`}
                        >
                            <button
                                onClick={() => toggleStatus(task)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'COMPLETED'
                                        ? 'bg-amber-500 border-amber-500 text-black'
                                        : 'border-zinc-700 group-hover:border-amber-500'
                                    }`}
                            >
                                {task.status === 'COMPLETED' && <Check size={18} strokeWidth={3} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className={`text-lg font-medium truncate ${task.status === 'COMPLETED' ? 'line-through text-zinc-500' : 'text-white'}`}>
                                        {task.title}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm truncate">{task.description || "No description provided."}</p>
                            </div>

                            <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <UserIcon size={14} />
                                    <span>{task.assignedTo?.name || "Unassigned"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} />
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}</span>
                                </div>
                            </div>

                            <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                        <div className="bg-zinc-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-1">No tasks found</h3>
                        <p className="text-zinc-500">You're all caught up with your duties.</p>
                    </div>
                )}
            </div>

            {/* New Task Dialog */}
            {showNewTask && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-light text-white mb-6">Create New <span className="text-amber-500">Command</span></h2>
                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 ml-1">Task Title</label>
                                <input
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="Enter task title..."
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 ml-1">Description</label>
                                <textarea
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors h-24"
                                    placeholder="Add more details..."
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 ml-1">Priority</label>
                                    <select
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="URGENT">Urgent</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400 ml-1">Assign To</label>
                                    <select
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none"
                                        value={newTask.assignedToId}
                                        onChange={e => setNewTask({ ...newTask, assignedToId: e.target.value })}
                                    >
                                        <option value="">Me (Default)</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400 ml-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    value={newTask.dueDate}
                                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewTask(false)}
                                    className="flex-1 px-6 py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black px-6 py-4 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20"
                                >
                                    Enact Command
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
