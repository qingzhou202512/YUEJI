import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ show, message }) => {
  return (
    <div 
      className={`absolute top-6 left-1/2 transform -translate-x-1/2 bg-ink-900/90 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg transition-all duration-300 z-[60] flex items-center gap-2 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <CheckCircle size={18} className="text-mint-400" />
      {message}
    </div>
  );
};



