import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Campaign, ComplianceStatus } from '../types';
import {
    Send, Plus, Search, Calendar, Users, FileCheck, Clock,
    CheckCircle2, AlertCircle, Mail, ExternalLink, Trash2,
    PlayCircle, PauseCircle, ChevronRight, X
} from 'lucide-react';

const Campaigns: React.FC = () => {
    const { campaigns, suppliers, addCampaign, updateCampaign, addNotification } = useWorkspace();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [docType, setDocType] = useState('CERTIFICATE');
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newCampaign: Campaign = {
            id: `CAMP-${Date.now()}`,
            title,
            description: `Collecte de masse pour le document ${docType}`,
            targetSuppliers: selectedSuppliers,
            requestedDocType: docType,
            status: 'ACTIVE',
            createdAt: new Date().toISOString().split('T')[0],
            stats: {
                total: selectedSuppliers.length,
                received: 0,
                pending: selectedSuppliers.length
            }
        };
        addCampaign(newCampaign);
        setIsModalOpen(false);
        setTitle('');
        setSelectedSuppliers([]);
    };

    const toggleSupplier = (id: string) => {
        setSelectedSuppliers(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Automation & Campagnes</h2>
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[8px] mt-1 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-[var(--accent)]" /> Moteur de relance proactif
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-lg font-black hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/10 flex items-center gap-2 uppercase tracking-widest text-[9px]"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Campagne
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--accent-subtle)] rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Fournisseurs sollicités</p>
                            <div className="text-2xl font-black text-[var(--text-primary)]">{campaigns.reduce((acc, c) => acc + c.targetSuppliers.length, 0)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Taux de réponse</p>
                            <div className="text-2xl font-black text-[var(--text-primary)]">
                                {campaigns.length > 0 ? Math.round((campaigns.reduce((acc, c) => acc + c.stats.received, 0) / campaigns.reduce((acc, c) => acc + c.stats.total, 0)) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">En attente (Relances)</p>
                            <div className="text-2xl font-black text-[var(--text-primary)]">{campaigns.reduce((acc, c) => acc + c.stats.pending, 0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign List */}
            <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
                <div className="px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30 flex justify-between items-center">
                    <h3 className="font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-widest text-[10px]">
                        <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Files d'attentes de collecte
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--accent)] text-white text-[8px] font-black px-2.5 py-1 rounded border border-white/20 uppercase tracking-widest shadow-sm">Live</div>
                    </div>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                    {campaigns.map(c => (
                        <div key={c.id} className="px-8 py-6 hover:bg-[var(--bg-hover)] transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md transition-all ${c.status === 'ACTIVE' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--text-primary)] text-sm tracking-tight group-hover:text-[var(--accent)] transition-colors uppercase">{c.title}</div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Lancée le {c.createdAt}
                                        </span>
                                        <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent)]/10">
                                            {c.requestedDocType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-10">
                                <div className="w-32">
                                    <div className="flex justify-between items-end mb-1.5">
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">Progression</span>
                                        <span className="text-[9px] font-black text-[var(--accent)]">{Math.round((c.stats.received / c.stats.total) * 100)}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                                        <div className="bg-[var(--accent)] h-full transition-all duration-1000" style={{ width: `${(c.stats.received / c.stats.total) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => updateCampaign(c.id, { status: c.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' })} className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] transition-all shadow-sm">
                                        {c.status === 'ACTIVE' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                    </button>
                                    <button className="p-2 bg-[var(--text-primary)] text-[var(--bg-main)] rounded-lg hover:opacity-90 transition-all shadow-lg group">
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {campaigns.length === 0 && (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-[var(--bg-main)] rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Send className="w-6 h-6 text-[var(--text-muted)] opacity-30" />
                            </div>
                            <h4 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-tight">Aucune campagne active</h4>
                            <p className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Lancez votre première collecte automatisée pour soulager vos équipes Qualité.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-4xl p-10 border border-[var(--border-subtle)] flex gap-10 max-h-[90vh]">
                        {/* Left View: Config */}
                        <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-hide">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Configuration Campagne</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-muted)]"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-1">Titre de la collecte</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl p-4 font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
                                        placeholder="Ex: Campagne IFS 2024 - Secteur Frais"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-1">Document exigé</label>
                                    <select
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl p-4 font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--accent)]/10"
                                        value={docType}
                                        onChange={e => setDocType(e.target.value)}
                                    >
                                        <option value="CERTIFICATE">Certificat (IFS/BRC)</option>
                                        <option value="INSURANCE">Assurances RC</option>
                                        <option value="TECHNICAL">Fiche Technique</option>
                                        <option value="SOCIAL">Charte Ethique / RSE</option>
                                    </select>
                                </div>
                                <div className="p-6 bg-[var(--accent)] text-white rounded-2xl shadow-xl shadow-[var(--accent)]/10">
                                    <h4 className="font-black text-[9px] uppercase tracking-widest mb-3 opacity-80">Action Automatisée</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-xl">
                                            <Mail className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-xs font-bold leading-relaxed">Les {selectedSuppliers.length} fournisseurs sélectionnés recevront un email avec un lien de dépôt sécurisé VISITrack.</p>
                                    </div>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!title || selectedSuppliers.length === 0}
                                        className="w-full mt-6 py-4 bg-white text-[var(--accent)] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-opacity-95 shadow-lg disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" /> Lancer la Campagne
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right View: Supplier Selection */}
                        <div className="w-80 flex flex-col bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-inner">
                            <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
                                <label className="block text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Ciblage Fournisseurs ({selectedSuppliers.length})</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg pl-8 pr-3 py-2 text-[10px] font-bold outline-none text-[var(--text-primary)] focus:border-[var(--accent)] transition-colors"
                                        placeholder="Filtrer..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                                {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => toggleSupplier(s.id)}
                                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedSuppliers.includes(s.id) ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-md' : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                                            }`}
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold truncate">{s.name}</span>
                                            <span className={`text-[8px] font-medium ${selectedSuppliers.includes(s.id) ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{s.country}</span>
                                        </div>
                                        {selectedSuppliers.includes(s.id) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3 h-3 border border-[var(--border-subtle)] rounded-full" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;
