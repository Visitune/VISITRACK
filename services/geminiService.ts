import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, ComplianceStatus } from "../types";

export const analyzeDocumentCompliance = async (documentText: string, documentType: string, apiKey: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("L'intelligence artificielle nécessite une clé API Gemini. Veuillez la configurer dans Paramètres.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-1.5-flash";

  const systemInstruction = `
      You are an elite Quality & Compliance Officer AI for a global supply chain platform (VISITrack Enterprise).
      
      Your goal is to extract structured data from OCR text of documents. 
      
      IF TYPE IS "TECHNICAL":
      - EXTRACT "ingredients" (array of strings).
      - EXTRACT "allergens" (array of strings).
      - EXTRACT "origin" (string).
      - EXTRACT "nutritionalPoints" (object with energy, fat, carbs, protein).
      - DO NOT include expiry date unless explicitly stated in the spec.
      - Put the structured data in an "extractedData" field.

      IF TYPE IS A CERTIFICATE (IFS, BRC, ISO, etc.):
      - EXTRACT the exact Expiry Date (YYYY-MM-DD).
      - IDENTIFY the Issuing Body (e.g., Bureau Veritas, SGS).
      - ASSESS RISK contextually.
      
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

/**
 * Generic document analysis using a dynamic prompt (inspired by PDFANALYZE)
 */
export const analyzeDocumentWithTemplate = async (
  base64Content: string,
  prompt: string,
  apiKey: string
): Promise<any> => {
  if (!apiKey) {
    throw new Error("Clé API Gemini manquante.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-1.5-pro"; // Use Pro for better analysis of long documents

  // Remove data:application/pdf;base64, prefix if present
  const base64Data = base64Content.includes(",") ? base64Content.split(",")[1] : base64Content;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    // Clean potential markdown code blocks
    const cleanJson = text.replace(/```json\n?/, "").replace(/```/, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Template Analysis Failed", error);
    throw error;
  }
};