import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BackToTopButton } from './BackToTopButton';

describe('BackToTopButton', () => {
  let mockSpellTable: HTMLElement;

  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();

    // Create a mock spell table element
    mockSpellTable = document.createElement('div');
    mockSpellTable.className = 'spell-table';
    document.body.appendChild(mockSpellTable);
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up mock spell table
    mockSpellTable.remove();
  });

  it('should not render when spell table is still visible', () => {
    // Mock spell table being in viewport (top >= 0)
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 500,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: 100,
      toJSON: () => {},
    }));

    const { container } = render(<BackToTopButton />);

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));

    expect(container.querySelector('.floating-action-container')).toBeNull();
  });

  it('should render when spell table scrolls off screen', async () => {
    // Mock spell table scrolled off screen (top < 0)
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: -50,
      bottom: 350,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: -50,
      toJSON: () => {},
    }));

    render(<BackToTopButton />);

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /back to top/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('should have correct accessibility attributes', async () => {
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: -50,
      bottom: 350,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: -50,
      toJSON: () => {},
    }));

    render(<BackToTopButton />);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /back to top/i });
      expect(button).toHaveAttribute('aria-label', 'Back to top');
    });
  });

  it('should scroll to top with smooth behavior when clicked', async () => {
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: -50,
      bottom: 350,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: -50,
      toJSON: () => {},
    }));

    render(<BackToTopButton />);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /back to top/i });
      button.click();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should hide when scrolling back up', async () => {
    const { container } = render(<BackToTopButton />);

    // Scroll down - table off screen
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: -50,
      bottom: 350,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: -50,
      toJSON: () => {},
    }));

    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(container.querySelector('.floating-action-container')).not.toBeNull();
    });

    // Scroll back up - table visible again
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 500,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: 100,
      toJSON: () => {},
    }));

    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(container.querySelector('.floating-action-container')).toBeNull();
    }, { timeout: 500 }); // Wait for fade-out animation
  });

  it('should display label text in DOM', async () => {
    mockSpellTable.getBoundingClientRect = vi.fn(() => ({
      top: -50,
      bottom: 350,
      left: 0,
      right: 0,
      width: 800,
      height: 400,
      x: 0,
      y: -50,
      toJSON: () => {},
    }));

    const { container } = render(<BackToTopButton />);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const labels = container.querySelectorAll('.floating-action-label');
      const backToTopLabel = Array.from(labels).find(l => l.textContent === 'Back to Top');
      expect(backToTopLabel).toBeInTheDocument();
    });
  });

  it('should clean up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackToTopButton />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
