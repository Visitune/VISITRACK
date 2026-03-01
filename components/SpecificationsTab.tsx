import React, { useState } from 'react';
import { Supplier, GFSICertificate, GFSIApprovalStatus, RawMaterial } from '../types';
import { PDFAnalyzer } from '../services/pdfAnalyzer';
import { PDF_TEMPLATES } from '../services/pdfTemplates';
import { useWorkspace } from '../context/WorkspaceContext';
import {
    Shield, Upload, CheckCircle, AlertTriangle, FileText,
    BadgeCheck, Clock, XCircle, Search, Plus,
    Package, Info, Sparkles
} from 'lucide-react';
import SectionHeader from './SectionHeader';

interface Props {
    supplier: Supplier;
}

export const SpecificationsTab: React.FC<Props> = ({ supplier }) => {
    const {
        settings, addGFSICertificate, updateSupplier, rawMaterials,
        addRawMaterial, deleteGFSICertificate, deleteRawMaterial, updateRawMaterial,
        deleteQuestionnaire
    } = useWorkspace();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    const [pendingCert, setPendingCert] = useState<GFSICertificate | null>(null);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const [newMaterial, setNewMaterial] = useState({ name: '', category: '', riskLevel: 'LOW' as any });
    const [showConfig, setShowConfig] = useState(false);

    const docTypes = [
        { id: 'CERTIFICATE', label: 'Certificats GFSI', icon: BadgeCheck },
        { id: 'SAQ', label: 'Questionnaire (SAQ)', icon: AlertTriangle },
        { id: 'ATTESTATION', label: 'Attestations (Assurance...)', icon: FileText },
        { id: 'POLITIQUE', label: 'Politiques (HACCP...)', icon: Shield },
        { id: 'ENGAGEMENT', label: 'Engagements (Ethique...)', icon: CheckCircle },
    ];

    const currentExpectedDocs = supplier.expectedDocumentTypes || ['CERTIFICATE', 'SAQ'];

    const toggleDocRequirement = (typeId: string) => {
        const updated = currentExpectedDocs.includes(typeId)
            ? currentExpectedDocs.filter(t => t !== typeId)
            : [...currentExpectedDocs, typeId];
        updateSupplier(supplier.id, { expectedDocumentTypes: updated });
    };

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
                    type: 'IFS',
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

    const getStatusIcon = (status: GFSIApprovalStatus) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'PENDING_DOCS': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'UNDER_REVIEW': return <Search className="w-5 h-5 text-indigo-500" />;
            default: return <Clock className="w-5 h-5 text-slate-400" />;
        }
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

    const supplierMaterials = rawMaterials.filter(m => m.supplierId === supplier.id);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Statut Global / Cahier des Charges */}
            <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                    <Shield className="w-20 h-20 text-[var(--accent)]" />
                </div>
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3">
                        <Shield className="w-4 h-4 text-[var(--accent)]" />
                        Conformité & CDC
                    </h3>
                    <div className="flex bg-[var(--bg-main)]/50 p-1 rounded-lg border border-[var(--border-subtle)] overflow-x-auto no-scrollbar scroll-smooth">
                        {(['NEW', 'PENDING_DOCS', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as GFSIApprovalStatus[]).map(s => (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${supplier.approvalStatus === s
                                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-orange-500/20'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {s.split('_').join(' ')}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={`p-2 rounded-lg border transition-all ${showConfig ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-subtle)]'}`}
                    >
                        <Plus className={`w-4 h-4 transition-transform ${showConfig ? 'rotate-45' : ''}`} />
                    </button>
                </div>

                {showConfig && (
                    <div className="mb-8 p-6 bg-[var(--bg-main)]/30 rounded-xl border border-dashed border-[var(--accent)]/30 animate-fade-in">
                        <h4 className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Paramétrage des Documents Requis
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {docTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => toggleDocRequirement(type.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${currentExpectedDocs.includes(type.id)
                                        ? 'bg-[var(--bg-card)] border-[var(--accent)] shadow-sm'
                                        : 'bg-transparent border-[var(--border-subtle)] opacity-40 hover:opacity-100'
                                        }`}
                                >
                                    <type.icon className={`w-4 h-4 ${currentExpectedDocs.includes(type.id) ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-tight text-[var(--text-primary)] leading-tight">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <div className={`p-3.5 rounded-xl ${supplier.approvalStatus === 'APPROVED' ? 'bg-emerald-500/10' :
                        supplier.approvalStatus === 'REJECTED' ? 'bg-rose-500/10' : 'bg-[var(--bg-main)]'
                        }`}>
                        {getStatusIcon(supplier.approvalStatus || 'NEW')}
                    </div>
                    <div>
                        <div className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                            {supplier.approvalStatus || 'Nouveau'}
                        </div>
                        {supplier.approvalDate && (
                            <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wide">
                                Certifié / Validé le {new Date(supplier.approvalDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certificates */}
                {currentExpectedDocs.includes('CERTIFICATE') && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                                <BadgeCheck className="w-5 h-5 text-[var(--accent)]" /> Certificats (GFSI/Autre)
                            </h3>
                            <button
                                onClick={() => document.getElementById('cert-upload')?.click()}
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Upload className="w-3.5 h-3.5" /> Nouveau Certificat
                            </button>
                            <input
                                id="cert-upload"
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleCertificateUpload}
                            />
                        </div>

                        <div className="space-y-3">
                            {supplier.gfsiCertificates?.map(cert => (
                                <div key={cert.id} className="bg-[var(--bg-card)] p-5 rounded-xl border border-[var(--border-subtle)] shadow-sm hover:shadow-md transition-all group relative">
                                    <button
                                        onClick={() => { if (confirm("Supprimer ce certificat ?")) deleteGFSICertificate(supplier.id, cert.id); }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    >
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                    <div className="flex justify-between items-start mb-2 text-left">
                                        <div className="flex items-center gap-3">
                                            <BadgeCheck className="w-4 h-4 text-[var(--accent)]" />
                                            <div>
                                                <h4 className="font-black text-[var(--text-primary)] text-xs uppercase">{cert.type} {cert.version}</h4>
                                                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">{cert.certificationBody}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {cert.score && <div className="text-xs font-black text-[var(--accent)]">{cert.score}%</div>}
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
                                        Expire le {new Date(cert.validUntil).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {(!supplier.gfsiCertificates || supplier.gfsiCertificates.length === 0) && (
                                <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-40">
                                    <FileText className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-20" />
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Aucun certificat enregistré</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Questionnaires & Risk Analysis */}
                {currentExpectedDocs.includes('SAQ') && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                                <AlertTriangle className="w-5 h-5 text-amber-500" /> Analyses de Risques
                            </h3>
                            <button
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-main)] hover:opacity-80 text-[var(--text-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" /> Nouvelle Analyse
                            </button>
                        </div>

                        <div className="space-y-3">
                            {supplier.questionnaires?.map(q => (
                                <div key={q.id} className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] hover:border-amber-500/30 transition-all group relative">
                                    <button
                                        onClick={() => { if (confirm("Supprimer ce questionnaire ?")) deleteQuestionnaire(supplier.id, q.id); }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    >
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                                <FileText className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight">{q.materialCategory}</h4>
                                                <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                                    Score: {q.overallScore || 0}% • {q.status}
                                                </p>
                                            </div>
                                        </div>
                                        {q.completedDate && (
                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                {new Date(q.completedDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!supplier.questionnaires || supplier.questionnaires.length === 0) && (
                                <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-40">
                                    <Info className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 opacity-20" />
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Aucun questionnaire enregistré</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Attestations Placeholders */}
                {currentExpectedDocs.includes('ATTESTATION') && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                                <FileText className="w-5 h-5 text-indigo-500" /> Attestations
                            </h3>
                            <button className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-main)] hover:opacity-80 text-[var(--text-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                <Upload className="w-3.5 h-3.5" /> Charger
                            </button>
                        </div>
                        <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-40">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Attestations d'assurance, Kbis, etc.</p>
                        </div>
                    </div>
                )}

                {/* Policies Placeholders */}
                {currentExpectedDocs.includes('POLITIQUE') && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                                <Shield className="w-5 h-5 text-emerald-500" /> Politiques Qualité
                            </h3>
                            <button className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-main)] hover:opacity-80 text-[var(--text-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                <Upload className="w-3.5 h-3.5" /> Charger
                            </button>
                        </div>
                        <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-40">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">HACCP, Plan de défense, etc.</p>
                        </div>
                    </div>
                )}

                {/* Engagement Placeholders */}
                {currentExpectedDocs.includes('ENGAGEMENT') && (
                    <div className="space-y-5 animate-fade-in lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                                <CheckCircle className="w-5 h-5 text-sky-500" /> Chartes & Engagements
                            </h3>
                            <button className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-main)] hover:opacity-80 text-[var(--text-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                <Plus className="w-3.5 h-3.5" /> Nouvel Engagement
                            </button>
                        </div>
                        <div className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-xl opacity-40">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Charte éthique, Engagements RSE, etc.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Raw Materials - Still relevant here as "Perimeter of Specs" */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2.5">
                        <Package className="w-5 h-5 text-[var(--accent)]" /> Périmètre des Matières Premières
                    </h3>
                    <button
                        onClick={() => setIsAddingMaterial(!isAddingMaterial)}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--bg-main)] hover:opacity-80 text-[var(--text-secondary)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        {isAddingMaterial ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {isAddingMaterial ? 'Annuler' : 'Ajouter'}
                    </button>
                </div>

                {isAddingMaterial && (
                    <div className="bg-[var(--bg-main)]/50 p-5 rounded-xl border border-[var(--border-subtle)] animate-fade-in space-y-3">
                        <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">Nouvelle Matière</h4>
                        <input
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 text-[11px] font-bold outline-none focus:border-[var(--accent)] transition-colors"
                            placeholder="Nom de la matière..."
                            value={newMaterial.name}
                            onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <select
                                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-3 text-[9px] font-black outline-none"
                                value={newMaterial.riskLevel}
                                onChange={e => setNewMaterial({ ...newMaterial, riskLevel: e.target.value as any })}
                            >
                                <option value="LOW">RISQUE FAIBLE</option>
                                <option value="MEDIUM">RISQUE MOYEN</option>
                                <option value="HIGH">RISQUE ÉLEVÉ</option>
                            </select>
                            <button onClick={handleAddMaterial} className="px-4 bg-[var(--accent)] text-white rounded-lg transition-opacity hover:opacity-90"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {supplierMaterials.map(m => (
                        <div key={m.id} className="p-3.5 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between group hover:border-[var(--accent)]/30 transition-colors relative">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${m.riskLevel === 'HIGH' ? 'bg-rose-500' : m.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <div className="font-black text-[var(--text-primary)] text-[10px] uppercase tracking-wide">{m.name}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100">{m.riskLevel}</div>
                                <button
                                    onClick={() => { if (confirm("Supprimer cette matière ?")) deleteRawMaterial(m.id); }}
                                    className="p-1.5 hover:bg-rose-500 hover:text-white rounded-lg text-[var(--text-muted)] transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <XCircle className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Certificate Review Modal (Gemini Analysis Confirm) */}
            {showCertModal && pendingCert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-xl border border-[var(--border-subtle)] flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Validation IA structurelle</h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1.5 opacity-60">Vérifiez les données extraites du certificat</p>
                            </div>
                            <button onClick={() => setShowCertModal(false)} className="p-2 hover:bg-[var(--bg-main)] text-[var(--text-muted)] rounded-lg transition-colors"><XCircle className="w-6 h-6 opacity-30 hover:opacity-100 transition-opacity" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                            <div className="bg-[var(--accent)]/5 p-4 rounded-xl border border-[var(--accent)]/10 flex items-start gap-3">
                                <Sparkles className="w-4 h-4 text-[var(--accent)] mt-0.5" />
                                <div>
                                    <h4 className="font-black text-[var(--accent)] text-[9px] uppercase tracking-widest">Analyse Gemini Terminée</h4>
                                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mt-1">Le moteur IA a détecté un score de <strong className="text-[var(--text-primary)]">{pendingCert.score}%</strong>. Veuillez confirmer les dates et le scope.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Standard</label>
                                    <select
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-bold text-[11px] outline-none focus:border-[var(--accent)]"
                                        value={pendingCert.type}
                                        onChange={e => setPendingCert({ ...pendingCert, type: e.target.value as any })}
                                    >
                                        <option value="IFS">IFS Food</option>
                                        <option value="BRCGS">BRCGS Food</option>
                                        <option value="FSSC">FSSC 22000</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Version</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-bold text-[11px] outline-none focus:border-[var(--accent)]"
                                        value={pendingCert.version}
                                        onChange={e => setPendingCert({ ...pendingCert, version: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Score (%)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-bold text-[11px] text-[var(--accent)] outline-none focus:border-[var(--accent)]"
                                        value={pendingCert.score}
                                        onChange={e => setPendingCert({ ...pendingCert, score: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Grade</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-bold text-[11px] outline-none focus:border-[var(--accent)]"
                                        value={pendingCert.grade}
                                        onChange={e => setPendingCert({ ...pendingCert, grade: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Valide jusqu'au</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-2.5 font-bold text-[11px] outline-none focus:border-[var(--accent)]"
                                        value={pendingCert.validUntil ? new Date(pendingCert.validUntil).toISOString().split('T')[0] : ''}
                                        onChange={e => setPendingCert({ ...pendingCert, validUntil: new Date(e.target.value).toISOString() })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest pl-1">Scope de Certification</label>
                                <textarea
                                    className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg p-3 font-medium text-[11px] h-20 resize-none outline-none focus:border-[var(--accent)] leading-relaxed"
                                    value={pendingCert.scope}
                                    onChange={e => setPendingCert({ ...pendingCert, scope: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/50 flex justify-end gap-3">
                            <button onClick={() => setShowCertModal(false)} className="px-5 py-2.5 rounded-lg text-[var(--text-muted)] font-black text-[9px] uppercase tracking-widest hover:bg-[var(--bg-card)] transition-all">Annuler</button>
                            <button onClick={confirmCertificate} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Valider & Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
