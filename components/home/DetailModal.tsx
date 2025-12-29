import React from 'react';
import { X } from 'lucide-react';

interface Moment {
  text: string;
  subtext?: string;
  date: Date;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  bgColor: string;
  label: string;
  isDone?: boolean;
}

interface DetailModalProps {
  moment: Moment | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ moment, onClose }) => {
  if (!moment) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div 
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-fade-in transform scale-100 transition-all border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-ink-400 hover:text-ink-900 hover:bg-gray-100 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${moment.bgColor} ${moment.color}`}>
              <moment.icon size={32} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-black uppercase tracking-widest opacity-60 ${moment.color}`}>
                {moment.label}
              </span>
              <span className="text-sm font-bold text-ink-400 font-serif">
                {moment.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
            <p className={`text-xl font-normal leading-relaxed ${moment.isDone === false ? 'text-ink-500' : 'text-ink-800'}`}>
              {moment.text}
            </p>
            
            {moment.subtext && (
              <div className="mt-6 p-5 bg-cream rounded-2xl border border-primary-50">
                <span className="text-xs font-bold text-ink-400 uppercase tracking-wider block mb-2">备注 / 原因</span>
                <p className="text-ink-600 font-normal leading-relaxed">
                  {moment.subtext}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




