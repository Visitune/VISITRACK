import React, { useState, useRef } from 'react';
import { Product, Supplier, ProductVersion } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    X, FileText, UploadCloud, Download, Trash2, CheckCircle2,
    AlertTriangle, Clock, Plus, CalendarCheck, File, FileImage,
    Sheet, Eye, Calendar, History, ChevronRight, Sparkles, Info, Save
} from 'lucide-react';

interface Props {
    product: Product;
    supplier: Supplier;
    onClose: () => void;
}

interface TechDocument {
    id: string;
    fileName: string;
    fileType: string;
    size: string;
    uploadDate: string;
    issuanceDate?: string;
    validUntil?: string;
    content?: string;
    label?: string; // e.g. "Fiche Technique V2", "Cahier des charges"
}

const docCategories = [
    'Fiche Technique',
    'Cahier des Charges',
    'Certificat d\'Analyse',
    'Spécification Produit',
    'Fiche Sécurité',
    'Autre',
];

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
    if (type.includes('sheet') || type.includes('excel') || type.includes('openxml')) return <Sheet className="w-5 h-5 text-emerald-500" />;
    return <File className="w-5 h-5 text-[var(--text-muted)]" />;
};

const ProductTechnicalModal: React.FC<Props> = ({ product, supplier, onClose }) => {
    const { updateProduct, addNotification } = useWorkspace();

    // Local document list — stored on product.versions as attachments logic
    const [documents, setDocuments] = useState<TechDocument[]>(
        (product.versions || []).filter(v => v.attachmentId).map(v => ({
            id: v.id,
            fileName: v.diff || 'Fiche technique',
            fileType: 'application/pdf',
            size: '—',
            uploadDate: v.timestamp,
            issuanceDate: v.timestamp,
            validUntil: undefined,
            label: v.diff || 'Fiche Technique',
        }))
    );

    // Upload state
    const [isDragging, setIsDragging] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingLabel, setPendingLabel] = useState('Fiche Technique');
    const [pendingIssuance, setPendingIssuance] = useState(new Date().toISOString().split('T')[0]);
    const [pendingExpiry, setPendingExpiry] = useState('');
    const [activeView, setActiveView] = useState<'LIST' | 'UPLOAD' | 'HISTORY' | 'INFO'>('INFO');

    // Product info state
    const [name, setName] = useState(product.name);
    const [category, setCategory] = useState(product.category);
    const [origin, setOrigin] = useState(product.origin || '');
    const [ingredients, setIngredients] = useState(product.ingredients?.join(', ') || '');
    const [allergens, setAllergens] = useState(product.allergens?.join(', ') || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) { setPendingFile(file); setActiveView('UPLOAD'); }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setPendingFile(file); setActiveView('UPLOAD'); }
    };

    const confirmUpload = () => {
        if (!pendingFile) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result as string;
            const newDoc: TechDocument = {
                id: `TD-${Date.now()}`,
                fileName: pendingFile.name,
                fileType: pendingFile.type,
                size: `${(pendingFile.size / 1024).toFixed(1)} KB`,
                uploadDate: new Date().toISOString(),
                issuanceDate: pendingIssuance,
                validUntil: pendingExpiry || undefined,
                content,
                label: pendingLabel,
            };
            const updated = [newDoc, ...documents];
            setDocuments(updated);

            // Persist as a product version
            const currentVersions = product.versions || [];
            const newVersion: ProductVersion = {
                id: newDoc.id,
                timestamp: newDoc.uploadDate,
                author: 'Admin Qualité',
                status: 'ACTIVE',
                ingredients: product.ingredients || [],
                allergens: product.allergens || [],
                attachmentId: newDoc.id,
                diff: `${pendingLabel} — ${pendingFile.name}`,
            };
            updateProduct(supplier.id, product.id, { versions: [newVersion, ...currentVersions] }, `Upload: ${pendingLabel}`);
            addNotification({ title: 'Document ajouté', message: `${pendingLabel} archivé avec succès.`, type: 'SUCCESS' });

            // Reset
            setPendingFile(null);
            setPendingLabel('Fiche Technique');
            setPendingExpiry('');
            setActiveView('LIST');
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(pendingFile);
    };

    const downloadDoc = (doc: TechDocument) => {
        if (!doc.content) return;
        const link = document.createElement('a');
        link.href = doc.content;
        link.download = doc.fileName;
        link.click();
    };

    const removeDoc = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30 sticky top-0 z-10">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{product.name}</h2>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 opacity-60">Documents techniques & fiches produit</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] group">
                            <X className="w-6 h-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Tab nav */}
                    <div className="flex bg-[var(--bg-main)]/50 p-1.5 rounded-xl border border-[var(--border-subtle)] mt-6 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'INFO', label: 'Informations', icon: Info },
                            { id: 'LIST', label: 'Documents', icon: FileText },
                            { id: 'UPLOAD', label: 'Ajouter', icon: UploadCloud },
                            { id: 'HISTORY', label: 'Historique', icon: History },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveView(t.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === t.id
                                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-orange-500/20'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}
                            >
                                <t.icon className="w-4 h-4" /> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-4">

                    {/* ─── INFO VIEW ─── */}
                    {activeView === 'INFO' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Nom du produit</label>
                                    <input
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Catégorie</label>
                                    <input
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Origine</label>
                                <input
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all"
                                    value={origin}
                                    onChange={e => setOrigin(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Ingrédients (séparés par virgules)</label>
                                <textarea
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm font-medium outline-none focus:border-[var(--accent)] transition-all h-24 resize-none"
                                    value={ingredients}
                                    onChange={e => setIngredients(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1 text-rose-400">Allergènes (séparés par virgules)</label>
                                <input
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm font-bold outline-none focus:border-[var(--accent)] transition-all"
                                    value={allergens}
                                    onChange={e => setAllergens(e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => {
                                        updateProduct(supplier.id, product.id, {
                                            name,
                                            category,
                                            origin,
                                            ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean),
                                            allergens: allergens.split(',').map(s => s.trim()).filter(Boolean),
                                        }, "Mise à jour des informations générales");
                                        addNotification({ title: 'Produit mis à jour', message: 'Les informations générales ont été enregistrées.', type: 'SUCCESS' });
                                    }}
                                    className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Enregistrer les modifications
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── LIST VIEW ─── */}
                    {activeView === 'LIST' && (
                        <>
                            {/* Drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition-all ${isDragging
                                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                                    : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-subtle)]'
                                    }`}
                            >
                                <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                    Glisser un PDF, XLS ou image ici, ou <span className="text-[var(--accent)]">parcourir</span>
                                </p>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.docx" onChange={handleFileSelect} />
                            </div>

                            {/* Document list */}
                            {documents.length === 0 ? (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Aucune fiche technique archivée</p>
                                    <p className="text-xs mt-1">Ajoutez votre premier document ci-dessus</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documents.map(doc => {
                                        const validity = getValidityStatus(doc.validUntil);
                                        return (
                                            <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all group">
                                                {/* Icon */}
                                                <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                                                    {getFileIcon(doc.fileType)}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.label || doc.fileName}</p>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${validity.cls}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${validity.dot}`}></span>
                                                            {validity.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                                                        {doc.fileName} • {doc.size}
                                                        {doc.issuanceDate && ` • Émis : ${new Date(doc.issuanceDate).toLocaleDateString('fr-FR')}`}
                                                        {doc.validUntil && ` • Expire : ${new Date(doc.validUntil).toLocaleDateString('fr-FR')}`}
                                                    </p>
                                                </div>
                                                {/* Actions */}
                                                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                    {doc.content && (
                                                        <button onClick={() => downloadDoc(doc)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all" title="Télécharger">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => removeDoc(doc.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all" title="Supprimer">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {/* ─── UPLOAD FORM ─── */}
                    {activeView === 'UPLOAD' && (
                        <div className="space-y-5">
                            {/* File picker */}
                            {!pendingFile ? (
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`cursor-pointer rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border-subtle)] hover:border-[var(--accent)]/50'}`}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center">
                                        <UploadCloud className="w-7 h-7 text-[var(--text-muted)]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[var(--text-primary)]">Glisser-déposer ou cliquer</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1">PDF, Excel, Word, Image — max 5 Mo</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.docx" onChange={handleFileSelect} />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center">
                                        {getFileIcon(pendingFile.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{pendingFile.name}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{(pendingFile.size / 1024).toFixed(1)} KB • {pendingFile.type}</p>
                                    </div>
                                    <button onClick={() => setPendingFile(null)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Metadata form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">
                                        Catégorie du document
                                    </label>
                                    <select
                                        value={pendingLabel}
                                        onChange={e => setPendingLabel(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm appearance-none"
                                    >
                                        {docCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 mb-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" /> Date d'émission
                                        </label>
                                        <input
                                            type="date"
                                            value={pendingIssuance}
                                            onChange={e => setPendingIssuance(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 mb-1.5">
                                            <CalendarCheck className="w-3.5 h-3.5 text-emerald-500" /> Date d'expiration
                                            <span className="text-[10px] text-[var(--text-muted)]">(optionnel)</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={pendingExpiry}
                                            onChange={e => setPendingExpiry(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Validity preview */}
                                {pendingExpiry && (
                                    <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium ${getValidityStatus(pendingExpiry).cls}`}>
                                        <span className={`w-2 h-2 rounded-full ${getValidityStatus(pendingExpiry).dot}`}></span>
                                        Statut : {getValidityStatus(pendingExpiry).label}
                                        {` — Expire le ${new Date(pendingExpiry).toLocaleDateString('fr-FR')}`}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
                                <button onClick={() => { setPendingFile(null); setActiveView('LIST'); }} className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-all">
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmUpload}
                                    disabled={!pendingFile}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium shadow-md shadow-orange-500/20 disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Archiver le document
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── HISTORY VIEW ─── */}
                    {activeView === 'HISTORY' && (
                        <div className="space-y-3">
                            {(product.versions || []).length === 0 ? (
                                <div className="text-center py-12 text-[var(--text-muted)]">
                                    <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Aucune révision enregistrée</p>
                                </div>
                            ) : (
                                (product.versions || []).map((v, i) => (
                                    <div key={v.id} className={`flex gap-4 items-start p-4 rounded-xl border transition-all ${v.status === 'ACTIVE' ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/30' : 'bg-[var(--bg-main)] border-[var(--border-subtle)]'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${v.status === 'ACTIVE' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.diff || 'Initialisation'}</p>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${v.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                                                    {v.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                {v.author} · {new Date(v.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/30 flex items-center justify-between sticky bottom-0 z-10">
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} archivé{documents.length !== 1 ? 's' : ''}
                    </p>
                    <button
                        onClick={() => { setActiveView('UPLOAD'); }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Ajouter un document
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProductTechnicalModal;
