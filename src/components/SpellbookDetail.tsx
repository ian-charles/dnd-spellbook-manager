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
import { ToastVariant } from '../hooks/useToast';

interface SpellbookDetailProps {
  spellbookId: string;
  openEditModal?: boolean;
  onBack: () => void;
  onCopySpellbook?: (id: string) => void;
  onDeleteSpellbook?: (spellbookName?: string) => void;
  onSuccess?: (message: string, variant?: ToastVariant) => void;
}

export function SpellbookDetail({ spellbookId, openEditModal, onBack, onCopySpellbook, onDeleteSpellbook, onSuccess }: SpellbookDetailProps) {
  const contextValue = useSpellbookDetailLogic({
    spellbookId,
    openEditModal,
    onBack,
    onCopySpellbook,
    onDeleteSpellbook,
    onSuccess,
  });

  return (
    <SpellbookDetailContext.Provider value={contextValue}>
      <SpellbookDetailView />
    </SpellbookDetailContext.Provider>
  );
}
