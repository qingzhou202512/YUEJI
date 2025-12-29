import React from 'react';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

interface CalendarViewProps {
  viewDate: Date;
  selectedDate: Date | null;
  hasEntryOnDate: (date: Date) => boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (day: number) => void;
  onClearFilter: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  viewDate,
  selectedDate,
  hasEntryOnDate,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  onClearFilter,
}) => {
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const totalDays = daysInMonth(viewDate);
  const startOffset = firstDayOfMonth(viewDate);
  const days: React.ReactNode[] = [];

  // Empty slots for start offset
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
  }

  // Days
  for (let i = 1; i <= totalDays; i++) {
    const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), i);
    const hasRecord = hasEntryOnDate(currentDayDate);
    const isSelected = selectedDate && isSameDay(selectedDate, currentDayDate);
    const isToday = isSameDay(new Date(), currentDayDate);

    days.push(
      <button 
        key={i} 
        onClick={() => onDateClick(i)}
        className={`h-10 w-full flex flex-col items-center justify-center relative rounded-xl transition-all border ${
          isSelected ? 'bg-ink-900 text-white shadow-md scale-105 border-ink-900' : 
          hasRecord ? 'bg-primary-50 text-primary-700 border-primary-100' :
          'text-ink-700 border-transparent hover:bg-white'
        }`}
      >
        <span className={`text-sm ${isToday && !isSelected ? 'text-primary-600 font-black' : (hasRecord && !isSelected) ? 'font-bold' : ''}`}>
          {i}
        </span>
        {hasRecord && !isSelected && (
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-400" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] p-4 border border-white/60 shadow-sm mt-1">
      <div className="flex justify-between items-center mb-4 px-2">
        <button onClick={onPrevMonth} className="p-1 rounded-full hover:bg-white text-ink-400 hover:text-ink-900 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-bold text-ink-800 uppercase tracking-widest font-serif">
          {viewDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
        </span>
        <button onClick={onNextMonth} className="p-1 rounded-full hover:bg-white text-ink-400 hover:text-ink-900 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-ink-300">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      {selectedDate && (
        <div className="mt-4 flex items-center justify-between bg-ink-900 text-white px-4 py-3 rounded-xl animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-primary-300" />
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-[10px] text-ink-300 uppercase font-bold">筛选日期</span>
              <span className="text-sm font-bold font-serif">
                {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <button 
            onClick={onClearFilter}
            className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};



