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

interface UseToastReturn {
  isVisible: boolean;
  message: string;
  showToast: (message: string, duration?: number) => void;
}

export function useToast(defaultDuration = 2000): UseToastReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = (toastMessage: string, duration: number = defaultDuration) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show toast with message
    setMessage(toastMessage);
    setIsVisible(true);

    // Auto-hide after duration
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setMessage('');
    }, duration);
  };

  return {
    isVisible,
    message,
    showToast,
  };
}
