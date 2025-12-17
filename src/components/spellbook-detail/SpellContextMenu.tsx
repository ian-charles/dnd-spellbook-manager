import { EnrichedSpell } from '../../types/spellbook';
import './SpellContextMenu.css';

interface SpellContextMenuProps {
  spell: EnrichedSpell;
  x: number;
  y: number;
  isSelected: boolean;
  onToggleSelected: () => void;
  onTogglePrepared: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export function SpellContextMenu({
  spell,
  x,
  y,
  isSelected,
  onToggleSelected,
  onTogglePrepared,
  onRemove,
  onClose,
}: SpellContextMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="spell-context-menu"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="spell-context-menu-header">
        {spell.spell.name}
      </div>
      <button
        className="spell-context-menu-item"
        onClick={() => handleAction(onToggleSelected)}
      >
        {isSelected ? 'Deselect' : 'Select'}
      </button>
      <button
        className="spell-context-menu-item"
        onClick={() => handleAction(onTogglePrepared)}
      >
        {spell.prepared ? 'Unprep' : 'Prep'}
      </button>
      <button
        className="spell-context-menu-item spell-context-menu-item-danger"
        onClick={() => handleAction(onRemove)}
      >
        Remove from Spellbook
      </button>
    </div>
  );
}
