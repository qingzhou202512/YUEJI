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
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });

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
    <header className="px-6 pt-10 pb-2 relative z-10 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex flex-col pt-1">
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-0.5">
            {monthName} {date.getFullYear()}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-ink-900 tracking-tighter leading-none font-serif">
              {dayNum}
            </span>
            <span className="text-base font-medium text-ink-600">
              {dayName}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onNavigate(ViewState.HISTORY)}
          className="flex flex-col items-end bg-white/70 backdrop-blur-md rounded-2xl p-2 pl-3 border border-white/70 shadow-sm active:scale-95 transition-transform group"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="bg-orange-100 p-1 rounded-full">
              <Flame size={12} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-xs font-bold text-ink-900">坚持 {recordedDays} 天</span>
          </div>
          <div className="flex items-center gap-1 text-ink-400 group-hover:text-primary-500 transition-colors">
            <span className="text-[10px] font-medium">查看足迹</span>
            <ChevronRight size={10} />
          </div>
        </button>
      </div>

      <div className="mt-4 relative pl-3 border-l-2 border-primary-400">
        <p className="text-sm text-ink-700 font-serif leading-relaxed italic pr-4">
          "{dailyQuote}"
        </p>
      </div>
    </header>
  );
};

HeaderComponent.displayName = 'Header';

export const Header = React.memo(HeaderComponent);




