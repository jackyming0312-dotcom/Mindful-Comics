
import React, { useState } from 'react';
import JSZip from 'jszip';
import { ComicPanelData, ArtStyle } from '../types';

interface ComicDisplayProps {
  panels: ComicPanelData[];
  status: 'idle' | 'scripting' | 'drawing' | 'completed' | 'error';
  completedCount: number;
  style?: ArtStyle;
}

const ComicDisplay: React.FC<ComicDisplayProps> = ({ panels, status, completedCount, style }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [isCombining, setIsCombining] = useState(false);

  if (status === 'idle') return null;

  const handleDownload = (base64Data: string, panelNumber: number) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = `cheering-comic-panel-${panelNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllZip = async () => {
    if (panels.some(p => !p.imageData)) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("cheering-comic");
      
      panels.forEach((panel, index) => {
        if (panel.imageData) {
          const base64Content = panel.imageData.split(',')[1];
          folder?.file(`panel-${index + 1}.png`, base64Content, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "cheering-comic-complete.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to generate ZIP:", error);
      alert("打包下載失敗，請稍後再試。");
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleImage = async () => {
    if (panels.some(p => !p.imageData)) return;
    setIsCombining(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Load all images first
      const imagePromises = panels.map(p => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = p.imageData!;
        });
      });

      const images = await Promise.all(imagePromises);

      // Define Layout Constants
      const panelSize = images[0].width || 1024;
      const padding = 100;
      const captionHeight = 160;
      const gutter = 60;
      const headerHeight = 220;

      // Calculate Total Dimensions (2x2 Grid)
      canvas.width = (panelSize * 2) + (gutter) + (padding * 2);
      canvas.height = (panelSize * 2) + (captionHeight * 2) + (gutter) + (padding * 2) + headerHeight;

      // Draw Background
      ctx.fillStyle = "#fffcf5"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Unified Handwritten Title in Canvas
      ctx.fillStyle = "#78350f"; 
      ctx.font = "bold 96px 'Zhi Mang Xing', 'Noto Sans TC', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("應援漫畫", canvas.width / 2, padding + 80);
      
      ctx.fillStyle = "#d97706"; 
      ctx.font = "italic bold 42px 'Caveat', cursive, sans-serif";
      ctx.fillText("Self-Cheering Comics", canvas.width / 2, padding + 135);
      
      // Draw artistic divider
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 120, padding + 165);
      ctx.lineTo(canvas.width / 2 + 120, padding + 165);
      ctx.stroke();

      // Draw Panels
      images.forEach((img, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);

        const x = padding + (col * (panelSize + gutter));
        const y = padding + headerHeight + (row * (panelSize + captionHeight + gutter));

        // Draw Image
        ctx.drawImage(img, x, y, panelSize, panelSize);

        // Draw Border for Image
        ctx.strokeStyle = "#e7e5e4"; 
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, panelSize, panelSize);

        // Draw Caption
        ctx.fillStyle = "#44403c"; 
        ctx.font = "italic 40px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "center";
        
        const caption = `「${panels[i].caption}」`;
        const words = caption.split('');
        let line = '';
        let currentY = y + panelSize + 85;
        const maxWidth = panelSize - 80;

        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n];
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x + panelSize / 2, currentY);
            line = words[n];
            currentY += 50;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x + panelSize / 2, currentY);
      });

      // Export
      const finalImage = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = "cheering-comic-sheet.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Failed to combine images:", error);
      alert("合併圖片失敗，請嘗試使用 ZIP 下載。");
    } finally {
      setIsCombining(false);
    }
  };

  const renderPlaceholders = () => {
    const placeholders = [];
    for (let i = 0; i < 4; i++) {
      const isDrawing = status === 'drawing' && i === completedCount;
      const isWaiting = status === 'drawing' && i > completedCount;
      const isScripting = status === 'scripting';

      if (!panels[i]?.imageData) {
        placeholders.push(
          <div key={`placeholder-${i}`} className="flex flex-col h-full w-full animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="bg-white/50 border-2 border-dashed border-stone-200 rounded-[2rem] h-80 flex flex-col items-center justify-center relative overflow-hidden">
              {isScripting && (
                <div className="flex flex-col items-center gap-4 text-stone-400">
                  <div className="w-12 h-12 rounded-full border-4 border-warm-200 border-t-warm-500 animate-spin"></div>
                  <span className="font-medium">構思應援劇本中...</span>
                </div>
              )}
              {isDrawing && (
                <div className="flex flex-col items-center gap-4 text-warm-600">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-warm-100 border-t-warm-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  </div>
                  <span className="font-bold">正在繪製第 {i + 1} 格應援</span>
                </div>
              )}
              {isWaiting && <span className="text-stone-300 font-medium">等候繪製...</span>}
            </div>
            <div className="mt-4 bg-stone-100 h-14 w-full rounded-2xl animate-pulse"></div>
          </div>
        );
      }
    }
    return placeholders;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-24">
      
      {status === 'scripting' && (
        <div className="text-center mb-10">
          <p className="text-warm-700 font-bold text-xl animate-pulse">正在為您編織一段應援自己的故事...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
        {panels.map((panel, index) => (
          panel.imageData ? (
            <div key={panel.panelNumber} className="flex flex-col group animate-fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="bg-white p-3 rounded-[2.5rem] shadow-warm border border-stone-100 overflow-hidden relative transition-transform duration-500 hover:scale-[1.02]">
                <div className={`relative rounded-[2rem] overflow-hidden aspect-square md:aspect-auto md:h-80 ${style === 'animated' ? 'animate-breathe' : ''}`}>
                  <img 
                    src={panel.imageData} 
                    alt={`Panel ${panel.panelNumber}`} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Subtle Light Overlay for Animated Style */}
                  {style === 'animated' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow pointer-events-none"></div>
                  )}

                  <div className="absolute top-4 left-4 glass-card rounded-full w-10 h-10 flex items-center justify-center font-bold text-stone-800 shadow-sm border border-white/50">
                    {index + 1}
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => handleDownload(panel.imageData!, panel.panelNumber)}
                      className="p-3 bg-white/90 hover:bg-warm-500 hover:text-white text-stone-700 rounded-full shadow-lg backdrop-blur-sm transition-all active:scale-90"
                      title="下載圖片"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 px-6 py-5 bg-white rounded-3xl shadow-soft border border-stone-100 relative min-h-[5rem] flex items-center justify-center text-center">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-l border-t border-stone-100 transform rotate-45"></div>
                 <p className="text-stone-700 font-bold text-lg leading-relaxed italic">
                   「{panel.caption}」
                 </p>
              </div>
            </div>
          ) : (
            renderPlaceholders()[index]
          )
        ))}
        
        {panels.length < 4 && renderPlaceholders().slice(panels.length)}
      </div>

      {status === 'completed' && (
        <div className="mt-20 text-center animate-fade-in space-y-8">
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-warm-50 to-orange-50 rounded-full border-2 border-warm-200 border-dashed">
             <span className="text-warm-800 font-bold">✨ 完成了！這是一份送給您自己的應援禮物。</span>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-4">
              {/* Option 1: Single Image Sheet */}
              <button 
                onClick={handleDownloadSingleImage}
                disabled={isCombining}
                className="group relative flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-warm-500 to-orange-500 hover:from-warm-600 hover:to-orange-600 text-white font-bold rounded-3xl shadow-warm transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {isCombining ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                <span className="text-xl">合併下載 (一張應援漫畫)</span>
              </button>

              {/* Option 2: ZIP */}
              <button 
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="group relative flex items-center gap-3 px-8 py-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-3xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                {isZipping ? (
                  <div className="w-6 h-6 border-3 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                )}
                <span className="text-xl">打包下載 (ZIP)</span>
              </button>
            </div>

            <p className="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
              您可以下載一張完整的應援漫畫，隨時提醒自己：<br />「你已經做得很棒了！」
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComicDisplay;
