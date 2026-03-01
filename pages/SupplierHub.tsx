import React, { useState, useRef } from 'react';
import { Supplier, ComplianceStatus, Product } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import ComplianceBadge from '../components/ComplianceBadge';
import { SpecificationsTab } from '../components/SpecificationsTab';
import { SupplierGEDTab } from '../components/SupplierGEDTab';
import { AnalysisTab } from '../components/AnalysisTab';
import { CampaignTab } from '../components/CampaignTab';
import SectionHeader from '../components/SectionHeader';
import {
   Search, MapPin, Plus, X, Globe, Building2,
   ShieldCheck, Activity, ChevronRight, Edit3, Save,
   FileSpreadsheet, UploadCloud, FileDown, FolderClosed,
   LayoutGrid, Factory, History, Share2, Contact, Users, Clock, Box, Trash2, Send
} from 'lucide-react';
import * as XLSX from 'xlsx';
import ProductTechnicalModal from '../components/ProductTechnicalModal';
import RawMaterialModal from '../components/RawMaterialModal';
import { RawMaterial } from '../types';

const SupplierHub: React.FC = () => {
   const {
      suppliers, rawMaterials, addSupplier, updateSupplier,
      addCommentToSupplier, addNotification, bulkImportSuppliers,
      addProductToSupplier, updateContact, deleteContact,
      deleteProduct, deleteRawMaterial
   } = useWorkspace();

   const [searchTerm, setSearchTerm] = useState('');
   const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
   const [isEditMode, setIsEditMode] = useState(false);
   const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH_RISK' | 'NON_COMPLIANT'>('ALL');
   const [activeTab, setActiveTab] = useState<'IDENTITY' | 'INDUSTRIAL' | 'SPECS' | 'GED' | 'MATIERES' | 'PDM' | 'JOURNAL' | 'ANALYSIS' | 'CAMPAIGN'>('IDENTITY');
   const [newCommentText, setNewCommentText] = useState('');
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [isAddProductOpen, setIsAddProductOpen] = useState(false);
   const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
   const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
   const excelInputRef = useRef<HTMLInputElement>(null);

   const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
         const bstr = evt.target?.result;
         const wb = XLSX.read(bstr, { type: 'binary' });
         const ws = wb.Sheets[wb.SheetNames[0]];
         const data = XLSX.utils.sheet_to_json(ws);
         const mapped: Supplier[] = data.map((row: any) => ({
            id: `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: row.Nom || row.Name || row.name || 'Inconnu',
            country: row.Pays || row.Country || row.country || 'FR',
            contactEmail: row.Email || row.email || '',
            siret: row.SIRET || row.siret || '',
            website: row.Web || row.website || '',
            status: 'NEW', onboardingStep: 'NEW',
            complianceStatus: ComplianceStatus.PENDING,
            riskScore: 50,
            documents: [], products: [], commentaries: [],
            contacts: [], attachments: [], nonConformities: [],
            industrialInfo: { address: row.Adresse || '', city: row.Ville || '' }
         }));
         bulkImportSuppliers(mapped);
         setIsBulkModalOpen(false);
      };
      reader.readAsBinaryString(file);
   };

   const downloadExcelTemplate = () => {
      const data = [
         { Nom: 'Exemple Fournisseur SAS', Pays: 'France', Email: 'qualite@exemple.fr', SIRET: '12345678900010', Web: 'https://exemple.fr', Adresse: '1 Rue de la Paix', Ville: 'Paris' },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Modele Import");
      XLSX.writeFile(wb, "visitrack_template_import.xlsx");
      addNotification({ title: 'Modèle téléchargé', message: 'Le fichier exemple est prêt.', type: 'SUCCESS' });
   };

   const filteredSuppliers = suppliers.filter(s => {
      const m = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.country.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeFilter === 'HIGH_RISK') return m && s.riskScore > 60;
      if (activeFilter === 'NON_COMPLIANT') return m && s.complianceStatus !== ComplianceStatus.COMPLIANT;
      return m;
   });

   const activeSupplier = suppliers.find(s => s.id === selectedSupplierId) || null;

   const handleAddComment = () => {
      if (!activeSupplier || !newCommentText) return;
      addCommentToSupplier(activeSupplier.id, { author: 'Admin Qualité', text: newCommentText, category: 'GENERAL' });
      setNewCommentText('');
   };

   /* ── Sub-components moved to standalone files ──────────────────── */

   const FormField = ({ label, value, onChange, placeholder, type = 'text', readOnly = !isEditMode }: any) => (
      <div className={`p-3.5 rounded-lg border transition-all duration-200 ${!readOnly
         ? 'bg-[var(--bg-card)] border-[var(--accent)] ring-2 ring-[var(--accent)]/10'
         : 'bg-[var(--bg-main)] border-[var(--border-subtle)]'
         }`}>
         <label className={`text-[10px] font-medium block mb-1 ${!readOnly ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
            {label}
         </label>
         <input
            type={type}
            readOnly={readOnly}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-medium outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
         />
      </div>
   );

   /* ── Render ─────────────────────────────────────────────────────── */
   return (
      <div className="flex h-full overflow-hidden animate-fade-in -m-8">

         {/* ─── LEFT PANEL: Supplier List ─── */}
         <div className={`flex flex-col h-full bg-[var(--bg-main)] transition-all duration-300 border-r border-[var(--border-subtle)] ${selectedSupplierId ? 'w-[350px] min-w-[320px] max-w-[380px]' : 'w-full'}`}>
            <div className="flex flex-col h-full">

               {/* Header */}
               <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                  <div className="flex justify-between items-start gap-3 mb-4">
                     <div className="min-w-0">
                        <h2 className="text-base font-semibold truncate">Référentiel Fournisseurs</h2>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Gestion et conformité</p>
                     </div>
                     <div className="flex gap-2 shrink-0">
                        <button
                           onClick={() => setIsBulkModalOpen(true)}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[11px] font-medium hover:bg-[var(--bg-hover)] transition-all text-[var(--text-secondary)]"
                        >
                           <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                           Import
                        </button>
                        <button
                           onClick={() => setIsModalOpen(true)}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-medium hover:opacity-90 shadow-md shadow-orange-500/20 transition-all"
                        >
                           <Plus className="w-3.5 h-3.5" />
                           Nouveau
                        </button>
                     </div>
                  </div>

                  {/* Search */}
                  <div className="relative group mb-3">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                     <input
                        type="text"
                        placeholder="Rechercher…"
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                     />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-1 bg-[var(--bg-main)] p-1 rounded-lg">
                     {[
                        { id: 'ALL', label: 'Tous' },
                        { id: 'HIGH_RISK', label: 'Risque élevé' },
                        { id: 'NON_COMPLIANT', label: 'Non conformes' },
                     ].map(f => (
                        <button
                           key={f.id}
                           onClick={() => setActiveFilter(f.id as any)}
                           className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all whitespace-nowrap truncate px-1 ${activeFilter === f.id
                              ? 'bg-[var(--accent)] text-white shadow-sm'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                              }`}
                        >
                           {f.label}
                        </button>
                     ))}
                  </div>
               </div>

               {/* List */}
               <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {filteredSuppliers.map(s => (
                     <button
                        key={s.id}
                        onClick={() => { setSelectedSupplierId(s.id); setActiveTab('IDENTITY'); }}
                        className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-all group ${selectedSupplierId === s.id ? 'bg-[var(--accent-subtle)] border-l-2 border-l-[var(--accent)]' : ''}`}
                     >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all ${selectedSupplierId === s.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'}`}>
                           {s.name.charAt(0)}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-medium truncate text-[var(--text-primary)]">{s.name}</div>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 truncate">
                                 <MapPin className="w-2.5 h-2.5 shrink-0" />{s.country}
                              </span>
                              <div className={`flex-shrink-0 w-10 h-1 rounded-full overflow-hidden bg-[var(--border-subtle)]`}>
                                 <div className={`h-full rounded-full ${s.riskScore > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${s.riskScore}%` }} />
                              </div>
                              <span className="text-[10px] font-semibold text-[var(--text-muted)] shrink-0">{s.riskScore}%</span>
                           </div>
                        </div>
                        {/* Badge */}
                        <ComplianceBadge status={s.complianceStatus} size="sm" />
                     </button>
                  ))}
                  {filteredSuppliers.length === 0 && (
                     <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
                        <Search className="w-8 h-8 mb-3 opacity-30" />
                        <p className="text-sm">Aucun résultat</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* ─── RIGHT PANEL: Supplier Detail ─── */}
         {activeSupplier && (
            <div className="flex-1 flex flex-col h-full bg-[var(--bg-card)] split-panel-enter overflow-hidden">

               {/* Detail Header */}
               <div className="px-6 pt-6 pb-0 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                  <div className="flex justify-between items-start mb-5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center text-lg font-bold shadow-md shadow-orange-500/15">
                           {activeSupplier.name.charAt(0)}
                        </div>
                        <div>
                           <h2 className="text-lg font-semibold text-[var(--text-primary)]">{activeSupplier.name}</h2>
                           <div className="flex items-center gap-2 mt-1">
                              <ComplianceBadge status={activeSupplier.complianceStatus} size="sm" />
                              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                                 <Globe className="w-3 h-3" /> {activeSupplier.country}
                              </span>
                           </div>
                        </div>
                     </div>
                     <button onClick={() => setSelectedSupplierId(null)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-all">
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                     {[
                        { id: 'IDENTITY', label: 'Identité', icon: Building2 },
                        { id: 'INDUSTRIAL', label: 'Industriel', icon: Factory },
                        { id: 'SPECS', label: 'CDC', icon: ShieldCheck },
                        { id: 'GED', label: 'Documents', icon: FolderClosed },
                        { id: 'MATIERES', label: 'Matières', icon: Box },
                        { id: 'PDM', label: 'Produits', icon: LayoutGrid },
                        { id: 'ANALYSIS', label: 'Analyses', icon: History },
                        { id: 'CAMPAIGN', label: 'Campagnes', icon: Send },
                        { id: 'JOURNAL', label: 'Journal', icon: History },
                     ].map(t => (
                        <button
                           key={t.id}
                           onClick={() => setActiveTab(t.id as any)}
                           className={`flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 ${activeTab === t.id
                              ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]/30'
                              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)]/50'
                              }`}
                        >
                           <t.icon className="w-4 h-4" />
                           {t.label}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Tab Content */}
               <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">

                  {/* IDENTITY */}
                  {activeTab === 'IDENTITY' && (
                     <div className="grid grid-cols-12 gap-5 pb-8 bento-stagger">
                        {/* Main info */}
                        <div className="col-span-12 lg:col-span-8 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-6">
                           <SectionHeader icon={Contact} title="Informations Générales" />
                           <div className="grid grid-cols-2 gap-3">
                              <FormField label="Nom Commercial" value={activeSupplier.name} onChange={(v: string) => updateSupplier(activeSupplier.id, { name: v })} />
                              <FormField label="Code Fournisseur" value={activeSupplier.code} placeholder="S00001" onChange={(v: string) => updateSupplier(activeSupplier.id, { code: v })} />
                              <FormField label="Email Principal" value={activeSupplier.contactEmail} onChange={(v: string) => updateSupplier(activeSupplier.id, { contactEmail: v })} />
                              <FormField label="Site Web" value={activeSupplier.website} placeholder="www.example.com" onChange={(v: string) => updateSupplier(activeSupplier.id, { website: v })} />
                           </div>
                           <div className="mt-5">
                              <SectionHeader icon={Building2} title="Localisation" />
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="col-span-2"><FormField label="Adresse" value={activeSupplier.address} placeholder="123 Rue du Commerce" onChange={(v: string) => updateSupplier(activeSupplier.id, { address: v })} /></div>
                                 <FormField label="Ville" value={activeSupplier.city} placeholder="Paris" onChange={(v: string) => updateSupplier(activeSupplier.id, { city: v })} />
                                 <FormField label="Code Postal" value={activeSupplier.zipCode} placeholder="75000" onChange={(v: string) => updateSupplier(activeSupplier.id, { zipCode: v })} />
                              </div>
                           </div>
                        </div>

                        {/* Contacts */}
                        <div className="col-span-12 lg:col-span-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-5 flex flex-col">
                           <SectionHeader icon={Users} title="Contacts" badge={activeSupplier.contacts?.length.toString() || '0'} />
                           <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                              {activeSupplier.contacts?.map(c => (
                                 <div key={c.id} className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 transition-all group relative">
                                    {isEditMode && (
                                       <button
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             if (confirm("Supprimer ce contact ?")) deleteContact(activeSupplier.id, c.id);
                                          }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                       >
                                          <X className="w-3 h-3" />
                                       </button>
                                    )}
                                    <div className="flex items-center gap-2">
                                       <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] text-xs font-bold">{c.name.charAt(0)}</div>
                                       <div className="min-w-0 flex-1">
                                          {isEditMode ? (
                                             <input
                                                className="text-xs font-semibold bg-transparent border-b border-[var(--accent)]/30 outline-none w-full focus:border-[var(--accent)]"
                                                value={c.name}
                                                onChange={(e) => updateContact(activeSupplier.id, c.id, { name: e.target.value })}
                                             />
                                          ) : (
                                             <p className="text-xs font-semibold truncate">{c.name}</p>
                                          )}
                                          {isEditMode ? (
                                             <input
                                                className="text-[10px] text-[var(--text-muted)] bg-transparent border-b border-[var(--border-subtle)] outline-none w-full mt-1 focus:border-[var(--accent)]"
                                                value={c.role}
                                                onChange={(e) => updateContact(activeSupplier.id, c.id, { role: e.target.value })}
                                             />
                                          ) : (
                                             <p className="text-[10px] text-[var(--text-muted)] truncate">{c.role}</p>
                                          )}
                                       </div>
                                    </div>
                                    {isEditMode ? (
                                       <input
                                          className="text-[10px] text-[var(--text-secondary)] bg-transparent border-b border-[var(--border-subtle)] outline-none w-full mt-2 focus:border-[var(--accent)]"
                                          value={c.email}
                                          onChange={(e) => updateContact(activeSupplier.id, c.id, { email: e.target.value })}
                                       />
                                    ) : (
                                       <p className="text-[10px] text-[var(--text-secondary)] mt-2 truncate">{c.email}</p>
                                    )}
                                 </div>
                              ))}
                              <button
                                 onClick={() => addNotification({ title: 'Nouveau Contact', message: 'Ouverture du formulaire...', type: 'SUCCESS' })}
                                 className="w-full py-4 rounded-lg border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center gap-1 text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all"
                              >
                                 <Plus className="w-4 h-4" />
                                 <span className="text-[10px] font-medium">Ajouter un contact</span>
                              </button>
                           </div>
                        </div>

                        {/* Risk */}
                        <div className="col-span-12 lg:col-span-4 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-5">
                           <SectionHeader icon={Activity} title="Score de Risque" />
                           <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle className="text-[var(--border-subtle)] stroke-current" strokeWidth="12" cx="50" cy="50" r="40" fill="transparent" />
                                    <circle className={`${activeSupplier.riskScore > 60 ? 'text-rose-500' : 'text-emerald-500'} stroke-current`} strokeWidth="12" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${activeSupplier.riskScore * 2.51} 251`} />
                                 </svg>
                                 <span className="absolute text-sm font-bold">{activeSupplier.riskScore}%</span>
                              </div>
                              <div>
                                 <ComplianceBadge status={activeSupplier.complianceStatus} size="sm" />
                                 <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Dernier audit: À jour</p>
                              </div>
                           </div>
                        </div>

                        {/* Products preview */}
                        <div className="col-span-12 lg:col-span-8 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-5">
                           <SectionHeader icon={LayoutGrid} title="Produits référencés" badge={String(activeSupplier.products?.length || 0)} />
                           <div className="space-y-2">
                              {activeSupplier.products?.slice(0, 4).map(p => (
                                 <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all">
                                    <span className="text-sm font-medium truncate">{p.name}</span>
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                                 </div>
                              ))}
                              <button onClick={() => setActiveTab('PDM')} className="w-full py-2 rounded-lg border border-[var(--accent)]/25 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all">
                                 Voir tout le catalogue →
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* CAHIER DES CHARGES */}
                  {activeTab === 'SPECS' && (
                     <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-6 animate-fade-in">
                        <SpecificationsTab supplier={activeSupplier} />
                     </div>
                  )}

                  {/* GED */}
                  {activeTab === 'GED' && (
                     <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-6 animate-fade-in">
                        <SupplierGEDTab supplier={activeSupplier} />
                     </div>
                  )}

                  {/* ANALYSIS */}
                  {activeTab === 'ANALYSIS' && (
                     <div className="bg-[var(--bg-main)]/30 rounded-xl border border-[var(--border-subtle)] p-6 animate-fade-in">
                        <AnalysisTab supplier={activeSupplier} />
                     </div>
                  )}

                  {/* CAMPAIGN */}
                  {activeTab === 'CAMPAIGN' && (
                     <div className="bg-[var(--bg-main)]/30 rounded-xl border border-[var(--border-subtle)] p-6 animate-fade-in">
                        <CampaignTab supplier={activeSupplier} />
                     </div>
                  )}

                  {/* INDUSTRIAL */}
                  {activeTab === 'INDUSTRIAL' && (
                     <div className="bg-[var(--bg-main)]/30 rounded-xl border border-[var(--border-subtle)] p-6 animate-fade-in max-w-4xl">
                        <SectionHeader icon={Factory} title="Fiche Industrielle" />
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <FormField label="TVA Intracom." value={activeSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(activeSupplier.id, { industrialInfo: { ...activeSupplier.industrialInfo, vatNumber: v } })} />
                           <FormField label="DUNS Number" value={activeSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(activeSupplier.id, { industrialInfo: { ...activeSupplier.industrialInfo, dunsNumber: v } })} />
                           <FormField label="Chiffre d'Affaire" value={activeSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M EUR" onChange={(v: string) => updateSupplier(activeSupplier.id, { industrialInfo: { ...activeSupplier.industrialInfo, annualRevenue: v } })} />
                           <FormField label="Effectif Total" value={activeSupplier.industrialInfo?.employeeCount || ''} placeholder="Ex: 150" onChange={(v: string) => updateSupplier(activeSupplier.id, { industrialInfo: { ...activeSupplier.industrialInfo, employeeCount: v } })} />
                        </div>
                        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                           <SectionHeader icon={MapPin} title="Localisation du site" />
                           <div className="h-40 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] overflow-hidden">
                              <div className="text-center p-4">
                                 <MapPin className="w-6 h-6 mx-auto mb-2 opacity-30 text-[var(--accent)]" />
                                 <p className="text-[11px] font-medium text-[var(--text-primary)]">{activeSupplier.industrialInfo?.address || 'Adresse principale non renseignée'}</p>
                                 <p className="text-[10px] mt-1">{activeSupplier.industrialInfo?.city || ''} {activeSupplier.industrialInfo?.zipCode || ''}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* MATIERES PREMIERES */}
                  {activeTab === 'MATIERES' && (
                     <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center mb-1">
                           <div>
                              <h3 className="text-sm font-black uppercase tracking-tight">Matières Premières</h3>
                              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Gérées avec cahier des charges GFSI</p>
                           </div>
                           <button onClick={() => setIsMaterialModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-orange-500/10 transition-all">
                              <Plus className="w-3.5 h-3.5" /> Nouvelle Matière
                           </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {(activeSupplier.rawMaterials || []).map(matId => {
                              const rm = rawMaterials.find(m => m.id === matId);
                              if (!rm) return null;
                              return (
                                 <div key={rm.id} onClick={() => setSelectedMaterial(rm)} className="cursor-pointer bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 shadow-sm hover:border-[var(--accent)]/40 hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button
                                          onClick={(e) => { e.stopPropagation(); setSelectedMaterial(rm); }}
                                          className="p-1 hover:bg-[var(--accent)] hover:text-white rounded transition-colors"
                                       >
                                          <Edit3 className="w-3 h-3" />
                                       </button>
                                       <button
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             if (confirm("Supprimer cette matière première ?")) deleteRawMaterial(rm.id);
                                          }}
                                          className="p-1 hover:bg-rose-500 hover:text-white rounded transition-colors"
                                       >
                                          <Trash2 className="w-3 h-3" />
                                       </button>
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                       <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
                                          <Box className="w-5 h-5" />
                                       </div>
                                       <span className={`text-[8px] font-black px-2 py-1 rounded border uppercase tracking-widest ${rm.riskLevel === 'HIGH' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' :
                                          rm.riskLevel === 'MEDIUM' ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' :
                                             'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                                          }`}>
                                          Risque {rm.riskLevel}
                                       </span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 truncate text-[var(--text-primary)]">{rm.name}</h4>
                                    <p className="text-[10px] text-[var(--text-muted)] mb-4 font-medium uppercase tracking-tight">{rm.category}</p>

                                    <div className="space-y-2 mb-4">
                                       <div className="flex justify-between items-center text-[10px]">
                                          <span className="text-[var(--text-muted)] uppercase tracking-tight">Allergènes:</span>
                                          <span className="font-bold text-[var(--text-primary)]">{rm.allergens?.length ? rm.allergens.join(', ') : 'Aucun'}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-[10px]">
                                          <span className="text-[var(--text-muted)] uppercase tracking-tight">GFSI:</span>
                                          <span className={`font-bold ${rm.requiresGFSICertificate ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>{rm.requiresGFSICertificate ? 'OBLIGATOIRE' : 'NON REQUIS'}</span>
                                       </div>
                                    </div>

                                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                                       <div className="flex items-center gap-1.5">
                                          <FolderClosed className="w-3 h-3 text-[var(--text-muted)]" />
                                          <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">{rm.requiredDocuments?.length || 0} DOCS</span>
                                       </div>
                                       <button className="text-[9px] font-black text-[var(--accent)] hover:text-[var(--accent)]/80 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-widest">
                                          Détails <ChevronRight className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                           {(!activeSupplier.rawMaterials || activeSupplier.rawMaterials.length === 0) && (
                              <div className="col-span-full py-16 text-center text-[var(--text-muted)] bg-[var(--bg-main)]/30 rounded-xl border border-[var(--border-subtle)] border-dashed">
                                 <Box className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                 <p className="text-xs font-black uppercase tracking-widest">Aucune matière référencée</p>
                                 <p className="text-[10px] mt-2 max-w-[250px] mx-auto opacity-60 font-medium">Le fournisseur n'est rattaché à aucun cahier des charges de matière première.</p>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* PDM */}
                  {activeTab === 'PDM' && (
                     <div className="animate-fade-in space-y-6">
                        <div className="flex justify-between items-center mb-1">
                           <div>
                              <h3 className="text-sm font-black uppercase tracking-tight">Catalogue de référencement</h3>
                              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Produits et fiches techniques</p>
                           </div>
                           <span className="bg-[var(--accent)] text-white px-2 py-1 text-[9px] font-black rounded border border-white/20 shadow-sm">{activeSupplier.products?.length || 0} PRODUITS</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {activeSupplier.products?.map(p => (
                              <div key={p.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 hover:border-[var(--accent)]/40 hover:shadow-lg transition-all group relative overflow-hidden">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
                                       <LayoutGrid className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                       <span className="text-[8px] font-black text-[var(--text-muted)] bg-[var(--bg-main)]/50 rounded border border-[var(--border-subtle)] px-2 py-1 uppercase tracking-widest">V1.0</span>
                                       <button
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             if (confirm("Supprimer ce produit ?")) deleteProduct(activeSupplier.id, p.id);
                                          }}
                                          className="p-1 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                          <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 </div>
                                 <h4 className="font-bold text-sm mb-1 truncate text-[var(--text-primary)]">{p.name}</h4>
                                 <p className="text-[9px] text-[var(--text-muted)] mb-5 font-medium uppercase tracking-widest truncate">{p.category}</p>
                                 <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                                    <div className="flex items-center gap-2">
                                       <div className={`w-2 h-2 rounded-full ${p.allergens?.length ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'}`} />
                                       <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tight">{p.status || 'VALIDE'}</span>
                                    </div>
                                    <button onClick={() => setSelectedProduct(p)} className="text-[9px] font-black text-[var(--accent)] hover:text-[var(--accent)]/80 uppercase tracking-widest flex items-center gap-1">
                                       Technique <ChevronRight className="w-3 h-3" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                           <button
                              onClick={() => setIsAddProductOpen(true)}
                              className="rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center p-8 text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all group min-h-[160px] cursor-pointer"
                           >
                              <div className="w-10 h-10 rounded-full border border-dashed border-[var(--border-subtle)] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:border-[var(--accent)]/50 transition-all">
                                 <Plus className="w-5 h-5" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest">Référencer un produit</span>
                           </button>
                        </div>
                     </div>
                  )}

                  {/* JOURNAL */}
                  {activeTab === 'JOURNAL' && (
                     <div className="max-w-4xl animate-fade-in space-y-6">
                        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 shadow-sm focus-within:ring-2 ring-[var(--accent)]/10 transition-all">
                           <SectionHeader icon={History} title="Rédiger une note" />
                           <textarea
                              placeholder="Consigner un événement d'audit, une anomalie ou une instruction stratégique…"
                              className="w-full h-28 bg-transparent resize-none text-sm placeholder:text-[var(--text-muted)] outline-none text-[var(--text-primary)] font-medium leading-relaxed"
                              value={newCommentText}
                              onChange={e => setNewCommentText(e.target.value)}
                           />
                           <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] gap-3">
                              <button onClick={() => setNewCommentText('')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)]">Effacer</button>
                              <button onClick={handleAddComment} disabled={!newCommentText} className="px-6 py-2.5 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-orange-500/10 disabled:opacity-30 hover:opacity-90 transition-all flex items-center gap-2">
                                 <Save className="w-3.5 h-3.5" /> Publier la note
                              </button>
                           </div>
                        </div>

                        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-px before:bg-[var(--border-subtle)]">
                           {activeSupplier.commentaries?.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(c => (
                              <div key={c.id} className="flex gap-4 items-start relative z-10 pl-1">
                                 <div className="w-8 h-8 rounded-lg bg-[var(--accent)] shrink-0 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-orange-500/10">
                                    {c.author.charAt(0)}
                                 </div>
                                 <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                       <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-black uppercase tracking-tight text-[var(--text-primary)]">{c.author}</span>
                                          <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                                          <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">{c.category || 'GENERAL'}</span>
                                       </div>
                                       <div className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tight">
                                          <Clock className="w-3 h-3" />
                                          {new Date(c.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                       </div>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">{c.text}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

               </div>

               {/* Footer */}
               <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] flex justify-between items-center shrink-0">
                  <div className="flex gap-4">
                     <button onClick={() => addNotification({ title: 'Export PDF', message: 'Génération en cours…', type: 'SUCCESS' })} className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
                        <FileDown className="w-4 h-4" /> Exporter PDF
                     </button>
                     <button onClick={() => addNotification({ title: 'Partage', message: 'Lien sécurisé généré.', type: 'SUCCESS' })} className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
                        <Share2 className="w-4 h-4" /> Partager
                     </button>
                  </div>
                  <div className="flex items-center gap-2">
                     {isEditMode && (
                        <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-[11px] font-medium text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all">
                           Annuler
                        </button>
                     )}
                     <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-medium transition-all ${isEditMode ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-[var(--accent)] text-white shadow-md shadow-orange-500/25 hover:opacity-90'}`}
                     >
                        {isEditMode ? <><Save className="w-4 h-4" /> Enregistrer</> : <><Edit3 className="w-4 h-4" /> Modifier</>}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* PRODUCT TECHNICAL MODAL */}
         {selectedProduct && activeSupplier && (
            <ProductTechnicalModal product={selectedProduct} supplier={activeSupplier} onClose={() => setSelectedProduct(null)} />
         )}

         {/* RAW MATERIAL MODAL */}
         {(selectedMaterial || isMaterialModalOpen) && activeSupplier && (
            <RawMaterialModal
               material={selectedMaterial || undefined}
               supplierId={activeSupplier.id}
               onClose={() => { setSelectedMaterial(null); setIsMaterialModalOpen(false); }}
            />
         )}

         {/* ADD PRODUCT MODAL */}
         {isAddProductOpen && activeSupplier && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddProductOpen(false)} />
               <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-semibold">Référencer un produit</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{activeSupplier.name}</p>
                     </div>
                     <button onClick={() => setIsAddProductOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)]">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <form
                     onSubmit={e => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        addProductToSupplier(activeSupplier.id, {
                           name: fd.get('name') as string,
                           category: fd.get('category') as string,
                           origin: fd.get('origin') as string,
                           ingredients: (fd.get('ingredients') as string).split(',').map(s => s.trim()).filter(Boolean),
                           allergens: (fd.get('allergens') as string).split(',').map(s => s.trim()).filter(Boolean),
                        });
                        // Refresh selected supplier view
                        setIsAddProductOpen(false);
                     }}
                     className="p-5 space-y-4"
                  >
                     <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Nom du produit *</label>
                        <input name="name" required placeholder="Ex: Tomates Bio Cerise" className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Catégorie *</label>
                           <input name="category" required placeholder="Ex: Légumes" className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                        </div>
                        <div>
                           <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Origine</label>
                           <input name="origin" placeholder="Ex: France" className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Ingrédients <span className="text-[var(--text-muted)]">(séparés par des virgules)</span></label>
                        <input name="ingredients" placeholder="Tomates, Eau, Sel..." className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                     </div>
                     <div>
                        <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Allergènes <span className="text-[var(--text-muted)]">(séparés par des virgules)</span></label>
                        <input name="allergens" placeholder="Gluten, Lait..." className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                     </div>
                     <div className="flex gap-3 pt-2 border-t border-[var(--border-subtle)]">
                        <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)]">
                           Annuler
                        </button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-medium shadow-md shadow-orange-500/20 hover:opacity-90">
                           Référencer le produit
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* ADD SUPPLIER MODAL */}
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
               <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center">
                     <div>
                        <h3 className="text-base font-semibold">Nouveau partenaire</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Initialisation du dossier</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-all">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <form onSubmit={e => {
                     e.preventDefault();
                     const fd = new FormData(e.currentTarget);
                     const name = fd.get('name') as string;
                     if (!name) return;
                     addSupplier({
                        id: `SUP-${Date.now()}`, name,
                        country: fd.get('country') as string || 'France',
                        contactEmail: fd.get('email') as string || '',
                        status: 'NEW', onboardingStep: 'NEW',
                        complianceStatus: ComplianceStatus.PENDING,
                        riskScore: 50, documents: [], products: [],
                        commentaries: [], contacts: [], attachments: [], nonConformities: []
                     });
                     setIsModalOpen(false);
                  }} className="p-5 space-y-4">
                     <div>
                        <label className="text-[11px] font-medium text-[var(--text-secondary)] mb-1 block">Nom de l'entité</label>
                        <input name="name" required className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-[11px] font-medium text-[var(--text-secondary)] mb-1 block">Pays</label>
                           <input name="country" required className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                        </div>
                        <div>
                           <label className="text-[11px] font-medium text-[var(--text-secondary)] mb-1 block">Email</label>
                           <input name="email" type="email" required className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-sm" />
                        </div>
                     </div>
                     <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Annuler</button>
                        <button type="submit" className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-medium shadow-md shadow-orange-500/20 hover:opacity-90">Créer le dossier</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* BULK IMPORT MODAL */}
         {isBulkModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsBulkModalOpen(false)} />
               <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                     <FileSpreadsheet className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">Importation massive</h3>
                  <p className="text-xs text-[var(--text-muted)] text-center mb-6">Déposez votre fichier XLS ou CSV pour importer plusieurs fournisseurs.</p>
                  <div className="w-full p-8 rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center cursor-pointer hover:border-[var(--accent)]/50 hover:bg-[var(--accent-subtle)] transition-all group" onClick={() => excelInputRef.current?.click()}>
                     <UploadCloud className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-2 transition-colors" />
                     <span className="text-xs font-medium text-[var(--text-muted)] group-hover:text-[var(--accent)]">Glisser-déposer ou parcourir</span>
                     <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleExcelImport} />
                  </div>
                  <button onClick={downloadExcelTemplate} className="mt-4 flex items-center gap-2 text-xs font-medium text-[var(--accent)] hover:underline">
                     <FileDown className="w-4 h-4" /> Télécharger le gabarit Excel
                  </button>
               </div>
            </div>
         )}

      </div>
   );
};

export default SupplierHub;