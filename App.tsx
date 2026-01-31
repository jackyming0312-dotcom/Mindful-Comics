
import React, { useState } from 'react';
import { generateComicScript, generatePanelImage } from './services/geminiService';
import { ComicGenerationState, ComicPanelData, ArtStyle, GenerationMode, Gender } from './types';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ComicDisplay from './components/ComicDisplay';

// Extend window for AI Studio tools
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Added readonly to match the global definition provided by the environment
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<ComicGenerationState>({
    status: 'idle',
    panels: [],
    completedCount: 0,
    activeStyle: undefined,
  });
  const [quotaWaitTime, setQuotaWaitTime] = useState<number | null>(null);

  const handleOpenKeyDialog = async () => {
    try {
      await window.aistudio.openSelectKey();
      setState(p => ({ ...p, status: 'idle', error: undefined }));
    } catch (err) {
      console.error("Failed to open key dialog", err);
    }
  };

  const handleStartGeneration = async (userInput: string, style: ArtStyle, mode: GenerationMode, userImagesBase64: string[], gender: Gender) => {
    setState({ status: 'scripting', panels: [], completedCount: 0, error: undefined, activeStyle: style });
    setQuotaWaitTime(null);

    try {
      // 1. Generate Script with gender info
      const scriptItems = await generateComicScript(userInput, style, mode, userImagesBase64, gender);
      
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

      // 2. Generate Images sequentially
      const newPanels = [...initialPanels];
      
      for (let i = 0; i < newPanels.length; i++) {
        let success = false;
        let retryCount = 0;
        const maxRetries = 3;

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
          } catch (err: any) {
            retryCount++;
            const errorMsg = err.message || "";
            
            if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("Resource exhausted")) {
              const wait = retryCount * 15000;
              setQuotaWaitTime(Math.ceil(wait / 1000));
              await new Promise(res => setTimeout(res, wait));
              setQuotaWaitTime(null);
            } else {
              await new Promise(res => setTimeout(res, 2000));
            }

            if (retryCount >= maxRetries) throw err;
          }
        }
        
        if (i < newPanels.length - 1) {
          await new Promise(res => setTimeout(res, 1000));
        }
      }

      setState(prevState => ({ ...prevState, status: 'completed' }));

    } catch (error: any) {
      console.error("Generation process failed:", error);
      
      const rawError = error.message || "";
      if (rawError.includes("Requested entity was not found.")) {
        await window.aistudio.openSelectKey();
        setState(prevState => ({ ...prevState, status: 'idle', error: undefined }));
        return;
      }

      let errorMessage = "創作過程中遇到了一些問題。";
      let isQuotaError = false;

      if (rawError.includes("429") || rawError.includes("quota") || rawError.includes("Resource exhausted")) {
        isQuotaError = true;
        errorMessage = "AI 生成頻率已達上限。";
      }

      setState(prevState => ({
        ...prevState,
        status: 'error',
        error: errorMessage + (isQuotaError ? " 建議等待 1 分鐘後再試，或更換您的 API 金鑰。" : ""),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 relative">
      <Header onSettingsClick={handleOpenKeyDialog} />
      
      <main className="container mx-auto pb-12">
        <InputSection 
          onSubmit={handleStartGeneration} 
          isLoading={state.status === 'scripting' || state.status === 'drawing'} 
        />

        {quotaWaitTime !== null && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center gap-3 text-orange-700 animate-pulse">
            <span className="text-xl">⏳</span>
            <span className="font-bold">魔法冷卻中，請稍候 {quotaWaitTime} 秒...</span>
          </div>
        )}

        {state.error && (
          <div className="max-w-2xl mx-auto mb-8 p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-red-800 text-center animate-fade-in shadow-soft">
            <div className="text-4xl mb-4">🌬️</div>
            <p className="font-bold text-xl mb-3">AI 正在休息...</p>
            <p className="text-sm opacity-90 leading-relaxed mb-6">{state.error}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button 
                onClick={() => setState(p => ({ ...p, status: 'idle', error: undefined }))}
                className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-red-100 text-red-700 rounded-full text-sm font-bold transition-all border border-red-200 shadow-sm"
              >
                稍後再試一次
              </button>
              <button 
                onClick={handleOpenKeyDialog}
                className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold transition-all shadow-md"
              >
                使用我的專屬金鑰
              </button>
            </div>
          </div>
        )}
        
        <ComicDisplay panels={state.panels} status={state.status} completedCount={state.completedCount} style={state.activeStyle} />
      </main>

      <footer className="text-center py-10 text-warm-700/60 text-sm">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="w-8 h-px bg-warm-200"></span>
          <span className="font-eng italic">Healing through art</span>
          <span className="w-8 h-px bg-warm-200"></span>
        </div>
        <p>Powered by Google Gemini | 專為心靈健康設計</p>
      </footer>
    </div>
  );
};

export default App;
