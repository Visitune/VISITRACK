import { PDF_TEMPLATES, PDFTemplate } from './pdfTemplates';
import { analyzeDocumentWithTemplate } from './geminiService';

export class PDFAnalyzer {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Analyse un PDF avec un template spécifique
     */
    async analyzePDF(
        base64Content: string,
        template: PDFTemplate
    ): Promise<Record<string, any>> {

        // Construction du prompt structuré pour Gemini
        const prompt = this.buildAnalysisPrompt(template);

        // Appel Gemini avec le PDF
        const result = await analyzeDocumentWithTemplate(base64Content, prompt, this.apiKey);

        // Validation et structuration des données
        return this.validateAndStructure(result, template);
    }

    private buildAnalysisPrompt(template: PDFTemplate): string {
        const pointsDescription = template.extractionPoints
            .map(point => {
                const synonymsStr = point.synonyms.join(', ');
                return `- **${point.name}** (${point.criticity}): ${point.description}
          Synonymes possibles: ${synonymsStr}
          Format attendu: ${point.expectedFormat || 'string'}`;
            })
            .join('\n');

        return `
Tu es un expert en analyse de documents techniques et conformité agroalimentaire.

Analyse ce document de type "${template.name}" et extrais les informations suivantes de manière structurée :

${pointsDescription}

Réponds UNIQUEMENT au format JSON strict suivant :
{
  "extractedData": {
    "point1": "valeur1",
    "point2": "valeur2",
    ...
  },
  "confidence": 0.95,
  "warnings": ["avertissement1", "avertissement2"]
}

IMPORTANT :
- Si une information n'est pas trouvée, utilise null
- Pour les dates, utilise le format ISO 8601 (YYYY-MM-DD)
- Pour les nombres, retourne des valeurs numériques (pas de strings)
- Indique un score de confiance global (0-1)
- Liste les avertissements si certaines données sont ambiguës ou si des points critiques manquent
    `.trim();
    }

    private validateAndStructure(
        rawResult: any,
        template: PDFTemplate
    ): Record<string, any> {
        const extracted = rawResult.extractedData || {};
        const validated: Record<string, any> = {};

        for (const point of template.extractionPoints) {
            const value = extracted[point.name];

            // Validation simple et conversion selon le format attendu
            if (value === null || value === undefined) {
                validated[point.name] = null;
                continue;
            }

            try {
                if (point.expectedFormat === 'number') {
                    validated[point.name] = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
                } else if (point.expectedFormat === 'date') {
                    const date = new Date(value);
                    validated[point.name] = isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
                } else if (point.expectedFormat === 'boolean') {
                    validated[point.name] = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true';
                } else {
                    validated[point.name] = value;
                }
            } catch (e) {
                console.warn(`Erreur de conversion pour ${point.name}:`, e);
                validated[point.name] = value;
            }
        }

        return {
            ...validated,
            _metadata: {
                confidence: rawResult.confidence || 0,
                warnings: rawResult.warnings || [],
                analyzedAt: new Date().toISOString(),
                templateUsed: template.id
            }
        };
    }
}
