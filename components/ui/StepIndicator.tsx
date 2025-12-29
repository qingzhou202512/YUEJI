import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i === currentStep ? 'w-8 bg-ink-900' : 
            i < currentStep ? 'w-1.5 bg-ink-300' : 'w-1.5 bg-ink-200'
          }`} 
        />
      ))}
    </div>
  );
};



