import React from 'react';
import { ViewState } from '../../types';
import { Sparkles, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNavigate: (view: ViewState) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 px-6 flex flex-col items-center justify-center pb-32 animate-fade-in gap-8 relative z-10">
      <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
        <div className="absolute inset-0 bg-white/40 rounded-full blur-2xl animate-pulse"></div>
        <div className="relative bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-soft border border-white/60 flex flex-col items-center text-center gap-4 transform rotate-3 transition-transform hover:rotate-0 duration-500">
          <div className="w-16 h-16 bg-primary-100 text-primary-500 rounded-2xl flex items-center justify-center mb-2">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink-900 mb-1">今天过得怎么样？</h3>
            <p className="text-sm text-ink-500 leading-relaxed font-normal">
              记录三件小事，一点思考<br/>
              是爱自己的开始
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onNavigate(ViewState.JOURNAL)}
        className="w-full max-w-xs bg-ink-900 text-white rounded-[2rem] py-5 font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
      >
        <Plus size={20} />
        <span>开始记录今天</span>
      </button>
    </div>
  );
};




