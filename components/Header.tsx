
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-20 pb-16 text-center relative px-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-warm-200/30 to-transparent blur-[100px] -z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Beautiful Animated Logo Section */}
        <div className="relative mb-10 group animate-logo-float">
          {/* Multi-layered glow */}
          <div className="absolute inset-0 bg-warm-400 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
          <div className="absolute -inset-4 bg-gradient-to-tr from-warm-200 via-orange-100 to-warm-300 rounded-full opacity-20 blur-xl"></div>
          
          <div className="relative bg-white/90 backdrop-blur-md p-7 rounded-full shadow-warm border border-warm-100 flex items-center justify-center transform transition-transform duration-700 hover:rotate-12">
            {/* SVG Logo */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-warm-600">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.07 4.93C20.9447 6.80521 21.9979 9.34825 21.9979 12C21.9979 14.6518 20.9447 17.1948 19.07 19.07" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
              <path d="M15.54 8.46C16.4774 9.39764 17.0041 10.6693 17.0041 11.995C17.0041 13.3207 16.4774 14.5924 15.54 15.53" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
            </svg>
            
            {/* Floating Heart */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-2 shadow-lg animate-bounce border-2 border-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Unified Artistic Title Block */}
        <div className="flex flex-col items-center select-none space-y-2">
          {/* 
            FIX: Set font-weight to normal (font-normal) instead of bold.
            Brush fonts usually only have a 400 weight. Forcing bold causes browsers 
            to use system fallbacks when it can't find a bold version of the brush font.
          */}
          <h1 className="text-7xl md:text-9xl font-hand font-normal text-gradient tracking-[0.2em] px-4">
            應援漫畫
          </h1>
          
          <div className="relative flex items-center justify-center w-full max-w-xs mt-4">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-warm-300 opacity-40"></div>
             </div>
             <div className="relative bg-warm-50/50 px-4">
                <span className="text-3xl md:text-4xl font-eng text-warm-500/90 font-bold italic tracking-wider">
                  Self-Cheering Comics
                </span>
             </div>
          </div>
        </div>

        {/* Supportive Slogan */}
        <div className="mt-12 space-y-4 max-w-2xl px-6">
          <p className="text-stone-700 text-xl font-bold leading-relaxed">
            最好的陪伴，是懂得為自己應援。
          </p>
          <p className="text-stone-500 text-base font-medium opacity-80">
            將您的心情與照片，轉化為自我鼓勵的四格故事。<br/>
            在每一格的筆觸中，看見那個努力且值得被愛的自己。
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="mt-10 group cursor-default">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-warm-100 shadow-warm hover:shadow-glow transition-all duration-300">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </div>
            <span className="text-sm text-warm-900 font-bold tracking-widest">
              AI 自我療癒引擎運作中
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
