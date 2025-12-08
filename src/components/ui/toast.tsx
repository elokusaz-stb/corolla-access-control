'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { CheckCircle, XCircle, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-corolla-primary-container border-corolla-quick-grant-border text-corolla-on-surface',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-corolla-primary',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border-2 p-4 shadow-xl',
        'duration-300 animate-in fade-in slide-in-from-right-4',
        colors[toast.type]
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconColors[toast.type])} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 rounded-full p-1 transition-colors hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
