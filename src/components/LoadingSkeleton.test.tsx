import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingSkeleton from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render skeleton element', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render with text variant by default', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toHaveClass('loading-skeleton-text');
  });

  it('should render with rectangle variant', () => {
    const { container } = render(<LoadingSkeleton variant="rectangle" />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toHaveClass('loading-skeleton-rectangle');
  });

  it('should render with circle variant', () => {
    const { container } = render(<LoadingSkeleton variant="circle" />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toHaveClass('loading-skeleton-circle');
  });

  it('should apply custom width', () => {
    const { container } = render(<LoadingSkeleton width="200px" />);
    const skeleton = container.querySelector('.loading-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
  });

  it('should apply custom height', () => {
    const { container } = render(<LoadingSkeleton height="50px" />);
    const skeleton = container.querySelector('.loading-skeleton') as HTMLElement;
    expect(skeleton.style.height).toBe('50px');
  });

  it('should apply both width and height', () => {
    const { container } = render(<LoadingSkeleton width="100px" height="100px" />);
    const skeleton = container.querySelector('.loading-skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('100px');
    expect(skeleton.style.height).toBe('100px');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSkeleton className="custom-skeleton" />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('should render multiple skeleton rows', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    const skeletons = container.querySelectorAll('.loading-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should apply gap between multiple rows', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    const wrapper = container.querySelector('.loading-skeleton-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render single skeleton without wrapper when count is 1', () => {
    const { container } = render(<LoadingSkeleton />);
    const wrapper = container.querySelector('.loading-skeleton-wrapper');
    expect(wrapper).not.toBeInTheDocument();
  });

  it('should have pulse animation class', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeleton = container.querySelector('.loading-skeleton');
    expect(skeleton).toHaveClass('loading-skeleton-pulse');
  });
});
