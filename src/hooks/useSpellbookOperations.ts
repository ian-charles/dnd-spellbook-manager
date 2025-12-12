import { useState, useRef, useEffect } from 'react';
import { Spellbook, CreateSpellbookInput, SpellSlots } from '../types/spellbook';
import { exportImportService } from '../services/exportImport.service';
import { MESSAGES } from '../constants/messages';
import { MAX_IMPORT_FILE_SIZE } from '../constants/gameRules';
import { AlertDialogState } from './useDialogs';

interface UseSpellbookOperationsProps {
    spellbooks: Spellbook[];
    onCreateSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
    onDeleteSpellbook: (id: string) => Promise<void>;
    onRefreshSpellbooks: () => Promise<void>;
    onAddSpellsToSpellbook: (spellbookId: string, spellIds: string[]) => Promise<void>;
    setAlertDialog: (state: AlertDialogState) => void;
    closeConfirm: () => void;
}

/**
 * Custom hook for managing spellbook operations (create, copy, delete, import, export).
 * 
 * Handles the complex logic for copying spells during spellbook creation,
 * including progress tracking and error handling.
 * 
 * @param props - Hook properties
 * @param props.spellbooks - List of available spellbooks
 * @param props.onCreateSpellbook - Callback to create a new spellbook
 * @param props.onDeleteSpellbook - Callback to delete a spellbook
 * @param props.onRefreshSpellbooks - Callback to refresh the spellbooks list
 * @param props.onAddSpellToSpellbook - Callback to add a spell to a spellbook
 * @param props.setAlertDialog - Callback to show an alert dialog
 * @param props.closeConfirm - Callback to close the confirmation dialog
 * @returns Object containing state and handlers for spellbook operations:
 * - `createModalOpen`: Boolean indicating if the create modal is open
 * - `setCreateModalOpen`: Function to set create modal state
 * - `copyData`: Data for the spellbook being copied (if any)
 * - `setCopyData`: Function to set copy data
 * - `copyProgress`: String description of current copy progress
 * - `importing`: Boolean indicating if an import is in progress
 * - `fileInputRef`: Ref for the hidden file input element
 * - `handleCreateSpellbook`: Function to handle spellbook creation
 * - `handleCopy`: Function to initiate spellbook copy
 * - `handleConfirmDelete`: Function to confirm spellbook deletion
 * - `handleExport`: Function to handle spellbook export
 * - `handleImportClick`: Function to trigger file input click
 * - `handleImport`: Function to handle file selection and import
 */
