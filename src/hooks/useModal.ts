/**
 * useModal Hook
 *
 * Generic hook for managing modal/dialog state.
 * Provides open/close functionality and current state.
 *
 * Usage:
 * const { isOpen, data, openModal, closeModal } = useModal<string>(); // data type can be specified
 *
 * // Open modal with optional data
 * openModal('some-data');
 *
 * // Close modal and clear data
 * closeModal();
 *
 * // Check if modal is open
 * if (isOpen) { ... }
 */

import { useState } from 'react';

interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  openModal: (data?: T) => void;
  closeModal: () => void;
}

export function useModal<T = unknown>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const openModal = (modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    isOpen,
    data,
    openModal,
    closeModal,
  };
}
