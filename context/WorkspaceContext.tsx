import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Supplier, ComplianceStatus, WorkspaceState, Settings, AppNotification,
  NonConformity, Product, Campaign, Comment, ContactPerson, Attachment,
  RawMaterial, CrisisCase, GFSICertificate, ReceptionControl, LaboratoryAnalysis,
  AnnualReview, SupplierQuestionnaire, ProductVersion
} from '../types';

interface WorkspaceContextType {
  suppliers: Supplier[];
  campaigns: Campaign[];
  rawMaterials: RawMaterial[];
  crisisCases: CrisisCase[];
  settings: Settings;
  notifications: AppNotification[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addDocumentToSupplier: (supplierId: string, doc: any) => void;
  addCommentToSupplier: (supplierId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  addAttachmentToSupplier: (supplierId: string, attachment: Omit<Attachment, 'id' | 'uploadDate'>) => void;
  linkSecondarySupplier: (supplierId: string, subSupplierId: string) => void;
  linkRawMaterialToSupplier: (supplierId: string, materialId: string) => void;
  addNonConformity: (supplierId: string, nc: NonConformity) => void;
  updateNonConformity: (supplierId: string, ncId: string, updates: Partial<NonConformity>) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (updates: Partial<Settings>) => void;
  exportWorkspace: () => void;
  importWorkspace: (file: File) => Promise<void>;
  bulkImportSuppliers: (suppliers: Supplier[]) => void;
  resetWorkspace: () => void;
  updateProduct: (supplierId: string, productId: string, updates: Partial<Product>, reason?: string) => void;
  updateAttachment: (supplierId: string, attachmentId: string, updates: Partial<Attachment>) => void;
  addProductToSupplier: (supplierId: string, product: Omit<Product, 'id' | 'versions'>) => void;

  // GFSI Functions
  addGFSICertificate: (supplierId: string, certificate: GFSICertificate) => void;
  addReceptionControl: (supplierId: string, control: ReceptionControl) => void;
  addLaboratoryAnalysis: (supplierId: string, analysis: LaboratoryAnalysis) => void;
  addRawMaterial: (material: RawMaterial) => void;
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  addCrisisCase: (crisis: CrisisCase) => void;
  updateCrisisCase: (id: string, updates: Partial<CrisisCase>) => void;
  addQuestionnaireToSupplier: (supplierId: string, questionnaire: SupplierQuestionnaire) => void;
  updateQuestionnaireInSupplier: (supplierId: string, questionnaireId: string, updates: Partial<SupplierQuestionnaire>) => void;
  deleteSupplier: (id: string) => void;
  deleteProduct: (supplierId: string, productId: string) => void;
  deleteQuestionnaire: (supplierId: string, questionnaireId: string) => void;
  updateGFSICertificate: (supplierId: string, certId: string, updates: Partial<GFSICertificate>) => void;
  deleteGFSICertificate: (supplierId: string, certId: string) => void;
  updateReceptionControl: (supplierId: string, controlId: string, updates: Partial<ReceptionControl>) => void;
  deleteReceptionControl: (supplierId: string, controlId: string) => void;
  updateLaboratoryAnalysis: (supplierId: string, analysisId: string, updates: Partial<LaboratoryAnalysis>) => void;
  deleteLaboratoryAnalysis: (supplierId: string, analysisId: string) => void;
  deleteRawMaterial: (id: string) => void;
  updateContact: (supplierId: string, contactId: string, updates: Partial<ContactPerson>) => void;
  deleteContact: (supplierId: string, contactId: string) => void;
  // Theme Management
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'visitrack_workspace_v9'; // Bumped version for Mock Data Injection

const DEFAULT_SETTINGS: Settings = {
  geminiApiKey: '',
  autoSave: true,
  companyName: 'Ma Société',
  theme: 'light',
  apiEndpointSimulated: true
};

const INITIAL_DATA: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'BioGarden France',
    country: 'France',
    contactEmail: 'qualite@biogarden.fr',
    website: 'https://biogarden.fr',
    siret: '892 102 921 00021',
    labels: ['Bio UE', 'HVE', 'Ecovadis Gold'],
    riskScore: 12,
    esgScore: 85,
    status: 'ACTIVE',
    onboardingStep: 'VALIDATED',
    complianceStatus: ComplianceStatus.COMPLIANT,
    documents: [],
    nonConformities: [],
    attachments: [
      { id: 'ATT-1', fileName: 'Plan_HACCP_2024.pdf', fileType: 'application/pdf', size: '2.4 MB', uploadDate: '2023-11-15T10:00:00Z', content: '' },
      { id: 'ATT-2', fileName: 'Audit_Interne_Q1.pdf', fileType: 'application/pdf', size: '1.1 MB', uploadDate: '2024-02-01T09:30:00Z', content: '' }
    ],
    contacts: [
      { id: 'C1', name: 'Jean Dupont', role: 'Qualité', email: 'j.dupont@biogarden.fr', phone: '+33 6 12 34 56 78' },
      { id: 'C2', name: 'Marie Vasseur', role: 'Commercial', email: 'm.vasseur@biogarden.fr', phone: '+33 6 98 76 54 32' }
    ],
    commentaries: [
      { id: 'COM1', author: 'Système', text: 'Référencement initial validé.', timestamp: '2023-10-01T10:00:00Z', category: 'GENERAL' },
      { id: 'COM2', author: 'Admin', text: 'Audit annuel prévu en Mai 2024.', timestamp: '2024-01-15T14:30:00Z', category: 'QUALITY' }
    ],
    industrialInfo: {
      address: '12 Rue de la Ferme',
      city: 'Avignon',
      zipCode: '84000',
      vatNumber: 'FR 92 892102921',
      employeeCount: 45,
      factoryCertifications: ['ISO 22000', 'FSSC 22000']
    },
    products: [
      {
        id: 'P1',
        name: 'Tomates Bio',
        category: 'Légumes',
        origin: 'France',
        ingredients: ['Tomates de plein champ'],
        allergens: [],
        versions: [{ id: 'V1', timestamp: '2023-12-01T10:00:00Z', author: 'System', status: 'ACTIVE', ingredients: ['Tomates'], allergens: [] }]
      }
    ],
    approvalStatus: 'APPROVED',
    gfsiCertificates: [
      {
        id: 'CERT-001',
        type: 'IFS',
        version: 'Food v8',
        score: 98.4,
        grade: 'Higher Level',
        validFrom: '2023-01-15',
        validUntil: '2024-03-15',
        scope: 'Transformation de fruits et légumes frais, conditionnement sous atmosphère protectrice.',
        certificationBody: 'Bureau Veritas',
        majorNonConformities: 0,
        minorNonConformities: 2
      }
    ],
    receptionControls: [
      { id: 'RC-1', date: '2024-02-01', materialId: 'MAT-001', lotNumber: 'L-24-033', supplierLotNumber: 'SUP-L-033', quantity: 500, unit: 'kg', physicalChecks: { temperature: 4.2, temperatureLimit: 6, visualAspect: 'CONFORM', smell: 'NORMAL', packagingIntegrity: true }, documentaryChecks: { sanitaryCertificate: true, analysisResults: true, traceability: true, labeling: true }, decision: 'ACCEPTED', operator: 'Martin L.' },
      { id: 'RC-2', date: '2024-01-25', materialId: 'MAT-001', lotNumber: 'L-24-020', supplierLotNumber: 'SUP-L-020', quantity: 450, unit: 'kg', physicalChecks: { temperature: 5.1, temperatureLimit: 6, visualAspect: 'CONFORM', smell: 'NORMAL', packagingIntegrity: true }, documentaryChecks: { sanitaryCertificate: true, analysisResults: true, traceability: true, labeling: true }, decision: 'ACCEPTED_CONDITIONAL', remarks: 'Température limite', operator: 'Martin L.' }
    ]
  },
  {
    id: 'SUP-002',
    name: 'Global Spices Import',
    country: 'India',
    contactEmail: 'export@globalspices.in',
    website: 'https://globalspices.in',
    siret: 'IN-8829102',
    labels: [],
    riskScore: 78,
    esgScore: 40,
    status: 'ACTIVE',
    onboardingStep: 'VALIDATED',
    complianceStatus: ComplianceStatus.REJECTED,
    documents: [],
    nonConformities: [
      { id: 'NC-1', createdAt: '2024-01-10', dueDate: '2024-02-10', title: 'Allergène Non Déclaré', severity: 'CRITICAL', description: 'Traces d\'allergènes non déclarés (Arachide) détectés dans le Curry.', status: 'OPEN', correctiveAction: 'Rappel de lot immédiat.' }
    ],
    expectedDocumentTypes: ['CERTIFICATE', 'SAQ'],
    attachments: [],
    contacts: [
      { id: 'C3', name: 'Raj Patel', role: 'Directeur Export', email: 'raj@globalspices.in' }
    ],
    commentaries: [
      { id: 'COM3', author: 'Qualité', text: 'Attention : Risque de fraude élevé sur le safran et le curcuma. Analyse systématique requise.', timestamp: '2023-11-20T09:00:00Z', category: 'QUALITY' }
    ],
    industrialInfo: {
      address: '45 Spice Market Road',
      city: 'Mumbai',
      zipCode: '400001',
      vatNumber: 'IN MH 28391',
      employeeCount: 200,
      factoryCertifications: ['BRC Food', 'Halal']
    },
    products: [
      { id: 'P2', name: 'Curry Powder Mix', category: 'Epices', origin: 'India', ingredients: ['Curcuma', 'Coriandre', 'Cumin'], allergens: ['Moutarde'], versions: [] }
    ],
    approvalStatus: 'APPROVED_CONDITIONAL',
    gfsiCertificates: [
      {
        id: 'CERT-002',
        type: 'BRCGS',
        version: 'Issue 9',
        score: 85.0,
        grade: 'B',
        validFrom: '2023-06-01',
        validUntil: '2024-06-01',
        scope: 'Grinding and blending of spices.',
        certificationBody: 'SGS',
        majorNonConformities: 1,
        minorNonConformities: 4
      }
    ],
    receptionControls: []
  },
  {
    id: 'SUP-003',
    name: 'PackIndustry Solutions',
    country: 'Germany',
    contactEmail: 'sales@packindustry.de',
    website: 'https://packindustry.de',
    siret: 'DE 9928192',
    labels: ['ISO 14001'],
    riskScore: 5,
    esgScore: 90,
    status: 'PENDING',
    onboardingStep: 'DOCS_PENDING',
    complianceStatus: ComplianceStatus.PENDING,
    documents: [],
    nonConformities: [],
    attachments: [],
    contacts: [
      { id: 'C4', name: 'Hans Mueller', role: 'Qualité', email: 'h.mueller@packindustry.de' }
    ],
    commentaries: [],
    industrialInfo: {
      address: 'Industriestrasse 10',
      city: 'Hamburg',
      zipCode: '20095',
      vatNumber: 'DE 882910',
      employeeCount: 500,
      factoryCertifications: ['ISO 9001', 'BRC Packaging']
    },
    products: [
      { id: 'P3', name: 'Barquette PET Recyclé', category: 'Emballage', origin: 'EU', ingredients: ['rPET'], allergens: [], versions: [] }
    ],
    approvalStatus: 'PENDING_DOCS',
    gfsiCertificates: [],
    receptionControls: []
  },
  {
    id: 'SUP-004',
    name: 'AgroFrozen Belgium',
    country: 'Belgium',
    contactEmail: 'quality@agrofrozen.be',
    website: 'https://agrofrozen.be',
    siret: 'BE 0449.123.456',
    labels: ['Bio UE'],
    riskScore: 25,
    esgScore: 65,
    status: 'ACTIVE',
    onboardingStep: 'VALIDATED',
    complianceStatus: ComplianceStatus.EXPIRED,
    documents: [],
    nonConformities: [],
    attachments: [],
    contacts: [],
    commentaries: [
      { id: 'COM4', author: 'Logistique', text: 'Retard de livraison fréquent le vendredi.', timestamp: '2024-01-05T10:00:00Z', category: 'LOGISTICS' }
    ],
    industrialInfo: {
      address: 'Zone Portuaire 5',
      city: 'Anvers',
      zipCode: '2000',
      vatNumber: 'BE 0449123456',
      employeeCount: 150,
      factoryCertifications: ['IFS Food']
    },
    products: [
      { id: 'P4', name: 'Epinards Hachés Surgelés', category: 'Légumes Surgelés', origin: 'Belgium', ingredients: ['Epinards', 'Crème'], allergens: ['Lait'], versions: [] }
    ],
    approvalStatus: 'APPROVED',
    gfsiCertificates: [
      {
        id: 'CERT-003',
        type: 'IFS',
        version: 'Food v7',
        score: 94.0,
        grade: 'Higher Level',
        validFrom: '2022-12-01',
        validUntil: '2023-12-01', /* EXPIRED */
        scope: 'Deep freezing of vegetables.',
        certificationBody: 'TÜV Nord',
        majorNonConformities: 0,
        minorNonConformities: 1
      }
    ],
    receptionControls: [
      { id: 'RC-3', date: '2024-02-05', materialId: 'MAT-003', lotNumber: 'AF-992', supplierLotNumber: 'SL-992', quantity: 2000, unit: 'kg', physicalChecks: { temperature: -21, temperatureLimit: -18, visualAspect: 'CONFORM', smell: 'NORMAL', packagingIntegrity: true }, documentaryChecks: { sanitaryCertificate: true, analysisResults: true, traceability: true, labeling: true }, decision: 'ACCEPTED', operator: 'Sophie D.' },
      { id: 'RC-4', date: '2024-01-20', materialId: 'MAT-003', lotNumber: 'AF-881', supplierLotNumber: 'SL-881', quantity: 2000, unit: 'kg', physicalChecks: { temperature: -15, temperatureLimit: -18, visualAspect: 'NON_CONFORM', smell: 'NORMAL', packagingIntegrity: true }, documentaryChecks: { sanitaryCertificate: true, analysisResults: true, traceability: true, labeling: true }, decision: 'REJECTED', remarks: 'Rupture chaîne froid (> -18°C)', operator: 'Sophie D.' }
    ]
  }
];

const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'MAT-001',
    name: 'Tomate Cerise Rouge',
    category: 'Légumes',
    riskLevel: 'LOW',
    requiresGFSICertificate: true,
    requiredDocuments: ['Certificat Bio', 'Bulletin Analyse'],
    allergens: [],
    crossContaminationRisk: [],
    fraudVulnerability: 'LOW',
    fraudRisks: [],
    foodDefenseRisk: 'LOW',
    approvedSuppliers: ['SUP-001']
  },
  {
    id: 'MAT-004',
    name: 'Curry Powder Special',
    category: 'Epices',
    riskLevel: 'HIGH',
    requiresGFSICertificate: true,
    requiredDocuments: ['Analyse Soudan rouge', 'Certificat Halal'],
    allergens: ['Moutarde'],
    crossContaminationRisk: ['Allergènes'],
    fraudVulnerability: 'HIGH',
    fraudRisks: ['Ajout colorants interdits', 'Agents de charge'],
    foodDefenseRisk: 'MEDIUM',
    vulnerabilityAssessment: { substitution: 8, adulteration: 9, counterfeiting: 5, overall: 7.5 },
    approvedSuppliers: ['SUP-002']
  }
];