export function useSpellbookOperations({
    spellbooks,
    onCreateSpellbook,
    onDeleteSpellbook,
    onRefreshSpellbooks,
    onAddSpellsToSpellbook,
    setAlertDialog,
    closeConfirm,
}: UseSpellbookOperationsProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [copyData, setCopyData] = useState<{
        name: string;
        spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
        spellAttackModifier?: number;
        spellSaveDC?: number;
        maxSpellSlots?: SpellSlots;
        sourceSpellbookId?: string;
        onSuccess?: (newSpellbookId: string) => void;
    } | undefined>(undefined);
    const [copyProgress, setCopyProgress] = useState<string>('');
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    /**
     * Handles spellbook creation.
     * 
     * Error Handling Strategy:
     * - Creation errors are propagated to the caller (modal form) to be displayed inline.
     * - Copy errors (partial or total) are handled via AlertDialog since the creation itself succeeded.
     */
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Cancels the currently running operation (create/copy/import).
     */
    const cancelOperation = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    /**
     * Handles spellbook creation.
     * 
     * Error Handling Strategy:
     * - Creation errors are propagated to the caller (modal form) to be displayed inline.
     * - Copy errors (partial or total) are handled via AlertDialog since the creation itself succeeded.
     */
    const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const newSpellbook = await onCreateSpellbook(input);

            // If this is a copy operation, copy all spells from the source spellbook
            if (copyData?.sourceSpellbookId) {
                const sourceSpellbook = spellbooks.find(sb => sb.id === copyData.sourceSpellbookId);
                if (sourceSpellbook && sourceSpellbook.spells.length > 0) {
                    // Copy all spells from the source spellbook to the new one
                    const errors: string[] = [];
                    const spellsToCopy = sourceSpellbook.spells.map(spell => spell.spellId);


                    // Use batch add operation
                    setCopyProgress('Copying spells...');

                    try {
                        if (signal.aborted) return;
                        await onAddSpellsToSpellbook(newSpellbook.id, spellsToCopy);
                    } catch (error) {
                        if (!signal.aborted) {
                            errors.push(`Failed to copy spells: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                    }

                    if (signal.aborted) {
                        setAlertDialog({
                            isOpen: true,
                            title: 'Copy Cancelled',
                            message: 'The copy operation was cancelled. The spellbook was created with partial spells.',
                            variant: 'warning'
                        });
                    } else if (errors.length > 0) {
                        setAlertDialog({
                            isOpen: true,
                            title: 'Copy Failed',
                            message: `Spellbook created, but failed to copy spells: ${errors[0]}`,
                            variant: 'warning'
                        });
                    }
                }
            }

            if (mountedRef.current && !signal.aborted) {
                // Call success callback if provided (e.g., for navigation after copy)
                if (copyData?.onSuccess) {
                    copyData.onSuccess(newSpellbook.id);
                }
                setCreateModalOpen(false);
                setCopyData(undefined);
                setCopyProgress('');
            }
        } finally {
            abortControllerRef.current = null;
            // Ensure spellbooks list is refreshed after creation (and potential copying)
            await onRefreshSpellbooks();
        }
    };

    /**
     * Initiates the copy process for a spellbook.
     * Opens the create modal pre-filled with the source spellbook's data.
     *
     * @param id - ID of the spellbook to copy
     * @param onSuccess - Optional callback to call with the new spellbook ID after successful copy
     */
    const handleCopy = (id: string, onSuccess?: (newSpellbookId: string) => void) => {
        const spellbook = spellbooks.find(sb => sb.id === id);
        if (!spellbook) return;

        setCopyData({
            name: `${spellbook.name}${MESSAGES.GENERATED.COPY_SUFFIX}`,
            spellcastingAbility: spellbook.spellcastingAbility,
            spellAttackModifier: spellbook.spellAttackModifier,
            spellSaveDC: spellbook.spellSaveDC,
            maxSpellSlots: spellbook.maxSpellSlots,
            sourceSpellbookId: id,
            onSuccess,
        });
        setCreateModalOpen(true);
    };

    /**
     * Confirms and executes spellbook deletion.
     * 
     * @param spellbookId - ID of the spellbook to delete
     */
    const handleConfirmDelete = async (spellbookId: string) => {
        try {
            await onDeleteSpellbook(spellbookId);
            closeConfirm();
        } catch (error) {
            closeConfirm();
            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.DELETE_FAILED,
                message: MESSAGES.ERROR.FAILED_TO_DELETE_SPELLBOOK,
                variant: 'error',
            });
        }
    };

    /**
     * Exports all spellbooks to a JSON file.
     */
    const handleExport = async () => {
        try {
            await exportImportService.downloadSpellbooks();
        } catch (error) {
            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.EXPORT_FAILED,
                message: MESSAGES.ERROR.FAILED_TO_EXPORT_SPELLBOOKS,
                variant: 'error',
            });
        }
    };

    /**
     * Triggers the hidden file input for importing spellbooks.
     */
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Handles the file selection and import process.
     * Validates file size and content before importing.
     * 
     * @param e - Change event from the file input
     */
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMPORT_FILE_SIZE) {
            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.IMPORT_FAILED,
                message: `File size exceeds limit of ${MAX_IMPORT_FILE_SIZE / 1024 / 1024}MB`,
                variant: 'error',
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setImporting(true);
        abortControllerRef.current = new AbortController();

        try {
            const text = await file.text();
            // Note: JSON.parse and basic validation are synchronous, so we can't easily abort them
            // unless we move them to a worker or use a streaming parser.
            // For now, we just support aborting the overall process state.

            if (abortControllerRef.current?.signal.aborted) return;

            const result = await exportImportService.importSpellbooks(text);

            if (abortControllerRef.current?.signal.aborted) return;

            // Show result
            if (result.errors.length > 0) {
                setAlertDialog({
                    isOpen: true,
                    title: MESSAGES.ERROR.IMPORT_WITH_ERRORS,
                    message:
                        `${MESSAGES.IMPORT.IMPORTED_LABEL} ${result.imported}\n` +
                        `${MESSAGES.IMPORT.SKIPPED_LABEL} ${result.skipped}\n` +
                        `${MESSAGES.IMPORT.ERRORS_LABEL} ${result.errors.length}\n\n` +
                        result.errors.join('\n'),
                    variant: 'warning',
                });
            } else {
                setAlertDialog({
                    isOpen: true,
                    title: MESSAGES.SUCCESS.IMPORT_SUCCESS,
                    message: `${MESSAGES.IMPORT.IMPORTED_LABEL} ${result.imported}\n${MESSAGES.IMPORT.SKIPPED_LABEL} ${result.skipped}`,
                    variant: 'success',
                });
            }

            // Refresh the spellbooks list
            onRefreshSpellbooks();
        } catch (error) {
            if (abortControllerRef.current?.signal.aborted) return;

            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.IMPORT_FAILED,
                message: `${MESSAGES.ERROR.FAILED_TO_IMPORT_SPELLBOOKS} ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'error',
            });
        } finally {
            abortControllerRef.current = null;
            if (mountedRef.current) {
                setImporting(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    return {
        createModalOpen,
        setCreateModalOpen,
        copyData,
        setCopyData,
        copyProgress,
        importing,
        fileInputRef,
        handleCreateSpellbook,
        handleCopy,
        handleConfirmDelete,
        handleExport,
        handleImportClick,
        handleImport,
        cancelOperation,
    };
}
