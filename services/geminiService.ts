
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponseItem } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the script writer
const SCRIPT_SYSTEM_INSTRUCTION = `
You are a compassionate, empathetic comic strip creator specializing in mental health support. 
Your goal is to take a user's feeling, situation, and optionally their photos, to turn it into a heartwarming, 4-panel comic strip.
The tone should be warm, healing, gentle, and encouraging.
The visual style description should be suitable for a simple, cute, hand-drawn watercolor aesthetic.
Avoid complex details; focus on emotions and simple character actions.
If photos are provided, incorporate elements from the photos (clothing, setting, characters) into the story naturally.
Panel 1: Introduce the feeling/situation.
Panel 2: Acknowledge or validate the feeling.
Panel 3: A turning point, a small act of self-care, or a shift in perspective.
Panel 4: A heartwarming conclusion or comforting message.
Output ONLY JSON.
`;

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      panelDescription: {
        type: Type.STRING,
        description: "Visual description of the scene for an image generator. Mention style: 'watercolor, hand-drawn, cute, warm colors'. Describe the main character's appearance (hair, clothes) in EVERY panel description to keep it consistent.",
      },
      caption: {
        type: Type.STRING,
        description: "The text/dialogue for this panel. Keep it short and sweet (Traditional Chinese).",
      },
    },
    required: ["panelDescription", "caption"],
  },
};

export const generateComicScript = async (userInput: string, userImagesBase64?: string[]): Promise<ScriptResponseItem[]> => {
  try {
    // Fix: Updated model to gemini-3-flash-preview for text generation tasks
    const model = "gemini-3-flash-preview";
    
    // Construct the prompt contents
    const contents: any[] = [];
    
    // Add images if available
    if (userImagesBase64 && userImagesBase64.length > 0) {
      userImagesBase64.forEach(img => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        });
      });
      
      contents.push({
        text: `The user has provided these photos as context for the story. Analyze them to understand the setting or the character's look. Use this visual context combined with their text input: "${userInput}". \n\nCreate a 4-panel healing comic script. \n\nIMPORTANT: Describe the main character's appearance based on the photos in the 'panelDescription' so the image generator knows what to draw.`
      });
    } else {
      contents.push({
        text: `User's feeling: "${userInput}". Create a 4-panel healing comic script. Create a simple, relatable main character (e.g., a cute bear, a bunny, or a person).`
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: contents },
      config: {
        systemInstruction: SCRIPT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ScriptResponseItem[];
    }
    throw new Error("No text returned from script generation.");
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

export const generatePanelImage = async (description: string, referenceImagesBase64?: string[]): Promise<string> => {
  try {
    // We use gemini-2.5-flash-image for image generation as per default guidelines
    const model = "gemini-2.5-flash-image";
    
    const parts: any[] = [];

    if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
      // Add all reference images
      referenceImagesBase64.forEach(img => {
         const base64Data = img.split(',')[1];
         const mimeType = img.split(';')[0].split(':')[1];
         parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
         });
      });

      // Prompt tuned for preserving likeness while changing style
      const prompt = `
      Create a panel for a comic strip.
      Scene Action: ${description}
      Art Style: Hand-drawn watercolor illustration with warm pastel colors and gentle outlines.
      Reference: Use the provided images as visual references for the character(s) and setting. Maintain the general look/likeness of the people in the photos but render them in the specified cute watercolor comic style.
      `;
      parts.push({ text: prompt });

    } else {
      // Text-only generation if no image provided
      const stylePrompt = "Style: Hand-drawn watercolor illustration, warm pastel colors, thick sketchy outlines, cute simple characters, minimalist background, healing atmosphere. High quality, artistic. ";
      parts.push({ text: stylePrompt + description });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
    });

    // Extract image from response parts by iterating through them
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error; // Re-throw to be handled by the UI
  }
};
