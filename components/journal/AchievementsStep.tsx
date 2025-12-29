import React from 'react';

interface AchievementsStepProps {
  values: string[];
  onChange: (index: number, value: string) => void;
}

export const AchievementsStep: React.FC<AchievementsStepProps> = ({ values, onChange }) => {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="group relative">
          <div className="absolute left-4 top-4 text-xs font-bold text-primary-400">0{i+1}</div>
          <input
            type="text"
            autoFocus={i === 0}
            placeholder={i === 0 ? "早起喝了一杯温水..." : "..."}
            value={values[i] || ''}
            onChange={(e) => onChange(i, e.target.value)}
            className="w-full pl-12 pr-6 py-5 bg-white rounded-[2rem] text-lg font-normal text-ink-700 placeholder:text-ink-300 shadow-sm focus:shadow-md focus:scale-[1.02] outline-none transition-all border border-transparent focus:border-primary-100"
          />
        </div>
      ))}
    </div>
  );
};



