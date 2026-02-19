"use client";

import { useEffect, useState } from "react";
import {
    HardDrive,
    Upload,
    File as FileIcon,
    Image as ImageIcon,
    FileText,
    Trash2,
    Download,
    Search,
    ChevronLeft,
    Folder as FolderIcon,
    Plus,
    Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function DrivePage() {
    const [files, setFiles] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ used: 0, limit: 100 * 1024 * 1024, percent: 0 });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState("");
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [path, setPath] = useState<any[]>([]); // To track breadcrumbs/navigation

    useEffect(() => {
        fetchDriveData();
    }, [currentFolderId]);

    const fetchDriveData = async () => {
        setLoading(true);
        try {
            const data = await api.get<any>(`/storage${currentFolderId ? `?folderId=${currentFolderId}` : ""}`);
            setFiles(data.files);
            setFolders(data.folders);
            setStats(data.stats);
        } catch (error) {
            toast.error("Failed to load drive data");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) {
            formData.append("folderId", currentFolderId.toString());
        }

        setUploading(true);
        try {
            await api.post("/storage/upload", formData);
            toast.success(`'${file.name}' uploaded to KEMET Drive`);
            fetchDriveData();
        } catch (error: any) {
            // Error messaging is already handled by api.ts but we can add more context if needed
            console.error("Upload error:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateFolder = async () => {
        const name = prompt("Enter folder name:");
        if (!name) return;

        try {
            await api.post("/storage/folders", {
                name,
                parentId: currentFolderId
            });
            toast.success(`Folder '${name}' created`);
            fetchDriveData();
        } catch (error) {
            toast.error("Failed to create folder");
        }
    };

    const handleDeleteFile = async (id: number) => {
        if (!confirm("Are you sure you want to delete this file from the royal archives?")) return;
        try {
            await api.delete(`/storage/${id}`);
            toast.success("File deleted");
            fetchDriveData();
        } catch (error) {
            toast.error("Failed to delete file");
        }
    };

    const handleDeleteFolder = async (folder: any) => {
        if (!confirm(`Are you sure you want to delete folder '${folder.name}'? It must be empty.`)) return;
        try {
            await api.delete(`/storage/folders/${folder.id}`);
            toast.success("Folder deleted");
            fetchDriveData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete folder. Ensure it is empty.");
        }
    };

    const enterFolder = (folder: any) => {
        setCurrentFolderId(folder.id);
        setPath([...path, folder]);
    };

    const goBack = () => {
        const newPath = [...path];
        newPath.pop();
        setPath(newPath);
        setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    };

    const formatSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="text-emerald-500" />;
        if (type.includes('pdf')) return <FileText className="text-red-500" />;
        return <FileIcon className="text-amber-500" />;
    };

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white mb-2 uppercase italic italic font-black">
                        KEMET <span className="text-amber-500">DRIVE</span>
                    </h1>
                    <p className="text-zinc-400">Secure storage for your organization's digital legacy.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-amber-500 px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 border border-amber-500/20"
                    >
                        <Plus size={20} />
                        New Folder
                    </button>
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Upload size={20} />
                            )}
                            {uploading ? "Uploading..." : "Upload File"}
                        </label>
                    </div>
                </div>
            </div>

            {/* Storage Progress */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/10 p-3 rounded-2xl">
                            <HardDrive className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-white">Storage Capacity</h2>
                            <p className="text-zinc-400 text-sm">{formatSize(stats.used)} of {formatSize(stats.limit)} used</p>
                        </div>
                    </div>
                    <span className="text-2xl font-light text-amber-500 italic font-black">{Math.round(stats.percent)}%</span>
                </div>
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${stats.percent}%` }}
                    />
                </div>
            </div>

            {/* Browser */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {currentFolderId && (
                            <button
                                onClick={goBack}
                                className="p-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <h3 className="text-xl font-light text-white">
                            {path.length === 0 ? "Root Archives" : path.map(p => p.name).join(' / ')}
                        </h3>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            placeholder="Search archives..."
                            className="bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {loading ? (
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                        ))
                    ) : (
                        <>
                            {/* Folders */}
                            {filteredFolders.map((folder) => (
                                <div
                                    key={`folder-${folder.id}`}
                                    className="group bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer relative"
                                    onClick={() => enterFolder(folder)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                                            <FolderIcon className="text-amber-500" size={24} />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFolder(folder);
                                            }}
                                            className="p-2 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium truncate">{folder.name}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Directory</p>
                                    </div>
                                </div>
                            ))}

                            {/* Files */}
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="group bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/60 transition-all duration-300 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-zinc-800/50 rounded-xl group-hover:bg-amber-500/10 transition-colors">
                                            {getFileIcon(file.type)}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
                                                <Download size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-medium truncate mb-1" title={file.name}>{file.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span>{formatSize(file.size)}</span>
                                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-amber-500/20 rounded-full border border-amber-500/30 flex items-center justify-center text-[10px] text-amber-500 font-bold">
                                                {file.user?.name?.[0] || 'U'}
                                            </div>
                                            <span className="text-xs text-zinc-400 truncate">{file.user?.name || "System"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(filteredFiles.length === 0 && filteredFolders.length === 0) && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                                    <h3 className="text-zinc-500">No treasures found in this archive.</h3>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
