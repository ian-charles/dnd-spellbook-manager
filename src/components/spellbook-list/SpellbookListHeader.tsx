import { MESSAGES } from '../../constants/messages';
import { LoadingButton } from '../LoadingButton';

interface SpellbookListHeaderProps {
    spellbookCount: number;
    importing: boolean;
    onExport: () => void;
    onImportClick: () => void;
    onCreateClick: () => void;
}

export function SpellbookListHeader({
    spellbookCount,
    importing,
    onExport,
    onImportClick,
    onCreateClick,
}: SpellbookListHeaderProps) {
    return (
        <div className="spellbook-list-header">
            <h2 data-testid="spellbooks-header">My Spellbooks</h2>
            <div className="header-actions">
                <button
                    className="btn-secondary"
                    data-testid="btn-export-spellbooks"
                    onClick={onExport}
                    disabled={spellbookCount === 0}
                    title={spellbookCount === 0 ? MESSAGES.TOOLTIPS.NO_SPELLBOOKS_TO_EXPORT : MESSAGES.TOOLTIPS.EXPORT_ALL_SPELLBOOKS}
                >
                    {MESSAGES.BUTTONS.EXPORT}
                </button>
                <LoadingButton
                    className="btn-secondary"
                    data-testid="btn-import-spellbooks"
                    onClick={onImportClick}
                    loading={importing}
                    loadingText="Importing..."
                >
                    {MESSAGES.BUTTONS.IMPORT}
                </LoadingButton>
                <button
                    className="btn-primary"
                    data-testid="btn-create-spellbook"
                    onClick={onCreateClick}
                >
                    + New Spellbook
                </button>
            </div>
        </div>
    );
}