// Helper for visual compression of data in localStorage
const compressData = (data: any) => {
  return JSON.stringify(data);
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [crisisCases, setCrisisCases] = useState<CrisisCase[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: WorkspaceState = JSON.parse(saved);
        setSuppliers(parsed.suppliers || INITIAL_DATA);
        setCampaigns(parsed.campaigns || []);
        setRawMaterials(parsed.rawMaterials || INITIAL_RAW_MATERIALS);
        setCrisisCases(parsed.crisisCases || []);
        setSettings(parsed.settings || DEFAULT_SETTINGS);
        setNotifications(parsed.notifications || []);
      } catch (e) {
        console.error("Failed to load workspace", e);
        setSuppliers(INITIAL_DATA);
        setRawMaterials(INITIAL_RAW_MATERIALS);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSuppliers(INITIAL_DATA);
      setRawMaterials(INITIAL_RAW_MATERIALS);
      setSettings(DEFAULT_SETTINGS);
    }
    const savedTheme = localStorage.getItem('visitrack_theme') as 'dark' | 'light';
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);

    // Explicitly apply theme classes to HTML element
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && (suppliers.length > 0 || settings.geminiApiKey)) {
      const state: WorkspaceState = {
        suppliers,
        campaigns,
        rawMaterials,
        crisisCases,
        settings,
        notifications,
        lastModified: Date.now(),
        version: '8.0'
      };

      try {
        localStorage.setItem(STORAGE_KEY, compressData(state));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          addNotification({
            title: 'Mémoire saturée',
            message: 'Le stockage du navigateur est plein. Exportez votre package et videz le cache.',
            type: 'ERROR'
          });
        }
      }
    }
  }, [suppliers, campaigns, rawMaterials, crisisCases, settings, notifications, isLoaded]);

  // --- Dynamic Scoring Logic ---
  const recalculateSupplierRisk = (supplier: Supplier): Supplier => {
    let score = 100;
    let newStatus = supplier.complianceStatus;

    // 1. GFSI Certificates Check
    const hasValidCert = supplier.gfsiCertificates?.some(c => new Date(c.validUntil) > new Date());
    if (!hasValidCert && supplier.gfsiCertificates && supplier.gfsiCertificates.length > 0) {
      score -= 30; // Expired or invalid
    } else if (!supplier.gfsiCertificates || supplier.gfsiCertificates.length === 0) {
      score -= 10; // No cert yet (less severe if new)
    }

    // 2. Critical Non-Conformities
    const criticalNCs = supplier.nonConformities?.filter(nc => nc.severity === 'CRITICAL' && nc.status === 'OPEN') || [];
    if (criticalNCs.length > 0) {
      score -= 40 * criticalNCs.length;
      newStatus = ComplianceStatus.NON_COMPLIANT;
    }

    // 3. Reception Controls (Last 3 months impact)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentControls = supplier.receptionControls?.filter(rc => new Date(rc.date) > threeMonthsAgo) || [];

    recentControls.forEach(rc => {
      if (rc.decision === 'REJECTED') score -= 20;
      if (rc.decision === 'ACCEPTED_CONDITIONAL') score -= 5;
    });

    // Clamp Score
    score = Math.max(0, Math.min(100, score));

    // Determine Status based on Score (if not blocked by Critical NC)
    if (criticalNCs.length === 0) {
      if (score < 40) newStatus = ComplianceStatus.NON_COMPLIANT;
      else if (score < 70 && newStatus === ComplianceStatus.COMPLIANT) newStatus = ComplianceStatus.PENDING; // Downgrade to Risk/Pending
      else if (score >= 70 && newStatus === ComplianceStatus.NON_COMPLIANT) newStatus = ComplianceStatus.PENDING; // Recovering
    }

    return { ...supplier, riskScore: score, complianceStatus: newStatus };
  };

  const addSupplier = (supplier: Supplier) => {
    const safeSupplier: Supplier = {
      ...supplier,
      documents: supplier.documents || [],
      products: supplier.products || [],
      commentaries: supplier.commentaries || [],
      contacts: supplier.contacts || [],
      attachments: supplier.attachments || [],
      nonConformities: supplier.nonConformities || [],
      industrialInfo: supplier.industrialInfo || {},
      gfsiCertificates: supplier.gfsiCertificates || [],
      receptionControls: supplier.receptionControls || [],
      laboratoryAnalyses: supplier.laboratoryAnalyses || [],
      annualReviews: supplier.annualReviews || [],
      questionnaires: supplier.questionnaires || []
    };
    setSuppliers(prev => [safeSupplier, ...prev]);
    addNotification({
      title: 'Nouveau fournisseur',
      message: `${safeSupplier.name} a été ajouté.`,
      type: 'SUCCESS'
    });
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addCommentToSupplier = (supplierId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `COM-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          commentaries: [newComment, ...(s.commentaries || [])]
        };
      }
      return s;
    }));
  };

  const addAttachmentToSupplier = (supplierId: string, attachment: Omit<Attachment, 'id' | 'uploadDate'>) => {
    const newAttachment: Attachment = {
      ...attachment,
      id: `FILE-${Date.now()}`,
      uploadDate: new Date().toISOString()
    };
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          attachments: [newAttachment, ...(s.attachments || [])]
        };
      }
      return s;
    }));
    addNotification({ title: 'GED Update', message: `Fichier ${attachment.fileName} rattaché.`, type: 'SUCCESS' });
  };

  const addDocumentToSupplier = (supplierId: string, doc: any) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          documents: [doc, ...s.documents],
          complianceStatus: doc.status === ComplianceStatus.REJECTED ? ComplianceStatus.REJECTED :
            doc.status === ComplianceStatus.EXPIRED ? ComplianceStatus.EXPIRED : s.complianceStatus
        };
      }
      return s;
    }));
    addNotification({ title: 'GED Sync', message: `Certificat ajouté pour ${supplierId}`, type: 'INFO' });
  };

  const linkSecondarySupplier = (supplierId: string, subSupplierId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const current = s.secondarySuppliers || [];
        if (current.includes(subSupplierId)) return s;
        return { ...s, secondarySuppliers: [...current, subSupplierId] };
      }
      return s;
    }));
  };

  const linkRawMaterialToSupplier = (supplierId: string, materialId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const current = s.rawMaterials || [];
        if (current.includes(materialId)) return s;
        return { ...s, rawMaterials: [...current, materialId] };
      }
      return s;
    }));
    addNotification({ title: 'Matière Première', message: `Matière rattachée au fournisseur avec succès.`, type: 'SUCCESS' });
  };

  const addNonConformity = (supplierId: string, nc: NonConformity) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const updated = { ...s, nonConformities: [nc, ...s.nonConformities] };
        return recalculateSupplierRisk(updated);
      }
      return s;
    }));
    addNotification({ title: 'Alerte Qualité', message: `Non-conformité détectée pour ${supplierId}`, type: 'WARNING' });
  };

  const updateNonConformity = (supplierId: string, ncId: string, updates: Partial<NonConformity>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          nonConformities: s.nonConformities.map(nc => nc.id === ncId ? { ...nc, ...updates } : nc)
        };
      }
      return s;
    }));
  };

  const addCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
    addNotification({ title: 'Campagne Active', message: `Relance lancée: ${campaign.title}`, type: 'SUCCESS' });
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: Date.now(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const exportWorkspace = () => {
    const state: WorkspaceState = {
      suppliers, campaigns, rawMaterials, crisisCases,
      settings, notifications, lastModified: Date.now(), version: '8.0'
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitrack-enterprise-v8-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importWorkspace = async (file: File) => {
    const text = await file.text();
    try {
      const parsed: WorkspaceState = JSON.parse(text);
      if (Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
      if (Array.isArray(parsed.campaigns)) setCampaigns(parsed.campaigns);
      if (Array.isArray(parsed.rawMaterials)) setRawMaterials(parsed.rawMaterials);
      if (Array.isArray(parsed.crisisCases)) setCrisisCases(parsed.crisisCases);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
      addNotification({ title: 'Restauration réussie', message: 'Toutes les données ERP ont été chargées.', type: 'SUCCESS' });
    } catch (e) {
      alert("Erreur lors de l'import : format de fichier invalide.");
    }
  };

  const bulkImportSuppliers = (newSuppliers: Supplier[]) => {
    setSuppliers(prev => {
      const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
      const filtered = newSuppliers
        .filter(s => !existingNames.has(s.name.toLowerCase()))
        .map(s => ({
          ...s,
          documents: s.documents || [],
          products: s.products || [],
          commentaries: s.commentaries || [],
          contacts: s.contacts || [],
          attachments: s.attachments || [],
          nonConformities: s.nonConformities || [],
          industrialInfo: s.industrialInfo || {},
          gfsiCertificates: s.gfsiCertificates || [],
          receptionControls: s.receptionControls || [],
          laboratoryAnalyses: s.laboratoryAnalyses || [],
          annualReviews: s.annualReviews || [],
          questionnaires: s.questionnaires || []
        }));
      return [...filtered, ...prev];
    });
    addNotification({
      title: 'Import de masse',
      message: `${newSuppliers.length} nouveaux fournisseurs intégrés.`,
      type: 'SUCCESS'
    });
  };

  const resetWorkspace = () => {
    if (confirm("Attention : supprimer définitivement toutes les données du navigateur ?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const updateProduct = (supplierId: string, productId: string, updates: Partial<Product>, reason?: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          products: s.products.map(p => {
            if (p.id === productId) {
              const newVersion: ProductVersion = {
                id: `V-${Date.now()}`,
                timestamp: new Date().toISOString(),
                author: 'Admin Qualité',
                status: 'ACTIVE',
                ingredients: updates.ingredients || p.ingredients || [],
                allergens: updates.allergens || p.allergens || [],
                nutrition: updates.nutrition || p.nutrition,
                attachmentId: (updates as any).attachmentId || (p as any).attachmentId,
                diff: reason || 'Mise à jour manuelle'
              };

              // Mark old versions as OBSOLETE
              const updatedVersions = (p.versions || []).map(v => ({ ...v, status: 'OBSOLETE' as const }));

              return {
                ...p,
                ...updates,
                versions: [newVersion, ...updatedVersions]
              };
            }
            return p;
          })
        };
      }
      return s;
    }));
    addNotification({ title: 'Produit mis à jour', message: `La fiche technique de ${productId} a été versionnée.`, type: 'SUCCESS' });
  };

  const addProductToSupplier = (supplierId: string, product: Omit<Product, 'id' | 'versions'>) => {
    const newProduct: Product = {
      ...product,
      id: `PROD-${Date.now()}`,
      versions: []
    };
    setSuppliers(prev => prev.map(s =>
      s.id === supplierId
        ? { ...s, products: [...(s.products || []), newProduct] }
        : s
    ));
    addNotification({ title: 'Produit référencé', message: `${newProduct.name} ajouté au catalogue.`, type: 'SUCCESS' });
  };

  const updateAttachment = (supplierId: string, attachmentId: string, updates: Partial<Attachment>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          attachments: s.attachments.map(a => a.id === attachmentId ? { ...a, ...updates } : a)
        };
      }
      return s;
    }));
  };

  // --- GFSI Functions Implementation ---

  const addGFSICertificate = (supplierId: string, certificate: GFSICertificate) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const updated = {
          ...s,
          gfsiCertificates: [...(s.gfsiCertificates || []), certificate]
        };
        return recalculateSupplierRisk(updated);
      }
      return s;
    }));
    addNotification({
      title: 'Certificat GFSI ajouté',
      message: `Certificat ${certificate.type} enregistré pour le fournisseur.`,
      type: 'SUCCESS'
    });
  };

  const addReceptionControl = (supplierId: string, control: ReceptionControl) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const updated = {
          ...s,
          receptionControls: [control, ...(s.receptionControls || [])]
        };
        return recalculateSupplierRisk(updated);
      }
      return s;
    }));
    addNotification({
      title: 'Contrôle Réception',
      message: `Réception de lot ${control.lotNumber} enregistrée. Décision: ${control.decision}`,
      type: control.decision === 'REJECTED' ? 'ERROR' : 'SUCCESS'
    });
  };

  const addLaboratoryAnalysis = (supplierId: string, analysis: LaboratoryAnalysis) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          laboratoryAnalyses: [analysis, ...(s.laboratoryAnalyses || [])]
        };
      }
      return s;
    }));
    addNotification({
      title: 'Analyse Laboratoire',
      message: `Résultats d'analyse intégrés pour le lot ${analysis.lotNumber}.`,
      type: analysis.overallResult === 'NON_CONFORM' ? 'ERROR' : 'SUCCESS'
    });
  };

  const addRawMaterial = (material: RawMaterial) => {
    setRawMaterials(prev => [material, ...prev]);
  };

  const updateRawMaterial = (id: string, updates: Partial<RawMaterial>) => {
    setRawMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const addCrisisCase = (crisis: CrisisCase) => {
    setCrisisCases(prev => [crisis, ...prev]);
    addNotification({
      title: '🚨 Alerte Crise',
      message: `Nouveau dossier de crise ouvert: ${crisis.danger} (${crisis.product})`,
      type: 'ERROR'
    });
  };

  const updateCrisisCase = (id: string, updates: Partial<CrisisCase>) => {
    setCrisisCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addQuestionnaireToSupplier = (supplierId: string, questionnaire: SupplierQuestionnaire) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          questionnaires: [...(s.questionnaires || []), questionnaire]
        };
      }
      return s;
    }));
    addNotification({
      title: 'Questionnaire ajouté',
      message: `Questionnaire ${questionnaire.materialCategory} enregistré pour le fournisseur.`,
      type: 'SUCCESS'
    });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addNotification({ title: 'Fournisseur supprimé', message: 'Le fournisseur a été retiré du référentiel.', type: 'INFO' });
  };

  const deleteProduct = (supplierId: string, productId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          products: (s.products || []).filter(p => p.id !== productId)
        };
      }
      return s;
    }));
    addNotification({ title: 'Produit supprimé', message: 'Le produit a été retiré du catalogue.', type: 'INFO' });
  };

  const deleteQuestionnaire = (supplierId: string, questionnaireId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          questionnaires: (s.questionnaires || []).filter(q => q.id !== questionnaireId)
        };
      }
      return s;
    }));
  };

  const updateGFSICertificate = (supplierId: string, certId: string, updates: Partial<GFSICertificate>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          gfsiCertificates: (s.gfsiCertificates || []).map(c => c.id === certId ? { ...c, ...updates } : c)
        };
      }
      return s;
    }));
  };

  const deleteGFSICertificate = (supplierId: string, certId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          gfsiCertificates: (s.gfsiCertificates || []).filter(c => c.id !== certId)
        };
      }
      return s;
    }));
  };

  const updateReceptionControl = (supplierId: string, controlId: string, updates: Partial<ReceptionControl>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          receptionControls: (s.receptionControls || []).map(rc => rc.id === controlId ? { ...rc, ...updates } : rc)
        };
      }
      return s;
    }));
  };

  const deleteReceptionControl = (supplierId: string, controlId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          receptionControls: (s.receptionControls || []).filter(rc => rc.id !== controlId)
        };
      }
      return s;
    }));
  };

  const updateLaboratoryAnalysis = (supplierId: string, analysisId: string, updates: Partial<LaboratoryAnalysis>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          laboratoryAnalyses: (s.laboratoryAnalyses || []).map(la => la.id === analysisId ? { ...la, ...updates } : la)
        };
      }
      return s;
    }));
  };

  const deleteLaboratoryAnalysis = (supplierId: string, analysisId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          laboratoryAnalyses: (s.laboratoryAnalyses || []).filter(la => la.id !== analysisId)
        };
      }
      return s;
    }));
  };

  const deleteRawMaterial = (id: string) => {
    setRawMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateContact = (supplierId: string, contactId: string, updates: Partial<ContactPerson>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          contacts: (s.contacts || []).map(c => c.id === contactId ? { ...c, ...updates } : c)
        };
      }
      return s;
    }));
  };

  const deleteContact = (supplierId: string, contactId: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          contacts: (s.contacts || []).filter(c => c.id !== contactId)
        };
      }
      return s;
    }));
  };

  const updateQuestionnaireInSupplier = (supplierId: string, questionnaireId: string, updates: Partial<SupplierQuestionnaire>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          questionnaires: (s.questionnaires || []).map(q => q.id === questionnaireId ? { ...q, ...updates } : q)
        };
      }
      return s;
    }));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('visitrack_theme', newTheme);

    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <WorkspaceContext.Provider value={{
      suppliers, campaigns, rawMaterials, crisisCases, settings, notifications,
      addSupplier, updateSupplier, addDocumentToSupplier, addCommentToSupplier, addAttachmentToSupplier,
      linkSecondarySupplier, linkRawMaterialToSupplier, addNonConformity, updateNonConformity,
      addCampaign, updateCampaign, addNotification, markNotificationAsRead,
      clearNotifications, updateSettings, exportWorkspace, importWorkspace, bulkImportSuppliers, resetWorkspace,
      addGFSICertificate, addReceptionControl, addLaboratoryAnalysis, addRawMaterial, updateRawMaterial,
      addCrisisCase, updateCrisisCase, addQuestionnaireToSupplier, updateQuestionnaireInSupplier,
      updateProduct, updateAttachment, addProductToSupplier,
      deleteSupplier, deleteProduct, deleteQuestionnaire,
      updateGFSICertificate, deleteGFSICertificate, updateReceptionControl, deleteReceptionControl,
      updateLaboratoryAnalysis, deleteLaboratoryAnalysis, deleteRawMaterial, updateContact, deleteContact,
      theme, toggleTheme
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace context error");
  return context;
};