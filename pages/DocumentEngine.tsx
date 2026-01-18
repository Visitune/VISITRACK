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
      <div className="h-full flex flex-col gap-8 animate-fade-in relative pb-10">
         <div className="flex justify-between items-center bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[24px] text-white flex items-center justify-center shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
                  <ScanSearch className="w-8 h-8" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Document Intelligence</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
                     <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Analyse Multimodale • Automatisation CAPA
                  </p>
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={handleLoadSample} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100">
                  <History className="w-4 h-4 inline mr-2" /> Sample Historique
               </button>
            </div>
         </div>

         <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
            {/* LEFT: Input Source */}
            <div className="flex flex-col gap-4 h-full">
               <div className="bg-white rounded-[40px] shadow-sm border border-slate-50 flex flex-col h-full overflow-hidden shadow-indigo-900/[0.02]">
                  <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                     <span className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> Flux Documentaire
                     </span>
                     <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all"
                     >
                        <option value="CERTIFICATE">Certificat (IFS/BRC)</option>
                        <option value="AUDIT">Rapport d'Audit</option>
                        <option value="INSURANCE">RC Exploitation</option>
                        <option value="TECHNICAL">Fiche Technique</option>
                     </select>
                  </div>
                  <textarea
                     className="flex-1 w-full p-8 text-sm font-bold text-slate-600 bg-white focus:outline-none resize-none leading-relaxed placeholder:text-slate-200"
                     placeholder="Collez ici le résultat de l'OCR ou le contenu texte du document..."
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="p-8 bg-slate-50 border-t border-slate-100">
                     <button
                        onClick={handleAnalyze}
                        disabled={!inputText || isAnalyzing}
                        className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-3xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/20 uppercase tracking-widest text-xs"
                     >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                        Identifier & Analyser par IA
                     </button>
                  </div>
               </div>
            </div>

            {/* RIGHT: Analysis Results */}
            <div className="flex flex-col h-full">
               {!result ? (
                  <div className="h-full bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                     <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center mb-8 shadow-inner">
                        <ScanSearch className="w-12 h-12 opacity-10" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Intelligence Ready</h3>
                     <p className="max-w-xs mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">Les métadonnées extraites et l'automatisme de conformité apparaîtront ici.</p>
                  </div>
               ) : (
                  <div className="h-full bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-900/5 flex flex-col overflow-hidden animate-slide-up">
                     <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Diagnostic IA structurel</p>
                              <div className="flex items-center gap-3">
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Analyse Complète</h3>
                                 <span className="bg-white text-indigo-600 text-[10px] px-3 py-1.5 rounded-xl font-black border border-indigo-100 shadow-sm uppercase tracking-widest">
                                    {(result.confidence * 100).toFixed(0)}% Fiabilité
                                 </span>
                              </div>
                           </div>
                           <ComplianceBadge status={result.suggestedStatus} size="md" />
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* Contextual Risk */}
                        <div className={`p-6 rounded-[32px] border-2 shadow-sm ${result.suggestedStatus === ComplianceStatus.COMPLIANT
                              ? 'bg-emerald-50 border-emerald-100'
                              : 'bg-rose-50 border-rose-100 animate-pulse'
                           }`}>
                           <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'bg-white text-emerald-600' : 'bg-white text-rose-500'
                                 }`}>
                                 {result.suggestedStatus === ComplianceStatus.COMPLIANT
                                    ? <CheckCircle className="w-6 h-6" />
                                    : <ShieldAlert className="w-6 h-6 shadow-rose-200" />}
                              </div>
                              <div className="flex-1">
                                 <h4 className={`font-black text-xs uppercase tracking-widest ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'text-emerald-800' : 'text-rose-800'
                                    }`}>Verdict de Conformité</h4>
                                 <p className={`text-sm mt-2 font-bold leading-relaxed ${result.suggestedStatus === ComplianceStatus.COMPLIANT ? 'text-emerald-700' : 'text-rose-700'
                                    }`}>{result.riskAssessment}</p>
                              </div>
                           </div>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-100 group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 group-hover:text-indigo-400 transition-colors">Échéance détectée</label>
                              <div className="font-black text-slate-900 text-xl tracking-tight">{result.extractedDate || 'INDÉTERMINÉE'}</div>
                              <div className="flex gap-1 mt-4">
                                 {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 6 ? 'bg-indigo-400' : 'bg-white border border-slate-100'}`} />
                                 ))}
                              </div>
                           </div>
                           <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm ring-1 ring-slate-100 group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 group-hover:text-indigo-400 transition-colors">Organisme Tier-C</label>
                              <div className="font-black text-slate-900 text-xl tracking-tight truncate uppercase" title={result.issuer}>{result.issuer || 'NON IDENTIFIÉ'}</div>
                              <div className="flex gap-1 mt-4">
                                 {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 7 ? 'bg-indigo-400' : 'bg-white border border-slate-100'}`} />
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Supplier Linking with Alert context */}
                        <div className="bg-indigo-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden ring-4 ring-indigo-50">
                           <div className="absolute top-0 right-0 p-8 opacity-5"><Save className="w-24 h-24" /></div>
                           <label className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4 block">Validation & Archivage</label>
                           <div className="space-y-4">
                              <select
                                 className="w-full bg-white/10 border border-white/20 text-white text-sm font-black rounded-2xl px-5 py-4 focus:bg-white focus:text-slate-900 focus:outline-none transition-all appearance-none"
                                 value={selectedSupplierId}
                                 onChange={(e) => setSelectedSupplierId(e.target.value)}
                              >
                                 <option value="" className="text-slate-400">Choisir le fournisseur cible...</option>
                                 {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                              <button
                                 onClick={handleSave}
                                 disabled={!selectedSupplierId}
                                 className="w-full bg-white hover:bg-indigo-50 text-indigo-900 py-5 rounded-[24px] font-black shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[10px]"
                              >
                                 <FileCheck className="w-5 h-5 shadow-inner" /> Enregistrer & Générer CAPA
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