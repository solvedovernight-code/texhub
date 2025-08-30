import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
  duration?: number; // in ms
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  info: 'bg-secondary text-white',
  warning: 'bg-warning text-white',
};

export function Toast({ id, message, type, onDismiss, duration = 5000 }: ToastProps) {
  const Icon = iconMap[type];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      // Animate out
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300); // Allow time for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-4 pr-8 rounded-lg shadow-lg transition-all duration-300 ease-out transform",
        colorMap[type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-grow">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(id), 300);
        }}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
