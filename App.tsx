
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
              throw new Error(`第 ${i + 1} 格漫畫繪製失敗。請嘗試稍微修改你的輸入或畫風。`);
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
      setState(prevState => ({
        ...prevState,
        status: 'error',
        error: error.message || "創作過程中遇到了一些問題，請再試一次。",
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
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-center animate-fade-in">
            <p className="font-bold">⚠️ 出現錯誤</p>
            <p className="text-sm">{state.error}</p>
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
