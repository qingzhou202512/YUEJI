import React from 'react';
import { ViewState } from '../../types';
import { Flame, ChevronRight } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: ViewState) => void;
  recordedDays: number;
}

const HeaderComponent: React.FC<HeaderProps> = ({ onNavigate, recordedDays }) => {
  const date = new Date();
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = weekDays[date.getDay()];
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  const quotes = [
    "今天也要好好爱自己",
    "生活原本沉闷，但跑起来就有风",
    "允许自己做自己，允许别人做别人",
    "凡是过往，皆为序章",
    "心有山海，静而无边",
    "你若盛开，清风自来",
    "热爱可抵岁月漫长",
    "星光不问赶路人",
    "好好生活，慢慢相遇",
    "保持热爱，奔赴山海"
  ];
  const quoteIndex = (date.getFullYear() * 1000 + date.getMonth() * 31 + date.getDate()) % quotes.length;
  const dailyQuote = quotes[quoteIndex];

  return (
    <header className="px-6 pt-8 pb-1 relative z-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-4xl font-light text-ink-900 tracking-tighter leading-none font-serif">
            {dayNum}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest leading-none mb-1">
              {monthName} {dayName}
            </span>
            <p className="text-xs text-ink-700 font-serif leading-none italic pr-4">
              "{dailyQuote}"
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigate(ViewState.HISTORY)}
          className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-xl p-1.5 pl-2.5 border border-white/60 shadow-sm active:scale-95 transition-transform group"
        >
          <div className="flex items-center gap-1">
            <Flame size={10} className="text-orange-500 fill-orange-500" />
            <span className="text-[11px] font-bold text-ink-900">{recordedDays} 天</span>
          </div>
          <div className="w-px h-3 bg-ink-200"></div>
          <ChevronRight size={12} className="text-ink-400 group-hover:text-primary-500" />
        </button>
      </div>
    </header>
  );
};

HeaderComponent.displayName = 'Header';

export const Header = React.memo(HeaderComponent);




