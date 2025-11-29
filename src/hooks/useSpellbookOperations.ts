import { useState, useRef, useEffect } from 'react';
import { Spellbook, CreateSpellbookInput } from '../types/spellbook';
import { exportImportService } from '../services/exportImport.service';
import { MESSAGES } from '../constants/messages';
import { MAX_IMPORT_FILE_SIZE } from '../constants/gameRules';
import { AlertDialogState } from './useDialogs';

interface UseSpellbookOperationsProps {
    spellbooks: Spellbook[];
    onCreateSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
    onDeleteSpellbook: (id: string) => Promise<void>;
    onRefreshSpellbooks: () => Promise<void>;
    onAddSpellToSpellbook: (spellbookId: string, spellId: string) => Promise<void>;
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
    onAddSpellToSpellbook,
    setAlertDialog,
    closeConfirm,
}: UseSpellbookOperationsProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [copyData, setCopyData] = useState<{
        name: string;
        spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
        spellAttackModifier?: number;
        spellSaveDC?: number;
        sourceSpellbookId?: string;
    } | undefined>(undefined);
    const [copyProgress, setCopyProgress] = useState<string>('');
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processedSpellCountRef = useRef(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
        try {
            const newSpellbook = await onCreateSpellbook(input);

            // If this is a copy operation, copy all spells from the source spellbook
            if (copyData?.sourceSpellbookId) {
                const sourceSpellbook = spellbooks.find(sb => sb.id === copyData.sourceSpellbookId);
                if (sourceSpellbook && sourceSpellbook.spells.length > 0) {
                    // Copy all spells from the source spellbook to the new one
                    const errors: string[] = [];
                    const spellsToCopy = sourceSpellbook.spells.map(spell => spell.spellId);
                    const totalSpells = spellsToCopy.length;

                    // Track processed spell count to avoid race conditions in async closure
                    processedSpellCountRef.current = 0;
                    setCopyProgress(MESSAGES.LOADING.COPYING_SPELLS.replace('{current}', '0').replace('{total}', String(totalSpells)));

                    const results = await Promise.allSettled(spellsToCopy.map(async (spellId) => {
                        try {
                            await onAddSpellToSpellbook(newSpellbook.id, spellId);
                        } finally {
                            if (mountedRef.current) {
                                processedSpellCountRef.current++;
                                setCopyProgress(MESSAGES.LOADING.COPYING_SPELLS.replace('{current}', String(processedSpellCountRef.current)).replace('{total}', String(totalSpells)));
                            }
                        }
                    }));

                    results.forEach((result, index) => {
                        if (result.status === 'rejected') {
                            errors.push(`Failed to copy spell ${spellsToCopy[index]}`);
                        }
                    });

                    if (errors.length > 0) {
                        const allFailed = errors.length === spellsToCopy.length;
                        setAlertDialog({
                            isOpen: true,
                            title: allFailed ? 'Copy Failed' : 'Partial Copy Warning',
                            message: allFailed
                                ? 'Failed to copy any spells. The spellbook was created but is empty.'
                                : `Spellbook created, but some spells failed to copy: ${errors.length} errors.`,
                            variant: allFailed ? 'error' : 'warning'
                        });
                    }
                }
            }

            if (mountedRef.current) {
                setCreateModalOpen(false);
                setCopyData(undefined);
                setCopyProgress('');
            }
        } catch (error) {
            throw error; // Let the modal handle the error
        } finally {
            // Ensure spellbooks list is refreshed after creation (and potential copying)
            await onRefreshSpellbooks();
        }
    };

    const handleCopy = (id: string) => {
        const spellbook = spellbooks.find(sb => sb.id === id);
        if (!spellbook) return;

        setCopyData({
            name: `${spellbook.name}${MESSAGES.GENERATED.COPY_SUFFIX}`,
            spellcastingAbility: spellbook.spellcastingAbility,
            spellAttackModifier: spellbook.spellAttackModifier,
            spellSaveDC: spellbook.spellSaveDC,
            sourceSpellbookId: id,
        });
        setCreateModalOpen(true);
    };

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

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

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
        try {
            const text = await file.text();
            const result = await exportImportService.importSpellbooks(text);

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
            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.IMPORT_FAILED,
                message: `${MESSAGES.ERROR.FAILED_TO_IMPORT_SPELLBOOKS} ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'error',
            });
        } finally {
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
    };
}
