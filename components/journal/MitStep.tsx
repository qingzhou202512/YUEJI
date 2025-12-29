import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface MitStepProps {
  description: string;
  completed: boolean;
  reason: string;
  onDescriptionChange: (value: string) => void;
  onCompletedChange: (completed: boolean) => void;
  onReasonChange: (reason: string) => void;
}

export const MitStep: React.FC<MitStepProps> = ({
  description,
  completed,
  reason,
  onDescriptionChange,
  onCompletedChange,
  onReasonChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm">
        <label className="block text-xs font-bold text-ink-400 uppercase tracking-wider mb-3 ml-1">今日要事</label>
        <input
          type="text"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="今天最重要的事情是..."
          className="w-full text-xl font-normal text-ink-900 placeholder:text-ink-300 bg-transparent outline-none mb-4"
        />
        
        <div className="h-px bg-gray-100 w-full mb-6"></div>

        <div className="flex gap-4">
          <button
            onClick={() => onCompletedChange(true)}
            className={`flex-1 py-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 ${
              completed 
              ? 'bg-ink-900 text-white shadow-lg transform scale-105' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <CheckCircle size={24} />
            <span className="font-bold text-sm">完成了</span>
          </button>
          <button
            onClick={() => onCompletedChange(false)}
            className={`flex-1 py-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 ${
              !completed 
              ? 'bg-peach-100 text-peach-600 ring-2 ring-peach-200' 
              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <XCircle size={24} />
            <span className="font-bold text-sm">未完成</span>
          </button>
        </div>
      </div>

      {!completed && (
        <div className="animate-fade-in">
          <label className="text-sm font-bold text-ink-400 ml-4 mb-2 block">没关系，原因是什么？</label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="记录一下，下次改进..."
            className="w-full p-6 bg-white rounded-[2rem] text-base font-normal text-ink-700 placeholder:text-ink-300 shadow-sm focus:ring-0 border-none resize-none outline-none"
          />
        </div>
      )}
    </div>
  );
};




