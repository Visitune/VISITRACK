import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, ComplianceStatus, WorkspaceState, Settings, AppNotification, NonConformity, Product, Campaign, Comment, ContactPerson, Attachment } from '../types';

interface WorkspaceContextType {
  suppliers: Supplier[];
  campaigns: Campaign[];
  settings: Settings;
  notifications: AppNotification[];
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addDocumentToSupplier: (supplierId: string, doc: any) => void;
  addCommentToSupplier: (supplierId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  addAttachmentToSupplier: (supplierId: string, attachment: Omit<Attachment, 'id' | 'uploadDate'>) => void;
  linkSecondarySupplier: (supplierId: string, subSupplierId: string) => void;
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
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY = 'visitrack_workspace_v7';

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
    contactEmail: 'contact@biogarden.fr',
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
    attachments: [],
    contacts: [
      { id: 'C1', name: 'Jean Dupont', role: 'Qualité', email: 'j.dupont@biogarden.fr' }
    ],
    commentaries: [
      { id: 'COM1', author: 'Système', text: 'Référencement initial validé.', timestamp: new Date().toISOString(), category: 'GENERAL' }
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
        versions: [
          {
            id: 'V1',
            timestamp: '2023-12-01T10:00:00Z',
            author: 'System',
            ingredients: ['Tomates de plein champ'],
            allergens: []
          }
        ]
      }
    ]
  }
];

// Helper for visual compression of data in localStorage
const compressData = (data: any) => {
  // In a real browser environment, we could use LZ-based compression
  // Here we ensure the JSON is compact and we could implement a basic string optimization if needed
  return JSON.stringify(data);
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: WorkspaceState = JSON.parse(saved);
        setSuppliers(parsed.suppliers || INITIAL_DATA);
        setCampaigns(parsed.campaigns || []);
        setSettings(parsed.settings || DEFAULT_SETTINGS);
        setNotifications(parsed.notifications || []);
      } catch (e) {
        console.error("Failed to load workspace", e);
        setSuppliers(INITIAL_DATA);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSuppliers(INITIAL_DATA);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && (suppliers.length > 0 || settings.geminiApiKey)) {
      const state: WorkspaceState = {
        suppliers,
        campaigns,
        settings,
        notifications,
        lastModified: Date.now(),
        version: '7.0'
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
  }, [suppliers, campaigns, settings, notifications, isLoaded]);

  const addSupplier = (supplier: Supplier) => {
    // Structural integrity check for new dossier creation
    const safeSupplier: Supplier = {
      ...supplier,
      documents: supplier.documents || [],
      products: supplier.products || [],
      commentaries: supplier.commentaries || [],
      contacts: supplier.contacts || [],
      attachments: supplier.attachments || [],
      nonConformities: supplier.nonConformities || [],
      industrialInfo: supplier.industrialInfo || {}
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

  const addNonConformity = (supplierId: string, nc: NonConformity) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, nonConformities: [nc, ...s.nonConformities] };
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
    const state: WorkspaceState = { suppliers, campaigns, settings, notifications, lastModified: Date.now(), version: '7.0' };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitrack-enterprise-v7-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importWorkspace = async (file: File) => {
    const text = await file.text();
    try {
      const parsed: WorkspaceState = JSON.parse(text);
      if (Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
      if (Array.isArray(parsed.campaigns)) setCampaigns(parsed.campaigns);
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
          industrialInfo: s.industrialInfo || {}
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

  return (
    <WorkspaceContext.Provider value={{
      suppliers, campaigns, settings, notifications,
      addSupplier, updateSupplier, addDocumentToSupplier, addCommentToSupplier, addAttachmentToSupplier,
      linkSecondarySupplier, addNonConformity, updateNonConformity,
      addCampaign, updateCampaign, addNotification, markNotificationAsRead,
      clearNotifications, updateSettings, exportWorkspace, importWorkspace, bulkImportSuppliers, resetWorkspace
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