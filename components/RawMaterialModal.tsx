import React, { useState } from 'react';
import { RawMaterial } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { X, ShieldCheck, Box, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

interface RawMaterialModalProps {
    material?: RawMaterial;
    supplierId?: string;
    onClose: () => void;
}

const RawMaterialModal: React.FC<RawMaterialModalProps> = ({ material, supplierId, onClose }) => {
    const { addRawMaterial, updateRawMaterial, linkRawMaterialToSupplier } = useWorkspace();

    const [name, setName] = useState(material?.name || '');
    const [category, setCategory] = useState(material?.category || '');
    const [riskLevel, setRiskLevel] = useState(material?.riskLevel || 'LOW');
    const [requiresGFSICertificate, setRequiresGFSICertificate] = useState(material?.requiresGFSICertificate || false);

    const [allergens, setAllergens] = useState(material?.allergens?.join(', ') || '');
    const [crossContamination, setCrossContamination] = useState(material?.crossContaminationRisk?.join(', ') || '');

    const [fraudVulnerability, setFraudVulnerability] = useState(material?.fraudVulnerability || 'LOW');
    const [fraudRisks, setFraudRisks] = useState(material?.fraudRisks?.join(', ') || '');
    const [foodDefenseRisk, setFoodDefenseRisk] = useState(material?.foodDefenseRisk || 'LOW');

    const [requiredDocuments, setRequiredDocuments] = useState(material?.requiredDocuments?.join(', ') || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newMaterial: RawMaterial = {
            id: material?.id || `MAT-${Date.now()}`,
            name,
            category,
            riskLevel: riskLevel as 'HIGH' | 'MEDIUM' | 'LOW',
            requiresGFSICertificate,
            allergens: allergens.split(',').map(s => s.trim()).filter(Boolean),
            crossContaminationRisk: crossContamination.split(',').map(s => s.trim()).filter(Boolean),
            fraudVulnerability: fraudVulnerability as 'HIGH' | 'MEDIUM' | 'LOW',
            fraudRisks: fraudRisks.split(',').map(s => s.trim()).filter(Boolean),
            foodDefenseRisk: foodDefenseRisk as 'HIGH' | 'MEDIUM' | 'LOW',
            requiredDocuments: requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
            approvedSuppliers: material ? material.approvedSuppliers : (supplierId ? [supplierId] : []),
        };

        if (material) {
            updateRawMaterial(material.id, newMaterial);
        } else {
            addRawMaterial(newMaterial);
            if (supplierId) {
                linkRawMaterialToSupplier(supplierId, newMaterial.id);
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-main)]/30 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">{material ? 'Éditer la matière première' : 'Nouvelle matière première'}</h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 opacity-60">Cahier des charges & paramétrage GFSI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] group">
                        <X className="w-6 h-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 flex-col">
                    {/* Section 1: Identification */}
                    <div className="space-y-5">
                        <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-3">
                            <FileText className="w-4 h-4 text-[var(--accent)]" />
                            Identification
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Nom / Désignation *</label>
                                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cacao en poudre, Sel marin..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-medium focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Catégorie *</label>
                                <input required value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Épices, Produits laitiers..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-medium focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Évaluation GFSI */}
                    <div className="space-y-5">
                        <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
                            Évaluation des risques
                        </h4>
                        <div className="bg-[var(--bg-main)]/50 p-6 rounded-xl border border-[var(--border-subtle)] space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Niveau de risque global</label>
                                    <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)] transition-all">
                                        <option value="LOW">Faible</option>
                                        <option value="MEDIUM">Moyen</option>
                                        <option value="HIGH">Élevé (Sensible)</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-5">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${requiresGFSICertificate ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-orange-500/20' : 'border-[var(--border-subtle)]'}`}>
                                            <input type="checkbox" checked={requiresGFSICertificate} onChange={e => setRequiresGFSICertificate(e.target.checked)} className="hidden" />
                                            {requiresGFSICertificate && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">Certification GFSI Obligatoire</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Vulnérabilité Fraude (VACCP)</label>
                                    <select value={fraudVulnerability} onChange={e => setFraudVulnerability(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)] transition-all">
                                        <option value="LOW">Faible</option>
                                        <option value="MEDIUM">Moyen</option>
                                        <option value="HIGH">Élevé</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Risque Food Defense (TACCP)</label>
                                    <select value={foodDefenseRisk} onChange={e => setFoodDefenseRisk(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm font-bold uppercase tracking-widest outline-none focus:border-[var(--accent)] transition-all">
                                        <option value="LOW">Faible</option>
                                        <option value="MEDIUM">Moyen</option>
                                        <option value="HIGH">Élevé</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Spécifications & Allergènes */}
                    <div className="space-y-5">
                        <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-[var(--accent)]" />
                            Allergènes & Contraintes
                        </h4>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Allergènes présents</label>
                                <input value={allergens} onChange={e => setAllergens(e.target.value)} placeholder="Soja, Lait..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-medium focus:border-[var(--accent)] outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Contamination croisée</label>
                                <input value={crossContamination} onChange={e => setCrossContamination(e.target.value)} placeholder="Traces d'arachides..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-medium focus:border-[var(--accent)] outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Documents */}
                    <div className="space-y-5">
                        <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-3">
                            <FileText className="w-4 h-4 text-[var(--accent)]" />
                            Documents exigés
                        </h4>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Liste des documents obligatoires</label>
                            <textarea rows={3} value={requiredDocuments} onChange={e => setRequiredDocuments(e.target.value)} placeholder="Cahier des charges signé, Certificat d'authenticité, Certificat Bio..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm font-medium focus:border-[var(--accent)] outline-none resize-none transition-all" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-3 sticky bottom-0 bg-[var(--bg-card)] mt-auto pb-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl border border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all">
                            Annuler
                        </button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:opacity-90 transition-all flex items-center gap-2">
                            {material ? 'Enregistrer les modifications' : 'Créer la matière première'} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RawMaterialModal;
