import React, { useState, useRef } from 'react';
import { Supplier, ComplianceStatus, OnboardingStep, NonConformity, Product, Document, ProductVersion, Comment, ContactPerson, Attachment } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import ComplianceBadge from '../components/ComplianceBadge';
import { GFSIApprovalTab } from '../components/GFSIApprovalTab';
import { SupplierGEDTab } from '../components/SupplierGEDTab';
import {
   Search, MapPin, Plus, X, Globe, Building2,
   ShieldCheck, Activity, ChevronRight, Edit3, Save, Trash2,
   UserPlus, Filter, Landmark, FileSpreadsheet, UploadCloud,
   MoreHorizontal, FileDown, CheckCircle, FolderClosed,
   LayoutGrid, Factory, History, Share2, Contact, Users
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
   const [activeTab, setActiveTab] = useState<'IDENTITY' | 'INDUSTRIAL' | 'GFSI' | 'GED' | 'PDM' | 'JOURNAL'>('IDENTITY');

   const [newCommentText, setNewCommentText] = useState('');
   const [commentCategory, setCommentCategory] = useState<'QUALITY' | 'PURCHASING' | 'LOGISTICS' | 'GENERAL'>('GENERAL');
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
         { Nom: 'Exemple Fournisseur SAS', Pays: 'France', Email: 'qualite@exemple.fr', SIRET: '12345678900010', Web: 'https://exemple.fr', Adresse: '1 Rue de la Paix', Ville: 'Paris' },
         { Nom: 'Global Supply Ltd', Pays: 'UK', Email: 'contact@globalsupply.com', SIRET: '', Web: 'https://globalsupply.com', Adresse: '10 Downing Street', Ville: 'London' }
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Modele Import");
      XLSX.writeFile(wb, "visitrack_template_import.xlsx");
      addNotification({ title: 'Modele telecharge', message: 'Le fichier exemple est pret.', type: 'SUCCESS' });
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
         author: 'Admin Qualite',
         text: newCommentText,
         category: commentCategory
      });
      setNewCommentText('');
   };

   const SectionHeader = ({ icon: Icon, title, badge }: { icon: any, title: string, badge?: string }) => (
      <div className="flex justify-between items-center mb-6">
         <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
               <Icon className="w-4 h-4 text-[var(--accent)]" />
            </div>
            {title}
         </h3>
         {badge && <span className="bg-[var(--accent)] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">{badge}</span>}
      </div>
   );

   const FormField = ({ label, value, onChange, placeholder, type = "text", readOnly = !isEditMode }: any) => (
      <div className={`p-4 rounded-xl border transition-all duration-300 animate-focus-glow ${!readOnly
         ? 'bg-[var(--bg-card)] border-[var(--accent)]/30 ring-2 ring-[var(--accent)]/5 shadow-lg shadow-indigo-500/5'
         : 'bg-[var(--bg-main)]/30 border-[var(--border-subtle)]'
         } focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10`}>
         <label className={`text-[9px] font-bold uppercase block mb-1 transition-colors ${!readOnly ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
            {label}
         </label>
         <input
            type={type}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full bg-transparent font-semibold text-sm outline-none transition-colors ${readOnly ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] cursor-text'}`}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
         />
      </div>
   );

   return (
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto w-full pb-10">

         {/* Header Actions */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <div>
               <h2 className="text-xl font-bold">Referentiel Partenaires</h2>
               <p className="text-[11px] text-[var(--text-muted)] font-medium">Gestion et audit de la base fournisseurs</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button onClick={() => setIsBulkModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider hover:bg-[var(--bg-main)] transition-all">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Import Bulk
               </button>
               <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all">
                  <Plus className="w-4 h-4" /> Nouveau Dossier
               </button>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
               <input type="text" placeholder="Rechercher par nom, pays ou SIRET..." className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent)]/10 transition-all outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar">
               {[
                  { id: 'ALL', label: 'Tout' },
                  { id: 'HIGH_RISK', label: 'Risque eleve' },
                  { id: 'NON_COMPLIANT', label: 'Non-conformes' }
               ].map(f => (
                  <button key={f.id} onClick={() => setActiveFilter(f.id as any)} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                     {f.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Main List */}
         <div className="card-premium overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest w-1/3">Fournisseur</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Surete Logistique</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Conformite GED</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {filteredSuppliers.map(s => (
                        <tr key={s.id} onClick={() => { setSelectedSupplier(s); setActiveTab('IDENTITY'); }} className="hover:bg-[var(--bg-main)] transition-all cursor-pointer group">
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl flex items-center justify-center font-bold text-sm group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                                    {s.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="font-bold text-sm tracking-tight">{s.name}</div>
                                    <div className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1.5 mt-0.5">
                                       <MapPin className="w-3 h-3" /> {s.country}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-3 max-w-[120px]">
                                 <div className="flex-1 bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${s.riskScore > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${s.riskScore}%` }} />
                                 </div>
                                 <span className="text-[10px] font-bold">{s.riskScore}%</span>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <ComplianceBadge status={s.complianceStatus} size="sm" />
                           </td>
                           <td className="px-6 py-5 text-right">
                              <button className="p-2 hover:bg-[var(--border-subtle)] rounded-lg transition-all">
                                 <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {filteredSuppliers.length === 0 && (
               <div className="p-20 text-center">
                  <div className="inline-flex p-4 bg-[var(--bg-main)] rounded-full mb-4">
                     <Search className="w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-muted)]">Aucun fournisseur ne correspond a votre recherche.</p>
               </div>
            )}
         </div>

         {/* ===================== SUPPLIER DETAIL MODAL ===================== */}
         {selectedSupplier && (
            <div className="fixed inset-0 z-50 flex justify-center p-4 lg:p-8 animate-fade-in overflow-y-auto scrollbar-hide py-10 lg:py-20">
               <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedSupplier(null)}></div>
               <div className="relative w-full max-w-7xl h-fit min-h-[85vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-up">

                  {/* Modal Header */}
                  <div className="p-8 pb-4 border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/30">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-6">
                           <div className="relative">
                              <div className="w-16 h-16 bg-[var(--accent)] text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
                                 {selectedSupplier.name.charAt(0)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--success)] border-4 border-[var(--bg-card)] rounded-full shadow-sm"></div>
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold tracking-tight mb-2">{selectedSupplier.name}</h2>
                              <div className="flex items-center gap-3">
                                 <ComplianceBadge status={selectedSupplier.complianceStatus} size="sm" />
                                 <div className="w-px h-3 bg-[var(--border-subtle)]" />
                                 <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" /> {selectedSupplier.country}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <button onClick={() => setSelectedSupplier(null)} className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-all">
                           <X className="w-5 h-5" />
                        </button>
                     </div>

                     {/* Navigation Tabs */}
                     <div className="flex gap-1 p-1 bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] rounded-xl w-full overflow-x-auto no-scrollbar">
                        {[
                           { id: 'IDENTITY', label: 'Identite', icon: Building2 },
                           { id: 'INDUSTRIAL', label: 'Industriel', icon: Factory },
                           { id: 'GFSI', label: 'GFSI', icon: ShieldCheck },
                           { id: 'GED', label: 'GED', icon: FolderClosed },
                           { id: 'PDM', label: 'Produits', icon: LayoutGrid },
                           { id: 'JOURNAL', label: 'Journal', icon: History }
                        ].map(t => (
                           <button
                              key={t.id}
                              onClick={() => setActiveTab(t.id as any)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${activeTab === t.id
                                 ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm'
                                 : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]/50'
                                 }`}
                           >
                              <t.icon className="w-3.5 h-3.5" /> {t.label}
                              {activeTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full"></span>}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Tab Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[var(--bg-main)]/5 scrollbar-hide">

                     {/* ===== IDENTITY TAB ===== */}
                     {activeTab === 'IDENTITY' && (
                        <div className="grid grid-cols-12 auto-rows-min gap-6 pb-10 bento-stagger">
                           <div className="col-span-12 lg:col-span-8 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                              <div className="space-y-6">
                                 <SectionHeader icon={Contact} title="Informations Generales" />
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Nom Commercial" value={selectedSupplier.name} readOnly={true} onChange={() => { }} />
                                    <FormField label="Code Fournisseur" value={selectedSupplier.code} placeholder="S00001" onChange={(v: string) => updateSupplier(selectedSupplier.id, { code: v })} />
                                    <FormField label="Email Principal" value={selectedSupplier.contactEmail} onChange={(v: string) => updateSupplier(selectedSupplier.id, { contactEmail: v })} />
                                    <FormField label="Telephone" placeholder="+33..." onChange={() => { }} />
                                    <FormField label="Site Web" value={selectedSupplier.website} placeholder="www.example.com" onChange={(v: string) => updateSupplier(selectedSupplier.id, { website: v })} />
                                    <FormField label="Classification" value={selectedSupplier.classification} placeholder="Direct / Indirect" onChange={(v: string) => updateSupplier(selectedSupplier.id, { classification: v })} />
                                 </div>
                              </div>
                              <div className="mt-8">
                                 <SectionHeader icon={Building2} title="Siege Social" />
                                 <div className="space-y-4 mt-4">
                                    <FormField label="Adresse" value={selectedSupplier.address} placeholder="123 Rue du Commerce" onChange={(v: string) => updateSupplier(selectedSupplier.id, { address: v })} />
                                    <div className="grid grid-cols-2 gap-4">
                                       <FormField label="Ville" value={selectedSupplier.city} placeholder="Paris" onChange={(v: string) => updateSupplier(selectedSupplier.id, { city: v })} />
                                       <FormField label="Code Postal" value={selectedSupplier.zipCode} placeholder="75000" onChange={(v: string) => updateSupplier(selectedSupplier.id, { zipCode: v })} />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="col-span-12 lg:col-span-4 row-span-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col min-h-[400px]">
                              <SectionHeader icon={Users} title="Contacts Tiers" badge={selectedSupplier.contacts?.length.toString() || '0'} />
                              <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
                                 {selectedSupplier.contacts?.map(c => (
                                    <div key={c.id} className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-xl shadow-sm hover:border-[var(--accent)] transition-all group relative font-medium">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center font-bold text-[var(--accent)] text-xs">{c.name.charAt(0)}</div>
                                          <div className="flex-1 min-w-0">
                                             <p className="font-bold text-sm truncate">{c.name}</p>
                                             <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{c.role}</p>
                                          </div>
                                       </div>
                                       <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                                          <div className="w-1 h-1 rounded-full bg-[var(--accent)]"></div>
                                          {c.email}
                                       </div>
                                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Edit3 className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent)]" />
                                       </div>
                                    </div>
                                 ))}
                                 <button onClick={() => addNotification({ title: 'Nouveau Contact', message: 'Ouverture du formulaire de creation...', type: 'SUCCESS' })} className="w-full h-24 border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
                                    <Plus className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un Contact</span>
                                 </button>
                              </div>
                           </div>

                           <div className="col-span-12 lg:col-span-4 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                              <SectionHeader icon={Factory} title="Details Industriels" />
                              <div className="space-y-4 mt-6">
                                 <FormField label="TVA Intracom." value={selectedSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, vatNumber: v } })} />
                                 <FormField label="DUNS Number" value={selectedSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, dunsNumber: v } })} />
                                 <FormField label="Chiffre d'Affaire" value={selectedSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M EUR" onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, annualRevenue: v } })} />
                              </div>
                           </div>

                           <div className="col-span-12 lg:col-span-4 row-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 flex flex-col justify-between">
                              <SectionHeader icon={Activity} title="Indice de Risque" />
                              <div className="flex items-center gap-6">
                                 <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                       <circle className="text-[var(--border-subtle)] stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                                       <circle className={`${selectedSupplier.riskScore > 60 ? 'text-rose-500' : 'text-emerald-500'} stroke-current transition-all duration-1000`} strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${selectedSupplier.riskScore * 2.51}, 251`} transform="rotate(-90 50 50)"></circle>
                                    </svg>
                                    <span className="absolute text-xl font-black">{selectedSupplier.riskScore}%</span>
                                 </div>
                                 <div className="flex-1">
                                    <ComplianceBadge status={selectedSupplier.complianceStatus} size="sm" />
                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Audit: Passe</p>
                                 </div>
                              </div>
                           </div>

                           <div className="col-span-12 lg:col-span-4 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col overflow-hidden">
                              <SectionHeader icon={LayoutGrid} title="Produits (Apercu)" badge={selectedSupplier.products?.length.toString()} />
                              <div className="flex-1 overflow-y-auto space-y-3 mt-4 scrollbar-hide">
                                 {selectedSupplier.products?.slice(0, 3).map(p => (
                                    <div key={p.id} className="p-3 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-xl flex justify-between items-center group">
                                       <span className="text-xs font-bold">{p.name}</span>
                                       <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all" />
                                    </div>
                                 ))}
                                 <button onClick={() => setActiveTab('PDM')} className="w-full py-3 border border-[var(--accent)]/20 rounded-xl text-[9px] font-black text-[var(--accent)] uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-all">
                                    Voir tout le catalogue
                                 </button>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* ===== GFSI TAB ===== */}
                     {activeTab === 'GFSI' && (
                        <div className="bg-[var(--bg-card)] rounded-3xl p-10 border border-[var(--border-subtle)] animate-fade-in shadow-2xl">
                           <GFSIApprovalTab supplier={selectedSupplier} />
                        </div>
                     )}

                     {/* ===== GED TAB ===== */}
                     {activeTab === 'GED' && (
                        <div className="bg-[var(--bg-card)] rounded-3xl p-10 border border-[var(--border-subtle)] animate-fade-in shadow-2xl">
                           <SupplierGEDTab supplier={selectedSupplier} />
                        </div>
                     )}

                     {/* ===== INDUSTRIAL TAB ===== */}
                     {activeTab === 'INDUSTRIAL' && (
                        <div className="bg-[var(--bg-card)] rounded-3xl p-12 border border-[var(--border-subtle)] animate-fade-in max-w-5xl mx-auto shadow-2xl">
                           <SectionHeader icon={Factory} title="Fiche Industrielle Detaillee" />
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                              <FormField label="TVA Intracom." value={selectedSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, vatNumber: v } })} />
                              <FormField label="DUNS Number" value={selectedSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, dunsNumber: v } })} />
                              <FormField label="Chiffre d'Affaire" value={selectedSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M EUR" onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, annualRevenue: v } })} />
                              <FormField label="Capacite Hebdo" placeholder="Ex: 50T" onChange={() => { }} />
                              <FormField label="Site Web" value={selectedSupplier.website} onChange={(v: string) => updateSupplier(selectedSupplier.id, { website: v })} />
                              <FormField label="Code Fournisseur" value={selectedSupplier.code} onChange={(v: string) => updateSupplier(selectedSupplier.id, { code: v })} />
                           </div>
                           <div className="mt-12 p-10 bg-[var(--bg-main)]/30 rounded-3xl border border-[var(--border-subtle)]">
                              <SectionHeader icon={MapPin} title="Localisation Geostrategique" />
                              <div className="h-80 bg-[var(--bg-sidebar)] rounded-2xl flex flex-col items-center justify-center text-[var(--text-muted)] border border-[var(--border-subtle)] mt-6 group">
                                 <MapPin className="w-12 h-12 mb-4 opacity-20 group-hover:scale-110 group-hover:text-[var(--accent)] group-hover:opacity-100 transition-all duration-700" />
                                 <p className="text-sm font-bold uppercase tracking-[0.3em]">Coordonnees GPS: {selectedSupplier.industrialInfo?.address || 'Non specifie'}</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* ===== PDM TAB ===== */}
                     {activeTab === 'PDM' && (
                        <div className="bg-[var(--bg-card)] rounded-3xl p-12 border border-[var(--border-subtle)] animate-fade-in shadow-2xl">
                           <SectionHeader icon={LayoutGrid} title="Catalogue de Referencement" badge={selectedSupplier.products?.length.toString()} />
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                              {selectedSupplier.products?.map(p => (
                                 <div key={p.id} className="p-8 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-3xl group hover:border-[var(--accent)] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                       <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
                                          <LayoutGrid className="w-6 h-6" />
                                       </div>
                                       <span className="text-[10px] font-black text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] tracking-widest">V1.0</span>
                                    </div>
                                    <h4 className="font-black text-xl mb-1">{p.name}</h4>
                                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-8">{p.category}</p>
                                    <div className="flex items-center justify-between pt-6 border-t border-[var(--border-subtle)]">
                                       <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{p.status}</span>
                                       <button className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Technique <Plus className="w-3.5 h-3.5" /></button>
                                    </div>
                                 </div>
                              ))}
                              <div className="p-8 border-4 border-dashed border-[var(--border-subtle)] rounded-3xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all cursor-pointer group">
                                 <Plus className="w-10 h-10 mb-4 group-hover:scale-125 transition-transform" />
                                 <span className="text-xs font-black uppercase tracking-widest">Referencer un Produit</span>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* ===== JOURNAL TAB ===== */}
                     {activeTab === 'JOURNAL' && (
                        <div className="bg-[var(--bg-card)] rounded-3xl p-12 border border-[var(--border-subtle)] animate-fade-in max-w-5xl mx-auto shadow-2xl">
                           <SectionHeader icon={History} title="Audit Trail & Communications" />
                           <div className="mt-10 space-y-8">
                              <div className="p-8 bg-[var(--bg-main)] shadow-inner rounded-3xl border border-[var(--border-subtle)] focus-within:ring-4 focus-within:ring-[var(--accent)]/5 transition-all">
                                 <textarea placeholder="Consigner un evenement d'audit ou une instruction strategique..." className="w-full h-40 bg-transparent outline-none resize-none text-base font-medium placeholder:text-[var(--text-muted)]" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} />
                                 <div className="flex justify-end pt-6 border-t border-[var(--border-subtle)]/50 mt-6">
                                    <button onClick={handleAddComment} disabled={!newCommentText} className="px-12 py-4 bg-[var(--accent)] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-30">
                                       Diffuser l'Instruction
                                    </button>
                                 </div>
                              </div>
                              <div className="space-y-6 pt-10">
                                 {selectedSupplier.commentaries?.sort((a, b) => b.timestamp - a.timestamp).map(c => (
                                    <div key={c.id} className="flex gap-8 items-start group">
                                       <div className="shrink-0 w-12 h-12 bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] rounded-2xl flex items-center justify-center font-black text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-500">
                                          {c.author.charAt(0)}
                                       </div>
                                       <div className="flex-1 bg-[var(--bg-main)]/30 p-8 rounded-3xl border border-[var(--border-subtle)] group-hover:bg-[var(--bg-main)] group-hover:shadow-xl transition-all">
                                          <div className="flex justify-between items-center mb-4">
                                             <h5 className="font-black text-sm tracking-tight">{c.author}</h5>
                                             <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-sidebar)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">{new Date(c.timestamp).toLocaleString()}</span>
                                          </div>
                                          <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed">{c.text}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                  </div>

                  {/* Fixed Footer */}
                  <div className="p-8 bg-[var(--bg-card)]/80 backdrop-blur-2xl border-t border-[var(--border-subtle)] flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Derniere mise a jour</span>
                           <span className="text-xs font-bold">Aujourd'hui, 14:15</span>
                        </div>
                        <div className="w-px h-8 bg-[var(--border-subtle)]" />
                        <div className="flex gap-4">
                           <button onClick={() => addNotification({ title: 'Export PDF', message: 'Generation du dossier fournisseur...', type: 'SUCCESS' })} className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.2em] transition-all group">
                              <FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Exporter PDF
                           </button>
                           <button onClick={() => addNotification({ title: 'Partage', message: 'Lien de consultation securise genere.', type: 'SUCCESS' })} className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.2em] transition-all group">
                              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Partager
                           </button>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        {isEditMode && (
                           <button onClick={() => setIsEditMode(false)} className="px-8 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all">
                              Annuler
                           </button>
                        )}
                        <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-3 px-12 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${isEditMode ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-[var(--accent)] text-white shadow-indigo-500/30'}`}>
                           {isEditMode ? <><Save className="w-5 h-5" /> Confirmer les modifications</> : <><Edit3 className="w-5 h-5" /> Passer en Edition</>}
                        </button>
                     </div>
                  </div>

               </div>
            </div>
         )}

         {/* ===================== ADD SUPPLIER MODAL ===================== */}
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
               <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-main)]/50">
                     <div>
                        <h3 className="text-xl font-bold">Nouveau Partenaire</h3>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Initialisation du dossier de securite</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--border-subtle)] rounded-lg">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <form onSubmit={(e) => {
                     e.preventDefault();
                     const fd = new FormData(e.currentTarget);
                     const name = fd.get('name') as string;
                     if (!name) return;
                     addSupplier({
                        id: `SUP-${Date.now()}`,
                        name,
                        country: fd.get('country') as string || 'France',
                        contactEmail: fd.get('email') as string || '',
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
                     });
                     setIsModalOpen(false);
                  }} className="p-8 space-y-6 overflow-y-auto">
                     <div className="space-y-4">
                        <div className="space-y-1.5 pl-1">
                           <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Nom de l'entite</label>
                           <input name="name" required className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5 pl-1">
                              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Pays</label>
                              <input name="country" required className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all" />
                           </div>
                           <div className="space-y-1.5 pl-1">
                              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Email de contact</label>
                              <input name="email" type="email" required className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all" />
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider">Annuler</button>
                        <button type="submit" className="px-8 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">Creer Dossier</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* ===================== BULK IMPORT MODAL ===================== */}
         {isBulkModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsBulkModalOpen(false)}></div>
               <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                     <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Importation Massive</h3>
                  <p className="text-center text-[11px] text-[var(--text-muted)] font-medium mb-8">Telechargez votre liste XLS ou CSV pour un onboarding groupe.</p>
                  <div className="w-full p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl flex flex-col items-center justify-center group hover:border-[var(--accent)] transition-all cursor-pointer" onClick={() => excelInputRef.current?.click()}>
                     <UploadCloud className="w-10 h-10 text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-4 transition-colors" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Glisser-deposer ou parcourir</span>
                     <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                  </div>
                  <button onClick={downloadExcelTemplate} className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">
                     <FileDown className="w-4 h-4" /> Telecharger le gabarit
                  </button>
               </div>
            </div>
         )}

      </div>
   );
};

export default SupplierHub;