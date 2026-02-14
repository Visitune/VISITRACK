import React, { useState, useRef } from 'react';
import { Supplier, ComplianceStatus, OnboardingStep, NonConformity, Product, Document, ProductVersion, Comment, ContactPerson, Attachment } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import ComplianceBadge from '../components/ComplianceBadge';
import { GFSIApprovalTab } from '../components/GFSIApprovalTab';
import { SupplierGEDTab } from '../components/SupplierGEDTab';
import {
   Search, MapPin, Plus, X, Globe, Building2,
   ShieldCheck, Clock, AlertTriangle,
   ChevronRight, Edit3, Save, Trash2, UserPlus,
   Filter, Landmark, Truck, Shield, FileDown,
   FileSpreadsheet, UploadCloud, ChevronDown, MoreHorizontal
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
         <h3 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-3">
            <Icon className="w-4 h-4 text-[var(--accent)]" /> {title}
         </h3>
         {badge && <span className="bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">{badge}</span>}
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

         {/* Extreme Granular Sidebar Redesign */}
         {selectedSupplier && (
            <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedSupplier(null)}></div>
               <div className="relative w-full max-w-6xl bg-[var(--bg-card)] h-full border-l border-[var(--border-subtle)] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-slide-right overflow-hidden">

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
                           { id: 'INDUSTRIAL', label: 'Industriel', icon: Landmark },
                           { id: 'GFSI', label: 'GFSI', icon: ShieldCheck },
                           { id: 'GED', label: 'GED', icon: UploadCloud },
                           { id: 'PDM', label: 'Produits', icon: Landmark },
                           { id: 'JOURNAL', label: 'Journal', icon: MoreHorizontal }
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

                  <div className="flex-1 overflow-y-auto scrollbar-hide p-8 bg-[var(--bg-main)]/10">

                     {/* TAB: IDENTITY */}
                     {activeTab === 'IDENTITY' && (
                        <div className="space-y-8 animate-fade-in">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <FormField label="Nom Commercial" value={selectedSupplier.name} readOnly={true} />
                              <FormField label="Email Principal" value={selectedSupplier.contactEmail} onChange={(v: string) => updateSupplier(selectedSupplier.id, { contactEmail: v })} />
                              <FormField label="Téléphone" placeholder="+33..." onChange={(v: string) => { }} />
                              <FormField label="Site Web" value={selectedSupplier.website} placeholder="www.example.com" onChange={(v: string) => updateSupplier(selectedSupplier.id, { website: v })} />
                              <FormField label="Code Fournisseur" value={selectedSupplier.code} placeholder="S00001" onChange={(v: string) => updateSupplier(selectedSupplier.id, { code: v })} />
                              <FormField label="Classification" value={selectedSupplier.classification} placeholder="Direct / Indirect" onChange={(v: string) => updateSupplier(selectedSupplier.id, { classification: v })} />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <section className="space-y-4">
                                 <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Siège Social</h3>
                                 <div className="space-y-4 p-6 bg-[var(--bg-main)]/20 border border-[var(--border-subtle)] rounded-2xl">
                                    <FormField label="Adresse" value={selectedSupplier.address} placeholder="123 Rue du Commerce" onChange={(v: string) => updateSupplier(selectedSupplier.id, { address: v })} />
                                    <div className="grid grid-cols-2 gap-4">
                                       <FormField label="Ville" value={selectedSupplier.city} placeholder="Paris" onChange={(v: string) => updateSupplier(selectedSupplier.id, { city: v })} />
                                       <FormField label="Code Postal" value={selectedSupplier.zipCode} placeholder="75000" onChange={(v: string) => updateSupplier(selectedSupplier.id, { zipCode: v })} />
                                    </div>
                                 </div>
                              </section>

                              <section className="space-y-4">
                                 <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Informations Administratives</h3>
                                 <div className="space-y-4 p-6 bg-[var(--bg-main)]/20 border border-[var(--border-subtle)] rounded-2xl">
                                    <FormField label="SIRET / VAT" placeholder="FR..." />
                                    <FormField label="IBAN" placeholder="FR76..." />
                                 </div>
                              </section>
                           </div>

                           <section className="space-y-4">
                              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                                 <UserPlus className="w-4 h-4" /> Contacts Tiers
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {selectedSupplier.contacts?.map(c => (
                                    <div key={c.id} className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm hover:border-[var(--accent)] transition-all group relative overflow-hidden">
                                       <div className="flex items-center gap-4 relative z-10">
                                          <div className="w-10 h-10 bg-[var(--bg-main)] rounded-full flex items-center justify-center font-bold text-[var(--accent)] border border-[var(--border-subtle)]">
                                             {c.name.charAt(0)}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <p className="font-bold text-sm truncate">{c.name}</p>
                                             <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">{c.role}</p>
                                          </div>
                                       </div>
                                       <div className="mt-4 flex flex-col gap-1.5 relative z-10">
                                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                                             <div className="w-1 h-1 rounded-full bg-[var(--accent)]"></div>
                                             {c.email}
                                          </div>
                                       </div>
                                       <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Edit3 className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-pointer hover:text-[var(--accent)]" />
                                       </div>
                                    </div>
                                 ))}
                                 <button className="h-full min-h-[100px] border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group">
                                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center mb-2 group-hover:border-[var(--accent)] group-hover:scale-110 transition-all">
                                       <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Ajouter un Contact</span>
                                 </button>
                              </div>
                           </section>
                        </div>
                     )}

                     {/* TAB: INDUSTRIAL */}
                     {activeTab === 'INDUSTRIAL' && (
                        <div className="space-y-8 animate-fade-in">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <FormField label="TVA Intracom." value={selectedSupplier.industrialInfo?.vatNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, vatNumber: v } })} />
                              <FormField label="DUNS Number" value={selectedSupplier.industrialInfo?.dunsNumber} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, dunsNumber: v } })} />
                              <FormField label="Chiffre d'Affaire" value={selectedSupplier.industrialInfo?.annualRevenue} placeholder="Ex: 5M€" onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, annualRevenue: v } })} />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                              <section className="space-y-4">
                                 <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Capacité & Logistique</h3>
                                 <div className="space-y-4 p-6 bg-[var(--bg-main)]/20 border border-[var(--border-subtle)] rounded-2xl">
                                    <FormField label="Adresse du Site" value={selectedSupplier.industrialInfo?.address} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, address: v } })} />
                                    <FormField label="Ville de Production" value={selectedSupplier.industrialInfo?.city} onChange={(v: string) => updateSupplier(selectedSupplier.id, { industrialInfo: { ...selectedSupplier.industrialInfo, city: v } })} />
                                 </div>
                              </section>

                              <section className="space-y-4">
                                 <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">Évaluation Industrielle</h3>
                                 <div className="space-y-4 p-6 bg-[var(--bg-main)]/20 border border-[var(--border-subtle)] rounded-2xl">
                                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)]">
                                       <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-2">Score de Risque Industriel</p>
                                       <div className="flex items-center gap-4">
                                          <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden">
                                             <div className="h-full bg-amber-500 w-[65%]" />
                                          </div>
                                          <span className="text-sm font-black">65%</span>
                                       </div>
                                    </div>
                                 </div>
                              </section>
                           </div>
                        </div>
                     )}

                     {/* TAB: GFSI */}
                     {activeTab === 'GFSI' && selectedSupplier && (
                        <div className="animate-fade-in">
                           <GFSIApprovalTab supplier={selectedSupplier} />
                        </div>
                     )}

                     {/* TAB: GED */}
                     {activeTab === 'GED' && selectedSupplier && (
                        <div className="animate-fade-in">
                           <SupplierGEDTab supplier={selectedSupplier} />
                        </div>
                     )}

                     {/* TAB: PDM */}
                     {activeTab === 'PDM' && (
                        <div className="space-y-6 animate-fade-in">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedSupplier.products?.map(p => (
                                 <div key={p.id} className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-sm hover:border-[var(--accent)] transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                       <div className="p-3 bg-[var(--accent)]/10 rounded-xl">
                                          <Truck className="w-5 h-5 text-[var(--accent)]" />
                                       </div>
                                       <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-main)] px-2 py-1 rounded">V{p.versions?.[0]?.version || '1.0'}</span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1">{p.name}</h4>
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium mb-4">{p.category}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                                       <span className="text-[10px] font-bold text-[var(--success)]">{p.status}</span>
                                       <button className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                          Fiche technique <ChevronRight className="w-3 h-3" />
                                       </button>
                                    </div>
                                 </div>
                              ))}
                              <button className="h-full min-h-[160px] border-2 border-dashed border-[var(--border-subtle)] rounded-2xl flex flex-col items-center justify-center text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                                 <Plus className="w-6 h-6 mb-2" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau Produit</span>
                              </button>
                           </div>
                        </div>
                     )}

                     {/* TAB: JOURNAL */}
                     {activeTab === 'JOURNAL' && (
                        <div className="space-y-8 animate-fade-in pb-10">
                           <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm focus-within:ring-2 focus-within:ring-[var(--accent)]/10 transition-all">
                              <div className="flex items-center gap-3 mb-4">
                                 <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                                    <Edit3 className="w-4 h-4" />
                                 </div>
                                 <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)]">Nouvelle Note d'Audit</h4>
                              </div>
                              <textarea
                                 placeholder="Décrivez ici les discussions, points d'attention ou conclusions d'audit..."
                                 className="w-full h-32 bg-[var(--bg-main)]/30 rounded-xl p-4 text-sm resize-none outline-none border border-transparent focus:border-[var(--accent)]/30 transition-all"
                                 value={newCommentText}
                                 onChange={(e) => setNewCommentText(e.target.value)}
                              />
                              <div className="flex justify-between items-center mt-4">
                                 <div className="flex gap-2">
                                    {['GENERAL', 'QUALITY', 'LOGISTICS'].map(cat => (
                                       <button
                                          key={cat}
                                          onClick={() => setCommentCategory(cat as any)}
                                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${commentCategory === cat ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                       >
                                          {cat}
                                       </button>
                                    ))}
                                 </div>
                                 <button
                                    onClick={handleAddComment}
                                    disabled={!newCommentText}
                                    className="px-8 py-2.5 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                 >
                                    Diffuser la Note
                                 </button>
                              </div>
                           </div>

                           <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                              {selectedSupplier.commentaries?.length === 0 ? (
                                 <div className="text-center py-10 text-[var(--text-muted)] text-[11px] italic">Aucune note historique pour le moment.</div>
                              ) : (
                                 selectedSupplier.commentaries?.sort((a, b) => b.timestamp - a.timestamp).map((c, idx) => (
                                    <div key={c.id} className="relative group">
                                       <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-[var(--bg-card)] shadow-sm z-10 transition-all group-hover:scale-125 ${idx === 0 ? 'bg-[var(--accent)] animate-pulse' : 'bg-[var(--text-muted)]'}`}></div>
                                       <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                                          <div className="flex justify-between items-start mb-4">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center font-bold text-[var(--accent)] text-xs">
                                                   {c.author.charAt(0)}
                                                </div>
                                                <div>
                                                   <p className="text-xs font-bold">{c.author}</p>
                                                   <p className="text-[10px] text-[var(--text-muted)] font-medium">{new Date(c.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                             </div>
                                             <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${c.category === 'QUALITY' ? 'bg-amber-500/10 text-amber-500' :
                                                c.category === 'LOGISTICS' ? 'bg-indigo-500/10 text-indigo-500' :
                                                   'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                {c.category}
                                             </span>
                                          </div>
                                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.text}</p>
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Sticky Premium Actions Footer */}
                  <div className="p-6 bg-[var(--bg-card)]/80 backdrop-blur-xl border-t border-[var(--border-subtle)] flex justify-between items-center px-10 shrink-0">
                     <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-widest transition-all group">
                           <FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Dossier Complet
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-widest transition-all group">
                           <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Site Fournisseur
                        </button>
                     </div>
                     <div className="flex items-center gap-3">
                        <button
                           onClick={() => { setIsEditMode(false); }}
                           className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-rose-500/5 ${isEditMode ? 'bg-rose-500/10 text-rose-500' : 'hidden'}`}
                        >
                           Annuler
                        </button>
                        <button
                           onClick={() => setIsEditMode(!isEditMode)}
                           className={`flex items-center gap-2 px-10 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 ${isEditMode
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                              : 'bg-[var(--accent)] text-white shadow-indigo-500/20 hover:opacity-90'
                              }`}
                        >
                           {isEditMode ? <><Save className="w-4 h-4" /> Enregistrer les modifications</> : <><Edit3 className="w-4 h-4" /> Modifier les informations</>}
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