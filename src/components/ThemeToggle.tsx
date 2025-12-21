import { Sun, MoonStar, MonitorCog } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

interface ThemeToggleProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

/**
 * ThemeToggle Component
 *
 * Cycles between light, dark, and auto (system) modes.
 *
 * Props:
 * - variant: 'desktop' (icon-only square button) or 'mobile' (icon + label)
 * - className: Additional CSS classes
 *
 * Mobile variant shows icon + label:
 * - Light mode → "Dark Mode" (moon icon)
 * - Dark mode → "Auto Mode" (monitor icon)
 * - Auto mode → "Light Mode" (sun icon)
 *
 * Desktop variant:
 * - Icon-only square button
 */
export function ThemeToggle({ variant = 'mobile', className = '' }: ThemeToggleProps) {
  const { mode, resolvedTheme, toggleTheme } = useTheme();

  // Determine icon and label based on current mode
  let Icon;
  let label;
  let nextMode;

  if (mode === 'light') {
    Icon = MoonStar;
    label = 'Dark Mode';
    nextMode = 'dark';
  } else if (mode === 'dark') {
    Icon = MonitorCog;
    label = 'Auto Mode';
    nextMode = 'auto';
  } else {
    // auto mode
    Icon = Sun;
    label = 'Light Mode';
    nextMode = 'light';
  }

  const ariaLabel = `Switch to ${nextMode} mode (currently ${mode} mode${
    mode === 'auto' ? `, displaying ${resolvedTheme}` : ''
  })`;

  if (variant === 'desktop') {
    return (
      <button
        className={`theme-toggle-desktop ${className}`}
        onClick={toggleTheme}
        aria-label={ariaLabel}
        title={label}
      >
        <Icon size={18} />
      </button>
    );
  }

  return (
    <button
      className={`theme-toggle-mobile ${className}`}
      onClick={toggleTheme}
      aria-label={ariaLabel}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
