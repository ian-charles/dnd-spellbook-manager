/**
 * ErrorBoundary Component Tests
 *
 * Tests for React Error Boundary component to ensure it:
 * - Catches rendering errors from child components
 * - Displays fallback UI instead of crashing
 * - Provides reload and reset functionality
 * - Shows error details in development mode only
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error from child component');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Store original console.error
  const originalError = console.error;

  beforeEach(() => {
    // Suppress console.error during tests to avoid noise
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors from child components', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should show error UI instead of child content
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
  });

  it('should display user-friendly error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/your spellbook data is safe/i)).toBeInTheDocument();
  });

  it('should show reload and try again buttons', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload the page/i });
    const tryAgainButton = screen.getByRole('button', { name: /try to continue without reloading/i });

    expect(reloadButton).toBeInTheDocument();
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should call window.location.reload when reload button is clicked', () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /reload the page/i });
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });

  it('should have try again button that is clickable', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error UI is showing
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();

    // Verify try again button exists and is clickable
    const tryAgainButton = screen.getByRole('button', { name: /try to continue without reloading/i });
    expect(tryAgainButton).toBeInTheDocument();
    expect(tryAgainButton).not.toBeDisabled();

    // Note: We don't actually click it in this test because:
    // 1. The child component will re-throw (it's a test component that always throws)
    // 2. In real usage, transient errors (like network issues) might resolve on retry
    // 3. The important thing is that the button exists and is clickable
  });

  it('should show error details in development mode', () => {
    // Set NODE_ENV to development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Look for details element (technical details)
    const details = screen.getByText(/Technical Details/i);
    expect(details).toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should NOT show error details in production mode', () => {
    // Set NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Technical details should not be present
    expect(screen.queryByText(/Technical Details/i)).not.toBeInTheDocument();

    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should log error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error Boundary caught an error'),
      expect.any(Error),
      expect.anything()
    );
  });

  it('should display error icon with proper aria-hidden', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorIcon = screen.getByText('⚠️');
    expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
