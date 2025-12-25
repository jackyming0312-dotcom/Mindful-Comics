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
  completedCount: number; // How many panels are drawn
}

export interface ScriptResponseItem {
  panelDescription: string;
  caption: string;
}