import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClassName: 'text-green-500',
    progressClassName: 'bg-green-500'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClassName: 'text-red-500',
    progressClassName: 'bg-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClassName: 'text-yellow-500',
    progressClassName: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClassName: 'text-blue-500',
    progressClassName: 'bg-blue-500'
  }
};

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  title, 
  message, 
  type, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const variant = toastVariants[type];
  const Icon = variant.icon;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    // Auto close
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[9999] w-96 max-w-sm transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg',
        variant.className
      )}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
          <div 
            className={cn('h-full transition-all duration-100 ease-linear', variant.progressClassName)}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Toast content */}
        <div className="flex items-start gap-3 p-4">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', variant.iconClassName)} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm mb-1 truncate">{title}</h4>
            )}
            <p className="text-sm leading-relaxed">{message}</p>
          </div>

          <button
            onClick={handleClose}
            className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ 
  toasts: ToastProps[]; 
  onClose: (id: string) => void; 
}> = ({ toasts, onClose }) => {
  console.log('🎯 ToastContainer render with toasts:', toasts.length, toasts);
  
  return (
    <>
      {toasts.map((toast, index) => {
        console.log(`🎯 Rendering toast ${index}:`, toast);
        return (
          <div
            key={toast.id}
            style={{ 
              top: `${4 + (index * 5)}rem`,
              zIndex: 9999 + index 
            }}
          >
            <Toast {...toast} onClose={onClose} />
          </div>
        );
      })}
    </>
  );
};
