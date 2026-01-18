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
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Automation & Campagnes</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-indigo-500" /> Moteur de relance proactif
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center gap-3 uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-5 h-5" /> Nouvelle Campagne
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseurs sollicités</p>
                            <div className="text-2xl font-black text-slate-900">{campaigns.reduce((acc, c) => acc + c.targetSuppliers.length, 0)}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                            <FileCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux de réponse</p>
                            <div className="text-2xl font-black text-slate-900">
                                {campaigns.length > 0 ? Math.round((campaigns.reduce((acc, c) => acc + c.stats.received, 0) / campaigns.reduce((acc, c) => acc + c.stats.total, 0)) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En attente (Relances)</p>
                            <div className="text-2xl font-black text-slate-900">{campaigns.reduce((acc, c) => acc + c.stats.pending, 0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign List */}
            <div className="bg-white rounded-[44px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-xs">
                        <Search className="w-4 h-4 text-indigo-400" /> Files d'attentes de collecte
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</div>
                    </div>
                </div>
                <div className="divide-y divide-slate-50">
                    {campaigns.map(c => (
                        <div key={c.id} className="p-10 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${c.status === 'ACTIVE' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{c.title}</div>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> Lancée le {c.createdAt}
                                        </span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                            {c.requestedDocType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="w-48">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progression</span>
                                        <span className="text-[10px] font-black text-indigo-600">{Math.round((c.stats.received / c.stats.total) * 100)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                        <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${(c.stats.received / c.stats.total) * 100}%` }} />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => updateCampaign(c.id, { status: c.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE' })} className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm">
                                        {c.status === 'ACTIVE' ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                    </button>
                                    <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-xl group">
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {campaigns.length === 0 && (
                        <div className="p-24 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                                <Send className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Aucune campagne active</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">Lancez votre première collecte automatisée pour soulager vos équipes Qualité.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-fade-in">
                    <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-4xl p-12 border border-slate-100 flex gap-12 max-h-[90vh]">
                        {/* Left View: Config */}
                        <div className="flex-1 space-y-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Configuration Campagne</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100"><X className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Titre de la collecte</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        placeholder="Ex: Campagne IFS 2024 - Secteur Frais"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Document exigé</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 font-black text-slate-900 outline-none"
                                        value={docType}
                                        onChange={e => setDocType(e.target.value)}
                                    >
                                        <option value="CERTIFICATE">Certificat (IFS/BRC)</option>
                                        <option value="INSURANCE">Assurances RC</option>
                                        <option value="TECHNICAL">Fiche Technique</option>
                                        <option value="SOCIAL">Charte Ethique / RSE</option>
                                    </select>
                                </div>
                                <div className="p-8 bg-indigo-900 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
                                    <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 opacity-60">Action Automatisée</h4>
                                    <div className="flex items-center gap-4">
                                        <Mail className="w-8 h-8 text-indigo-400" />
                                        <p className="text-sm font-bold leading-relaxed">Les {selectedSuppliers.length} fournisseurs sélectionnés recevront un email avec un lien de dépôt sécurisé VISITrack.</p>
                                    </div>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!title || selectedSuppliers.length === 0}
                                        className="w-full mt-8 py-5 bg-white text-indigo-900 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 shadow-xl disabled:opacity-30 transition-all"
                                    >
                                        Lancer la Campagne
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right View: Supplier Selection */}
                        <div className="w-96 flex flex-col bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden shadow-inner">
                            <div className="p-8 border-b border-slate-200">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ciblage Fournisseurs ({selectedSuppliers.length})</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none"
                                        placeholder="Filtrer..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                                {suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => toggleSupplier(s.id)}
                                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedSuppliers.includes(s.id) ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-400'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black truncate max-w-[150px]">{s.name}</span>
                                            <span className={`text-[10px] font-bold ${selectedSuppliers.includes(s.id) ? 'text-indigo-200' : 'text-slate-400'}`}>{s.country}</span>
                                        </div>
                                        {selectedSuppliers.includes(s.id) ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-200 rounded-full" />}
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
