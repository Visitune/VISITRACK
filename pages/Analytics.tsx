import React, { useState } from 'react';
import { ComplianceStatus } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { FileText, Download, CheckCircle, AlertTriangle, Loader2, BarChart3, Calendar, Leaf, ShieldAlert } from 'lucide-react';
import ComplianceBadge from '../components/ComplianceBadge';

const Analytics: React.FC = () => {
   const { suppliers } = useWorkspace();
   const [generatingId, setGeneratingId] = useState<string | null>(null);

   const handleGenerateReport = (id: string) => {
      setGeneratingId(id);
      // Simulate generation delay
      setTimeout(() => {
         setGeneratingId(null);
         alert("Rapport d'audit VISITrack généré avec succès !");
      }, 2000);
   };

   const getComplianceGrade = (score: number) => {
      if (score <= 20) return { grade: 'A', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
      if (score <= 50) return { grade: 'B', color: 'text-blue-500 bg-blue-50 border-blue-100' };
      if (score <= 80) return { grade: 'C', color: 'text-amber-500 bg-amber-50 border-amber-100' };
      return { grade: 'D', color: 'text-red-500 bg-red-50 border-red-100' };
   };

   return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
         <div className="flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Intelligence & Rapports</h2>
               <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] mt-1">Dossiers de conformité IFS / BRC / CSRD</p>
            </div>
            <div className="flex gap-3">
               <div className="bg-[var(--bg-card)] px-4 py-2 rounded-lg border border-[var(--border-subtle)] shadow-sm flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                  FY 2024
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[var(--accent)] to-[#C9681F] rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="text-white/70 text-[8px] font-black uppercase tracking-[0.15em] mb-2">Taux de Maîtrise</div>
                  <div className="text-3xl font-black">{suppliers.length > 0 ? Math.round((suppliers.filter(s => s.complianceStatus === 'COMPLIANT').length / suppliers.length) * 100) : 0}%</div>
                  <div className="mt-4 text-[8px] font-bold text-white/90 flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md w-fit backdrop-blur-sm uppercase tracking-widest">
                     <CheckCircle className="w-3 h-3" /> Objectif 85% atteint
                  </div>
               </div>
               <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                  <ShieldAlert className="w-32 h-32" />
               </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.2em] mb-2">Score RSE Moyen</div>
                  <div className="text-2xl font-black text-[var(--accent)]">
                     {Math.round(suppliers.reduce((acc, s) => acc + (s.esgScore || 0), 0) / (suppliers.length || 1))}%
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Niveau Satisfaisant</span>
               </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.2em] mb-2">NC en cours (CAPA)</div>
                  <div className="text-2xl font-black text-rose-500">
                     {suppliers.reduce((acc, s) => acc + s.nonConformities.filter(nc => nc.status !== 'RESOLVED').length, 0)}
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Traitement Impératif</span>
               </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-[var(--text-muted)] text-[8px] font-black uppercase tracking-[0.2em] mb-2">GED Intégrité</div>
                  <div className="text-2xl font-black text-[var(--text-primary)]">
                     {suppliers.reduce((acc, s) => acc + s.documents.length, 0)}
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-emerald-500">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Documents Archivés</span>
               </div>
            </div>
         </div>

         <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-main)]/30">
               <h3 className="font-black text-[var(--text-primary)] flex items-center gap-3 uppercase tracking-widest text-[10px]">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--accent)]" />
                  Performance Analytique
               </h3>
               <button className="text-[9px] font-black text-[var(--accent)] hover:text-[var(--accent-hover)] uppercase tracking-widest bg-[var(--accent-subtle)] px-4 py-2 rounded-lg border border-[var(--accent)]/10 transition-colors">Exporter Audit Pack (ZIP)</button>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full text-left">
                  <thead>
                     <tr className="bg-[var(--bg-main)]/50">
                        <th className="px-8 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">Fournisseur</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center font-mono">Score</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center font-mono">Statut</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">RSE</th>
                        <th className="px-6 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">Anomalies</th>
                        <th className="px-8 py-4 text-right text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {suppliers.map(s => {
                        const { grade, color } = getComplianceGrade(s.riskScore);
                        const ncCount = s.nonConformities.filter(nc => nc.status !== 'RESOLVED').length;
                        return (
                           <tr key={s.id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">{s.name}</div>
                                 <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-tight">{s.country}</div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-base border mx-auto ${color} shadow-sm group-hover:scale-105 transition-transform`}>
                                    {grade}
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                 <ComplianceBadge status={s.complianceStatus} size="sm" />
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-[var(--bg-main)] h-1 rounded-full overflow-hidden max-w-[60px]">
                                       <div className="bg-[var(--accent)] h-full" style={{ width: `${s.esgScore || 0}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--accent)]">{s.esgScore || 0}%</span>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 {ncCount > 0 ? (
                                    <span className="flex items-center gap-2 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                                       <AlertTriangle className="w-3 h-3" /> {ncCount} NC
                                    </span>
                                 ) : (
                                    <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                       <CheckCircle className="w-3 h-3" /> RAS
                                    </span>
                                 )}
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <button
                                    onClick={() => handleGenerateReport(s.id)}
                                    disabled={generatingId === s.id}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-main)] text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                 >
                                    {generatingId === s.id ? (
                                       <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> ...
                                       </>
                                    ) : (
                                       <>
                                          <Download className="w-3.5 h-3.5" /> PDF
                                       </>
                                    )}
                                 </button>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default Analytics;