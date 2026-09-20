import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      id="toastContainer"
      className="fixed bottom-5 right-5 z-50 animate-fade-in max-w-sm flex items-center gap-2.5 bg-[#22271F] text-[#FBFAF3] px-4 py-3 rounded-lg shadow-xl border border-[#CFC9B4] text-xs font-mono"
    >
      <CheckCircle className="w-4 h-4 text-[#4B7355] shrink-0" />
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="text-[#8B8776] hover:text-[#FBFAF3] cursor-pointer ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
