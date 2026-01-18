export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED'
}

export type OnboardingStep = 'NEW' | 'DOCS_PENDING' | 'REVIEW' | 'VALIDATED';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  category?: 'QUALITY' | 'PURCHASING' | 'LOGISTICS' | 'GENERAL';
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  size: string;
  url?: string;
  content?: string; // Base64 content for real persistence in packages
}

export interface Document {
  id: string;
  name: string;
  type: string;
  expiryDate: string;
  status: ComplianceStatus;
  issuer?: string;
  riskAnalysis?: string;
  comments?: string;
  confidenceScore?: number;
  attachmentId?: string;
}

export interface ProductVersion {
  id: string;
  timestamp: string;
  author: string;
  ingredients: string[];
  allergens: string[];
  specUrl?: string; // Link to the original document
  diff?: string; // Summary of changes
}

export interface Product {
  id: string;
  name: string;
  category: string;
  origin: string;
  isComplianceBlocked?: boolean;
  ingredients?: string[];
  allergens?: string[];
  nutrition?: {
    energy?: string;
    fat?: string;
    carbs?: string;
    protein?: string;
  };
  versions?: ProductVersion[]; // History of the technical sheet
}

export interface NonConformity {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  dueDate: string;
  createdAt: string;
  correctiveAction?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  targetSuppliers: string[]; // IDs
  requestedDocType: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdAt: string;
  stats: {
    total: number;
    received: number;
    pending: number;
  };
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface SupplierIndustrialInfo {
  address?: string;
  city?: string;
  zipCode?: string;
  vatNumber?: string;
  dunsNumber?: string;
  employeeCount?: number;
  annualRevenue?: string;
  bankIban?: string;
  bankBic?: string;
  socialLink?: string;
  factoryCertifications?: string[]; // e.g. "ISO 22000", "FSSC 22000"
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  siret?: string;
  labels?: string[]; // e.g., "B-Corp", "Ecovadis"
  riskScore: number; // 0-100
  status: string;
  onboardingStep: OnboardingStep;
  complianceStatus: ComplianceStatus;
  documents: Document[];
  products: Product[];
  notes?: string;
  commentaries: Comment[];
  contacts: ContactPerson[];
  industrialInfo?: SupplierIndustrialInfo; // Detailed industrial data
  attachments: Attachment[]; // Raw files (PDFs, Images, Data)
  governanceRisk?: number;
  environmentalRisk?: number;
  socialRisk?: number;
  secondarySuppliers?: string[];
  nonConformities: NonConformity[];
  esgScore?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  timestamp: number;
  isRead: boolean;
  link?: string;
}

export interface AnalysisResult {
  isValid: boolean;
  extractedDate: string;
  issuer: string;
  riskAssessment: string;
  suggestedStatus: ComplianceStatus;
  confidence: number;
  fieldScores?: {
    date: number;
    issuer: number;
    risk: number;
  };
}

export type AIAnalysisResult = AnalysisResult;

export interface Settings {
  geminiApiKey: string;
  autoSave: boolean;
  companyName: string;
  theme: 'light' | 'dark';
  ifsApiKey?: string;
  brcApiKey?: string;
  apiEndpointSimulated?: boolean;
}

export interface WorkspaceState {
  suppliers: Supplier[];
  campaigns?: Campaign[];
  settings: Settings;
  notifications: AppNotification[];
  lastModified: number;
  version: string;
}