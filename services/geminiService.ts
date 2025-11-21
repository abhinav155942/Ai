import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message, Attachment } from "../types";

// Initialize the client with the API key from the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachments: Attachment[] = []
): Promise<string> => {
  try {
    // Construct the conversation history for the API
    const contents = history.slice(-20).map((msg) => {
      const parts: any[] = [];
      
      // Add text if present
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      // Add attachments if present
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }

      // Fallback for empty messages (shouldn't happen but API requires content)
      if (parts.length === 0) {
        parts.push({ text: "..." });
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });

    // Prepare the current user message parts
    const currentParts: any[] = [];
    if (newMessage) {
      currentParts.push({ text: newMessage });
    }
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        currentParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    // Ensure there is at least some content
    if (currentParts.length === 0) {
      currentParts.push({ text: "Analysis requested." });
    }

    // Add the current message
    contents.push({
      role: 'user',
      parts: currentParts,
    });

    // Call the API using the gemini-2.5-flash model.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    return response.text || "I didn't quite catch that. Could you try again?";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle specific error cases
    if (error.message?.includes("403") || error.status === "PERMISSION_DENIED") {
      return "Error: Permission denied (403). Please verify your API key has access to the 'gemini-2.5-flash' model.";
    }
    
    return "Sorry, I'm having trouble connecting. Please try again in a moment.";
  }
};