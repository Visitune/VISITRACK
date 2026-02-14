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
    onSuccess: () => void;
}

export const ReceptionControlForm: React.FC<ReceptionControlFormProps> = ({ supplierId, onSuccess }) => {
    const { rawMaterials, addReceptionControl, addNotification } = useWorkspace();

    const [formData, setFormData] = useState<Partial<ReceptionControl>>({
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

        const control: ReceptionControl = {
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

        addReceptionControl(supplierId, control);
        addNotification({
            title: 'Contrôle enregistré',
            message: 'Le contrôle à réception a été ajouté avec succès.',
            type: 'SUCCESS'
        });
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
        <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded-xl border border-slate-100 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Nouveau Contrôle à Réception
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Date</label>
                            <input
                                type="date"
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Opérateur</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.operator}
                                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Matière Première</label>
                        <select
                            className="bg-transparent font-bold text-sm outline-none w-full"
                            value={formData.materialId}
                            onChange={e => setFormData({ ...formData, materialId: e.target.value })}
                        >
                            <option value="">Sélectionner une matière...</option>
                            {rawMaterials.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Lot Interne</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.lotNumber}
                                onChange={e => setFormData({ ...formData, lotNumber: e.target.value })}
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Lot Fournisseur</label>
                            <input
                                type="text"
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.supplierLotNumber}
                                onChange={e => setFormData({ ...formData, supplierLotNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Quantité</label>
                            <input
                                type="number"
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Unité</label>
                            <select
                                className="bg-transparent font-bold text-sm outline-none w-full"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="KG">Kilogrammes (KG)</option>
                                <option value="L">Litres (L)</option>
                                <option value="PCS">Pièces (PCS)</option>
                                <option value="T">Tonnes (T)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Checks */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Contrôles Documentaires
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            <CheckToggle
                                label="Certificat Sanitaire"
                                active={formData.documentaryChecks!.sanitaryCertificate}
                                onClick={() => toggleDocumentary('sanitaryCertificate')}
                            />
                            <CheckToggle
                                label="Résultats d'Analyses"
                                active={formData.documentaryChecks!.analysisResults}
                                onClick={() => toggleDocumentary('analysisResults')}
                            />
                            <CheckToggle
                                label="Traçabilité (SSCC/EAN)"
                                active={formData.documentaryChecks!.traceability}
                                onClick={() => toggleDocumentary('traceability')}
                            />
                            <CheckToggle
                                label="Étiquetage Conforme"
                                active={formData.documentaryChecks!.labeling}
                                onClick={() => toggleDocumentary('labeling')}
                            />
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Thermometer className="w-3.5 h-3.5 text-indigo-500" /> Température & Physique
                        </h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Temp. Mesurée</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="bg-transparent font-bold text-sm outline-none w-full"
                                    value={formData.physicalChecks!.temperature}
                                    onChange={e => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, temperature: parseFloat(e.target.value) } })}
                                />
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Limite Max</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="bg-transparent font-bold text-sm outline-none w-full"
                                    value={formData.physicalChecks!.temperatureLimit}
                                    onChange={e => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, temperatureLimit: parseFloat(e.target.value) } })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, physicalChecks: { ...formData.physicalChecks!, packagingIntegrity: !formData.physicalChecks!.packagingIntegrity } })}
                                className={`p-4 rounded-xl flex items-center justify-between border transition-all ${formData.physicalChecks!.packagingIntegrity ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                            >
                                <span className="text-[11px] font-bold">Intégrité Emballages</span>
                                {formData.physicalChecks!.packagingIntegrity ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Decision */}
            <div className="pt-6 border-t border-slate-100">
                <label className="text-[9px] font-black text-slate-400 uppercase block mb-3">Décision Qualité</label>
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

                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Commentaires / Réserves</label>
                    <textarea
                        className="w-full bg-transparent font-medium text-sm outline-none min-h-[80px] resize-none"
                        value={formData.remarks}
                        onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                    Fermer
                </button>
                <button
                    type="submit"
                    className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-3"
                >
                    <Save className="w-5 h-5" /> Valider la Réception
                </button>
            </div>
        </form>
    );
};

const CheckToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-xl flex items-center justify-between border transition-all ${active
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-slate-50/50 border-slate-100 text-slate-400'
            }`}
    >
        <span className="text-[11px] font-bold">{label}</span>
        {active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
    </button>
);

const ConclusionButton = ({ type, active, onClick }: { type: string, active: boolean, onClick: () => void }) => {
    const styles = {
        ACCEPTED: active ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-50 text-emerald-600',
        ACCEPTED_CONDITIONAL: active ? 'bg-amber-600 text-white shadow-lg' : 'bg-amber-50 text-amber-600',
        REJECTED: active ? 'bg-rose-600 text-white shadow-lg' : 'bg-rose-50 text-rose-600',
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
            className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${styles[type as keyof typeof styles]}`}
        >
            <Icon className="w-5 h-5" /> {labels[type as keyof typeof labels]}
        </button>
    );
};
