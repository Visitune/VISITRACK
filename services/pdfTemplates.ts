export interface ExtractionPoint {
    name: string;
    description: string;
    criticity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    synonyms: string[];
    expectedFormat?: 'string' | 'number' | 'date' | 'array' | 'boolean';
}

export interface PDFTemplate {
    id: string;
    name: string;
    description: string;
    category: 'CERTIFICATE' | 'ANALYSIS' | 'SPECIFICATION';
    extractionPoints: ExtractionPoint[];
}

// --- Templates GFSI Génériques ---

export const TEMPLATE_IFS_CERTIFICATE: PDFTemplate = {
    id: 'ifs-v8',
    name: 'Certificat IFS Food (Générique)',
    description: 'Extraction de données pour certificats IFS Food v8 et versions antérieures',
    category: 'CERTIFICATE',
    extractionPoints: [
        {
            name: 'score',
            description: 'Score global en pourcentage',
            criticity: 'CRITICAL',
            synonyms: ['score', 'résultat', 'total score', 'rating'],
            expectedFormat: 'number'
        },
        {
            name: 'grade',
            description: 'Niveau de certification (Foundation/Higher Level)',
            criticity: 'CRITICAL',
            synonyms: ['niveau', 'level', 'grade'],
            expectedFormat: 'string'
        },
        {
            name: 'validFrom',
            description: 'Date de début de validité',
            criticity: 'CRITICAL',
            synonyms: ['valid from', 'effective date', 'date de certification'],
            expectedFormat: 'date'
        },
        {
            name: 'validUntil',
            description: 'Date de fin de validité',
            criticity: 'CRITICAL',
            synonyms: ['valide jusqu\'au', 'valid until', 'expiry date', 'expiration'],
            expectedFormat: 'date'
        },
        {
            name: 'certificationBody',
            description: 'Organisme certificateur',
            criticity: 'MAJOR',
            synonyms: ['organisme', 'certification body', 'auditor', 'organismo'],
            expectedFormat: 'string'
        },
        {
            name: 'scope',
            description: 'Périmètre de certification (produits/services)',
            criticity: 'MAJOR',
            synonyms: ['périmètre', 'scope', 'productos', 'activities'],
            expectedFormat: 'string'
        },
        {
            name: 'majorNonConformities',
            description: 'Nombre de non-conformités majeures',
            criticity: 'CRITICAL',
            synonyms: ['major NC', 'non-conformités majeures', 'KO', 'major non-conformities'],
            expectedFormat: 'number'
        }
    ]
};

export const TEMPLATE_BRCGS_CERTIFICATE: PDFTemplate = {
    id: 'brcgs-v9',
    name: 'Certificat BRCGS Food Safety',
    description: 'Extraction de données pour certificats BRCGS Food Safety v9',
    category: 'CERTIFICATE',
    extractionPoints: [
        {
            name: 'grade',
            description: 'Grade de certification (AA+, AA, A, B, etc.)',
            criticity: 'CRITICAL',
            synonyms: ['grade', 'rating', 'category'],
            expectedFormat: 'string'
        },
        {
            name: 'validUntil',
            description: 'Date d\'expiration ou prochain audit',
            criticity: 'CRITICAL',
            synonyms: ['expiry date', 're-audit due date', 'valid until'],
            expectedFormat: 'date'
        },
        {
            name: 'certificationBody',
            description: 'Organisme certificateur',
            criticity: 'MAJOR',
            synonyms: ['certification body', 'cb', 'auditor'],
            expectedFormat: 'string'
        },
        {
            name: 'scope',
            description: 'Périmètre de certification',
            criticity: 'MAJOR',
            synonyms: ['scope', 'audit scope'],
            expectedFormat: 'string'
        }
    ]
};

export const TEMPLATE_MICRO_ANALYSIS: PDFTemplate = {
    id: 'micro-analysis',
    name: 'Bulletin d\'Analyse Microbiologique (Universel)',
    description: 'Analyse générique pour tous types de produits (Viande, Laitage, Végétaux, etc.)',
    category: 'ANALYSIS',
    extractionPoints: [
        {
            name: 'laboratory',
            description: 'Nom du laboratoire d\'analyse',
            criticity: 'MAJOR',
            synonyms: ['laboratoire', 'laboratory', 'lab'],
            expectedFormat: 'string'
        },
        {
            name: 'sampleDate',
            description: 'Date de prélèvement ou d\'analyse',
            criticity: 'CRITICAL',
            synonyms: ['date de prélèvement', 'sample date', 'date d\'analyse'],
            expectedFormat: 'date'
        },
        {
            name: 'lotNumber',
            description: 'Numéro de lot associé au prélèvement',
            criticity: 'CRITICAL',
            synonyms: ['lot', 'batch number', 'n° lot'],
            expectedFormat: 'string'
        },
        {
            name: 'results',
            description: 'Liste des paramètres analysés avec leurs résultats et limites',
            criticity: 'CRITICAL',
            synonyms: ['résultats', 'results', 'findings'],
            expectedFormat: 'array'
        }
    ]
};

export const PDF_TEMPLATES = {
    IFS: TEMPLATE_IFS_CERTIFICATE,
    BRCGS: TEMPLATE_BRCGS_CERTIFICATE,
    MICRO_ANALYSIS: TEMPLATE_MICRO_ANALYSIS
};
