'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface AlertBannerProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function AlertBanner({
  message,
  type = 'info',
  dismissible = true,
  onDismiss,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  };

  return (
    <div
      className={`border-l-4 border-current ${styles[type]} p-4 flex items-center justify-between`}
    >
      <p className="text-sm font-medium">{message}</p>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-4 inline-flex text-current hover:opacity-75"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
