import React from 'react';
import { ArrowLeft, ArrowRight, Save, Check, Loader2 } from 'lucide-react';

interface JournalActionsProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSave: () => void;
  onNext: () => void;
}

export const JournalActions: React.FC<JournalActionsProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onSave,
  onNext,
}) => {
  return (
    <div className="absolute bottom-32 left-0 w-full px-6 z-50 flex gap-3 pointer-events-auto">
      {currentStep > 0 && (
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-14 h-14 bg-white text-ink-500 border border-ink-100 rounded-[1.5rem] shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <button
        onClick={onSave}
        disabled={isSubmitting}
        className="flex-1 h-14 bg-white text-ink-900 border border-ink-100 rounded-[1.5rem] font-bold text-base shadow-sm hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Save size={18} className="text-ink-400" />
        保存
      </button>

      <button
        onClick={onNext}
        disabled={isSubmitting}
        className="flex-[2] h-14 bg-ink-900 text-white rounded-[1.5rem] font-bold text-base shadow-glow hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            {currentStep === totalSteps - 1 ? '完成' : '下一步'}
            {currentStep === totalSteps - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
          </>
        )}
      </button>
    </div>
  );
};



