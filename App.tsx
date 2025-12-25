import React, { useState } from 'react';
import { generateComicScript, generatePanelImage } from './services/geminiService';
import { ComicGenerationState, ComicPanelData, ScriptResponseItem } from './types';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ComicDisplay from './components/ComicDisplay';

const App: React.FC = () => {
  const [state, setState] = useState<ComicGenerationState>({
    status: 'idle',
    panels: [],
    completedCount: 0,
  });

  const handleStartGeneration = async (userInput: string, userImagesBase64?: string[]) => {
    setState({ status: 'scripting', panels: [], completedCount: 0, error: undefined });

    try {
      // Step 1: Generate Script (passing images if available to customize character/story)
      const scriptItems: ScriptResponseItem[] = await generateComicScript(userInput, userImagesBase64);
      
      if (!scriptItems || scriptItems.length === 0) {
        throw new Error("Failed to generate script.");
      }

      // Initialize empty panels with script info
      const initialPanels: ComicPanelData[] = scriptItems.map((item, index) => ({
        panelNumber: index + 1,
        description: item.panelDescription,
        caption: item.caption,
      }));

      setState({
        status: 'drawing',
        panels: initialPanels,
        completedCount: 0,
      });

      // Step 2: Generate Images one by one
      // We pass the userImagesBase64 to the image generator to use as references
      const imagePromises = initialPanels.map(async (panel, index) => {
        try {
          const base64Image = await generatePanelImage(panel.description, userImagesBase64);
          
          // Update specific panel in state
          setState(prevState => {
            const newPanels = [...prevState.panels];
            newPanels[index] = { ...newPanels[index], imageData: base64Image };
            return {
              ...prevState,
              panels: newPanels,
              completedCount: prevState.completedCount + 1,
            };
          });
          return true;
        } catch (err) {
          console.error(`Failed to generate image for panel ${index + 1}`, err);
          return false;
        }
      });

      await Promise.all(imagePromises);

      setState(prevState => ({
        ...prevState,
        status: 'completed',
      }));

    } catch (error: any) {
      console.error("Full generation error:", error);
      setState(prevState => ({
        ...prevState,
        status: 'error',
        error: error.message || "Something went wrong while creating your comic. Please try again.",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 relative">
      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <svg className="absolute top-20 left-10 text-warm-200 w-16 h-16 opacity-50" viewBox="0 0 100 100" fill="currentColor">
           <path d="M50 0L61 35H98L68 57L79 91L50 70L21 91L32 57L2 35H39L50 0Z" />
        </svg>
        <svg className="absolute bottom-20 right-10 text-warm-200 w-24 h-24 opacity-50 rotate-12" viewBox="0 0 100 100" fill="currentColor">
           <circle cx="50" cy="50" r="50" />
        </svg>
      </div>

      <Header />
      
      <main className="container mx-auto pb-12">
        <InputSection 
          onSubmit={handleStartGeneration} 
          isLoading={state.status === 'scripting' || state.status === 'drawing'} 
        />
        
        {state.error && (
          <div className="w-full max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-center">
            {state.error}
          </div>
        )}

        <ComicDisplay 
          panels={state.panels} 
          status={state.status} 
          completedCount={state.completedCount}
        />
      </main>

      <footer className="text-center py-6 text-warm-700/60 text-sm">
        <p>Powered by Google Gemini | Designed for Mental Wellness</p>
      </footer>
    </div>
  );
};

export default App;