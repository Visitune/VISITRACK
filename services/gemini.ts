import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeDocument = async (text: string, docType: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("Veuillez configurer votre clé API Gemini dans les Paramètres.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.0-flash";
  
  const prompt = `
    Analyse le texte suivant issu d'un OCR de document fournisseur (${docType}).
    Extrais la date d'expiration, l'émetteur, et évalue le risque.
    Date actuelle: ${new Date().toISOString().split('T')[0]}.
    
    Texte du document:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "Le document est-il valide (dates ok, pas de mots clés suspects) ?" },
            extractedDate: { type: Type.STRING, description: "Date d'expiration au format YYYY-MM-DD" },
            issuer: { type: Type.STRING, description: "Nom de l'organisme certificateur ou assureur" },
            riskAssessment: { type: Type.STRING, description: "Analyse courte du risque (1 phrase)" },
            suggestedStatus: { type: Type.STRING, enum: ["COMPLIANT", "PENDING", "EXPIRED", "REJECTED"] },
            confidence: { type: Type.NUMBER, description: "Score de confiance 0-1" }
          },
          required: ["isValid", "extractedDate", "issuer", "riskAssessment", "suggestedStatus", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as AnalysisResult;
  } catch (err) {
    console.error("Erreur Gemini:", err);
    throw err;
  }
};
