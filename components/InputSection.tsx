import React, { useState, useRef } from 'react';

interface InputSectionProps {
  onSubmit: (text: string, imagesBase64: string[]) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input, selectedImages);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to array and limit to 4 total images for performance/relevance
      // Cast to File[] to avoid 'unknown' type in map which causes error in readAsDataURL
      const newFiles = Array.from(files).slice(0, 4 - selectedImages.length) as File[];
      
      if (newFiles.length === 0) {
        alert("最多只能上傳 4 張照片 / Max 4 photos allowed");
        return;
      }

      const promises = newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(images => {
        setSelectedImages(prev => [...prev, ...images]);
      });
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        
        <div className="w-full relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="今天發生了什麼事？(例如：和朋友去海邊玩，風好大...)"
            className="w-full h-32 p-6 text-lg border-2 border-warm-300 bg-white shadow-sm resize-none focus:outline-none focus:border-warm-500 focus:ring-2 focus:ring-warm-200 transition-all hand-drawn-input text-stone-700 placeholder-stone-400"
          />
          
          {/* Decorative sticker */}
          <div className="absolute -top-3 -right-2 transform rotate-12 bg-yellow-100 border border-yellow-300 px-3 py-1 rounded-full shadow-sm text-xs text-yellow-700 font-bold hidden md:block">
            Tell me...
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="w-full flex flex-col items-center">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              multiple
              className="hidden" 
            />
            
            <div className="flex flex-wrap justify-center gap-4 mb-4">
                {selectedImages.map((img, index) => (
                    <div key={index} className="relative group animate-fade-in z-10 hover:z-20 transition-all hover:scale-105" style={{ transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (2 + index)}deg)` }}>
                        {/* Polaroid Style Preview */}
                        <div className="bg-white p-2 pb-8 shadow-md border border-stone-200 w-24 md:w-28">
                            <img src={img} alt={`Preview ${index}`} className="w-full h-20 md:h-24 object-cover bg-stone-100" />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors z-30"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        </button>
                        {/* Tape decoration */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-3 bg-warm-200/80 transform rotate-1"></div>
                    </div>
                ))}
            </div>

            {selectedImages.length < 4 && (
                 <button
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isLoading}
                 className="flex items-center gap-2 px-6 py-2 bg-white border-2 border-dashed border-warm-400 rounded-2xl text-warm-600 hover:bg-warm-50 hover:border-warm-600 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <span>{selectedImages.length > 0 ? '加入更多照片' : '上傳照片 (最多 4 張)'}</span>
               </button>
            )}
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`
            px-8 py-3 rounded-full font-bold text-white text-lg shadow-md transition-transform transform active:scale-95
            ${!input.trim() || isLoading 
              ? 'bg-stone-300 cursor-not-allowed' 
              : 'bg-warm-500 hover:bg-warm-600 hover:-translate-y-1 rotate-1'}
          `}
        >
          {isLoading ? '生成故事中...' : '開始繪製 (Draw)'}
        </button>
      </form>
    </div>
  );
};

export default InputSection;