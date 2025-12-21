/**
 * useToast Hook
 *
 * Hook for managing temporary toast notifications.
 * Automatically hides toast after specified duration.
 *
 * Usage:
 * const { isVisible, message, showToast } = useToast();
 *
 * // Show toast with message (auto-hides after 2 seconds)
 * showToast('Operation successful!');
 *
 * // Show toast with custom duration
 * showToast('Saving...', 5000);
 *
 * // Render toast
 * {isVisible && <div className="toast">{message}</div>}
 */

import { useState, useEffect, useRef } from 'react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

interface UseToastReturn {
  isVisible: boolean;
  message: string;
  variant: ToastVariant;
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

export function useToast(defaultDuration = 2000): UseToastReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<ToastVariant>('success');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = (toastMessage: string, toastVariant: ToastVariant = 'success', duration: number = defaultDuration) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show toast with message and variant
    setMessage(toastMessage);
    setVariant(toastVariant);
    setIsVisible(true);

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setMessage('');
      setVariant('success');
    }, duration);
  };

  return {
    isVisible,
    message,
    variant,
    showToast,
  };
}
