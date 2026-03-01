import React, { useState } from 'react';
import { analyzeDocumentCompliance } from '../services/geminiService';
import { AIAnalysisResult, ComplianceStatus, Document, NonConformity } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { Sparkles, CheckCircle, AlertTriangle, Loader2, Save, FileText, ArrowRight, Eye, ScanSearch, FileCheck, ShieldAlert, History } from 'lucide-react';
import ComplianceBadge from '../components/ComplianceBadge';

const DocumentEngine: React.FC = () => {
   const { suppliers, settings, addDocumentToSupplier, addNonConformity } = useWorkspace();
   const [docType, setDocType] = useState('CERTIFICATE');
   const [inputText, setInputText] = useState('');
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [result, setResult] = useState<AIAnalysisResult | null>(null);
   const [selectedSupplierId, setSelectedSupplierId] = useState('');
   const [comments, setComments] = useState('');

   // Example Loader
   const handleLoadSample = () => {
      setInputText(`CERTIFICAT IFS FOOD V7 - EXPIRE
Certificat N°: IFS-2023-0012
Organisme: Bureau Veritas Certification
Date d'audit: 12/01/2023

Détenteur:
GROUPE AGRO-INDUSTRIE DU NORD
59000 Lille, France

Note: Ce document est périmé depuis le 28/02/2024.`);
   };

   const handleAnalyze = async () => {
      if (!inputText) return;
      setIsAnalyzing(true);
      setResult(null);
      try {
         const analysis = await analyzeDocumentCompliance(inputText, docType, settings.geminiApiKey);
         setResult(analysis);
      } catch (error: any) {
         alert(error.message || "Erreur analyse IA");
      } finally {
         setIsAnalyzing(false);
      }
   };

   const handleSave = () => {
      if (!result || !selectedSupplierId) return;

      const newDoc: Document = {
         id: `DOC-${Date.now()}`,
         name: `${docType} - ${result.issuer || 'Auto'}`,
         type: docType,
         expiryDate: result.extractedDate,
         status: result.suggestedStatus,
         issuer: result.issuer,
         comments: comments,
         confidenceScore: result.confidence
      };

      addDocumentToSupplier(selectedSupplierId, newDoc);

      // Auto-trigger Non-Conformity if status is negative
      if (result.suggestedStatus === ComplianceStatus.REJECTED || result.suggestedStatus === ComplianceStatus.EXPIRED) {
         const nc: NonConformity = {
            id: `NC-${Date.now()}`,
            title: `Alerte Documentaire: ${docType}`,
            description: `Détection automatique d'une non-conformité sur le document "${newDoc.name}". Analyse IA: ${result.riskAssessment}`,
            severity: result.suggestedStatus === ComplianceStatus.REJECTED ? 'CRITICAL' : 'HIGH',
            status: 'OPEN',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
            createdAt: new Date().toISOString().split('T')[0]
         };
         addNonConformity(selectedSupplierId, nc);
      }

      // Reset
      setResult(null);
      setInputText('');
      setComments('');
      setSelectedSupplierId('');
      alert("Document enregistré ! Une non-conformité a été créée automatiquement si nécessaire.");
   };

   return (
      <div className="h-full flex flex-col gap-6 animate-fade-in relative pb-10">
         <div className="flex justify-between items-center bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-subtle)]">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent)] to-[#C9681F] rounded-xl text-white flex items-center justify-center shadow-lg shadow-[var(--accent)]/10">
                  <ScanSearch className="w-7 h-7" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">AI Document Intelligence</h2>
                  <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[9px] mt-1 flex items-center gap-2">
                     <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Analyse Multimodale • Automatisation CAPA
                  </p>
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={handleLoadSample} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-subtle)] hover:opacity-80 rounded-lg transition-all border border-[var(--accent)]/10">
                  <History className="w-3.5 h-3.5 inline mr-1.5" /> Sample Historique
               </button>
            </div>
         </div>

         <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
            {/* LEFT: Input Source */}
            <div className="flex flex-col gap-4 h-full">
               <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] flex flex-col h-full overflow-hidden">
                  <div className="bg-[var(--bg-main)]/30 px-6 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
                     <span className="font-black text-[var(--text-primary)] text-[9px] uppercase tracking-[0.15em] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--accent)]" /> Flux Documentaire
                     </span>
                     <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 outline-none shadow-sm focus:border-[var(--accent)] transition-all"
                     >
                        <option value="CERTIFICATE">Certificat (IFS/BRC)</option>
                        <option value="AUDIT">Rapport d'Audit</option>
                        <option value="INSURANCE">RC Exploitation</option>
                        <option value="TECHNICAL">Fiche Technique</option>
                     </select>
                  </div>
                  <textarea
                     className="flex-1 w-full p-6 text-sm font-medium text-[var(--text-primary)] bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-[var(--text-muted)] opacity-80"
                     placeholder="Collez ici le résultat de l'OCR ou le contenu texte du document..."
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="p-6 bg-[var(--bg-main)]/50 border-t border-[var(--border-subtle)]">
                     <button
                        onClick={handleAnalyze}
                        disabled={!inputText || isAnalyzing}
                        className="w-full py-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[var(--accent)]/10 uppercase tracking-widest text-[10px]"
                     >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Identifier & Analyser par IA
                     </button>
                  </div>
               </div>
            </div>

            {/* RIGHT: Analysis Results */}
            <div className="flex flex-col h-full">
               {!result ? (
                  <div className="h-full bg-[var(--bg-card)] rounded-2xl border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center text-[var(--text-muted)] p-10 text-center">
                     <div className="w-24 h-24 bg-[var(--bg-main)] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <ScanSearch className="w-10 h-10 opacity-20" />
                     </div>
                     <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Intelligence Ready</h3>
                     <p className="max-w-xs mt-2 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-loose opacity-60">Les métadonnées extraites et l'automatisme de conformité apparaîtront ici.</p>
                  </div>
               ) : (
                  <div className="h-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-xl flex flex-col overflow-hidden animate-slide-up">
                     <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">Diagnostic IA structurel</p>
                              <div className="flex items-center gap-3">
                                 <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Analyse Complète</h3>
                                 <span className="bg-[var(--bg-card)] text-[var(--accent)] text-[9px] px-2.5 py-1 rounded-lg font-black border border-[var(--accent)]/10 shadow-sm uppercase tracking-widest">
                                    {(result.confidence * 100).toFixed(0)}% Fiabilité
                                 </span>
                              </div>
                           </div>
                           <ComplianceBadge status={result.suggestedStatus} size="md" />
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                        {/* Contextual Risk */}
                        <div className={`p-5 rounded-xl border shadow-sm ${result.suggestedStatus === ComplianceStatus.COMPLIANT
                           ? 'bg-emerald-500/5 border-emerald-500/20'
                           : 'bg-rose-500/5 border-rose-500/20 animate-pulse'
                           }`}>
                           <div className="flex gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'bg-white text-emerald-600' : 'bg-white text-rose-500'
                                 }`}>
                                 {result.suggestedStatus === ComplianceStatus.COMPLIANT
                                    ? <CheckCircle className="w-5 h-5" />
                                    : <ShieldAlert className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                 <h4 className={`font-black text-[10px] uppercase tracking-widest ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'text-emerald-700' : 'text-rose-700'
                                    }`}>Verdict de Conformité</h4>
                                 <p className={`text-xs mt-1.5 font-bold leading-relaxed ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>{result.riskAssessment}</p>
                              </div>
                           </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-subtle)] group">
                              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2 group-hover:text-[var(--accent)] transition-colors">Échéance détectée</label>
                              <div className="font-black text-[var(--text-primary)] text-lg tracking-tight">{result.extractedDate || 'INDÉTERMINÉE'}</div>
                              <div className="flex gap-1 mt-3">
                                 {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className={`flex-1 h-1 rounded-full ${i <= 4 ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]/30'}`} />
                                 ))}
                              </div>
                           </div>
                           <div className="p-5 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-subtle)] group">
                              <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-2 group-hover:text-[var(--accent)] transition-colors">Organisme Tier-C</label>
                              <div className="font-black text-[var(--text-primary)] text-lg tracking-tight truncate uppercase" title={result.issuer}>{result.issuer || 'NON IDENTIFIÉ'}</div>
                              <div className="flex gap-1 mt-3">
                                 {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className={`flex-1 h-1 rounded-full ${i <= 5 ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]/30'}`} />
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Supplier Linking with Alert context */}
                        <div className="bg-[var(--text-primary)] p-6 rounded-2xl text-[var(--bg-card)] shadow-xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-5"><Save className="w-16 h-16" /></div>
                           <label className="text-[9px] font-black text-[var(--bg-main)]/50 uppercase tracking-[0.15em] mb-4 block">Validation & Archivage</label>
                           <div className="space-y-4">
                              <select
                                 className="w-full bg-[var(--bg-main)]/20 border border-white/10 text-[var(--bg-card)] text-xs font-bold rounded-xl px-4 py-3.5 focus:bg-white focus:outline-none transition-all appearance-none"
                                 value={selectedSupplierId}
                                 onChange={(e) => setSelectedSupplierId(e.target.value)}
                              >
                                 <option value="" className="text-[var(--text-muted)]">Choisir le fournisseur cible...</option>
                                 {suppliers.map(s => <option key={s.id} value={s.id} className="text-[var(--text-primary)]">{s.name}</option>)}
                              </select>
                              <button
                                 onClick={handleSave}
                                 disabled={!selectedSupplierId}
                                 className="w-full bg-white hover:bg-opacity-95 text-[var(--text-primary)] py-4 rounded-xl font-black shadow-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[10px]"
                              >
                                 <FileCheck className="w-4 h-4" /> Enregistrer & Générer CAPA
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default DocumentEngine;