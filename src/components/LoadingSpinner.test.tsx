import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner element', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with custom size prop', () => {
    render(<LoadingSpinner size="large" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-large');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="small" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-small');
  });

  it('should render with medium size by default', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-medium');
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Loading spells..." />);
    const message = screen.getByText('Loading spells...');
    expect(message).toBeInTheDocument();
  });

  it('should not render message when not provided', () => {
    const { container } = render(<LoadingSpinner />);
    const message = container.querySelector('.loading-spinner-message');
    expect(message).not.toBeInTheDocument();
  });

  it('should center spinner in container', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.querySelector('.loading-spinner-wrapper');
    expect(wrapper).toHaveClass('loading-spinner-center');
  });

  it('should render inline when inline prop is true', () => {
    const { container } = render(<LoadingSpinner inline />);
    const wrapper = container.querySelector('.loading-spinner-wrapper');
    expect(wrapper).toHaveClass('loading-spinner-inline');
    expect(wrapper).not.toHaveClass('loading-spinner-center');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const wrapper = container.querySelector('.loading-spinner-wrapper');
    expect(wrapper).toHaveClass('custom-class');
  });
});
