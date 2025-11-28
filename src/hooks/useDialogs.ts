import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
    isOpen: boolean;
    spellbookId: string;
    spellbookName: string;
}

export interface AlertDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'error' | 'success' | 'warning' | 'info';
}

/**
 * Custom hook for managing dialog state (ConfirmDialog and AlertDialog).
 * 
 * Provides methods to show and close dialogs, abstracting the state management.
 * 
 * @returns Object containing dialog states and handler functions
 */
export function useDialogs() {
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        spellbookId: '',
        spellbookName: '',
    });

    const [alertDialog, setAlertDialog] = useState<AlertDialogState>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'info',
    });

    const showConfirm = useCallback((spellbookId: string, spellbookName: string) => {
        setConfirmDialog({ isOpen: true, spellbookId, spellbookName });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmDialog({ isOpen: false, spellbookId: '', spellbookName: '' });
    }, []);

    const showAlert = useCallback((title: string, message: string, variant: AlertDialogState['variant'] = 'info') => {
        setAlertDialog({ isOpen: true, title, message, variant });
    }, []);

    const closeAlert = useCallback(() => {
        setAlertDialog(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        confirmDialog,
        alertDialog,
        showConfirm,
        closeConfirm,
        showAlert,
        closeAlert,
        setAlertDialog, // Exposed for cases where we need to set the full object
    };
}
