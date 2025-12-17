import { CircleCheck, CircleX, type LucideProps } from 'lucide-react';
import '../styles/swipe-indicator.css';

export type SwipeAction = 'select' | 'deselect';

interface SwipeIndicatorProps {
  action: SwipeAction;
  direction: 'left' | 'right';
  progress: number; // 0-100
  isCommitted: boolean; // true when past threshold
}

const ACTION_CONFIG: Record<
  SwipeAction,
  { icon: React.ComponentType<LucideProps>; text: string; className: string }
> = {
  select: {
    icon: CircleCheck,
    text: 'Select',
    className: 'swipe-indicator-select',
  },
  deselect: {
    icon: CircleX,
    text: 'Deselect',
    className: 'swipe-indicator-deselect',
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

  const Icon = config.icon;

  return (
    <div
      className={`swipe-indicator ${directionClass} ${config.className} ${commitClass}`}
      style={{ opacity }}
    >
      {direction === 'right' ? (
        <>
          <Icon className="swipe-indicator-icon" size={28} strokeWidth={2.5} />
          <span>{config.text}</span>
        </>
      ) : (
        <>
          <span>{config.text}</span>
          <Icon className="swipe-indicator-icon" size={28} strokeWidth={2.5} />
        </>
      )}
    </div>
  );
}
