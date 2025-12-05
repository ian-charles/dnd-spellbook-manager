import '../styles/swipe-indicator.css';

export type SwipeAction =
  | 'select'
  | 'deselect'
  | 'prep'
  | 'unprep'
  | 'remove';

interface SwipeIndicatorProps {
  action: SwipeAction;
  direction: 'left' | 'right';
  progress: number; // 0-100
  isCommitted: boolean; // true when past threshold
}

const ACTION_CONFIG: Record<
  SwipeAction,
  { icon: string; text: string; className: string }
> = {
  select: {
    icon: '✓',
    text: 'Select',
    className: 'swipe-indicator-select',
  },
  deselect: {
    icon: '✗',
    text: 'Deselect',
    className: 'swipe-indicator-deselect',
  },
  prep: {
    icon: '⭐',
    text: 'Prep',
    className: 'swipe-indicator-prep',
  },
  unprep: {
    icon: '○',
    text: 'Unprep',
    className: 'swipe-indicator-unprep',
  },
  remove: {
    icon: '🗑',
    text: 'Remove',
    className: 'swipe-indicator-remove',
  },
};

/**
 * Visual indicator shown during swipe gesture
 * Displays background color, icon, and text based on the action
 */
export function SwipeIndicator({
  action,
  direction,
  progress,
  isCommitted,
}: SwipeIndicatorProps) {
  const config = ACTION_CONFIG[action];
  const opacity = Math.min(1, progress / 50); // Fade in from 0-50% progress

  const directionClass =
    direction === 'left' ? 'swipe-indicator-left' : 'swipe-indicator-right';

  const commitClass = isCommitted ? 'committed' : '';

  return (
    <div
      className={`swipe-indicator ${directionClass} ${config.className} ${commitClass}`}
      style={{ opacity }}
    >
      <span className="swipe-indicator-icon">{config.icon}</span>
      <span>{config.text}</span>
    </div>
  );
}
