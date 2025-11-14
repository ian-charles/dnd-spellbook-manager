import { useState } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import './SpellbookList.css';

interface SpellbookListProps {
  onSpellbookClick: (spellbookId: string) => void;
}

export function SpellbookList({ onSpellbookClick }: SpellbookListProps) {
  const { spellbooks, loading, createSpellbook, deleteSpellbook } = useSpellbooks();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpellbookName, setNewSpellbookName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpellbookName.trim()) return;

    setCreating(true);
    try {
      await createSpellbook({ name: newSpellbookName.trim() });
      setNewSpellbookName('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create spellbook:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete spellbook "${name}"?`)) {
      try {
        await deleteSpellbook(id);
      } catch (error) {
        console.error('Failed to delete spellbook:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="spellbook-list">
        <h2 data-testid="spellbooks-header">My Spellbooks</h2>
        <p>Loading spellbooks...</p>
      </div>
    );
  }

  return (
    <div className="spellbook-list">
      <div className="spellbook-list-header">
        <h2 data-testid="spellbooks-header">My Spellbooks</h2>
        <button
          className="btn-primary"
          data-testid="btn-create-spellbook"
          onClick={() => setShowCreateDialog(true)}
        >
          + New Spellbook
        </button>
      </div>

      {spellbooks.length === 0 ? (
        <div className="spellbooks-empty" data-testid="spellbooks-empty">
          <p>You don't have any spellbooks yet.</p>
          <p>Click "New Spellbook" to create your first one!</p>
        </div>
      ) : (
        <div className="spellbooks-grid">
          {spellbooks.map((spellbook) => (
            <div
              key={spellbook.id}
              className="spellbook-card"
              data-testid={`spellbook-item-${spellbook.id}`}
            >
              <div onClick={() => onSpellbookClick(spellbook.id)} className="spellbook-card-content">
                <h3 data-testid="spellbook-name">{spellbook.name}</h3>
                <p className="spellbook-count">
                  {spellbook.spells.length} spell{spellbook.spells.length !== 1 ? 's' : ''}
                </p>
                <p className="spellbook-prepared">
                  {spellbook.spells.filter(s => s.prepared).length} prepared
                </p>
              </div>
              <div className="spellbook-card-actions">
                <button
                  className="btn-danger-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(spellbook.id, spellbook.name);
                  }}
                  data-testid={`btn-delete-spellbook-${spellbook.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <div className="dialog-overlay" data-testid="create-spellbook-dialog">
          <div className="dialog">
            <h3>Create New Spellbook</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label htmlFor="spellbook-name">Spellbook Name</label>
                <input
                  type="text"
                  id="spellbook-name"
                  data-testid="input-spellbook-name"
                  value={newSpellbookName}
                  onChange={(e) => setNewSpellbookName(e.target.value)}
                  placeholder="e.g., My Wizard Spells"
                  autoFocus
                  required
                />
              </div>
              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewSpellbookName('');
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  data-testid="btn-save-spellbook"
                  disabled={creating || !newSpellbookName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
