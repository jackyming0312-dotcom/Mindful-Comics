import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="pt-10 pb-6 text-center relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-10 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute top-4 right-10 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-warm-800 tracking-wide mb-2">
          Mindful Comics
        </h1>
        <h2 className="text-xl md:text-2xl text-warm-600 font-medium">
          暖心療癒漫畫生成器
        </h2>
        <p className="mt-2 text-warm-700 max-w-md mx-auto px-4 text-sm md:text-base">
          分享你的心情，讓 AI 為你畫一則溫暖的小故事。
        </p>
      </div>
    </header>
  );
};

export default Header;