import { useState } from 'react';

export function useSpellSelection() {
    const [selectedSpellIds, setSelectedSpellIds] = useState<Set<string>>(new Set());
    const [targetSpellbookId, setTargetSpellbookId] = useState<string>('');

    return {
        selectedSpellIds,
        setSelectedSpellIds,
        targetSpellbookId,
        setTargetSpellbookId,
    };
}
