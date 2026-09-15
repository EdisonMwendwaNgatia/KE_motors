'use client';

import React from 'react';
import { useToast, ToastType } from '@/lib/toastContext';

const typeStyles: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-900/90 dark:bg-emerald-950/90',
    border: 'border-emerald-500',
    text: 'text-emerald-200',
    icon: '✓',
  },
  error: {
    bg: 'bg-rose-900/90 dark:bg-rose-950/90',
    border: 'border-rose-500',
    text: 'text-rose-200',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-900/90 dark:bg-amber-950/90',
    border: 'border-amber-500',
    text: 'text-amber-200',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-900/90 dark:bg-blue-950/90',
    border: 'border-blue-500',
    text: 'text-blue-200',
    icon: 'ℹ',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg} ${style.text} shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5`}
          >
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-sm font-bold">
              {style.icon}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{toast.title}</h4>
              {toast.description && (
                <p className="mt-1 text-xs opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
