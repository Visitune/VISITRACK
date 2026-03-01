import React from 'react';
import { Supplier } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    History, Plus, Sparkles, XCircle, FileText,
    BarChart3, Activity, Beaker
} from 'lucide-react';

interface Props {
    supplier: Supplier;
}

export const AnalysisTab: React.FC<Props> = ({ supplier }) => {
    const { deleteLaboratoryAnalysis, addNotification } = useWorkspace();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Summary Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Analyses Laboratoires</h3>
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Suivi des contrôles microbiologiques et physico-chimiques</p>
                    </div>
                    <div className="flex gap-6 text-right">
                        <div>
                            <div className="text-3xl font-black">{supplier.laboratoryAnalyses?.length || 0}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Analyses Total</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-emerald-300">
                                {supplier.laboratoryAnalyses?.filter(la => la.overallResult === 'CONFORM').length || 0}
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-widest opacity-60">Conformes</div>
                        </div>
                    </div>
                </div>
                <div className="absolute right-0 top-0 p-8 opacity-10">
                    <Beaker className="w-32 h-32" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-500" /> Historique des prélèvements
                        </h4>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20">
                            <Plus className="w-3.5 h-3.5" /> Nouvelle Analyse
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {supplier.laboratoryAnalyses?.map(la => (
                            <div key={la.id} className="p-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] hover:border-indigo-500/40 transition-all group relative shadow-sm">
                                <button
                                    onClick={() => { if (confirm("Supprimer cette analyse ?")) deleteLaboratoryAnalysis(supplier.id, la.id); }}
                                    className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10 hover:scale-110"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-xl ${la.overallResult === 'CONFORM' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                        <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight truncate">{la.analysisType}</h5>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">LOT: {la.lotNumber}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    {la.parameters?.slice(0, 2).map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[10px]">
                                            <span className="text-[var(--text-muted)] font-medium">{p.name}</span>
                                            <span className={`font-black ${p.conform ? 'text-[var(--text-primary)]' : 'text-rose-500'}`}>
                                                {p.result} {p.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                    <span className={la.overallResult === 'CONFORM' ? 'text-emerald-500' : 'text-rose-500'}>
                                        {la.overallResult === 'CONFORM' ? 'Conforme' : 'Non Conforme'}
                                    </span>
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <FileText className="w-3.5 h-3.5" />
                                        {new Date(la.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(!supplier.laboratoryAnalyses || supplier.laboratoryAnalyses.length === 0) && (
                        <div className="p-20 text-center bg-[var(--bg-main)]/30 rounded-2xl border-2 border-dashed border-[var(--border-subtle)]">
                            <Beaker className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Aucune analyse enregistrée</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Tendances Qualité
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                                    <span>Fiabilité Tests</span>
                                    <span className="text-emerald-500">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[98.2%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                                    <span>Vigilance Contaminants</span>
                                    <span className="text-amber-500">Faible</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[15%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Alertes Labo</h5>
                        </div>
                        <p className="text-[11px] text-indigo-600/80 leading-relaxed font-medium">
                            Toutes les analyses récentes sont conformes. Aucune dérive n'a été détectée sur les 3 derniers mois.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
