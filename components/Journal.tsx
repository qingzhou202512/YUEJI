import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { ArrowLeft, Smile, Sparkles, Battery, CheckCircle, Target } from 'lucide-react';
import { generateDailyInsight } from '../services/geminiService';
import { saveEntry } from '../services/storage';
import { StepIndicator } from './ui/StepIndicator';
import { Toast } from './ui/Toast';
import { HappinessStep } from './journal/HappinessStep';
import { AchievementsStep } from './journal/AchievementsStep';
import { DrainersStep } from './journal/DrainersStep';
import { MitStep } from './journal/MitStep';
import { TomorrowStep } from './journal/TomorrowStep';
import { JournalActions } from './journal/JournalActions';

interface JournalProps {
  onComplete: () => void;
  onBack: () => void;
  existingEntry?: JournalEntry;
  yesterdayEntry?: JournalEntry;
}

const steps = [
  { id: 'happiness', title: '小确幸', subtitle: '记录 3 件让你感到开心幸福的事', color: 'bg-pink-50 text-pink-500', icon: <Smile size={24} /> },
  { id: 'achievements', title: '高光时刻', subtitle: '记录 3 件让你有成就感的小事', color: 'bg-primary-50 text-primary-600', icon: <Sparkles size={24} /> },
  { id: 'drainers', title: '能量监测', subtitle: '今天有没有让你感到消耗的事情？', color: 'bg-mint-50 text-mint-600', icon: <Battery size={24} /> },
  { id: 'mit', title: '核心复盘', subtitle: '最重要的那一件事，完成了吗？', color: 'bg-indigo-50 text-indigo-600', icon: <CheckCircle size={24} /> },
  { id: 'tomorrow', title: '明日展望', subtitle: '明天最重要的一件事是什么？', color: 'bg-purple-50 text-purple-600', icon: <Target size={24} /> },
];

export const Journal: React.FC<JournalProps> = ({ onComplete, onBack, existingEntry, yesterdayEntry }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // Pre-fill logic
  const initialTodayMit = existingEntry?.todayMitDescription || yesterdayEntry?.tomorrowMit || '';
  const initialMitCompleted = existingEntry ? existingEntry.mitCompleted : false;

  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    achievements: ['', '', ''],
    happiness: ['', '', ''],
    drainerLevel: 'none',
    drainerNote: '',
    todayMitDescription: initialTodayMit,
    mitCompleted: initialMitCompleted,
    mitReason: '',
    tomorrowMit: '',
    ...existingEntry
  });

  const handleArrayChange = (field: 'achievements' | 'happiness', index: number, value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(c => c + 1);
    } else {
      handleSubmit(true);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(false);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleSubmit = async (isCompleteFlow: boolean) => {
    if (isCompleteFlow) setIsSubmitting(true);
    
    const entry: JournalEntry = {
      id: existingEntry?.id || crypto.randomUUID(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      achievements: formData.achievements as string[],
      happiness: formData.happiness as string[],
      drainerLevel: formData.drainerLevel || 'none',
      drainerNote: formData.drainerNote,
      todayMitDescription: formData.todayMitDescription || '',
      mitCompleted: !!formData.mitCompleted,
      mitReason: formData.mitReason,
      tomorrowMit: formData.tomorrowMit || '',
      aiInsight: existingEntry?.aiInsight,
      aiMood: existingEntry?.aiMood
    };

    if (isCompleteFlow) {
      try {
        const analysis = await generateDailyInsight(entry);
        entry.aiInsight = analysis.text;
        entry.aiMood = analysis.mood;
      } catch (e) {
        console.error("AI generation failed", e);
      }
      saveEntry(entry);
      setIsSubmitting(false);
      onComplete();
    } else {
      saveEntry(entry);
    }
  };

  const activeStep = steps[currentStep];

  return (
    <div className="flex flex-col h-full w-full bg-cream relative overflow-hidden z-40">
      {/* Dynamic Background Blobs */}
      <div className={`absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30 transition-colors duration-700 pointer-events-none ${
        currentStep === 0 ? 'bg-pink-300' : 
        currentStep === 1 ? 'bg-primary-300' :
        currentStep === 2 ? 'bg-mint-300' : 
        currentStep === 3 ? 'bg-indigo-300' : 'bg-purple-300'
      }`} />
      
      <Toast show={showSaveToast} message="已保存您的分享" />

      {/* Top Bar */}
      <div className="pt-8 px-6 relative z-10 flex-none">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="p-3 rounded-full text-ink-500 hover:bg-white/50 transition-all active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          
          <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

          <div className="w-12" />
        </div>

        <div className="space-y-3 animate-fade-in px-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shadow-sm ${activeStep.color}`}>
              {activeStep.icon}
            </div>
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
              {activeStep.title}
            </h2>
          </div>
          <p className="text-ink-500 text-lg leading-relaxed font-medium">{activeStep.subtitle}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar relative z-10">
        <div className="min-h-[50vh] flex flex-col pt-2 pb-56 animate-fade-in">
          {currentStep === 0 && (
            <HappinessStep
              values={formData.happiness || ['', '', '']}
              onChange={(i, v) => handleArrayChange('happiness', i, v)}
            />
          )}

          {currentStep === 1 && (
            <AchievementsStep
              values={formData.achievements || ['', '', '']}
              onChange={(i, v) => handleArrayChange('achievements', i, v)}
            />
          )}

          {currentStep === 2 && (
            <DrainersStep
              drainerLevel={formData.drainerLevel || 'none'}
              drainerNote={formData.drainerNote || ''}
              onLevelChange={(level) => setFormData({ ...formData, drainerLevel: level })}
              onNoteChange={(note) => setFormData({ ...formData, drainerNote: note })}
            />
          )}

          {currentStep === 3 && (
            <MitStep
              description={formData.todayMitDescription || ''}
              completed={formData.mitCompleted || false}
              reason={formData.mitReason || ''}
              onDescriptionChange={(v) => setFormData({ ...formData, todayMitDescription: v })}
              onCompletedChange={(v) => setFormData({ ...formData, mitCompleted: v })}
              onReasonChange={(v) => setFormData({ ...formData, mitReason: v })}
            />
          )}

          {currentStep === 4 && (
            <TomorrowStep
              value={formData.tomorrowMit || ''}
              onChange={(v) => setFormData({ ...formData, tomorrowMit: v })}
            />
          )}
        </div>
      </div>

      <JournalActions
        currentStep={currentStep}
        totalSteps={steps.length}
        isSubmitting={isSubmitting}
        onBack={handleBackStep}
        onSave={handleSaveDraft}
        onNext={handleNext}
      />
    </div>
  );
};



