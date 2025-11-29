/**
 * SpellbookDetail Component (Container)
 *
 * Container component that handles data fetching and business logic.
 * Delegates rendering to SpellbookDetailView (presentational component).
 *
 * Responsibilities:
 * - Data fetching (loading spellbook from storage)
 * - State management (spellbook data, UI state)
 * - Event handling (toggle prepared, remove spell, etc.)
 * - Business logic (enriching spells with full data)
 */

import { SpellbookDetailContext } from '../contexts/SpellbookDetailContext';
import { SpellbookDetailView } from './SpellbookDetailView';
import { useSpellbookDetailLogic } from '../hooks/useSpellbookDetailLogic';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
  onCopySpellbook?: (id: string) => void;
}

export function SpellbookDetail({ spellbookId, onBack, onCopySpellbook }: SpellbookDetailProps) {
  const contextValue = useSpellbookDetailLogic({
    spellbookId,
    onBack,
    onCopySpellbook,
  });

  return (
    <SpellbookDetailContext.Provider value={contextValue}>
      <SpellbookDetailView />
    </SpellbookDetailContext.Provider>
  );
}
