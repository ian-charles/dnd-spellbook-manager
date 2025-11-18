/**
 * Unit tests for LoadingButton component
 *
 * Tests the loading button that displays a spinner and loading text when in loading state.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingButton } from './LoadingButton';

describe('LoadingButton', () => {
  describe('rendering', () => {
    it('should render children when not loading', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading...">
          Click Me
        </LoadingButton>
      );

      expect(screen.getByText('Click Me')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render loading text when loading', () => {
      render(
        <LoadingButton loading={true} loadingText="Please wait...">
          Click Me
        </LoadingButton>
      );

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
    });

    it('should show loading state with text and button disabled when loading', () => {
      render(
        <LoadingButton loading={true} loadingText="Loading...">
          Submit
        </LoadingButton>
      );

      // Verify loading text is displayed (spinner presence implied)
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      // Verify button is disabled during loading
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should show normal state when not loading', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading...">
          Submit
        </LoadingButton>
      );

      // Verify children are displayed
      expect(screen.getByText('Submit')).toBeInTheDocument();
      // Verify loading text is NOT displayed
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when loading', () => {
      render(
        <LoadingButton loading={true} loadingText="Loading...">
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be disabled when not loading and disabled not set', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading...">
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading..." disabled={true}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when both loading and disabled props are true', () => {
      render(
        <LoadingButton loading={true} loadingText="Loading..." disabled={true}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('props forwarding', () => {
    it('should forward className prop', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading..." className="btn-primary">
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should forward onClick prop', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <LoadingButton loading={false} loadingText="Loading..." onClick={handleClick}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <LoadingButton loading={true} loadingText="Loading..." onClick={handleClick}>
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      // Click on disabled button doesn't trigger onClick
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should forward type prop', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading..." type="submit">
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should forward data-testid prop', () => {
      render(
        <LoadingButton loading={false} loadingText="Loading..." data-testid="my-button">
          Submit
        </LoadingButton>
      );

      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });
  });

  describe('loading text variations', () => {
    it('should display custom loading text', () => {
      render(
        <LoadingButton loading={true} loadingText="Importing data...">
          Import
        </LoadingButton>
      );

      expect(screen.getByText('Importing data...')).toBeInTheDocument();
    });

    it('should support different loading text from children', () => {
      render(
        <LoadingButton loading={true} loadingText="Saving...">
          Save Changes
        </LoadingButton>
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
  });
});
