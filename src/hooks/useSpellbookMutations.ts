import { useState } from 'react';
import { CreateSpellbookInput, Spellbook } from '../types/spellbook';
import { MESSAGES } from '../constants/messages';

interface UseSpellbookMutationsProps {
    spellbooks: Spellbook[];
    addSpellsToSpellbook: (spellbookId: string, spellIds: string[]) => Promise<void>;
    createSpellbook: (input: CreateSpellbookInput) => Promise<Spellbook>;
    refreshSpellbooks: () => Promise<void>;
    onSuccess: (message: string) => void;
    onError: (title: string, message: string) => void;
    onInfo: (title: string, message: string) => void;
    selectedSpellIds: Set<string>;
    setSelectedSpellIds: (ids: Set<string>) => void;
    setCreateModalOpen: (isOpen: boolean) => void;
    setPendingSpellIds: (ids: Set<string>) => void;
    pendingSpellIds: Set<string>;
    targetSpellbookId: string;
}

/**
 * Custom hook for handling spellbook mutations (adding spells, creating spellbooks from selection).
 * 
 * Manages the state and logic for:
 * - Adding selected spells to an existing spellbook
 * - Creating a new spellbook with selected spells
 * - Validating selection and target spellbook
 * 
 * @param props - Hook properties
 * @returns Object containing mutation state and handlers
 */
export function useSpellbookMutations({
    spellbooks,
    addSpellsToSpellbook,
    createSpellbook,
    refreshSpellbooks,
    onSuccess,
    onError,
    onInfo,
    selectedSpellIds,
    setSelectedSpellIds,
    setCreateModalOpen,
    setPendingSpellIds,
    pendingSpellIds,
    targetSpellbookId,
}: UseSpellbookMutationsProps) {
    const [isAddingSpells, setIsAddingSpells] = useState(false);

    /**
     * Handles adding selected spells to a target spellbook.
     * Validates selection and target, then performs batch add.
     *
     * @param spellbookId - Optional spellbook ID to add to. If not provided, uses targetSpellbookId from state.
     */
    const handleAddToSpellbook = async (spellbookId?: string) => {
        if (selectedSpellIds.size === 0) {
            onInfo('No Spells Selected', 'Please select at least one spell to add to a spellbook.');
            return;
        }

        const targetId = spellbookId || targetSpellbookId;

        if (!targetId) {
            onInfo('No Spellbook Selected', 'Please select a spellbook from the dropdown menu.');
            return;
        }

        // If "new" is selected, open create spellbook modal with pending spells
        if (targetId === 'new') {
            setPendingSpellIds(new Set(selectedSpellIds));
            setCreateModalOpen(true);
            return;
        }

        // Validate spellbook exists
        const targetExists = spellbooks.some(sb => sb.id === targetId);
        if (!targetExists) {
            onError('Spellbook Not Found', 'The selected spellbook no longer exists. Please select another spellbook.');
            return;
        }

        // Get spellbook name before the operation
        const targetSpellbook = spellbooks.find(sb => sb.id === targetId);
        const spellbookName = targetSpellbook?.name || 'spellbook';
        const count = selectedSpellIds.size;

        setIsAddingSpells(true);
        try {
            // Add all selected spells to the spellbook in a single batch
            await addSpellsToSpellbook(targetId, Array.from(selectedSpellIds));

            // Ensure spellbooks list is refreshed to show updated spell counts
            await refreshSpellbooks();

            const message = count === 1
                ? `1 Spell added to ${spellbookName}!`
                : `${count} Spells added to ${spellbookName}!`;
            onSuccess(message);

            setSelectedSpellIds(new Set()); // Clear selection after adding
        } catch (error) {
            onError(
                MESSAGES.ERROR.FAILED_TO_ADD_SPELL,
                error instanceof Error ? error.message : MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC
            );
        } finally {
            setIsAddingSpells(false);
        }
    };

    /**
     * Handles creating a new spellbook, optionally adding pending spells.
     * 
     * @param input - Spellbook creation input
     */
    const handleCreateSpellbook = async (input: CreateSpellbookInput) => {
        try {
            const newSpellbook = await createSpellbook(input);

            // If there are pending spells, add them to the new spellbook
            if (pendingSpellIds.size > 0) {
                setIsAddingSpells(true);

                // Add spells in a single batch
                await addSpellsToSpellbook(newSpellbook.id, Array.from(pendingSpellIds));

                // Ensure spellbooks list is refreshed to show updated spell counts
                await refreshSpellbooks();

                const count = pendingSpellIds.size;
                onSuccess(`Spellbook created with ${count} ${count === 1 ? 'spell' : 'spells'}`);

                setPendingSpellIds(new Set());
                setSelectedSpellIds(new Set());
            } else {
                onSuccess('Spellbook created successfully');
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
