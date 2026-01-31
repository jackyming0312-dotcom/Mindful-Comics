
import React, { useState, useRef } from 'react';
import { ArtStyle, GenerationMode, Gender } from '../types';

interface InputSectionProps {
  onSubmit: (text: string, style: ArtStyle, mode: GenerationMode, imagesBase64: string[], gender: Gender) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<GenerationMode>('public');
  const [gender, setGender] = useState<Gender>('boy');
  const [style, setStyle] = useState<ArtStyle>('japanese');
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const KIDS_STORIES = [
    { id: 'cloud', label: '🏰 雲朵城堡', prompt: '在柔軟如棉花糖的雲朵城堡裡玩耍，發現會飛的小馬與彩虹滑梯' },
    { id: 'park', label: '🎠 奇幻遊樂園', prompt: '旋轉木馬在夜晚會帶我飛向彩虹，那是一個充滿甜點與歡笑的地方' },
    { id: 'detective', label: '🕵️ 森林偵探', prompt: '我和聰明的小兔子組成偵探團，一起尋找森林裡消失的神祕紅蘿蔔' },
    { id: 'space', label: '🚀 太空冒險', prompt: '一個關於在月球上野餐的奇幻冒險' },
    { id: 'ocean', label: '🧜‍♀️ 海底世界', prompt: '在五彩斑斕的海底宮殿參加派對' },
    { id: 'animal', label: '🐾 森林學校', prompt: '和會說話的小動物們一起上課的一天' },
    { id: 'dino', label: '🦖 恐龍朋友', prompt: '穿越時空回到過去，與善良的恐龍成為好友' },
    { id: 'magic', label: '🏰 魔法學院', prompt: '學會了第一招魔法，展開有趣的校園生活' }
  ];

  const PUBLIC_PROMPTS = [
    "最近讓你感到最放鬆的一件事是什麼？",
    "今天有沒有什麼小小的成就感？",
    "如果可以對過去的自己說一句話，你會說什麼？",
    "描述一個讓你感到溫暖的瞬間。",
    "你理想中的放鬆午後是什麼樣子的？",
    "最近有遇到什麼讓你想要感謝的人或事嗎？",
    "想像一個沒有壓力的秘密基地，那裡長什麼樣子？",
    "今天的心情如果是一種顏色，會是什麼顏色？為什麼？",
    "最近有什麼讓你開懷大笑的小插曲嗎？",
    "給未來的自己寫一張鼓勵的小紙條。"
  ];

