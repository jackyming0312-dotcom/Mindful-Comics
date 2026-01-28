
import React, { useState } from 'react';
import { generateComicScript, generatePanelImage } from './services/geminiService';
import { ComicGenerationState, ComicPanelData, ArtStyle, GenerationMode } from './types';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ComicDisplay from './components/ComicDisplay';

const App: React.FC = () => {
  const [state, setState] = useState<ComicGenerationState>({
    status: 'idle',
    panels: [],
    completedCount: 0,
    activeStyle: undefined,
  });

  const handleStartGeneration = async (userInput: string, style: ArtStyle, mode: GenerationMode, userImagesBase64?: string[]) => {
    setState({ status: 'scripting', panels: [], completedCount: 0, error: undefined, activeStyle: style });

    try {
      // 1. Generate Script
      const scriptItems = await generateComicScript(userInput, style, mode, userImagesBase64);
      
      const initialPanels: ComicPanelData[] = scriptItems.map((item, index) => ({
        panelNumber: index + 1,
        description: item.panelDescription,
        caption: item.caption,
      }));

      setState(prev => ({
        ...prev,
        status: 'drawing',
        panels: initialPanels,
        completedCount: 0,
      }));

      // 2. Generate Images sequentially with retries
      const newPanels = [...initialPanels];
      
      for (let i = 0; i < newPanels.length; i++) {
        let success = false;
        let retryCount = 0;
        const maxRetries = 2;

        while (!success && retryCount < maxRetries) {
          try {
            const base64Image = await generatePanelImage(newPanels[i].description, style, mode, userImagesBase64);
            newPanels[i] = { ...newPanels[i], imageData: base64Image };
            
            setState(prevState => ({
              ...prevState,
              panels: [...newPanels],
              completedCount: i + 1,
            }));
            
            success = true;
          } catch (err) {
            retryCount++;
            console.warn(`Panel ${i + 1} attempt ${retryCount} failed:`, err);
            if (retryCount >= maxRetries) {
              throw err; // Throw to the main catch block
            }
            await new Promise(res => setTimeout(res, 1000));
          }
        }
        
        if (i < newPanels.length - 1) {
          await new Promise(res => setTimeout(res, 500));
        }
      }

      setState(prevState => ({ ...prevState, status: 'completed' }));

    } catch (error: any) {
      console.error("Generation process failed:", error);
      
      let errorMessage = "創作過程中遇到了一些問題，請再試一次。";
      
      // FIX: Parse raw JSON error message if it exists
      try {
        const errorStr = error.message || "";
        if (errorStr.includes('"message"')) {
          const parsed = JSON.parse(errorStr.substring(errorStr.indexOf('{')));
          if (parsed.error?.message?.includes("User location is not supported")) {
            errorMessage = "您的地區目前尚未支援此 AI 圖像生成模型 (例如 EEA/UK 地區)。請嘗試更換網路環境或稍後再試。";
          } else {
            errorMessage = parsed.error?.message || errorMessage;
          }
        } else if (errorStr.includes("User location is not supported")) {
          errorMessage = "您的地區目前尚未支援此 AI 圖像生成模型。";
        }
      } catch (e) {
        console.error("Failed to parse error JSON", e);
      }

      setState(prevState => ({
        ...prevState,
        status: 'error',
        error: errorMessage,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 relative">
      <Header />
      <main className="container mx-auto pb-12">
        <InputSection 
          onSubmit={handleStartGeneration} 
          isLoading={state.status === 'scripting' || state.status === 'drawing'} 
        />
        {state.error && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-[2rem] text-red-700 text-center animate-fade-in shadow-soft">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="font-bold text-lg mb-1">發生一點小意外</p>
            <p className="text-sm opacity-90 leading-relaxed">{state.error}</p>
            <button 
              onClick={() => setState(p => ({ ...p, status: 'idle', error: undefined }))}
              className="mt-4 px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold transition-colors"
            >
              我知道了，再試一次
            </button>
          </div>
        )}
        <ComicDisplay panels={state.panels} status={state.status} completedCount={state.completedCount} style={state.activeStyle} />
      </main>
      <footer className="text-center py-6 text-warm-700/60 text-sm">
        <p>Powered by Google Gemini | 專為心靈健康與兒童創作設計</p>
      </footer>
    </div>
  );
};

export default App;
