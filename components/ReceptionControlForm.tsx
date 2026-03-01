import React, { useState } from 'react';
import { RawMaterial, ReceptionControl, ComplianceStatus } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Calendar, Package, ClipboardCheck, Thermometer,
    Eye, CornerDownRight, CheckCircle2, XCircle, AlertCircle,
    Plus, Trash2, Save, FileText, Scale, User, Clock
} from 'lucide-react';

interface ReceptionControlFormProps {
    supplierId: string;
    control?: ReceptionControl;
    onSuccess: () => void;
}

export const ReceptionControlForm: React.FC<ReceptionControlFormProps> = ({ supplierId, control, onSuccess }) => {
    const { rawMaterials, addReceptionControl, updateReceptionControl, addNotification } = useWorkspace();

    const [formData, setFormData] = useState<Partial<ReceptionControl>>(control || {
        date: new Date().toISOString().split('T')[0],
        lotNumber: '',
        supplierLotNumber: '',
        materialId: '',
        quantity: 0,
        unit: 'KG',
        operator: 'Admin Qualité',
        documentaryChecks: {
            sanitaryCertificate: true,
            analysisResults: true,
            traceability: true,
            labeling: true
        },
        physicalChecks: {
            temperature: 4,
            temperatureLimit: 4,
            visualAspect: 'CONFORM',
            smell: 'NORMAL',
            packagingIntegrity: true
        },
        decision: 'ACCEPTED',
        remarks: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.materialId || !formData.lotNumber) {
            addNotification({
                title: 'Champs manquants',
                message: 'Veuillez renseigner la matière et le numéro de lot.',
                type: 'WARNING'
            });
            return;
        }

        if (control) {
            updateReceptionControl(supplierId, control.id, {
                date: formData.date!,
                materialId: formData.materialId!,
                lotNumber: formData.lotNumber!,
                supplierLotNumber: formData.supplierLotNumber || '',
                quantity: formData.quantity || 0,
                unit: formData.unit || 'KG',
                operator: formData.operator || 'Admin',
                documentaryChecks: formData.documentaryChecks as any,
                physicalChecks: formData.physicalChecks as any,
                decision: formData.decision as any,
                remarks: formData.remarks || ''
            });
            addNotification({
                title: 'Contrôle mis à jour',
                message: 'Le contrôle à réception a été modifié avec succès.',
                type: 'SUCCESS'
            });
        } else {
            const newControl: ReceptionControl = {
                id: `REC-${Date.now()}`,
                date: formData.date!,
                materialId: formData.materialId!,
                lotNumber: formData.lotNumber!,
                supplierLotNumber: formData.supplierLotNumber || '',
                quantity: formData.quantity || 0,
                unit: formData.unit || 'KG',
                operator: formData.operator || 'Admin',
                documentaryChecks: formData.documentaryChecks as any,
                physicalChecks: formData.physicalChecks as any,
                decision: formData.decision as any,
                remarks: formData.remarks || ''
            };

            addReceptionControl(supplierId, newControl);
            addNotification({
                title: 'Contrôle enregistré',
                message: 'Le contrôle à réception a été ajouté avec succès.',
                type: 'SUCCESS'
            });
        }
        onSuccess();
    };

    const toggleDocumentary = (key: keyof ReceptionControl['documentaryChecks']) => {
        setFormData(prev => ({
            ...prev,
            documentaryChecks: {
                ...prev.documentaryChecks!,
                [key]: !prev.documentaryChecks![key]
            }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] shadow-sm animate-fade-in text-[var(--text-primary)]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-[var(--accent)]" />
                    {control ? 'Modifier le Contrôle' : 'Nouveau Contrôle à Réception'}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Date</label>
                            <input
                                type="date"
                                className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)] cursor-pointer"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Opérateur</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)]"
                                value={formData.operator}
                                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Matière Première</label>
                        <select
                            className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)] cursor-pointer"
                            value={formData.materialId}
                            onChange={e => setFormData({ ...formData, materialId: e.target.value })}
                        >
                            <option value="" className="bg-[var(--bg-card)]">Sélectionner une matière...</option>
                            {rawMaterials.filter(m => m.supplierId === supplierId).map(m => (
                                <option key={m.id} value={m.id} className="bg-[var(--bg-card)]">{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Lot Interne</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)]"
                                placeholder="Auto-généré..."
                                value={formData.lotNumber}
                                onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                            />
                        </div>
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Lot Fournisseur</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)]"
                                placeholder="Numéro lot..."
                                value={formData.supplierLotNumber}
                                onChange={e => setFormData({ ...formData, supplierLotNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Quantité</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="bg-transparent font-black text-sm outline-none w-full text-[var(--accent)]"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                            <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Unité</label>
                            <select
                                className="bg-transparent font-bold text-xs outline-none w-full text-[var(--text-primary)] cursor-pointer"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="KG" className="bg-[var(--bg-card)]">KILOGRAMMES (KG)</option>
                                <option value="L" className="bg-[var(--bg-card)]">LITRES (L)</option>
                                <option value="PCS" className="bg-[var(--bg-card)]">PIÈCES (PCS)</option>
                                <option value="T" className="bg-[var(--bg-card)]">TONNES (T)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Checks */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[var(--accent)]" /> Contrôles Documentaires
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <CheckToggle
                                label="Certificat Sanitaire"
                                active={formData.documentaryChecks!.sanitaryCertificate}
                                onClick={() => toggleDocumentary('sanitaryCertificate')}
                            />
                            <CheckToggle
                                label="Analyses / COA"
                                active={formData.documentaryChecks!.analysisResults}
                                onClick={() => toggleDocumentary('analysisResults')}
                            />
                            <CheckToggle
                                label="Traçabilité"
                                active={formData.documentaryChecks!.traceability}
                                onClick={() => toggleDocumentary('traceability')}
                            />
                            <CheckToggle
                                label="Étiquetage"
                                active={formData.documentaryChecks!.labeling}
                                onClick={() => toggleDocumentary('labeling')}
                            />
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <Thermometer className="w-3.5 h-3.5 text-[var(--accent)]" /> Température & Physique
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Temp. Mesurée</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="bg-transparent font-bold text-sm outline-none w-full text-[var(--text-primary)]"
                                        value={formData.physicalChecks!.temperature}
                                        onChange={e => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, temperature: parseFloat(e.target.value) } })}
                                    />
                                    <span className="text-[10px] font-black text-[var(--text-muted)]">°C</span>
                                </div>
                            </div>
                            <div className="p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-1 tracking-widest">Limite Max</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="bg-transparent font-bold text-sm outline-none w-full text-[var(--text-primary)] opacity-60"
                                        value={formData.physicalChecks!.temperatureLimit}
                                        onChange={e => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, temperatureLimit: parseFloat(e.target.value) } })}
                                    />
                                    <span className="text-[10px] font-black text-[var(--text-muted)]">°C</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, packagingIntegrity: !formData.physicalChecks!.packagingIntegrity } })}
                            className={`w-full p-3 rounded-lg flex items-center justify-between border transition-all ${formData.physicalChecks!.packagingIntegrity
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
                                : 'bg-rose-500/5 border-rose-500/20 text-rose-600'
                                }`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-tight">Intégrité des Emballages</span>
                            {formData.physicalChecks!.packagingIntegrity ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                    </section>
                </div>
            </div>

            {/* Decision */}
            <div className="pt-6 border-t border-[var(--border-subtle)]">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-4 tracking-[0.2em] text-center">Décision Qualité</label>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <ConclusionButton
                        type="ACCEPTED"
                        active={formData.decision === 'ACCEPTED'}
                        onClick={() => setFormData({ ...formData, decision: 'ACCEPTED' })}
                    />
                    <ConclusionButton
                        type="ACCEPTED_CONDITIONAL"
                        active={formData.decision === 'ACCEPTED_CONDITIONAL'}
                        onClick={() => setFormData({ ...formData, decision: 'ACCEPTED_CONDITIONAL' })}
                    />
                    <ConclusionButton
                        type="REJECTED"
                        active={formData.decision === 'REJECTED'}
                        onClick={() => setFormData({ ...formData, decision: 'REJECTED' })}
                    />
                </div>

                <div className="p-4 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)] focus-within:border-[var(--accent)] transition-colors">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase block mb-2 tracking-widest text-center">Observations / Actions Correctives</label>
                    <textarea
                        className="w-full bg-transparent font-medium text-xs outline-none min-h-[60px] resize-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                        placeholder="Précisez les éventuelles anomalies..."
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="px-8 py-3 bg-[var(--accent)] text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <Save className="w-4 h-4" /> Enregistrer le Contrôle
                </button>
            </div>
        </form>
    );
};

const CheckToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-3 rounded-lg flex items-center justify-between border transition-all ${active
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'
            : 'bg-[var(--bg-main)]/30 border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60'
            }`}
    >
        <span className="text-[10px] font-bold text-left">{label}</span>
        {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    </button>
);

const ConclusionButton = ({ type, active, onClick }: { type: string, active: boolean, onClick: () => void }) => {
    const styles = {
        ACCEPTED: active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 hover:bg-emerald-500/10',
        ACCEPTED_CONDITIONAL: active ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-500/5 text-amber-600 border border-amber-500/10 hover:bg-amber-500/10',
        REJECTED: active ? 'bg-rose-600 text-white shadow-lg' : 'bg-rose-500/5 text-rose-600 border border-rose-500/10 hover:bg-rose-500/10',
    };

    const labels = {
        ACCEPTED: 'CONFORME',
        ACCEPTED_CONDITIONAL: 'RÉSERVES',
        REJECTED: 'REFUSÉ'
    };

    const icons = {
        ACCEPTED: CheckCircle2,
        ACCEPTED_CONDITIONAL: AlertCircle,
        REJECTED: XCircle
    };

    const Icon = icons[type as keyof typeof icons];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex flex-col items-center justify-center gap-2 transition-all group ${styles[type as keyof typeof styles]}`}
        >
            <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>{labels[type as keyof typeof labels]}</span>
        </button>
    );
};
