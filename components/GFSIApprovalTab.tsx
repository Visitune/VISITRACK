import React, { useState } from 'react';
import { Supplier, GFSICertificate, GFSIApprovalStatus, RawMaterial, ReceptionControl } from '../types';
import { PDFAnalyzer } from '../services/pdfAnalyzer';
import { PDF_TEMPLATES } from '../services/pdfTemplates';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Shield, Upload, CheckCircle, AlertTriangle, FileText,
    BadgeCheck, Clock, XCircle, Search, Plus, Truck, History,
    Package, Thermometer, Info, ClipboardCheck, Sparkles
} from 'lucide-react';
import { ReceptionControlForm } from './ReceptionControlForm';

interface Props {
    supplier: Supplier;
}

export const GFSIApprovalTab: React.FC<Props> = ({ supplier }) => {
    const { settings, addGFSICertificate, updateSupplier, rawMaterials, addRawMaterial } = useWorkspace();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [pendingCert, setPendingCert] = useState<GFSICertificate | null>(null);
    const [showReceptionForm, setShowReceptionForm] = useState(false);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const [newMaterial, setNewMaterial] = useState({ name: '', category: '', riskLevel: 'LOW' as any });

    const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!settings.geminiApiKey) {
            alert("Veuillez configurer votre clé API Gemini dans les Paramètres pour l'analyse automatique.");
            return;
        }

        setIsAnalyzing(true);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Content = event.target?.result as string;

                const analyzer = new PDFAnalyzer(settings.geminiApiKey);
                const result = await analyzer.analyzePDF(
                    base64Content,
                    PDF_TEMPLATES.IFS
                );

                const newCertificate: GFSICertificate = {
                    id: `CERT-${Date.now()}`,
                    type: 'IFS', // Default detection, ideally should come from analysis
                    version: result.version || 'Unknown',
                    score: result.score || 0,
                    grade: result.grade || 'N/A',
                    validFrom: result.validFrom || new Date().toISOString(),
                    validUntil: result.validUntil || new Date().toISOString(),
                    scope: result.scope || 'Scope non détecté',
                    certificationBody: result.certificationBody || 'Organisme Inconnu',
                    majorNonConformities: result.majorNonConformities || 0,
                    minorNonConformities: result.minorNonConformities || 0,
                    extractedData: result
                };

                setPendingCert(newCertificate);
                setShowCertModal(true);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Erreur analyse certificat:', error);
            alert('Erreur lors de l\'analyse du certificat. Vérifiez votre clé API ou le format du fichier.');
        } finally {
            setIsAnalyzing(false);
            // Reset input
            e.target.value = '';
        }
    };

    const confirmCertificate = () => {
        if (pendingCert) {
            addGFSICertificate(supplier.id, pendingCert);
            setShowCertModal(false);
            setPendingCert(null);
        }
    };

    const updateStatus = (status: GFSIApprovalStatus) => {
        updateSupplier(supplier.id, {
            approvalStatus: status,
            approvalDate: status === 'APPROVED' ? new Date().toISOString() : supplier.approvalDate
        });
    };

    const handleAddMaterial = () => {
        if (!newMaterial.name) return;
        addRawMaterial({
            id: `MAT-${Date.now()}`,
            supplierId: supplier.id,
            ...newMaterial,
            specifications: []
        });
        setNewMaterial({ name: '', category: '', riskLevel: 'LOW' });
        setIsAddingMaterial(false);
    };

    const getStatusIcon = (status: GFSIApprovalStatus) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'PENDING_DOCS': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'UNDER_REVIEW': return <Search className="w-5 h-5 text-indigo-500" />;
            default: return <Clock className="w-5 h-5 text-slate-400" />;
        }
    };

    const supplierMaterials = rawMaterials.filter(m => m.supplierId === supplier.id);
    const supplierControls = supplier.receptionControls || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Statut Global */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Statut d'Approbation GFSI
                    </h3>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
                        {(['NEW', 'PENDING_DOCS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as GFSIApprovalStatus[]).map(s => (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${supplier.approvalStatus === s
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {s.split('_').join(' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${supplier.approvalStatus === 'APPROVED' ? 'bg-emerald-50' :
                        supplier.approvalStatus === 'REJECTED' ? 'bg-rose-50' : 'bg-slate-50'
                        }`}>
                        {getStatusIcon(supplier.approvalStatus || 'NEW')}
                    </div>
                    <div>
                        <div className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {supplier.approvalStatus || 'Nouveau'}
                        </div>
                        {supplier.approvalDate && (
                            <div className="text-xs text-slate-400 font-bold">
                                Validé le {new Date(supplier.approvalDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certificates */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <BadgeCheck className="w-6 h-6 text-indigo-600" /> Certificats & Audits
                        </h3>
                        <button
                            onClick={() => document.getElementById('cert-upload')?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                        >
                            <Upload className="w-4 h-4" /> Nouveau Certificat
                        </button>
                        <input
                            id="cert-upload"
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleCertificateUpload}
                        />
                    </div>

                    <div className="space-y-4">
                        {supplier.gfsiCertificates?.map(cert => (
                            <div key={cert.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <BadgeCheck className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm">{cert.type} {cert.version}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cert.certificationBody}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {cert.score && <div className="text-sm font-black text-indigo-600">{cert.score}%</div>}
                                    </div>
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase">
                                    Expire le {new Date(cert.validUntil).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {(!supplier.gfsiCertificates || supplier.gfsiCertificates.length === 0) && (
                            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-xl opacity-50">
                                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucun certificat</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Raw Materials */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <Package className="w-6 h-6 text-indigo-600" /> Matières Premières
                        </h3>
                        <button
                            onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                        >
                            {isAddingMaterial ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {isAddingMaterial ? 'Annuler' : 'Ajouter'}
                        </button>
                    </div>

                    {isAddingMaterial && (
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-fade-in space-y-4">
                            <h4 className="text-sm font-bold text-slate-900">Nouvelle Matière</h4>
                            <input
                                className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-bold outline-none"
                                placeholder="Nom de la matière..."
                                value={newMaterial.name}
                                onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 bg-white border border-indigo-200 rounded-lg p-2 text-[10px] font-black outline-none"
                                    value={newMaterial.riskLevel}
                                    onChange={e => setNewMaterial({ ...newMaterial, riskLevel: e.target.value as any })}
                                >
                                    <option value="LOW">RISQUE FAIBLE</option>
                                    <option value="MEDIUM">RISQUE MOYEN</option>
                                    <option value="HIGH">RISQUE ÉLEVÉ</option>
                                </select>
                                <button onClick={handleAddMaterial} className="p-2 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => setIsAddingMaterial(false)} className="p-2 bg-white text-slate-400 rounded-lg"><XCircle className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {supplierMaterials.map(m => (
                            <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${m.riskLevel === 'HIGH' ? 'bg-rose-500' : m.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    <div className="font-black text-slate-900 text-xs uppercase">{m.name}</div>
                                </div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.riskLevel}</div>
                            </div>
                        ))}

                        {supplierMaterials.length === 0 && !isAddingMaterial && (
                            <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-xl opacity-50">
                                <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune matière</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reception Controls */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <History className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 mb-2">
                            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                            Historique des Réceptions
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôles qualité et conformité des livraisons</p>
                    </div>
                    <button
                        onClick={() => setShowReceptionForm(true)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-black transition-all"
                    >
                        <Plus className="w-5 h-5" /> Nouveau Contrôle
                    </button>
                </div>

                {showReceptionForm ? (
                    <ReceptionControlForm
                        supplierId={supplier.id}
                        onSuccess={() => setShowReceptionForm(false)}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matière / Lot</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temp.</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Décision</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {supplierControls.sort((a, b) => b.date.localeCompare(a.date)).map(c => {
                                        const material = rawMaterials.find(m => m.id === c.materialId);
                                        return (
                                            <tr key={c.id} className="group">
                                                <td className="py-4">
                                                    <div className="font-black text-slate-900 text-xs">{new Date(c.date).toLocaleDateString()}</div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="font-black text-slate-900 text-xs uppercase">{material?.name || 'Inconnue'}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold">Lot: {c.lotNumber}</div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Thermometer className="w-3 h-3 text-slate-300" />
                                                        <span className="text-xs font-bold text-slate-700">{c.temperatureC || '-'}°C</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.decision === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' :
                                                        c.decision === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>
                                                        {c.decision?.split('_').join(' ') || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {supplierControls.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-2xl">
                                <Truck className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Aucun contrôle enregistré</p>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Certificate Review Modal */}
            {
                showCertModal && pendingCert && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Validation IA</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vérifiez les données extraites du certificat</p>
                                </div>
                                <button onClick={() => setShowCertModal(false)} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500"><XCircle className="w-5 h-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-black text-indigo-900 text-xs uppercase">Analyse Gemini Terminée</h4>
                                        <p className="text-[10px] text-indigo-700">Le moteur IA a détecté un score de <strong className="text-indigo-900">{pendingCert.score}%</strong>. Veuillez confirmer les dates et le scope.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Standard</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                                            value={pendingCert.type}
                                            onChange={e => setPendingCert({ ...pendingCert, type: e.target.value as any })}
                                        >
                                            <option value="IFS">IFS Food</option>
                                            <option value="BRCGS">BRCGS Food</option>
                                            <option value="FSSC">FSSC 22000</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Version</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                                            value={pendingCert.version}
                                            onChange={e => setPendingCert({ ...pendingCert, version: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Score (%)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs text-indigo-600"
                                            value={pendingCert.score}
                                            onChange={e => setPendingCert({ ...pendingCert, score: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Grade</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                                            value={pendingCert.grade}
                                            onChange={e => setPendingCert({ ...pendingCert, grade: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Valide jusqu'au</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
                                            value={pendingCert.validUntil ? new Date(pendingCert.validUntil).toISOString().split('T')[0] : ''}
                                            onChange={e => setPendingCert({ ...pendingCert, validUntil: new Date(e.target.value).toISOString() })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Scope de Certification</label>
                                    <textarea
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs h-24 resize-none"
                                        value={pendingCert.scope}
                                        onChange={e => setPendingCert({ ...pendingCert, scope: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                                <button onClick={() => setShowCertModal(false)} className="px-6 py-3 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Annuler</button>
                                <button onClick={confirmCertificate} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Valider & Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div >
    );
};
