import React from 'react';
import { Battery, BatteryLow, BatteryCharging } from 'lucide-react';
import { JournalEntry } from '../../types';

interface DrainersStepProps {
  drainerLevel: JournalEntry['drainerLevel'];
  drainerNote: string;
  onLevelChange: (level: JournalEntry['drainerLevel']) => void;
  onNoteChange: (note: string) => void;
}

const options = [
  { id: 'none' as const, label: '无消耗，状态不错', icon: BatteryCharging, color: 'text-mint-600 bg-mint-50 border-mint-200' },
  { id: 'low' as const, label: '少量消耗，有一点累', icon: Battery, color: 'text-peach-500 bg-peach-50 border-peach-200' },
  { id: 'high' as const, label: '大量消耗，非常疲惫', icon: BatteryLow, color: 'text-red-500 bg-red-50 border-red-200' }
];

export const DrainersStep: React.FC<DrainersStepProps> = ({ 
  drainerLevel, 
  drainerNote, 
  onLevelChange, 
  onNoteChange 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onLevelChange(option.id)}
            className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] text-left transition-all duration-300 border ${
              drainerLevel === option.id 
              ? `${option.color} ring-2 ring-offset-2 ring-offset-cream shadow-md scale-[1.02]` 
              : 'bg-white text-ink-500 border-transparent shadow-sm hover:bg-white/80'
            }`}
          >
            <div className="p-2 rounded-full bg-white/50">
              <option.icon size={24} />
            </div>
            <span className="text-lg font-bold">{option.label}</span>
          </button>
        ))}
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${
        drainerLevel !== 'none' ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <label className="text-sm font-bold text-ink-400 ml-4 mb-2 block">是什么消耗了你？</label>
        <textarea
          value={drainerNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="写下来，把负面情绪留在这里..."
          className="w-full h-32 p-6 bg-white rounded-[2rem] text-base font-normal text-ink-700 placeholder:text-ink-300 shadow-sm focus:ring-0 border-none resize-none outline-none"
        />
      </div>
    </div>
  );
};



