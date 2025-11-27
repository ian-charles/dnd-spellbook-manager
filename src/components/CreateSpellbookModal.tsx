import { useState, useEffect } from 'react';
import { CreateSpellbookInput } from '../types/spellbook';
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
}

export function CreateSpellbookModal({
  isOpen,
  onClose,
  onSubmit,
  existingNames,
  initialData,
  title,
}: CreateSpellbookModalProps) {
  const [name, setName] = useState('');
  const [spellcastingAbility, setSpellcastingAbility] = useState<'INT' | 'WIS' | 'CHA' | ''>('');
  const [spellAttackModifier, setSpellAttackModifier] = useState('');
  const [spellSaveDC, setSpellSaveDC] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize or reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && initialData) {
      // Pre-fill with initial data
      setName(initialData.name || '');
      setSpellcastingAbility(initialData.spellcastingAbility || '');
      setSpellAttackModifier(initialData.spellAttackModifier !== undefined ? String(initialData.spellAttackModifier) : '');
      setSpellSaveDC(initialData.spellSaveDC !== undefined ? String(initialData.spellSaveDC) : '');
      setError('');
      setLoading(false);
    } else if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setSpellcastingAbility('');
      setSpellAttackModifier('');
      setSpellSaveDC('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate name
    if (!name.trim()) {
      setError('Spellbook name is required');
      setLoading(false);
      return;
    }

    // Check for duplicate name (case-insensitive)
    if (existingNames.some(n => n.toLowerCase() === name.trim().toLowerCase())) {
      setError('A spellbook with this name already exists');
      setLoading(false);
      return;
    }

    // Validate spell attack modifier
    if (spellAttackModifier && !isValidAttackModifier(spellAttackModifier)) {
      setError('Spell Attack Modifier must be an integer between 0 and 18');
      setLoading(false);
      return;
    }

    // Validate spell save DC
    if (spellSaveDC && !isValidSaveDC(spellSaveDC)) {
      setError('Spell Save DC must be an integer between 8 and 26');
      setLoading(false);
      return;
    }

    const input: CreateSpellbookInput = {
      name: name.trim(),
      spellcastingAbility: spellcastingAbility || undefined,
      spellAttackModifier: spellAttackModifier ? parseInt(spellAttackModifier) : undefined,
      spellSaveDC: spellSaveDC ? parseInt(spellSaveDC) : undefined,
    };

    try {
      await onSubmit(input);
      // Reset form
      setName('');
      setSpellcastingAbility('');
      setSpellAttackModifier('');
      setSpellSaveDC('');
      setError('');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create spellbook');
      setLoading(false);
    }
  };

  const isValidAttackModifier = (value: string): boolean => {
    const num = parseInt(value);
    return Number.isInteger(num) && num >= 0 && num <= 18;
  };

  const isValidSaveDC = (value: string): boolean => {
    const num = parseInt(value);
    return Number.isInteger(num) && num >= 8 && num <= 26;
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog create-spellbook-modal" onClick={(e) => e.stopPropagation()} data-testid="create-spellbook-dialog">
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
                placeholder="0-18"
                min="0"
                max="18"
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
                placeholder="8-26"
                min="8"
                max="26"
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
              {loading ? 'Creating...' : 'Create Spellbook'}
            </button>
          </div>
        </form >
      </div >
    </div >
  );
}
