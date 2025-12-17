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
  openEditModal?: boolean;
  onBack: () => void;
  onCopySpellbook?: (id: string) => void;
  onDeleteSpellbook?: () => void;
}

export function SpellbookDetail({ spellbookId, openEditModal, onBack, onCopySpellbook, onDeleteSpellbook }: SpellbookDetailProps) {
  const contextValue = useSpellbookDetailLogic({
    spellbookId,
    openEditModal,
    onBack,
    onCopySpellbook,
    onDeleteSpellbook,
  });

  return (
    <SpellbookDetailContext.Provider value={contextValue}>
      <SpellbookDetailView />
    </SpellbookDetailContext.Provider>
  );
}
