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

   // Commentary State
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


   // UI Components
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
               <h2 className="text-xl font-bold">Référentiel Partenaires</h2>
               <p className="text-[11px] text-[var(--text-muted)] font-medium">Gestion et audit de la base fournisseurs</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider hover:bg-[var(--bg-main)] transition-all"
               >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Import Bulk
               </button>
               <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all"
               >
                  <Plus className="w-4 h-4" /> Nouveau Dossier
               </button>
            </div>
         </div>

         {/* Filters & Search */}
         <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
               <input
                  type="text"
                  placeholder="Rechercher par nom, pays ou SIRET..."
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-[var(--accent)]/10 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl w-full lg:w-auto overflow-x-auto no-scrollbar">
               {[
                  { id: 'ALL', label: 'Tout' },
                  { id: 'HIGH_RISK', label: 'Risque élevé' },
                  { id: 'NON_COMPLIANT', label: 'Non-conformes' }
               ].map(f => (
                  <button
                     key={f.id}
                     onClick={() => setActiveFilter(f.id as any)}
                     className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeFilter === f.id
                        ? 'bg-[var(--accent)] text-white shadow-md'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                  >
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
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Sûreté Logistique</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Conformité GED</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                     {filteredSuppliers.map(s => (
                        <tr
                           key={s.id}
                           onClick={() => { setSelectedSupplier(s); setActiveTab('IDENTITY'); }}
                           className="hover:bg-[var(--bg-main)] transition-all cursor-pointer group"
                        >
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
                                    <div
                                       className={`h-full transition-all duration-1000 ${s.riskScore > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                       style={{ width: `${s.riskScore}%` }}
                                    />
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
                  <p className="text-sm font-medium text-[var(--text-muted)]">Aucun fournisseur ne correspond à votre recherche.</p>
               </div>
            )}
         </div>

         {/* Modern Centric Command Center */}
         {selectedSupplier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in overflow-hidden">
               <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedSupplier(null)}></div>
               <div className="relative w-full max-w-7xl h-[90vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-up">

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
                        <div className="flex gap-2">
                           <button
                              onClick={() => setSelectedSupplier(null)}
                              className="p-2.5 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-all"
                           >
                              <X className="w-5 h-5" />
                           </button>
                        </div>
                     </div>

                     {/* Navigation Tabs */}
                     <div className="flex gap-1 p-1 bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] rounded-xl w-full overflow-x-auto no-scrollbar">
                        {[
                           { id: 'IDENTITY', label: 'Identité', icon: Building2 },
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
                              {activeTab === t.id && (
                                 <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-full"></span>
                              )}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex-1 overflow-hidden p-8 bg-[var(--bg-main)]/5">
                     <div className="grid grid-cols-12 grid-rows-6 gap-6 h-full bento-stagger">

                        {/* Main Identity Card */}
                        <div className="col-span-12 lg:col-span-8 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                           <div className="space-y-6">
                              <SectionHeader icon={Contact} title="Informations Générales" />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <FormField label="Nom Commercial" value={selectedSupplier.name} readOnly={true} />
                                 <FormField label="Code Fournisseur" value={selectedSupplier.code} placeholder="S00001" onChange={(v: string) => updateSupplier(selectedSupplier.id, { code: v })} />
                                 <FormField label="Email Principal" value={selectedSupplier.contactEmail} onChange={(v: string) => updateSupplier(selectedSupplier.id, { contactEmail: v })} />
                                 <FormField label="Téléphone" placeholder="+33..." onChange={(v: string) => { }} />
                                 <FormField label="Site Web" value={selectedSupplier.website} placeholder="www.example.com" onChange={(v: string) => updateSupplier(selectedSupplier.id, { website: v })} />
                                 <FormField label="Classification" value={selectedSupplier.classification} placeholder="Direct / Indirect" onChange={(v: string) => updateSupplier(selectedSupplier.id, { classification: v })} />
                              </div>
                           </div>
                           <div className="mt-8">
                              <SectionHeader icon={Building2} title="Siège Social" />
                              <div className="space-y-4 mt-4">
                                 <FormField label="Adresse" value={selectedSupplier.address} placeholder="123 Rue du Commerce" onChange={(v: string) => updateSupplier(selectedSupplier.id, { address: v })} />
                                 <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Ville" value={selectedSupplier.city} placeholder="Paris" onChange={(v: string) => updateSupplier(selectedSupplier.id, { city: v })} />
                                    <FormField label="Code Postal" value={selectedSupplier.zipCode} placeholder="75000" onChange={(v: string) => updateSupplier(selectedSupplier.id, { zipCode: v })} />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Contacts Card */}
                        <div className="col-span-12 lg:col-span-4 row-span-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                           <SectionHeader icon={Users} title="Contacts Tiers" badge={selectedSupplier.contacts?.length.toString() || '0'} />
                           <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
                              {selectedSupplier.contacts?.map(c => (
                                 <div key={c.id} className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-xl shadow-sm hover:border-[var(--accent)] transition-all group relative">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 bg-[var(--accent)]/10 rounded-full flex items-center justify-center font-bold text-[var(--accent)] text-xs">
                                          {c.name.charAt(0)}
                                       </div>
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
                              <button className="w-full h-24 border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
                                 <Plus className="w-5 h-5 mb-1" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un Contact</span>
                              </button>
                           </div>
                        </div>

                        {/* Industrial Info Card */}
                        <div className="col-span-12 lg:col-span-4 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                           <SectionHeader icon={Factory} title="Informations Industrielles" />
                           <div className="space-y-4 mt-6">
                              <FormField label="TVA Intracom." value={selectedSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, vatNumber: v } })} />
                              <FormField label="DUNS Number" value={selectedSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, dunsNumber: v } })} />
                              <FormField label="Chiffre d'Affaire" value={selectedSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M€" onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, annualRevenue: v } })} />
                           </div>
                           <div className="mt-8">
                              <SectionHeader icon={MapPin} title="Site de Production" />
                              <div className="space-y-4 mt-4">
                                 <FormField label="Adresse du Site" value={selectedSupplier.industrialInfo?.address} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, address: v } })} />
                                 <FormField label="Ville de Production" value={selectedSupplier.industrialInfo?.city} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, city: v } })} />
                              </div>
                           </div>
                        </div>

                        {/* Risk & Compliance Card */}
                        <div className="col-span-12 lg:col-span-4 row-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 flex flex-col justify-between">
                           <SectionHeader icon={Activity} title="Score de Risque" />
                           <div className="flex items-center gap-6">
                              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                                 <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle className="text-[var(--border-subtle)] stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                                    <circle
                                       className={`${selectedSupplier.riskScore > 60 ? 'text-rose-500' : 'text-emerald-500'} stroke-current transition-all duration-1000`}
                                       strokeWidth="10"
                                       strokeLinecap="round"
                                       cx="50"
                                       cy="50"
                                       r="40"
                                       fill="transparent"
                                       strokeDasharray={`${selectedSupplier.riskScore * 2.51}, 251`}
                                       transform="rotate(-90 50 50)"
                                    ></circle>
                                 </svg>
                                 <span className="absolute text-xl font-black">{selectedSupplier.riskScore}%</span>
                              </div>
                              <div className="flex-1">
                                 <ComplianceBadge status={selectedSupplier.complianceStatus} size="sm" />
                                 <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">Dernier Audit: Passé</p>
                              </div>
                           </div>
                        </div>

                        {/* GFSI Approval Card */}
                        <div className="col-span-12 lg:col-span-6 xl:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
                           <GFSIApprovalTab supplier={selectedSupplier} />
                        </div>

                        {/* GED Documents Card */}
                        <div className="col-span-12 lg:col-span-6 xl:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
                           <SupplierGEDTab supplier={selectedSupplier} />
                        </div>

                        {/* Products Card */}
                        <div className="col-span-12 lg:col-span-6 xl:col-span-6 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col">
                           <SectionHeader icon={LayoutGrid} title="Produits Référencés" badge={selectedSupplier.products?.length.toString() || '0'} />
                           <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide mt-6">
                              {selectedSupplier.products?.map(p => (
                                 <div key={p.id} className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-xl shadow-sm hover:border-[var(--accent)] transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                       <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                                          <LayoutGrid className="w-4 h-4 text-[var(--accent)]" />
                                       </div>
                                       <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-main)] px-2 py-1 rounded">V{p.versions?.[0]?.version || '1.0'}</span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium mb-3">{p.category}</p>
                                    <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
                                       <span className="text-[10px] font-bold text-[var(--success)]">{p.status}</span>
                                       <button className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                          Fiche technique <ChevronRight className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                              <button className="w-full h-24 border-2 border-dashed border-[var(--border-subtle)] rounded-xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
                                 <Plus className="w-5 h-5 mb-1" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau Produit</span>
                              </button>
                           </div>
                        </div>

                        {/* Journal Card */}
                        <div className="col-span-12 lg:col-span-4 row-span-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col overflow-hidden">
                           <SectionHeader icon={History} title="Notes d'Audit" badge={selectedSupplier.commentaries?.length.toString() || '0'} />
                           <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
                              {selectedSupplier.commentaries?.sort((a, b) => b.timestamp - a.timestamp).map((c, idx) => (
                                 <div key={c.id} className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border-subtle)] rounded-xl relative group">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-tighter">{c.author}</span>
                                       <span className="text-[8px] text-[var(--text-muted)]">{new Date(c.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{c.text}</p>
                                 </div>
                              ))}
                           </div>
                           <button className="mt-4 w-full py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest hover:bg-[var(--accent)]/10 transition-all">
                              Ajouter une note
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Fixed Footer with Premium Effects */}
                  <div className="p-8 bg-[var(--bg-card)]/80 backdrop-blur-2xl border-t border-[var(--border-subtle)] flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dernière mise à jour</span>
                           <span className="text-xs font-bold">Aujourd'hui, 14:15</span>
                        </div>
                        <div className="w-px h-8 bg-[var(--border-subtle)]" />
                        <div className="flex gap-4">
                           <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.2em] transition-all group">
                              <FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Exporter PDF
                           </button>
                           <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.2em] transition-all group">
                              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Partager
                           </button>
                        </div>
                     </div>

                     <div className="flex items-center gap-4">
                        {isEditMode && (
                           <button
                              onClick={() => setIsEditMode(false)}
                              className="px-8 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/5 transition-all"
                           >
                              Annuler
                           </button>
                        )}
                        <button
                           onClick={() => setIsEditMode(!isEditMode)}
                           className={`flex items-center gap-3 px-12 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${isEditMode
                              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                              : 'bg-[var(--accent)] text-white shadow-indigo-500/30'
                              }`}
                        >
                           {isEditMode ? <><Save className="w-5 h-5" /> Confirmer les modifications</> : <><Edit3 className="w-5 h-5" /> Passer en Edition</>}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Add Supplier Modal Redesign */}
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
               <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-main)]/50">
                     <div>
                        <h3 className="text-xl font-bold">Nouveau Partenaire</h3>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Initialisation du dossier de sécurité</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[var(--border-subtle)] rounded-lg">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <form onSubmit={(e) => {
                     e.preventDefault();
                     // Handle form logic simplified for brevity but functional
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
                           <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">Nom de l'entité</label>
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
                        <button type="submit" className="px-8 py-2.5 bg-[var(--accent)] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">Créer Dossier</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Bulk Import Modal Redesign */}
         {isBulkModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsBulkModalOpen(false)}></div>
               <div className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                     <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Importation Massive</h3>
                  <p className="text-center text-[11px] text-[var(--text-muted)] font-medium mb-8">Téléchargez votre liste XLS ou CSV pour un onboarding groupé.</p>

                  <div className="w-full p-10 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl flex flex-col items-center justify-center group hover:border-[var(--accent)] transition-all cursor-pointer" onClick={() => excelInputRef.current?.click()}>
                     <UploadCloud className="w-10 h-10 text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-4 transition-colors" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Glisser-déposer ou parcourir</span>
                     <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                  </div>

                  <button onClick={downloadExcelTemplate} className="mt-8 flex items-center gap-2 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">
                     <FileDown className="w-4 h-4" /> Télécharger le gabarit
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default SupplierHub;