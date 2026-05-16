import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title, size = 'lg' }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <div
        className={`bg-white w-full ${sizeClasses[size]} rounded-xl shadow-xl overflow-hidden animate-fadeInUp relative max-h-[95vh] sm:max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="hover:bg-green-700 rounded-full p-1 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
