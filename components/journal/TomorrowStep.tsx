import React from 'react';
import { Target } from 'lucide-react';

interface TomorrowStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const TomorrowStep: React.FC<TomorrowStepProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-10">
      <div className="w-20 h-20 bg-primary-100 text-primary-500 rounded-full flex items-center justify-center mb-8 shadow-inner animate-float">
        <Target size={40} />
      </div>
      
      <h3 className="text-2xl font-bold text-ink-900 mb-2">最后一步</h3>
      <p className="text-ink-500 mb-8 text-center max-w-xs">
        明天最重要的一件事是什么？<br/>少即是多，专注当下。
      </p>
      
      <div className="w-full relative group">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="写下明天最重要的那件事..."
          className="w-full p-8 bg-white rounded-[2.5rem] text-xl text-center font-bold text-ink-900 placeholder:text-ink-300 shadow-soft focus:shadow-glow outline-none transition-all border-2 border-transparent focus:border-primary-200"
        />
      </div>
    </div>
  );
};




