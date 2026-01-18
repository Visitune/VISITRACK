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
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence & Rapports</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-1">Dossiers de conformité IFS / BRC / CSRD</p>
            </div>
            <div className="flex gap-3">
               <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 text-xs font-black text-slate-600 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  FY 2024
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Taux de Maîtrise</div>
                  <div className="text-5xl font-black">{suppliers.length > 0 ? Math.round((suppliers.filter(s => s.complianceStatus === ComplianceStatus.COMPLIANT).length / suppliers.length) * 100) : 0}%</div>
                  <div className="mt-6 text-[10px] font-bold text-white/80 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg w-fit">
                     <CheckCircle className="w-3.5 h-3.5" /> Objectif 85% atteint
                  </div>
               </div>
               <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                  <ShieldAlert className="w-48 h-48" />
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Score RSE Moyen</div>
                  <div className="text-4xl font-black text-indigo-600">
                     {Math.round(suppliers.reduce((acc, s) => acc + (s.esgScore || 0), 0) / (suppliers.length || 1))}%
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau Satisfaisant</span>
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">NC en cours (CAPA)</div>
                  <div className="text-4xl font-black text-rose-500">
                     {suppliers.reduce((acc, s) => acc + s.nonConformities.filter(nc => nc.status !== 'RESOLVED').length, 0)}
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traitement Impératif</span>
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
               <div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">GED Intégrité</div>
                  <div className="text-4xl font-black text-slate-900">
                     {suppliers.reduce((acc, s) => acc + s.documents.length, 0)}
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-2 text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Documents Archivés</span>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
               <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-sm">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Performance Analytique
               </h3>
               <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">Exporter Audit Pack (ZIP)</button>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                     <tr>
                        <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Score</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">RSE</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomalies</th>
                        <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {suppliers.map(s => {
                        const { grade, color } = getComplianceGrade(s.riskScore);
                        const ncCount = s.nonConformities.filter(nc => nc.status !== 'RESOLVED').length;
                        return (
                           <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-10 py-6">
                                 <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{s.country}</div>
                              </td>
                              <td className="px-6 py-6">
                                 <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black text-xl border mx-auto ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                                    {grade}
                                 </div>
                              </td>
                              <td className="px-6 py-6 text-center">
                                 <ComplianceBadge status={s.complianceStatus} size="sm" />
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[60px]">
                                       <div className="bg-indigo-500 h-full" style={{ width: `${s.esgScore || 0}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-500">{s.esgScore || 0}%</span>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 {ncCount > 0 ? (
                                    <span className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase">
                                       <AlertTriangle className="w-3.5 h-3.5" /> {ncCount} NC
                                    </span>
                                 ) : (
                                    <span className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-2">
                                       <CheckCircle className="w-3.5 h-3.5" /> RAS
                                    </span>
                                 )}
                              </td>
                              <td className="px-10 py-6 text-right">
                                 <button
                                    onClick={() => handleGenerateReport(s.id)}
                                    disabled={generatingId === s.id}
                                    className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-200"
                                 >
                                    {generatingId === s.id ? (
                                       <>
                                          <Loader2 className="w-4 h-4 animate-spin" /> Génération...
                                       </>
                                    ) : (
                                       <>
                                          <Download className="w-4 h-4" /> Rapport PDF
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