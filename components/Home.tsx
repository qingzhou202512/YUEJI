import React, { useState } from 'react';
import { ViewState } from '../types';
import { Sparkles, CheckCircle, XCircle, Smile, BatteryLow, Battery, ArrowRight } from 'lucide-react';
import { getTodayEntry, getEntries, getRecordedDaysCount, isValidEntry } from '../services/storage';
import { Header } from './home/Header';
import { Background } from './home/Background';
import { EmptyState } from './home/EmptyState';
import { DetailModal } from './home/DetailModal';
import { MomentCard } from './home/MomentCard';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
}

interface Moment {
  id: string;
  type: 'happy' | 'achievement' | 'focus' | 'drainer';
  text: string;
  subtext?: string;
  date: Date;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  color: string;
  bgColor: string;
  label: string;
  isDone?: boolean;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  
  const todayEntry = getTodayEntry();
  const allEntries = getEntries().filter(isValidEntry);
  const hasEntry = !!todayEntry && isValidEntry(todayEntry);
  const recordedDays = getRecordedDaysCount();

  // State 1: No Entry (Guide Mode)
  if (!hasEntry && allEntries.length === 0) {
    return (
      <div className="flex flex-col h-full bg-cream relative">
        <Background />
        <Header onNavigate={onNavigate} recordedDays={recordedDays} />
        <EmptyState onNavigate={onNavigate} />
      </div>
    );
  }

  // State 2: Timeline Mode
  const moments: Moment[] = [];
  const DISPLAY_LIMIT = 15;
  const entriesToShow = allEntries.slice(0, DISPLAY_LIMIT);
  const totalEntriesCount = allEntries.length;

  entriesToShow.forEach(entry => {
    const d = new Date(entry.date);
    
    entry.happiness.forEach((text, i) => {
      if (text) moments.push({ 
        id: `${entry.id}-h-${i}`, 
        type: 'happy', 
        text, 
        date: d, 
        icon: Smile, 
        color: 'text-pink-500', 
        bgColor: 'bg-pink-100', 
        label: '小确幸' 
      });
    });
    
    entry.achievements.forEach((text, i) => {
      if (text) moments.push({ 
        id: `${entry.id}-a-${i}`, 
        type: 'achievement', 
        text, 
        date: d, 
        icon: Sparkles, 
        color: 'text-primary-500', 
        bgColor: 'bg-primary-100', 
        label: '高光时刻' 
      });
    });
    
    if (entry.todayMitDescription) {
      const isDone = entry.mitCompleted;
      moments.push({ 
        id: `${entry.id}-mit`, 
        type: 'focus', 
        text: entry.todayMitDescription, 
        subtext: !isDone && entry.mitReason ? `原因: ${entry.mitReason}` : undefined,
        date: d, 
        icon: isDone ? CheckCircle : XCircle, 
        color: isDone ? 'text-green-600' : 'text-orange-500', 
        bgColor: isDone ? 'bg-green-100' : 'bg-orange-100', 
        label: '今日要事',
        isDone: isDone 
      });
    }
    
    if (entry.drainerLevel && entry.drainerLevel !== 'none') {
      const isHigh = entry.drainerLevel === 'high';
      const defaultLabel = isHigh ? '大量消耗，非常疲惫' : '少量消耗，有一点累';
      const displayText = entry.drainerNote ? entry.drainerNote : defaultLabel;

      moments.push({ 
        id: `${entry.id}-drain`, 
        type: 'drainer', 
        text: displayText, 
        date: d, 
        icon: isHigh ? BatteryLow : Battery, 
        color: isHigh ? 'text-red-500' : 'text-orange-400', 
        bgColor: isHigh ? 'bg-red-100' : 'bg-orange-100', 
        label: isHigh ? '高能量消耗' : '低能量消耗' 
      });
    }
  });

  moments.sort((a, b) => b.date.getTime() - a.date.getTime());

  const grouped: Record<string, Moment[]> = {};
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();

  moments.forEach(m => {
    let label = '';
    if (isSameDay(m.date, today)) label = '今天';
    else if (isSameDay(m.date, yesterday)) label = '昨天';
    else if (isSameDay(m.date, dayBefore)) label = '前天';
    else label = m.date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }).replace('/', '月') + '日';
    
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(m);
  });

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === '今天') return -1;
    if (b === '今天') return 1;
    if (a === '昨天') return -1;
    if (b === '昨天') return 1;
    if (a === '前天') return -1;
    if (b === '前天') return 1;
    const dateA = grouped[a][0].date.getTime();
    const dateB = grouped[b][0].date.getTime();
    return dateB - dateA;
  });

  return (
    <div className="flex flex-col h-full bg-cream relative">
      <Background />
      <Header onNavigate={onNavigate} recordedDays={recordedDays} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-2 z-10 min-h-0">
        <div className="flex flex-col gap-5 max-w-md mx-auto">
          {sortedKeys.map((label, groupIdx) => (
            <div key={label} className="w-full flex flex-col gap-3 animate-fade-in" style={{ animationDelay: `${groupIdx * 100}ms` }}>
              <div className="flex items-center gap-4 mt-1">
                <div className="px-3 py-1 bg-white/50 rounded-lg backdrop-blur-sm border border-white/50 shadow-sm">
                  <h3 className="text-sm font-bold text-ink-900">{label}</h3>
                </div>
                <div className="h-px bg-ink-100 flex-1"></div>
              </div>

              <div className="w-full flex flex-col gap-3">
                {grouped[label].map((m) => (
                  <MomentCard 
                    key={m.id} 
                    moment={m}
                    onClick={() => setSelectedMoment(m)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="py-6 flex justify-center w-full">
            {totalEntriesCount > DISPLAY_LIMIT ? (
              <button 
                onClick={() => onNavigate(ViewState.HISTORY)}
                className="flex items-center gap-2 text-ink-400 font-bold text-sm bg-white px-5 py-3 rounded-full shadow-sm hover:text-primary-500 hover:shadow-md transition-all active:scale-95"
              >
                去历史记录查看更多 <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="w-1 h-1 bg-ink-300 rounded-full"></div>
                <span className="text-xs font-medium text-ink-400">全部记录已加载</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <DetailModal moment={selectedMoment} onClose={() => setSelectedMoment(null)} />
    </div>
  );
};



