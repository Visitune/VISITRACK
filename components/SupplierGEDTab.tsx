import React, { useState, useRef } from 'react';
import { Supplier } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { FileText, FileUp, Download, Trash2, Sparkles, XCircle, CheckCircle, File } from 'lucide-react';

interface Props {
    supplier: Supplier;
}

export const SupplierGEDTab: React.FC<Props> = ({ supplier }) => {
    const { addAttachmentToSupplier, addNotification } = useWorkspace();
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const validateAndSetFile = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            addNotification({
                title: 'Fichier trop volumineux',
                message: 'La taille limite est de 5 Mo.',
                type: 'ERROR'
            });
            return;
        }
        setPendingFile(file);
    };

    const confirmUpload = () => {
        if (!pendingFile) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Content = event.target?.result as string;
            addAttachmentToSupplier(supplier.id, {
                fileName: pendingFile.name,
                fileType: pendingFile.type,
                size: `${(pendingFile.size / 1024).toFixed(1)} KB`,
                content: base64Content
            });
            setPendingFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(pendingFile);
    };

    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="w-10 h-10 text-rose-500" />;
        if (type.includes('image')) return <FileText className="w-10 h-10 text-indigo-500" />;
        if (type.includes('spreadsheet') || type.includes('excel')) return <FileText className="w-10 h-10 text-emerald-500" />;
        return <File className="w-10 h-10 text-slate-400" />;
    }

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-[32px] p-10 shadow-lg transition-all border-4 border-dashed group overflow-hidden ${isDragging
                    ? 'bg-[var(--accent)]/10 border-[var(--accent)] scale-[1.01]'
                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--accent)]/30'
                    }`}
            >
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${isDragging ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)]'}`}>
                        <FileUp className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">
                        {isDragging ? 'Déposez le fichier ici' : 'Zone de Dépose Intelligente'}
                    </h3>
                    <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest mb-8 max-w-md">
                        Glissez vos documents (PDF, Excel, Images) ou cliquez pour parcourir.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-main)] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:opacity-90 transition-all"
                    >
                        Parcourir les fichiers
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </div>

                {/* Decoration */}
                <Sparkles className={`absolute -right-10 -bottom-10 w-64 h-64 transition-all duration-700 ${isDragging ? 'text-[var(--accent)] opacity-20 rotate-12 scale-110' : 'text-[var(--accent)] opacity-0'}`} />
            </div>

            {/* File List */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[var(--accent)]" /> Fichiers Archivés
                    </h3>
                    <span className="bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{supplier.attachments?.length || 0} fichier(s)</span>
                </div>

                {supplier.attachments?.map(a => (
                    <div key={a.id} className="p-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl flex items-center justify-between hover:border-[var(--accent)]/30 transition-all group">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)] transition-all">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-black text-[var(--text-primary)] text-sm">{a.fileName}</p>
                                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">{a.fileType} • {a.size} • Le {new Date(a.uploadDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (a.content) {
                                        const link = document.createElement('a');
                                        link.href = a.content;
                                        link.download = a.fileName;
                                        link.click();
                                    }
                                }}
                                className="p-3 bg-[var(--bg-main)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 border border-rose-500/20"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                ))}

                {(!supplier.attachments || supplier.attachments.length === 0) && (
                    <div className="p-10 text-center opacity-40">
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Aucun document archivé</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {pendingFile && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[var(--bg-card)] rounded-3xl shadow-2xl w-full max-w-md border border-[var(--border-subtle)] p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            {getFileIcon(pendingFile.type)}
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">Confirmer l'Upload</h3>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">{pendingFile.name}</p>
                        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest mb-8">{(pendingFile.size / 1024).toFixed(1)} KB • {pendingFile.type}</p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setPendingFile(null)}
                                className="flex-1 py-4 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--bg-card)] transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" /> Annuler
                            </button>
                            <button
                                onClick={confirmUpload}
                                className="flex-1 py-4 bg-[var(--accent)] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
