import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Truck, Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
    CheckCircle2, XCircle, AlertCircle, Calendar, Thermometer,
    ClipboardCheck, History, BarChart3, Package, Trash2, Edit3
} from 'lucide-react';
import { ReceptionControlForm } from '../components/ReceptionControlForm';
import SectionHeader from '../components/SectionHeader';

const Receptions: React.FC = () => {
    const { suppliers, rawMaterials, deleteReceptionControl, addNotification } = useWorkspace();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [editingControl, setEditingControl] = useState<any | null>(null);

    // Flatten all reception controls from all suppliers
    const allReceptions = suppliers.flatMap(s =>
        (s.receptionControls || []).map(c => ({
            ...c,
            supplierName: s.name,
            supplierId: s.id
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredReceptions = allReceptions.filter(r =>
        r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.materialId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: allReceptions.length,
        accepted: allReceptions.filter(r => r.decision === 'ACCEPTED').length,
        rejected: allReceptions.filter(r => r.decision === 'REJECTED').length,
        conditional: allReceptions.filter(r => r.decision === 'ACCEPTED_CONDITIONAL').length,
    };

    const acceptanceRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Réceptions</h1>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-1.5 opacity-60">Suivi global de la conformité à réception</p>
                </div>
                <button
                    onClick={() => {
                        setEditingControl(null);
                        setShowForm(true);
                        setSelectedSupplierId(suppliers[0]?.id || null);
                    }}
                    className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Nouveau Contrôle
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Taux d'Acceptation"
                    value={`${acceptanceRate}%`}
                    subValue="Objectif > 95%"
                    icon={BarChart3}
                    color="text-indigo-500"
                />
                <StatCard
                    label="Conformes"
                    value={stats.accepted}
                    subValue="Flux validés"
                    icon={CheckCircle2}
                    color="text-emerald-500"
                />
                <StatCard
                    label="Non-Conformes"
                    value={stats.rejected}
                    subValue="Flux isolés"
                    icon={XCircle}
                    color="text-rose-500"
                />
                <StatCard
                    label="Réserves"
                    value={stats.conditional}
                    subValue="Sous surveillance"
                    icon={AlertCircle}
                    color="text-amber-500"
                />
            </div>

            {/* Main Content */}
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl overflow-hidden">
                {showForm ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Saisir une Réception</h2>
                            <div className="flex items-center gap-4">
                                <select
                                    className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-[10px] font-black uppercase outline-none"
                                    value={selectedSupplierId || ''}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                >
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <button onClick={() => { setShowForm(false); setEditingControl(null); }} className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)]">Annuler</button>
                            </div>
                        </div>
                        {selectedSupplierId && (
                            <ReceptionControlForm
                                supplierId={selectedSupplierId}
                                control={editingControl}
                                onSuccess={() => { setShowForm(false); setEditingControl(null); }}
                            />
                        )}
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par lot, matière, fournisseur..."
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium outline-none focus:border-[var(--accent)] transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                    {filteredReceptions.length} RÉSULTATS
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[var(--bg-main)]/20 border-b border-[var(--border-subtle)]">
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-left">Date / Opérateur</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-left">Fournisseur / Matière</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-left">Traçabilité (LOT)</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-left">Temp.</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-center">Décision</th>
                                        <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]/50">
                                    {filteredReceptions.map((r) => {
                                        const material = rawMaterials.find(m => m.id === r.materialId);
                                        return (
                                            <tr key={r.id} className="group hover:bg-[var(--accent)]/[0.02] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-[var(--bg-main)] rounded-lg">
                                                            <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
                                                                {new Date(r.date).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase opacity-60">
                                                                Par {r.operator}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
                                                        {r.supplierName}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">
                                                        <Package className="w-3 h-3" />
                                                        {material?.name || 'Inconnue'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="inline-flex items-center px-2 py-1 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-tighter">
                                                        LOT: {r.lotNumber}
                                                    </div>
                                                    {r.supplierLotNumber && (
                                                        <div className="text-[8px] text-[var(--text-muted)] font-bold mt-1 uppercase tracking-tighter opacity-50">
                                                            EXT: {r.supplierLotNumber}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Thermometer className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                                                        <span className={`text-xs font-black ${r.physicalChecks?.temperature > r.physicalChecks?.temperatureLimit ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>
                                                            {r.physicalChecks?.temperature || '-'}°C
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-center">
                                                        <DecisionBadge decision={r.decision} />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => {
                                                                setEditingControl(r);
                                                                setSelectedSupplierId(r.supplierId);
                                                                setShowForm(true);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-[var(--accent-subtle)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm("Supprimer ce contrôle ?")) {
                                                                    deleteReceptionControl(r.supplierId, r.id);
                                                                    addNotification({ title: 'Supprimé', message: 'Contrôle supprimé.', type: 'INFO' });
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredReceptions.length === 0 && (
                                <div className="p-20 text-center opacity-40">
                                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucune réception trouvée</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 group-hover:opacity-10 transition-all">
            <Icon className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-2.5 rounded-xl bg-slate-500/5 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">{value}</span>
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">{subValue}</span>
        </div>
    </div>
);

const DecisionBadge = ({ decision }: { decision: string }) => {
    const configs: any = {
        ACCEPTED: { label: 'Conforme', icon: CheckCircle2, styles: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
        REJECTED: { label: 'Refusé', icon: XCircle, styles: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
        ACCEPTED_CONDITIONAL: { label: 'Réserves', icon: AlertCircle, styles: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    };

    const config = configs[decision] || { label: 'Inconnu', icon: AlertCircle, styles: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${config.styles}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </div>
    );
};

export default Receptions;
