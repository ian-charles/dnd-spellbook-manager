import { useState, useRef, useEffect } from 'react';
import { Spell } from '../types/spell';
import { SpellDescription } from './SpellDescription';
import { ComponentBadges, ClassBadges } from './SpellBadges';
import { formatMaterialsWithCosts } from '../utils/spellFormatters';
import './SpellDetailModal.css';

interface SpellDetailModalProps {
  spell: Spell;
  isOpen: boolean;
  onClose: () => void;
  isSelected?: boolean;
  onToggleSelected?: (spellId: string) => void;
}

export function SpellDetailModal({ spell, isOpen, onClose, isSelected = false, onToggleSelected }: SpellDetailModalProps) {
  const [dragDistance, setDragDistance] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getLevelBadgeText = (level: number) => {
    return level === 0 ? 'Cantrip' : `Level ${level}`;
  };

  const capitalizeSchool = (school: string) => {
    return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    // Only allow dragging down (positive distance)
    if (distance > 0) {
      setDragDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;

    isDragging.current = false;

    // Close if dragged down more than 100px
    if (dragDistance > 100) {
      onClose();
    }

    // Reset drag distance
    setDragDistance(0);
  };

  const modalStyle = {
    transform: dragDistance > 0 ? `translateY(${dragDistance}px)` : 'translateY(0)',
    transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
  };

  return (
    <div className="spell-detail-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className="spell-detail-modal"
        style={modalStyle}
      >
        <div
          className="spell-detail-modal-header"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="spell-detail-modal-header-content">
            {onToggleSelected && (
              <input
                type="checkbox"
                className="spell-detail-modal-header-checkbox"
                checked={isSelected}
                onChange={() => onToggleSelected(spell.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${spell.name}`}
              />
            )}
            <h2>{spell.name}</h2>
            <button
              className="spell-detail-modal-close"
              onClick={onClose}
              aria-label="Close spell details"
            >
              ×
            </button>
          </div>
        </div>
        <div className="spell-detail-modal-body">
          <div className="spell-meta">
            <span className="spell-meta-badge level-badge" data-level={spell.level}>
              {getLevelBadgeText(spell.level)}
            </span>
            <span className="spell-meta-separator">•</span>
            <span className="spell-meta-badge school-badge" data-school={spell.school}>
              {capitalizeSchool(spell.school)}
            </span>
          </div>
          <div className="spell-expanded-details">
            <div>
              <strong>Casting Time:</strong> {spell.castingTime}
              {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
            </div>
            <div><strong>Range:</strong> {spell.range}</div>
            <div>
              <strong>Duration:</strong> {spell.duration}
              {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
            </div>
            <div className="spell-expanded-components">
              <strong>Components:</strong>
              <div className="expanded-badges-container">
                <ComponentBadges spell={spell} />
              </div>
            </div>
          </div>

          <div className="spell-expanded-description">
            {spell.materials && (
              <div
                className="spell-materials"
                dangerouslySetInnerHTML={{
                  __html: `<strong>Material:</strong> ${formatMaterialsWithCosts(spell.materials)}`
                }}
              />
            )}
            <SpellDescription text={spell.description} />
          </div>

          {spell.higherLevels && (
            <div className="spell-expanded-higher-levels">
              <strong>At Higher Levels:</strong> <SpellDescription text={spell.higherLevels} />
            </div>
          )}

          <div className="spell-expanded-footer">
            <div className="spell-expanded-classes">
              <strong>Classes:</strong>
              <ClassBadges classes={spell.classes} />
            </div>
            <div className="spell-source">{spell.source}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
