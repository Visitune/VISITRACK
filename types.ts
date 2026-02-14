export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  NON_COMPLIANT = 'NON_COMPLIANT'
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

// --- GFSI Extension Types ---

export type GFSIApprovalStatus = 'NEW' | 'PENDING_DOCS' | 'UNDER_REVIEW' | 'APPROVED' | 'APPROVED_CONDITIONAL' | 'REJECTED';

export interface GFSICertificate {
  id: string;
  type: 'IFS' | 'BRCGS' | 'FSSC22000' | 'ISO22000' | 'OTHER';
  version: string;
  score?: number;
  grade?: string;
  validFrom: string;
  validUntil: string;
  scope: string;
  certificationBody: string;
  majorNonConformities: number;
  minorNonConformities: number;
  attachmentId?: string;
  extractedData?: Record<string, any>;
  findings?: {
    id: string;
    description: string;
    clause?: string;
    severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
    status: 'OPEN' | 'CLOSED';
    correctiveAction?: string;
  }[];
}

export interface AnalysisParameter {
  name: string;
  result: string;
  limit: string;
  unit?: string;
  conform: boolean;
}

export interface LaboratoryAnalysis {
  id: string;
  date: string;
  lotNumber: string;
  materialId: string;
  supplierId: string;
  analysisType: 'MICROBIOLOGY' | 'CHEMISTRY' | 'DNA' | 'ALLERGENS' | 'CONTAMINANTS';
  parameters: AnalysisParameter[];
  laboratory: string;
  status: 'PLANNED' | 'SENT' | 'RESULTS_RECEIVED' | 'VALIDATED';
  overallResult: 'CONFORM' | 'NON_CONFORM';
  attachmentId?: string;
  extractedData?: Record<string, any>;
}

export interface ReceptionControl {
  id: string;
  date: string;
  lotNumber: string;
  supplierLotNumber: string;
  materialId: string;
  quantity: number;
  unit: string;
  documentaryChecks: {
    sanitaryCertificate: boolean;
    analysisResults: boolean;
    traceability: boolean;
    labeling: boolean;
  };
  physicalChecks: {
    temperature?: number;
    temperatureLimit: number;
    visualAspect: 'CONFORM' | 'NON_CONFORM';
    smell: 'NORMAL' | 'ABNORMAL';
    dlc?: string;
    packagingIntegrity: boolean;
  };
  decision: 'ACCEPTED' | 'ACCEPTED_CONDITIONAL' | 'REJECTED';
  remarks?: string;
  operator: string;
  photoUrl?: string;
  nonConformityId?: string;
  labAnalysisId?: string; // Linked lab analysis
}

export interface RawMaterial {
  id: string;
  name: string;
  category: string; // e.g., 'MEAT', 'DAIRY', 'VEGETABLES', 'EPICES', 'PACKAGING'
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  requiresGFSICertificate: boolean;
  requiredDocuments: string[];
  allergens: string[];
  crossContaminationRisk: string[];
  fraudVulnerability: 'HIGH' | 'MEDIUM' | 'LOW';
  fraudRisks: string[];
  approvedSuppliers: string[]; // Supplier IDs
  foodDefenseRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  defenseMeasures?: string[];
  vulnerabilityAssessment?: {
    substitution: number;
    adulteration: number;
    counterfeiting: number;
    overall: number;
  };
}

export interface AnnualReview {
  id: string;
  year: number;
  date: string;
  reviewer: string;
  scores: {
    quality: number;
    gfsiCompliance: number;
    laboratoryResults: number;
    logistics: number;
    overall: number;
  };
  grade: 'A' | 'B' | 'C' | 'D';
  decision: 'MAINTAIN' | 'REINFORCE_REQUIREMENTS' | 'IMPROVEMENT_PLAN' | 'UNDER_OBSERVATION' | 'DELIST';
  remarks?: string;
  reportAttachmentId?: string;
}

export interface SupplierQuestionnaire {
  id: string;
  materialCategory: string;
  completedDate?: string;
  status: 'PENDING' | 'COMPLETED' | 'VALIDATED';
  responses: Record<string, any>;
}

export interface CrisisAction {
  id: string;
  type: 'BLOCKING' | 'ALERT' | 'RECALL' | 'ANALYSIS' | 'REPORT';
  description: string;
  status: 'PENDING' | 'DONE';
  dueDate?: string;
}

export interface CrisisCase {
  id: string;
  alertType: 'RASFF' | 'INFOSAN' | 'INTERNAL' | 'CLIENT';
  alertReference?: string;
  product: string;
  danger: string;
  origin?: string;
  createdDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  affectedLots: string[];
  affectedFinishedProducts: string[];
  actions: CrisisAction[];
}

// --- End GFSI Extension Types ---

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

  // GFSI Extensions
  approvalStatus?: GFSIApprovalStatus;
  approvalDate?: string;
  approvedBy?: string;
  nextReviewDate?: string;
  gfsiCertificates?: GFSICertificate[];
  questionnaires?: SupplierQuestionnaire[];
  receptionControls?: ReceptionControl[];
  laboratoryAnalyses?: LaboratoryAnalysis[];
  annualReviews?: AnnualReview[];
  rawMaterials?: string[]; // IDs of RawMaterial
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
  rawMaterials?: RawMaterial[];
  crisisCases?: CrisisCase[];
  campaigns?: Campaign[];
  settings: Settings;
  notifications: AppNotification[];
  lastModified: number;
  version: string;
}