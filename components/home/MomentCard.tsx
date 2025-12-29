import React from 'react';

interface Moment {
  id: string;
  text: string;
  date: Date;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  bgColor: string;
  label: string;
  isDone?: boolean;
}

interface MomentCardProps {
  moment: Moment;
  onClick: () => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({ moment, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="w-full bg-white/95 backdrop-blur-sm rounded-[2rem] p-5 shadow-card border border-white/60 flex items-start gap-4 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className={`p-3 rounded-2xl shrink-0 ${moment.bgColor} ${moment.color}`}>
        <moment.icon size={20} />
      </div>
      <div className="flex-1 pt-0.5 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-[10px] px-2 py-0.5 rounded-md ${moment.bgColor} ${moment.color} bg-opacity-30 font-bold tracking-wide`}>
            {moment.label}
          </span>
        </div>
        <p className={`text-[15px] leading-relaxed font-normal line-clamp-2 overflow-hidden text-ellipsis ${
          moment.isDone === false ? 'text-ink-500 line-through decoration-ink-300' : 'text-ink-700'
        }`}>
          {moment.text}
        </p>
      </div>
    </div>
  );
};




