import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BackToTopButton } from './BackToTopButton';

describe('BackToTopButton', () => {
  beforeEach(() => {
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when scrollY is less than 2 viewport heights', () => {
    window.scrollY = 1000; // 1 viewport height
    const { container } = render(<BackToTopButton />);

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));

    expect(container.querySelector('.back-to-top-button')).toBeNull();
  });

  it('should render when scrollY exceeds 2 viewport heights', async () => {
    render(<BackToTopButton />);

    // Scroll past 2 viewport heights
    window.scrollY = 2001; // > 2 * 1000
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /back to top/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('should have correct accessibility attributes', async () => {
    render(<BackToTopButton />);

    window.scrollY = 2001;
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /back to top/i });
      expect(button).toHaveAttribute('aria-label', 'Back to top');
      expect(button).toHaveAttribute('title', 'Back to top');
    });
  });

  it('should scroll to top with smooth behavior when clicked', async () => {
    render(<BackToTopButton />);

    window.scrollY = 2001;
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

    // Scroll down past threshold
    window.scrollY = 2001;
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(container.querySelector('.back-to-top-button')).not.toBeNull();
    });

    // Scroll back up
    window.scrollY = 1000;
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(container.querySelector('.back-to-top-button')).toBeNull();
    });
  });

  it('should clean up scroll listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackToTopButton />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
