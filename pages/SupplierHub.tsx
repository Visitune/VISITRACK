import React, { useState, useRef } from 'react';
import { Supplier, ComplianceStatus, OnboardingStep, NonConformity, Product, Document, ProductVersion, Comment, ContactPerson, Attachment } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import ComplianceBadge from '../components/ComplianceBadge';
import {
   Search, MapPin, FileText, Box, Plus, X, Globe, Building2,
   Mail, ShieldCheck, List, Clock, AlertTriangle, CheckCircle2,
   Leaf, Info, ChevronRight, Edit3, Save, Trash2, Tag, PlusCircle, ExternalLink, FileUp, Sparkles, History, Diff, ArrowLeftRight, Phone, MessageSquare, UserPlus, Filter, Trash, Landmark, Truck, Shield, HardHat, FileDown, Download, FileSpreadsheet, UploadCloud
} from 'lucide-react';
import * as XLSX from 'xlsx';

const SupplierHub: React.FC = () => {
   const {
      suppliers, addSupplier, updateSupplier,
      addCommentToSupplier, addAttachmentToSupplier, addNotification, bulkImportSuppliers
   } = useWorkspace();

   const [searchTerm, setSearchTerm] = useState('');
   const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
   const [isEditMode, setIsEditMode] = useState(false);
   const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH_RISK' | 'NON_COMPLIANT'>('ALL');
   const [activeTab, setActiveTab] = useState<'IDENTITY' | 'INDUSTRIAL' | 'GED' | 'PDM' | 'JOURNAL'>('IDENTITY');

   // Commentary State
   const [newCommentText, setNewCommentText] = useState('');
   const [commentCategory, setCommentCategory] = useState<'QUALITY' | 'PURCHASING' | 'LOGISTICS' | 'GENERAL'>('GENERAL');

   const fileInputRef = useRef<HTMLInputElement>(null);
   const excelInputRef = useRef<HTMLInputElement>(null);

   const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
         const bstr = evt.target?.result;
         const wb = XLSX.read(bstr, { type: 'binary' });
         const wsname = wb.SheetNames[0];
         const ws = wb.Sheets[wsname];
         const data = XLSX.utils.sheet_to_json(ws);

         const mapped: Supplier[] = data.map((row: any) => ({
            id: `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: row.Nom || row.Name || row.name || 'Inconnu',
            country: row.Pays || row.Country || row.country || 'FR',
            contactEmail: row.Email || row.email || '',
            siret: row.SIRET || row.siret || '',
            website: row.Web || row.website || '',
            status: 'NEW',
            onboardingStep: 'NEW',
            complianceStatus: ComplianceStatus.PENDING,
            riskScore: 50,
            documents: [],
            products: [],
            commentaries: [],
            contacts: [],
            attachments: [],
            nonConformities: [],
            industrialInfo: {
               address: row.Adresse || row.address || '',
               city: row.Ville || row.city || ''
            }
         }));

         bulkImportSuppliers(mapped);
         setIsBulkModalOpen(false);
      };
      reader.readAsBinaryString(file);
   };

   const downloadExcelTemplate = () => {
      const data = [
         {
            Nom: 'Exemple Fournisseur SAS',
            Pays: 'France',
            Email: 'qualite@exemple.fr',
            SIRET: '12345678900010',
            Web: 'https://exemple.fr',
            Adresse: '1 Rue de la Paix',
            Ville: 'Paris'
         },
         {
            Nom: 'Global Supply Ltd',
            Pays: 'UK',
            Email: 'contact@globalsupply.com',
            SIRET: '',
            Web: 'https://globalsupply.com',
            Adresse: '10 Downing Street',
            Ville: 'London'
         }
      ];

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Modèle Import");
      XLSX.writeFile(wb, "visitrack_template_import.xlsx");

      addNotification({
         title: 'Modèle téléchargé',
         message: 'Le fichier exemple est prêt.',
         type: 'SUCCESS'
      });
   };

   const filteredSuppliers = suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.country.toLowerCase().includes(searchTerm.toLowerCase());

      if (activeFilter === 'HIGH_RISK') return matchesSearch && s.riskScore > 60;
      if (activeFilter === 'NON_COMPLIANT') return matchesSearch && s.complianceStatus !== ComplianceStatus.COMPLIANT;
      return matchesSearch;
   });

   const handleAddComment = () => {
      if (!selectedSupplier || !newCommentText) return;
      addCommentToSupplier(selectedSupplier.id, {
         author: 'Admin Qualité',
         text: newCommentText,
         category: commentCategory
      });
      setNewCommentText('');
   };

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedSupplier) {
         if (file.size > 2 * 1024 * 1024) {
            addNotification({
               title: 'Fichier trop lourd',
               message: 'Pour préserver les performances du navigateur, évitez les fichiers > 2 Mo.',
               type: 'WARNING'
            });
         }

         const reader = new FileReader();
         reader.onload = (event) => {
            const base64Content = event.target?.result as string;
            addAttachmentToSupplier(selectedSupplier.id, {
               fileName: file.name,
               fileType: file.type,
               size: `${(file.size / 1024).toFixed(1)} KB`,
               content: base64Content
            });
         };
         reader.readAsDataURL(file);
      }
   };

   // UI Components
   const SectionHeader = ({ icon: Icon, title, badge }: { icon: any, title: string, badge?: string }) => (
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <Icon className="w-5 h-5 text-indigo-600" /> {title}
         </h3>
         {badge && <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{badge}</span>}
      </div>
   );

   const FormField = ({ label, value, onChange, placeholder, type = "text", readOnly = !isEditMode }: any) => (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-200">
         <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{label}</label>
         <input
            type={type}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full bg-transparent font-bold text-sm outline-none ${readOnly ? 'text-slate-900' : 'text-indigo-600 cursor-text'}`}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
         />
      </div>
   );

   return (
      <div className="space-y-6 h-full flex flex-col relative pb-10">

         {/* Header UI */}
         <div className="flex flex-col xl:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
               <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                     type="text"
                     placeholder="Dossier ou SIRET..."
                     className="w-full bg-slate-50 text-slate-900 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold shadow-inner"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  {['ALL', 'HIGH_RISK', 'NON_COMPLIANT'].map(f => (
                     <button
                        key={f}
                        onClick={() => setActiveFilter(f as any)}
                        className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeFilter === f ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400'}`}
                     >
                        {f === 'ALL' ? 'Flux Global' : f === 'HIGH_RISK' ? 'Risques' : 'Conformité'}
                     </button>
                  ))}
               </div>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setIsBulkModalOpen(true)} className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Bulk Import
               </button>
               <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 uppercase tracking-widest text-[10px] hover:bg-black transition-all">
                  <Plus className="w-5 h-5" /> Nouveau Partenaire
               </button>
            </div>
         </div>

         {/* Main List */}
         <div className="flex-1 overflow-hidden bg-white rounded-[44px] shadow-sm border border-slate-100 flex flex-col">
            <div className="overflow-y-auto flex-1 scrollbar-hide">
               <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-xl z-20">
                     <tr>
                        <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Identité Dossier</th>
                        <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Sûreté Supply</th>
                        <th className="px-8 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Conformité GED</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredSuppliers.map(s => (
                        <tr key={s.id} onClick={() => { setSelectedSupplier(s); setActiveTab('IDENTITY'); }} className="hover:bg-slate-50/50 cursor-pointer group transition-all">
                           <td className="px-10 py-7">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    {s.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-black text-slate-900 text-lg uppercase tracking-tight">{s.name}</div>
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1">
                                       <MapPin className="w-3.5 h-3.5" /> {s.country} • SIRET: {s.siret || 'Provisoire'}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-7">
                              <div className="flex items-center gap-4">
                                 <div className="flex-1 bg-slate-100 rounded-full h-2">
                                    <div className={`h-full rounded-full ${s.riskScore > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${s.riskScore}%` }} />
                                 </div>
                                 <span className="text-xs font-black text-slate-900">{s.riskScore}%</span>
                              </div>
                           </td>
                           <td className="px-8 py-7 text-center">
                              <ComplianceBadge status={s.complianceStatus} size="sm" />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* EXTREME GRANULAR SIDEBAR v6 */}
         {selectedSupplier && (
            <div className="fixed inset-0 z-50 flex justify-end">
               <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)}></div>
               <div className="relative w-[64rem] bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">

                  {/* Sidebar Header */}
                  <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-8">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-8">
                           <div className="w-20 h-20 bg-slate-900 text-white rounded-[28px] flex items-center justify-center text-4xl font-black shadow-xl">
                              {selectedSupplier.name.charAt(0)}
                           </div>
                           <div>
                              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{selectedSupplier.name}</h2>
                              <div className="flex gap-2 mt-2">
                                 <ComplianceBadge status={selectedSupplier.complianceStatus} size="sm" />
                                 <a href={selectedSupplier.website || '#'} target="_blank" className="bg-white border border-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50">
                                    <Globe className="w-3 h-3" /> {selectedSupplier.website ? 'Visiter Site' : 'Site Web non renseigné'}
                                 </a>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => setIsEditMode(!isEditMode)} className={`p-4 rounded-2xl shadow-sm flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${isEditMode ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-900'}`}>
                              {isEditMode ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                              {isEditMode ? 'Sauver' : 'Editer'}
                           </button>
                           <button onClick={() => setSelectedSupplier(null)} className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-500 shadow-sm"><X className="w-5 h-5" /></button>
                        </div>
                     </div>

                     {/* Tab Navigation */}
                     <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl self-start">
                        {[
                           { id: 'IDENTITY', label: 'Identité', icon: Building2 },
                           { id: 'INDUSTRIAL', label: 'Données Industrielles', icon: Landmark },
                           { id: 'GED', label: 'GED & OneDrive', icon: FileUp },
                           { id: 'PDM', label: 'Catalogue PDM', icon: Box },
                           { id: 'JOURNAL', label: 'Journal & CRM', icon: MessageSquare },
                        ].map(tab => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                              <tab.icon className="w-4 h-4" /> {tab.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide p-10 bg-slate-50/20">

                     {/* TAB: IDENTITY */}
                     {activeTab === 'IDENTITY' && (
                        <div className="space-y-10 animate-fade-in">
                           <section>
                              <SectionHeader icon={Building2} title="Structure Légale & Siège" />
                              <div className="grid grid-cols-2 gap-4">
                                 <FormField label="Dénomination" value={selectedSupplier.name} onChange={(v: string) => updateSupplier(selectedSupplier.id, { name: v })} />
                                 <FormField label="SIRET" value={selectedSupplier.siret} onChange={(v: string) => updateSupplier(selectedSupplier.id, { siret: v })} />
                                 <FormField label="Site Web Official" value={selectedSupplier.website} placeholder="https://..." onChange={(v: string) => updateSupplier(selectedSupplier.id, { website: v })} />
                                 <FormField label="Email Central" value={selectedSupplier.contactEmail} onChange={(v: string) => updateSupplier(selectedSupplier.id, { contactEmail: v })} />
                                 <FormField label="LinkedIn / Réseaux" value={selectedSupplier.industrialInfo?.socialLink} placeholder="linkedin.com/company/..." onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, socialLink: v } })} />
                              </div>
                           </section>
                           <section>
                              <SectionHeader icon={Shield} title="Certifications d'Usine" />
                              <div className="flex flex-wrap gap-2 mb-4">
                                 {selectedSupplier.industrialInfo?.factoryCertifications?.map(cert => (
                                    <span key={cert} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                       <ShieldCheck className="w-3.5 h-3.5" /> {cert}
                                       {isEditMode && <button className="hover:text-rose-500"><X className="w-3 h-3" /></button>}
                                    </span>
                                 ))}
                                 {isEditMode && (
                                    <button onClick={() => {
                                       const c = prompt("Nom de la certification (ISO 22000, FSSC, etc.) :");
                                       if (c) {
                                          const certs = [...(selectedSupplier.industrialInfo?.factoryCertifications || []), c];
                                          updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, factoryCertifications: certs } });
                                          setSelectedSupplier({ ...selectedSupplier, industrialInfo: { ...selectedSupplier.industrialInfo, factoryCertifications: certs } });
                                       }
                                    }} className="px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all">
                                       + Ajouter Certification
                                    </button>
                                 )}
                              </div>
                           </section>
                           <section>
                              <SectionHeader icon={UserPlus} title="Contacts Tiers" badge={`${selectedSupplier.contacts?.length || 0} référencé(s)`} />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {selectedSupplier.contacts?.map(c => (
                                    <div key={c.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex justify-between items-start">
                                       <div>
                                          <p className="font-black text-slate-900 text-sm">{c.name}</p>
                                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">{c.role}</p>
                                          <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold">
                                             <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {c.email}</span>
                                             {c.phone && <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {c.phone}</span>}
                                          </div>
                                       </div>
                                       {isEditMode && <button className="text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                 ))}
                                 <button className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                                    <UserPlus className="w-6 h-6 mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Nouveau Contact</span>
                                 </button>
                              </div>
                           </section>
                        </div>
                     )}

                     {/* TAB: INDUSTRIAL */}
                     {activeTab === 'INDUSTRIAL' && (
                        <div className="space-y-10 animate-fade-in">
                           <section>
                              <SectionHeader icon={Landmark} title="Données Fiscales & Bancaires" />
                              <div className="grid grid-cols-2 gap-4">
                                 <FormField label="Numéro TVA Intracom." value={selectedSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, vatNumber: v } })} />
                                 <FormField label="IBAN (Paiement)" value={selectedSupplier.industrialInfo?.bankIban} placeholder="FR76..." onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, bankIban: v } })} />
                                 <FormField label="Code BIC" value={selectedSupplier.industrialInfo?.bankBic} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, bankBic: v } })} />
                                 <FormField label="DUNS Number" value={selectedSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, dunsNumber: v } })} />
                              </div>
                           </section>
                           <section>
                              <SectionHeader icon={Truck} title="Logistique & Site de Production" />
                              <div className="grid grid-cols-2 gap-4">
                                 <FormField label="Adresse du Site" value={selectedSupplier.industrialInfo?.address} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, address: v } })} />
                                 <FormField label="Code Postal" value={selectedSupplier.industrialInfo?.zipCode} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, zipCode: v } })} />
                                 <FormField label="Ville" value={selectedSupplier.industrialInfo?.city} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, city: v } })} />
                                 <FormField label="Chiffre d'Affaire Annuel" value={selectedSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M€" onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, annualRevenue: v } })} />
                              </div>
                           </section>
                        </div>
                     )}

                     {/* TAB: GED */}
                     {activeTab === 'GED' && (
                        <div className="space-y-8 animate-fade-in">
                           <div className="bg-indigo-600 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden">
                              <Sparkles className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
                              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                 <div className="max-w-md">
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Cloud Drive Intégré</h3>
                                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">Centralisez tous les fichiers bruts (PDF, Tableaux, Photos d'Usine) qui ne sont pas des certificats de conformité classiques.</p>
                                 </div>
                                 <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                                    Uploader un fichier
                                 </button>
                                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 gap-4">
                              <SectionHeader icon={FileText} title="Fichiers Archivés" badge={`${selectedSupplier.attachments?.length || 0} fichier(s)`} />
                              {selectedSupplier.attachments?.map(a => (
                                 <div key={a.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:border-indigo-200 transition-all group">
                                    <div className="flex items-center gap-6">
                                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                          <FileText className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <p className="font-black text-slate-900 text-sm">{a.fileName}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.fileType} • {a.size} • Le {new Date(a.uploadDate).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-2">
                                       <button
                                          onClick={() => {
                                             if (a.content) {
                                                const link = document.createElement('a');
                                                link.href = a.content;
                                                link.download = a.fileName;
                                                link.click();
                                             } else {
                                                alert("Ce fichier est un placeholder sans contenu physique.");
                                             }
                                          }}
                                          className="p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100"
                                       >
                                          <Download className="w-5 h-5" />
                                       </button>
                                       <button className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                 </div>
                              ))}
                              {(!selectedSupplier.attachments || selectedSupplier.attachments.length === 0) && (
                                 <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                                    <FileUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Glissez un fichier pour le synchroniser</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* TAB: PDM & JOURNAL (Keep existing logic but styled) */}
                     {activeTab === 'PDM' && (
                        <div className="space-y-8 animate-fade-in">
                           <SectionHeader icon={Box} title="Gestion de Version Spécifications" />
                           {selectedSupplier.products.map(p => (
                              <div key={p.id} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm">
                                 <div className="flex justify-between items-center mb-6">
                                    <div>
                                       <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter">{p.name}</h4>
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category} | {p.origin}</p>
                                    </div>
                                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Voir Historique</button>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {p.ingredients?.map(i => <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold rounded-lg text-slate-600">{i}</span>)}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {activeTab === 'JOURNAL' && (
                        <div className="space-y-8 animate-fade-in pb-10">
                           <SectionHeader icon={MessageSquare} title="CRM Technique & Notes d'Audit" />
                           <div className="space-y-4">
                              <textarea
                                 placeholder="Notez ici les remarques de l'audit usine ou les échanges téléphoniques..."
                                 className="w-full h-32 bg-white border border-slate-200 rounded-[32px] p-8 text-sm font-medium outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                 value={newCommentText}
                                 onChange={e => setNewCommentText(e.target.value)}
                              />
                              <div className="flex justify-between items-center">
                                 <div className="flex gap-2">
                                    {['GENERAL', 'QUALITY', 'LOGISTICS'].map(cat => (
                                       <button key={cat} onClick={() => setCommentCategory(cat as any)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${commentCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border text-slate-400'}`}>{cat}</button>
                                    ))}
                                 </div>
                                 <button onClick={handleAddComment} disabled={!newCommentText} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-30">Publier au Journal</button>
                              </div>
                           </div>

                           <div className="space-y-6 pt-6">
                              {selectedSupplier.commentaries?.map(c => (
                                 <div key={c.id} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative group">
                                    <div className="flex justify-between items-center mb-4">
                                       <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${c.category === 'QUALITY' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{c.category}</span>
                                       <span className="text-[10px] font-bold text-slate-300">{new Date(c.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{c.text}</p>
                                    <div className="mt-6 flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px]">AD</div>
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.author}</span>
                                       </div>
                                       <button className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         {/* Add Supplier Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-fade-in">
               <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl p-12 border border-slate-100 relative">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">Identité Partenaire</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-12">Initialisation d'un nouveau dossier fournisseur enterprise.</p>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const name = formData.get('name') as string;
                     const country = formData.get('country') as string;
                     const contactEmail = formData.get('email') as string;
                     if (!name || !country || !contactEmail) return;
                     const newSup: Supplier = {
                        id: `SUP-${Date.now()}`,
                        name,
                        country,
                        contactEmail,
                        status: 'NEW',
                        onboardingStep: 'NEW',
                        complianceStatus: ComplianceStatus.PENDING,
                        riskScore: 50,
                        documents: [],
                        products: [],
                        commentaries: [],
                        contacts: [],
                        attachments: [],
                        nonConformities: []
                     };
                     addSupplier(newSup);
                     setIsModalOpen(false);
                  }} className="space-y-6">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nom de l'entité</label>
                           <input name="name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 font-bold outline-none ring-offset-4 focus:ring-4 focus:ring-slate-900/5 transition-all" placeholder="Ex: BioLuce SARL..." />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Pays / Région</label>
                           <input name="country" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 font-bold outline-none" placeholder="Ex: France..." />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email de contact principal</label>
                        <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 font-bold outline-none" placeholder="qualite@partenaire.com" />
                     </div>
                     <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-black transition-all mt-6">
                        Créer le Dossier
                     </button>
                  </form>
               </div>
            </div>
         )}
         {/* Bulk Import Modal */}
         {isBulkModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4 animate-fade-in">
               <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl p-12 border border-slate-100 relative">
                  <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-10 right-10 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <FileSpreadsheet className="w-8 h-8" />
                     </div>
                     <h3 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Import Excel/CSV</h3>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-8">Téléchargez votre liste de fournisseurs pour un onboarding massif.</p>

                  <div className="bg-slate-50 rounded-[32px] p-8 mb-8 border border-slate-100 flex justify-between items-center">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Format attendu (Colonnes)</h4>
                        <p className="font-bold text-xs text-slate-600 mb-2 italic">Nom, Pays, Email, SIRET, Web, Adresse, Ville</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Les colonnes sont détectées automatiquement.</p>
                     </div>
                     <button onClick={downloadExcelTemplate} className="shrink-0 flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all">
                        <FileDown className="w-4 h-4" /> Télécharger Modèle
                     </button>
                  </div>

                  <div className="space-y-4">
                     <button
                        onClick={() => excelInputRef.current?.click()}
                        className="w-full py-10 border-4 border-dashed border-slate-100 rounded-[40px] flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all group"
                     >
                        <UploadCloud className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Parcourir ou Glisser le fichier</span>
                        <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SupplierHub;