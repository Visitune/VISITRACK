import React from 'react';
import { Supplier, Campaign } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Send, Mail, Calendar, Clock,
    CheckCircle2, AlertCircle, ExternalLink,
    FileText, ArrowUpRight
} from 'lucide-react';

interface Props {
    supplier: Supplier;
}

export const CampaignTab: React.FC<Props> = ({ supplier }) => {
    const { campaigns } = useWorkspace();

    const supplierCampaigns = campaigns.filter(c =>
        c.targetSuppliers.includes(supplier.id) ||
        c.targetSuppliers.includes('ALL')
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-tight">Historique des Campagnes</h3>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Collectes de documents et audits proactifs</p>
                </div>
                <div className="bg-[var(--accent)] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-orange-500/10">
                    <Send className="w-3.5 h-3.5" /> {supplierCampaigns.length} Prélèvements
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {supplierCampaigns.map(c => (
                    <div key={c.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 hover:border-[var(--accent)]/40 transition-all group flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${c.status === 'ACTIVE' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h4 className="font-black text-[var(--text-primary)] text-sm uppercase tracking-tight mb-1">{c.title}</h4>
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Lancée le {c.createdAt}
                                    </span>
                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest bg-[var(--accent-subtle)] px-2 py-0.5 rounded border border-[var(--accent)]/10">
                                        {c.requestedDocType}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-60">Statut Relance</div>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className={`w-2 h-2 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{c.status}</span>
                                </div>
                            </div>
                            <button className="p-3 bg-[var(--bg-main)] text-[var(--text-primary)] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm border border-[var(--border-subtle)] group">
                                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ))}

                {supplierCampaigns.length === 0 && (
                    <div className="p-16 text-center bg-[var(--bg-main)]/30 rounded-2xl border-2 border-dashed border-[var(--border-subtle)]">
                        <Send className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Aucune campagne ciblée</h4>
                        <p className="text-[9px] mt-2 opacity-60 font-black uppercase tracking-widest max-w-[200px] mx-auto">Ce fournisseur n'a pas encore fait l'objet d'une campagne de masse.</p>
                    </div>
                )}
            </div>

            {/* Quick Actions / Summary */}
            <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-[var(--bg-main)]/50 p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col items-center text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                    <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Taux Collecte</div>
                    <div className="text-lg font-black text-[var(--text-primary)]">100%</div>
                </div>
                <div className="bg-[var(--bg-main)]/50 p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col items-center text-center">
                    <FileText className="w-5 h-5 text-indigo-500 mb-2" />
                    <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Docs Reçus</div>
                    <div className="text-lg font-black text-[var(--text-primary)]">{supplierCampaigns.length}</div>
                </div>
                <div className="bg-[var(--bg-main)]/50 p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col items-center text-center">
                    <Clock className="w-5 h-5 text-amber-500 mb-2" />
                    <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Temps Moyen</div>
                    <div className="text-lg font-black text-[var(--text-primary)]">4.2j</div>
                </div>
            </div>
        </div>
    );
};
