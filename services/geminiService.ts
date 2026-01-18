import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, ComplianceStatus } from "../types";

export const analyzeDocumentCompliance = async (documentText: string, documentType: string, apiKey: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("L'intelligence artificielle nécessite une clé API Gemini. Veuillez la configurer dans Paramètres.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-1.5-flash";

  const systemInstruction = `
    You are an elite Compliance Officer AI for a global supply chain platform (VISITrack Enterprise).
    
    Your goal is to extract structured data from OCR text of supplier certificates (IFS, BRC, ISO, Insurance, etc.).
    
    CRITICAL RULES:
    1. EXTRACT the exact Expiry Date (YYYY-MM-DD).
    2. IDENTIFY the Issuing Body (e.g., Bureau Veritas, SGS).
    3. ASSESS RISK contextually:
       - If "Critical Non-Conformity" or "Suspended" is found -> REJECTED.
       - If expired -> EXPIRED.
       - If valid but grade is low (e.g., Grade C or Foundation Level) -> PENDING (needs review).
       - If valid and high grade -> COMPLIANT.
    4. CALCULATE CONFIDENCE: A float between 0.0 and 1.0 based on data clarity.
    
    Reference Date: ${new Date().toISOString().split('T')[0]}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Document Type: ${documentType}\n\nOCR Content:\n${documentText}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "Technical validity of the document." },
            extractedDate: { type: Type.STRING, description: "YYYY-MM-DD format." },
            issuer: { type: Type.STRING, description: "Organization name." },
            riskAssessment: { type: Type.STRING, description: "Professional risk analysis sentence." },
            suggestedStatus: {
              type: Type.STRING,
              enum: [ComplianceStatus.COMPLIANT, ComplianceStatus.PENDING, ComplianceStatus.EXPIRED, ComplianceStatus.REJECTED]
            },
            confidence: { type: Type.NUMBER, description: "Global confidence score (0-1)." }
          },
          required: ["isValid", "extractedDate", "issuer", "riskAssessment", "suggestedStatus", "confidence"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    throw error;
  }
};