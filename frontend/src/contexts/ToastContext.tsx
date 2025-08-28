import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastProps } from '@/components/ui/toast';

interface ToastContextType {
  toasts: ToastProps[];
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    console.log('🍞 Creating toast with id:', id, props);
    const newToast = { 
      ...props, 
      id,
      onClose: (toastId: string) => {
        console.log('❌ Toast close called for id:', toastId);
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }
    };
    
    setToasts(prev => {
      console.log('📝 Current toasts:', prev.length, 'Adding new toast:', newToast);
      return [...prev, newToast];
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    console.log('🟢 showSuccess called:', { title, message, duration });
    toast({ title, message, type: 'success', duration });
  }, [toast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    console.log('🔴 showError called:', { title, message, duration });
    toast({ title, message, type: 'error', duration });
  }, [toast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    console.log('🟡 showWarning called:', { title, message, duration });
    toast({ title, message, type: 'warning', duration });
  }, [toast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    console.log('🔵 showInfo called:', { title, message, duration });
    toast({ title, message, type: 'info', duration });
  }, [toast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextType = {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