  const STYLES = [
    { id: 'animated', label: '微動療癒', icon: '✨' },
    { id: 'japanese', label: '日式黑白', icon: '🖋️' },
    { id: 'korean', label: '現代韓漫', icon: '🎨' },
    { id: 'european', label: '古典歐漫', icon: '📐' },
    { id: 'cyberpunk', label: '賽博霓虹', icon: '🌃' },
    { id: 'pixel', label: '復古像素', icon: '👾' }
  ];

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * PUBLIC_PROMPTS.length);
    setInput(PUBLIC_PROMPTS[randomIndex]);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input, style, mode, selectedImages, gender);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 1 - selectedImages.length) as File[];
    const promises = files.map(file => new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(promises).then(imgs => setSelectedImages(p => [...p, ...imgs]));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-12 space-y-10 animate-fade-in">
      
      {/* Mode Switcher */}
      <div className="flex bg-warm-100/50 p-1.5 rounded-3xl border border-warm-200 shadow-inner">
        <button 
          onClick={() => { setMode('public'); setInput(''); }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'public' ? 'bg-white shadow-soft text-warm-800 scale-[1.02]' : 'text-warm-500 hover:text-warm-600'}`}
        >
          <span className="text-xl">🌟</span>
          <span>大眾模式</span>
        </button>
        <button 
          onClick={() => { setMode('kids'); setInput(''); }}
          className={`flex-1 py-3.5 px-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'kids' ? 'bg-white shadow-soft text-warm-800 scale-[1.02]' : 'text-warm-500 hover:text-warm-600'}`}
        >
          <span className="text-xl">🧸</span>
          <span>小朋友模式</span>
        </button>
      </div>

      {/* Style Picker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <label className="text-stone-700 font-bold flex items-center gap-2">
            <span>🎨 藝術畫風</span>
            <span className="text-xs font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">選擇一個風格</span>
          </label>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id as ArtStyle)}
              className={`flex-shrink-0 w-32 h-24 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${style === s.id ? 'bg-warm-500 text-white border-warm-600 shadow-warm scale-105' : 'bg-white border-stone-100 text-stone-600 hover:border-warm-200'}`}
            >
              <span className={`text-3xl group-hover:scale-110 transition-transform`}>{s.icon}</span>
              <span className="text-xs font-bold">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-soft space-y-8 relative overflow-hidden">
        
        {/* Kids Mode Specific: Gender Selection */}
        {mode === 'kids' && (
          <div className="space-y-4 animate-fade-in">
            <label className="text-stone-700 font-bold block ml-1">👦👧 我是...</label>
            <div className="flex gap-4">
              <button
                onClick={() => setGender('boy')}
                className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${gender === 'boy' ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md scale-105' : 'bg-white border-stone-100 text-stone-400'}`}
              >
                <span className="text-4xl">👦</span>
                <span className="font-bold">小男生</span>
              </button>
              <button
                onClick={() => setGender('girl')}
                className={`flex-1 py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${gender === 'girl' ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-md scale-105' : 'bg-white border-stone-100 text-stone-400'}`}
              >
                <span className="text-4xl">👧</span>
                <span className="font-bold">小女生</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        {mode === 'public' ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-stone-700 font-bold block ml-1">✍️ 您的心情與故事</label>
                <button 
                  onClick={handleRandomPrompt}
                  className="flex items-center gap-1.5 text-xs font-bold text-warm-600 hover:text-warm-700 bg-warm-50 px-3 py-1.5 rounded-full border border-warm-100 transition-all active:scale-95"
                >
                  <span>💡</span>
                  <span>隨機生成引導</span>
                </button>
              </div>
              <div className="relative group">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="最近的心情如何？有什麼想說的故事嗎？"
                  className="w-full h-40 p-6 text-lg border-2 border-stone-100 bg-white/80 rounded-3xl resize-none focus:outline-none focus:border-warm-400 transition-colors placeholder:text-stone-300 text-stone-700 shadow-inner"
                />
                <div className="absolute top-4 right-6 text-xs text-warm-600 opacity-50 font-medium">
                  {input.length} 字
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <label className="text-stone-700 font-bold block ml-1">🌈 選擇一個童話開頭</label>
             <div className="grid grid-cols-1 gap-3">
              {KIDS_STORIES.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setInput(story.prompt)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left flex items-center justify-between group ${input === story.prompt ? 'bg-warm-500 text-white border-warm-600 shadow-md' : 'bg-white border-stone-100 text-stone-600 hover:bg-warm-50'}`}
                >
                  <span className="font-bold">{story.label}</span>
                  <span className={`transition-transform group-hover:translate-x-1 ${input === story.prompt ? 'opacity-100' : 'opacity-30'}`}>➔</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Character Photo Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
           <div className="flex items-center justify-between">
              <label className="text-stone-700 font-bold flex items-center gap-2">
                <span>📸 人物照片還原</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">NEW</span>
              </label>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-warm-600 font-bold hover:underline"
              >
                {selectedImages.length > 0 ? '更換照片' : '上傳照片'}
              </button>
           </div>
           
           <div className="flex justify-center">
             {selectedImages.length > 0 ? (
               <div className="group relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-warm animate-float">
                  <img src={selectedImages[0]} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImages([])}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs"
                  >
                    移除
                  </button>
               </div>
             ) : (
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full py-10 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-warm-300 hover:text-warm-500 transition-all bg-stone-50/50"
               >
                 <div className="text-3xl">📷</div>
                 <div className="text-sm font-medium">上傳您的美照，讓 AI 繪製專屬角色</div>
                 <div className="text-[10px] opacity-60">建議上傳清晰的臉部正面照</div>
               </button>
             )}
           </div>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        {/* Generate Button */}
        <div className="pt-6">
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className={`w-full py-5 rounded-3xl font-bold text-white text-xl shadow-warm transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-3 ${!input.trim() || isLoading ? 'bg-stone-300 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-warm-500 to-orange-500 hover:shadow-2xl hover:-translate-y-1'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>魔法正在發生...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>生成我的暖心漫畫</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
