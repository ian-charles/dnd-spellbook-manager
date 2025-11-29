import { createContext, useContext } from 'react';
import { SpellbookDetailContextType } from '../types/spellbookDetail';

export const SpellbookDetailContext = createContext<SpellbookDetailContextType | null>(null);

export function useSpellbookDetail() {
    const context = useContext(SpellbookDetailContext);
    if (!context) {
        throw new Error('useSpellbookDetail must be used within a SpellbookDetailProvider');
    }
    return context;
}
