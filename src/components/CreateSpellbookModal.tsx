import { useFocusTrap } from '../hooks/useFocusTrap';
import { useCreateSpellbookForm } from '../hooks/useCreateSpellbookForm';
import { CreateSpellbookInput } from '../types/spellbook';
import {
  MIN_ATTACK_MODIFIER,
  MAX_ATTACK_MODIFIER,
  MIN_SAVE_DC,
  MAX_SAVE_DC
} from '../constants/gameRules';
import './CreateSpellbookModal.css';

interface CreateSpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSpellbookInput) => Promise<void>;
  existingNames: string[];
  initialData?: {
    name?: string;
    spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
    spellAttackModifier?: number;
    spellSaveDC?: number;
  };
  title?: string;
  loadingText?: string;
}

export function CreateSpellbookModal({
  isOpen,
  onClose,
  onSubmit,
  existingNames,
  initialData,
  title,
  loadingText,
}: CreateSpellbookModalProps) {
  const {
    name,
    setName,
    spellcastingAbility,
    setSpellcastingAbility,
    spellAttackModifier,
    setSpellAttackModifier,
    spellSaveDC,
    setSpellSaveDC,
    error,
    loading,
    handleSubmit,
  } = useCreateSpellbookForm({
    isOpen,
    onSubmit,
    existingNames,
    initialData,
  });

  // Focus trap
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div
        className="dialog create-spellbook-modal"
        onClick={(e) => e.stopPropagation()}
        data-testid="create-spellbook-dialog"
        ref={modalRef}
      >
        <h3>{title || 'Create New Spellbook'}</h3>
        <form onSubmit={handleSubmit} data-testid="create-spellbook-form">
          <div className="form-group">
            <label htmlFor="spellbook-name">
              Spellbook Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="spellbook-name"
              data-testid="spellbook-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="My Spellbook"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Spellcasting Ability</label>
            <div className="ability-buttons">
              <button
                type="button"
                className={`ability-btn ${spellcastingAbility === 'INT' ? 'active' : ''}`}
                onClick={() => setSpellcastingAbility(spellcastingAbility === 'INT' ? '' : 'INT')}
                data-testid="ability-int"
              >
                INT
              </button>
              <button
                type="button"
                className={`ability-btn ${spellcastingAbility === 'WIS' ? 'active' : ''}`}
                onClick={() => setSpellcastingAbility(spellcastingAbility === 'WIS' ? '' : 'WIS')}
                data-testid="ability-wis"
              >
                WIS
              </button>
              <button
                type="button"
                className={`ability-btn ${spellcastingAbility === 'CHA' ? 'active' : ''}`}
                onClick={() => setSpellcastingAbility(spellcastingAbility === 'CHA' ? '' : 'CHA')}
                data-testid="ability-cha"
              >
                CHA
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="attack-modifier">
                Spell Attack Modifier
              </label>
              <input
                type="number"
                id="attack-modifier"
                value={spellAttackModifier}
                onChange={(e) => setSpellAttackModifier(e.target.value)}
                className="form-input"
                placeholder={`${MIN_ATTACK_MODIFIER}-${MAX_ATTACK_MODIFIER}`}
                min={MIN_ATTACK_MODIFIER}
                max={MAX_ATTACK_MODIFIER}
                data-testid="attack-modifier-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="save-dc">
                Spell Save DC
              </label>
              <input
                type="number"
                id="save-dc"
                value={spellSaveDC}
                onChange={(e) => setSpellSaveDC(e.target.value)}
                className="form-input"
                placeholder={`${MIN_SAVE_DC}-${MAX_SAVE_DC}`}
                min={MIN_SAVE_DC}
                max={MAX_SAVE_DC}
                data-testid="save-dc-input"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="dialog-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              data-testid="create-button"
              disabled={loading}
            >
              {loading ? (loadingText || 'Saving...') : 'Save Spellbook'}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
}
