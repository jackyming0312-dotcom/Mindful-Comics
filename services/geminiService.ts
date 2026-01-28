
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResponseItem, ArtStyle, GenerationMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStylePrompt = (style: ArtStyle) => {
  switch (style) {
    case 'japanese':
      return "Classic Japanese Manga style. Focus on high-contrast ink lines, screentones, and expressive eyes. The character must be a recognizable anime-version of the reference.";
    case 'korean':
      return "Modern Korean Webtoon (Manhwa) style. Clean digital line-art, sophisticated soft coloring, and trendy aesthetic character designs with realistic proportions.";
    case 'european':
      return "European 'Ligne Claire' style (Tintin-esque). Strong, clean black outlines with flat, vibrant colors and clear backgrounds.";
    case 'cyberpunk':
      return "High-detail Cyberpunk digital art. Neon-lit atmosphere, synthwave palette (purple/cyan), futuristic fashion, and glowing technological details.";
    case 'pixel':
      return "Detailed 16-bit Pixel Art. High-quality sprite work with vibrant retro colors, maintaining the character's key recognizable features in pixel form.";
    case 'animated':
      return "Living Art style. Dreamy digital painting with soft glowing highlights and deep cinematic shadows. The composition should suggest potential motion, like a frame from a high-end animated movie.";
    default:
      return "Warm, hand-painted watercolor storybook illustration with soft edges and gentle lighting.";
  }
};

export const generateComicScript = async (
  userInput: string, 
  style: ArtStyle,
  mode: GenerationMode,
  userImagesBase64?: string[]
): Promise<ScriptResponseItem[]> => {
  try {
    // FIX: Using gemini-flash-lite-latest for better regional support
    const model = "gemini-flash-lite-latest";
    const styleDescription = getStylePrompt(style);
    const hasPhoto = userImagesBase64 && userImagesBase64.length > 0;
    
    const modeInstruction = mode === 'kids' 
      ? `Target Audience: Children. 
         Character Focus: The main character is a cute child. 
         ${hasPhoto ? "CRITICAL: Analyze the provided photo. Describe the character's hair (style/color), eye shape, and facial structure precisely to maintain likeness." : ""}
         Theme: Positive, magical, and friendly.` 
      : `Target Audience: General Public. Focus on mental health and emotional journey.
         ${hasPhoto ? "CRITICAL: The protagonist MUST be the person from the uploaded photo. Describe their facial features, hairstyle, and distinctive physical traits in detail for each panel." : ""}`;
    
    const contents: any[] = [];
    if (userImagesBase64 && userImagesBase64.length > 0) {
      userImagesBase64.forEach(img => {
        contents.push({
          inlineData: {
            mimeType: img.split(';')[0].split(':')[1],
            data: img.split(',')[1],
          },
        });
      });
    }

    contents.push({
      text: `TASK: Create a 4-panel healing comic script.
      USER STORY: "${userInput}"
      ART STYLE: ${styleDescription}
      ${modeInstruction}
      
      INSTRUCTION: 
      1. For 'panelDescription': Write a high-quality, descriptive ENGLISH prompt for an image generator. 
         It MUST include specific details about the character's facial expression, hair, and clothing to ensure consistency with the reference photo.
      2. For 'caption': Write a warm, supportive Traditional Chinese text.
      
      Output ONLY valid JSON.`
    });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: contents },
      config: {
        systemInstruction: "You are an expert comic designer. You excel at character consistency and emotional storytelling. You must describe the character's appearance in the image prompts based on the visual evidence in the provided photos.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              panelDescription: { type: Type.STRING, description: "Detailed visual prompt in English including character physical traits" },
              caption: { type: Type.STRING, description: "Healing Chinese caption" },
            },
            required: ["panelDescription", "caption"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]") as ScriptResponseItem[];
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

export const generatePanelImage = async (
  description: string, 
  style: ArtStyle, 
  mode: GenerationMode,
  referenceImagesBase64?: string[]
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash-image";
    const stylePrompt = getStylePrompt(style);
    const hasPhoto = referenceImagesBase64 && referenceImagesBase64.length > 0;
    
    const parts: any[] = [];

    if (hasPhoto) {
      referenceImagesBase64!.forEach(img => {
         parts.push({
            inlineData: {
              data: img.split(',')[1],
              mimeType: img.split(';')[0].split(':')[1]
            }
         });
      });
    }

    const promptText = `
      TASK: Create a professional comic book panel.
      STYLE: ${stylePrompt}
      SCENE DESCRIPTION: ${description}
      
      ${hasPhoto ? `
      CHARACTER LIKENESS REQUIREMENT:
      - You MUST replicate the facial features of the person in the provided reference photos.
      - Match their eye shape, facial structure, nose shape, and mouth precisely.
      - Ensure the hairstyle and hair color are consistent with the reference.
      - Replicate the specific facial expression described in the scene: "${description.split('.')[0]}".
      - The character in this drawing must be unmistakably the same person as in the photo.
      ` : ""}
      
      TECHNICAL INSTRUCTION:
      - Deliver a single, complete illustration.
      - Ensure high aesthetic quality and artistic consistency.
      - DO NOT provide any text or JSON. Output the image data ONLY.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("Model returned no candidates.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    const textOutput = response.candidates[0].content.parts.find(p => p.text)?.text;
    if (textOutput) {
      console.error("Model refused to draw or returned text:", textOutput);
      throw new Error("模型未能生成圖像。這通常是因為內容安全限制或描述過於複雜，請嘗試簡化故事敘述。");
    }

    throw new Error("Image generation failed.");

  } catch (error: any) {
    console.error("Image generation service error:", error);
    throw error;
  }
};
