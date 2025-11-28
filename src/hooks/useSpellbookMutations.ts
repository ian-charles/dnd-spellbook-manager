import { useState } from 'react';
import { CreateSpellbookInput, Spellbook } from '../types/spellbook';
import { MESSAGES } from '../constants/messages';

interface UseSpellbookMutationsProps {
    spellbooks: Spellbook[];
    addSpellToSpellbook: (spellbookId: string, spellId: string) => Promise<void>;
    createSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
    refreshSpellbooks: () => Promise<void>;
    displayToast: (message: string) => void;
    setAlertDialog: (dialog: { isOpen: boolean; title: string; message: string; variant: 'error' | 'success' | 'warning' | 'info' }) => void;
    selectedSpellIds: Set<string>;
    setSelectedSpellIds: (ids: Set<string>) => void;
    setCreateModalOpen: (isOpen: boolean) => void;
    setPendingSpellIds: (ids: Set<string>) => void;
    pendingSpellIds: Set<string>;
    targetSpellbookId: string;
}

export function useSpellbookMutations({
    spellbooks,
    addSpellToSpellbook,
    createSpellbook,
    refreshSpellbooks,
    displayToast,
    setAlertDialog,
    selectedSpellIds,
    setSelectedSpellIds,
    setCreateModalOpen,
    setPendingSpellIds,
    pendingSpellIds,
    targetSpellbookId,
}: UseSpellbookMutationsProps) {
    const [isAddingSpells, setIsAddingSpells] = useState(false);

    const handleAddToSpellbook = async () => {
        if (selectedSpellIds.size === 0) {
            setAlertDialog({
                isOpen: true,
                title: 'No Spells Selected',
                message: 'Please select at least one spell to add to a spellbook.',
                variant: 'info',
            });
            return;
        }

        if (!targetSpellbookId) {
            setAlertDialog({
                isOpen: true,
                title: 'No Spellbook Selected',
                message: 'Please select a spellbook from the dropdown menu.',
                variant: 'info',
            });
            return;
        }

        // If "new" is selected, open create spellbook modal with pending spells
        if (targetSpellbookId === 'new') {
            setPendingSpellIds(new Set(selectedSpellIds));
            setCreateModalOpen(true);
            return;
        }

        // Validate spellbook exists
        const targetExists = spellbooks.some(sb => sb.id === targetSpellbookId);
        if (!targetExists) {
            setAlertDialog({
                isOpen: true,
                title: 'Spellbook Not Found',
                message: 'The selected spellbook no longer exists. Please select another spellbook.',
                variant: 'error',
            });
            return;
        }

        setIsAddingSpells(true);
        try {
            // Add all selected spells to the spellbook in parallel
            const results = await Promise.allSettled(
                Array.from(selectedSpellIds).map(spellId => addSpellToSpellbook(targetSpellbookId, spellId))
            );

            // Check for failures
            const failed = results.filter(r => r.status === 'rejected');

            // Ensure spellbooks list is refreshed to show updated spell counts
            await refreshSpellbooks();

            if (failed.length > 0) {
                const successCount = selectedSpellIds.size - failed.length;
                if (successCount > 0) {
                    displayToast(`Added ${successCount} spells. Failed to add ${failed.length} spells.`);
                } else {
                    throw new Error(`Failed to add any spells to the spellbook.`);
                }
            } else {
                const count = selectedSpellIds.size; // Calculate count BEFORE clearing
                displayToast(count === 1 ? MESSAGES.SUCCESS.SPELL_ADDED : `${count} spells added to spellbook`);
            }

            setSelectedSpellIds(new Set()); // Clear selection after adding
        } catch (error) {
            setAlertDialog({
                isOpen: true,
                title: MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
                message: error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC,
                variant: 'error',
            });
        } finally {
            setIsAddingSpells(false);
        }
    };

    const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
        try {
            const newSpellbook = await createSpellbook(input);

            // If there are pending spells, add them to the new spellbook
            if (pendingSpellIds.size > 0) {
                setIsAddingSpells(true);

                // Add spells in parallel
                const results = await Promise.allSettled(
                    Array.from(pendingSpellIds).map(spellId => addSpellToSpellbook(newSpellbook.id, spellId))
                );

                const failed = results.filter(r => r.status === 'rejected');

                // Ensure spellbooks list is refreshed to show updated spell counts
                await refreshSpellbooks();

                if (failed.length > 0) {
                    // If some failed, we still show success for the ones that worked, but warn about failures
                    const successCount = pendingSpellIds.size - failed.length;
                    if (successCount > 0) {
                        displayToast(`Spellbook created with ${successCount} spells. Failed to add ${failed.length} spells.`);
                    } else {
                        throw new Error(`Failed to add any spells to the new spellbook.`);
                    }
                } else {
                    const count = pendingSpellIds.size;
                    displayToast(`Spellbook created with ${count} ${count === 1 ? 'spell' : 'spells'}`);
                }

                setPendingSpellIds(new Set());
                setSelectedSpellIds(new Set());
            } else {
                displayToast('Spellbook created successfully');
                // Always refresh and close modal
                await refreshSpellbooks();
            }
        } catch (error) {
            throw error; // Let the modal handle the error
        } finally {
            setIsAddingSpells(false);
            setCreateModalOpen(false);
        }
    };

    return {
        isAddingSpells,
        handleAddToSpellbook,
        handleCreateSpellbook,
    };
}
