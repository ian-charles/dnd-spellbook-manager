import { Sun, MoonStar } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

interface ThemeToggleProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

/**
 * ThemeToggle Component
 *
 * Toggles between light and dark mode with localStorage persistence.
 *
 * Props:
 * - variant: 'desktop' (icon-only square button) or 'mobile' (icon + label)
 * - className: Additional CSS classes
 *
 * Mobile variant:
 * - Light mode: Shows moon-star icon with "Dark Mode" label
 * - Dark mode: Shows sun icon with "Light Mode" label
 *
 * Desktop variant:
 * - Icon-only square button (no text label)
 */
export function ThemeToggle({ variant = 'mobile', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : MoonStar;
  const label = isDark ? 'Light Mode' : 'Dark Mode';
  const ariaLabel = `Switch to ${isDark ? 'light' : 'dark'} mode`;

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
