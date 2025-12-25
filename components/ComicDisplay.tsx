import React from 'react';
import { ComicPanelData } from '../types';

interface ComicDisplayProps {
  panels: ComicPanelData[];
  status: 'idle' | 'scripting' | 'drawing' | 'completed' | 'error';
  completedCount: number;
}

const ComicDisplay: React.FC<ComicDisplayProps> = ({ panels, status, completedCount }) => {
  if (status === 'idle') return null;

  // Placeholder skeletons for loading state
  const renderPlaceholders = () => {
    const placeholders = [];
    for (let i = 0; i < 4; i++) {
      const isDrawing = status === 'drawing' && i === completedCount;
      const isWaiting = status === 'drawing' && i > completedCount;
      const isScripting = status === 'scripting';

      if (!panels[i]?.imageData) {
        placeholders.push(
          <div key={`placeholder-${i}`} className="flex flex-col h-full w-full">
            <div className="bg-white border-4 border-stone-800 p-2 hand-drawn-border h-64 md:h-80 flex items-center justify-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-stone-50 opacity-50"></div>
              <div className="text-stone-400 text-center z-10 p-4">
                {isScripting && (
                  <span className="animate-pulse">構思劇本中...<br/>Writing script...</span>
                )}
                {isDrawing && (
                  <div className="flex flex-col items-center">
                     <svg className="animate-spin h-8 w-8 text-warm-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    <span>正在繪製第 {i + 1} 格...<br/>Drawing panel {i + 1}...</span>
                    {panels[i]?.description && (
                        <p className="text-xs mt-2 text-stone-300 italic max-h-20 overflow-hidden px-4">{panels[i].description.substring(0, 50)}...</p>
                    )}
                  </div>
                )}
                {isWaiting && <span>等待繪製...<br/>Waiting...</span>}
              </div>
            </div>
            <div className="mt-3 bg-stone-200 h-16 w-full rounded-lg animate-pulse"></div>
          </div>
        );
      } else {
        // This handles cases where panel data exists but image failed or logic mixed
        // But usually successful panels are rendered in the main return map
        placeholders.push(<div key={`ph-${i}`}></div>); 
      }
    }
    return placeholders;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20">
       {status === 'scripting' && (
          <div className="text-center mb-6 text-warm-600 animate-pulse">
            正在用心感受你的故事，編寫劇本中...
          </div>
       )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {panels.map((panel, index) => (
          panel.imageData ? (
            <div key={panel.panelNumber} className="flex flex-col group transform transition-all hover:scale-[1.01] duration-300">
              {/* Image Container */}
              <div className="bg-white border-[3px] border-stone-800 p-2 hand-drawn-border shadow-[4px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden relative">
                <img 
                  src={panel.imageData} 
                  alt={`Panel ${panel.panelNumber}`} 
                  className="w-full h-64 md:h-80 object-cover rounded-[inherit]"
                />
                <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm border-2 border-stone-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-stone-800">
                  {index + 1}
                </div>
              </div>
              
              {/* Caption Container */}
              <div className="mt-4 bg-white p-4 rounded-xl border-2 border-stone-200 shadow-sm relative min-h-[5rem] flex items-center justify-center text-center">
                 {/* Speech Bubble Tail */}
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-stone-200 transform rotate-45"></div>
                 <p className="text-stone-700 font-medium text-lg leading-relaxed">
                   {panel.caption}
                 </p>
              </div>
            </div>
          ) : (
            // Render specific placeholder slot if no image yet
            renderPlaceholders()[index]
          )
        ))}
        
        {/* Fill remaining slots if panel array isn't full yet (e.g. during scripting) */}
        {panels.length < 4 && status !== 'idle' && renderPlaceholders().slice(panels.length)}
      </div>
    </div>
  );
};

export default ComicDisplay;