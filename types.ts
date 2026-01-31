
export type ArtStyle = 'japanese' | 'korean' | 'european' | 'cyberpunk' | 'pixel' | 'animated';

export type GenerationMode = 'public' | 'kids';

export type Gender = 'boy' | 'girl' | 'neutral';

export interface ComicPanelData {
  panelNumber: number;
  description: string;
  caption: string;
  imageData?: string; // Base64 string
}

export interface ComicGenerationState {
  status: 'idle' | 'scripting' | 'drawing' | 'completed' | 'error';
  panels: ComicPanelData[];
  error?: string;
  completedCount: number;
  activeStyle?: ArtStyle;
}

export interface ScriptResponseItem {
  panelDescription: string;
  caption: string;
}
