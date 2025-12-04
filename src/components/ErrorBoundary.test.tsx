/**
 * @file ErrorBoundary.test.tsx
 * @description Unit tests for the ErrorBoundary component.
 *
 * Testing Strategy:
 * - Verify it renders children when no error occurs.
 * - Verify it renders fallback UI when an error occurs.
 * - Verify it logs errors to the console.
 * - Verify recovery mechanisms (Try Again, Reload Page).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';
import '@testing-library/jest-dom';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test Error');
  }
  return <div>No Error</div>;
};

const ERROR_BOUNDARY_RENDER_TIMEOUT = 3000;

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content'), 'Children should be rendered').toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs', async () => {
    // Suppress console.error for this test to keep output clean
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/Oops! Something went wrong/), 'Error title should be visible').toBeInTheDocument();
    }, { timeout: ERROR_BOUNDARY_RENDER_TIMEOUT });

    expect(screen.getByText(/We're sorry, but the app encountered an unexpected error/), 'Error message should be visible').toBeInTheDocument();
    expect(screen.getByText(/Reload Page/i), 'Reload button should be visible').toBeInTheDocument();
    expect(screen.getByText(/Try Again/i), 'Try Again button should be visible').toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('logs error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error Boundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('resets error state when "Try Again" is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText(/Oops! Something went wrong/), 'Error title should be visible').toBeInTheDocument();
    }, { timeout: ERROR_BOUNDARY_RENDER_TIMEOUT });

    // Rerender with no error to simulate recovery
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Click Try Again
    fireEvent.click(screen.getByText(/Try Again/i));

    expect(screen.getByText('No Error'), 'Content should recover').toBeInTheDocument();
    expect(screen.queryByText(/Oops! Something went wrong/), 'Error UI should disappear').not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('reloads page when "Reload Page" is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: reloadMock },
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Use findByText which is async and waits for the element to appear
    const errorTitle = await screen.findByText(/Oops! Something went wrong/i, {}, { timeout: ERROR_BOUNDARY_RENDER_TIMEOUT });
    expect(errorTitle, 'Error title should appear').toBeInTheDocument();

    const reloadButton = screen.getByText(/Reload Page/i);
    expect(reloadButton, 'Reload button should be visible').toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(reloadMock).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
