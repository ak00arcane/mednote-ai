
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { DocType, Consultation } from "../types";
import { SYSTEM_PROMPTS } from "../constants";

export async function* generateDocumentStream(
  type: DocType,
  consultation: Consultation
) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = SYSTEM_PROMPTS[type];
  
  const prompt = `
    PATIENT INFO: Name: ${consultation.patientName}, Age: ${consultation.patientAge}
    TRANSCRIPT: """${consultation.transcript}"""
    TASK: Generate the ${type} document immediately.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    for await (const chunk of result) {
      const text = chunk.text;
      if (text) yield text;
    }
  } catch (error) {
    console.error(`Error in streaming ${type}:`, error);
    yield "Error: Connection interrupted.";
  }
}

// Keep the original for backward compatibility if needed, but we'll use the stream.
export async function generateDocument(
  type: DocType,
  consultation: Consultation
): Promise<string> {
  let fullText = "";
  const stream = generateDocumentStream(type, consultation);
  for await (const chunk of stream) {
    fullText += chunk;
  }
  return fullText;
}
