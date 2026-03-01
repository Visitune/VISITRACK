import React, { useState, useRef } from 'react';
import { Supplier } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    FileText, FileUp, Download, Trash2, File,
    FileImage, CheckCircle2, XCircle, UploadCloud, Calendar, CalendarCheck
} from 'lucide-react';

interface Props { supplier: Supplier; }

const getValidityStatus = (validUntil?: string): { label: string; cls: string; dot: string } => {
    if (!validUntil) return { label: 'Permanent', cls: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', dot: 'bg-blue-500' };
    const diff = (new Date(validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expiré', cls: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', dot: 'bg-rose-500' };
    if (diff < 30) return { label: 'Expire bientôt', cls: 'bg-amber-500/10 text-amber-600 border border-amber-500/20', dot: 'bg-amber-500 animate-pulse' };
    return { label: 'Valide', cls: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25', dot: 'bg-emerald-500' };
};

const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-violet-500" />;
    if (type.includes('sheet') || type.includes('excel') || type.includes('openxml'))
        return <FileText className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-[var(--text-muted)]" />;
};

const docCategories = [
    'Certificat GFSI / IFS / BRC',
    'Analyse de laboratoire',
    'Fiche de données sécurité',
    'Certificat d\'origine',
    'Bon de livraison',
    'Facture',
    'Autre',
];

export const SupplierGEDTab: React.FC<Props> = ({ supplier }) => {
    const { addAttachmentToSupplier, addNotification } = useWorkspace();
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingLabel, setPendingLabel] = useState('Certificat GFSI / IFS / BRC');
    const [issuanceDate, setIssuanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) trySetFile(file);
    };

    const trySetFile = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            addNotification({ title: 'Fichier trop volumineux', message: 'Limite : 10 Mo.', type: 'ERROR' });
            return;
        }
        setPendingFile(file);
    };

    const confirmUpload = () => {
        if (!pendingFile) return;
        const reader = new FileReader();
        reader.onload = evt => {
            addAttachmentToSupplier(supplier.id, {
                fileName: pendingFile.name,
                fileType: pendingFile.type,
                size: `${(pendingFile.size / 1024).toFixed(1)} KB`,
                content: evt.target?.result as string,
                issuanceDate,
                validUntil: validUntil || undefined,
            });
            addNotification({ title: 'Document archivé', message: `${pendingLabel} ajouté avec succès.`, type: 'SUCCESS' });
            setPendingFile(null);
            setValidUntil('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(pendingFile);
    };

    const validity = getValidityStatus(validUntil);

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ── Drop Zone ── */}
            {!pendingFile ? (
                <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-4 transition-all ${isDragging
                        ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-main)]/30'
                        }`}
                >
                    <div className={`w-14 h-14 rounded-full border border-dashed flex items-center justify-center transition-all ${isDragging ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-orange-500/20' : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'}`}>
                        <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                            {isDragging ? 'Déposez le fichier ici' : 'Importer un document'}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-widest opacity-60">PDF, Excel, Word, Images — max 10 Mo</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) trySetFile(f); }} />
                </div>
            ) : (
                /* ── Upload Form ── */
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-6 shadow-sm">
                    {/* Selected file */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)]">
                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                            {getFileIcon(pendingFile.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-[var(--text-primary)]">{pendingFile.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{(pendingFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={() => setPendingFile(null)} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] block mb-2 pl-1">Nature du document</label>
                        <select value={pendingLabel} onChange={e => setPendingLabel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10 appearance-none">
                            {docCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-2 mb-2 pl-1">
                                <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> 1. Date d'émission
                            </label>
                            <input type="date" value={issuanceDate} onChange={e => setIssuanceDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10" />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] flex items-center gap-2 mb-2 pl-1">
                                <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" /> 2. Expiration
                            </label>
                            <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10" placeholder="Optionnel" />
                        </div>
                    </div>

                    {/* Validity preview */}
                    {validUntil && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${validity.cls}`}>
                            <span className={`w-2 h-2 rounded-full ${validity.dot}`}></span>
                            Statut : {validity.label} — {new Date(validUntil).toLocaleDateString('fr-FR')}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button onClick={() => setPendingFile(null)} className="px-6 py-3 rounded-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all">
                            Annuler
                        </button>
                        <button onClick={confirmUpload} className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-3">
                            <CheckCircle2 className="w-4 h-4" /> Sauvegarder dans le coffre-fort
                        </button>
                    </div>
                </div>
            )}

            {/* ── Document List ── */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--accent)]" /> Documents archivés
                    </h3>
                    <span className="bg-[var(--accent)] text-white px-2 py-1 rounded border border-white/20 text-[9px] font-black shadow-sm">
                        {supplier.attachments?.length || 0} DOCS
                    </span>
                </div>

                {(!supplier.attachments || supplier.attachments.length === 0) ? (
                    <div className="text-center py-16 bg-[var(--bg-main)]/30 rounded-xl border border-[var(--border-subtle)] border-dashed">
                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Aucun document archivé</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {supplier.attachments.map(a => {
                            const v = getValidityStatus(a.validUntil);
                            return (
                                <div key={a.id} className="flex items-center gap-5 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                        {getFileIcon(a.fileType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate uppercase tracking-tight">{a.fileName}</p>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest ${v.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`}></span>
                                                {v.label}
                                            </span>
                                        </div>
                                        <p className="text-[9px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-tight opacity-70">
                                            {a.size}
                                            {a.issuanceDate && ` • ÉMIS : ${new Date(a.issuanceDate).toLocaleDateString('fr-FR')}`}
                                            {a.validUntil && ` • EXPIRE : ${new Date(a.validUntil).toLocaleDateString('fr-FR')}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                        {a.content && (
                                            <button
                                                onClick={() => { const l = document.createElement('a'); l.href = a.content!; l.download = a.fileName; l.click(); }}
                                                className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierGEDTab;
