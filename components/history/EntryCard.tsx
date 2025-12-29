import React from 'react';
import { JournalEntry } from '../../types';
import { CheckCircle, XCircle, Sparkles, BatteryLow, Battery } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  return (
    <div className="bg-white rounded-[2rem] p-5 shadow-card border border-white/50 animate-fade-in transition-transform active:scale-[0.99]">
      {/* Header Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-lg text-sm font-bold tracking-tight font-serif">
            {new Date(entry.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
          </div>
          <span className="text-xs font-medium text-ink-300">
            {new Date(entry.date).toLocaleDateString('zh-CN', { weekday: 'long' })}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-3">
        {/* MIT Status */}
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${entry.mitCompleted ? 'text-mint-500' : 'text-peach-500'}`}>
            {entry.mitCompleted ? <CheckCircle size={16} /> : <XCircle size={16} />}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-normal leading-tight line-clamp-2 ${entry.mitCompleted ? 'text-ink-800' : 'text-ink-400 line-through'}`}>
              {entry.todayMitDescription || '未记录重要之事'}
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-50 w-full"></div>

        {/* Highlights Row */}
        <div className="flex flex-wrap gap-2">
          {entry.drainerLevel === 'high' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[11px] font-bold">
              <BatteryLow size={12} /> 高消耗
            </span>
          )}
          {entry.drainerLevel === 'low' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-400 text-[11px] font-bold">
              <Battery size={12} /> 低消耗
            </span>
          )}
          {entry.achievements.slice(0, 2).map((a, i) => a && (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[11px] font-bold max-w-full truncate">
              <Sparkles size={12} /> {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};




