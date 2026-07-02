import React from 'react';
import { useToastStore } from '../store/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    info: <Info className="h-5 w-5 text-indigo-500" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    error: 'bg-rose-50 border-rose-100 text-rose-900',
    info: 'bg-indigo-50 border-indigo-100 text-indigo-900',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start p-4 rounded-xl border shadow-lg pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-4 ${
            bgStyles[toast.type]
          }`}
        >
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="ml-3 flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 flex-shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
