/**
 * useModal Hook Tests
 *
 * Tests for modal state management hook.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from './useModal';

describe('useModal', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should open modal without data', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('should open modal with string data', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('test-data');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test-data');
  });

  it('should open modal with object data', () => {
    interface TestData {
      id: string;
      name: string;
    }

    const { result } = renderHook(() => useModal<TestData>());

    const testData = { id: '123', name: 'Test' };

    act(() => {
      result.current.openModal(testData);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual(testData);
  });

  it('should close modal and clear data', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('some-data');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('some-data');

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should update data when opening modal again', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('first-data');
    });

    expect(result.current.data).toBe('first-data');

    act(() => {
      result.current.openModal('second-data');
    });

    expect(result.current.data).toBe('second-data');
  });

  it('should handle opening modal multiple times', () => {
    const { result } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('data-1');
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.openModal('data-2');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('data-2');
  });

  it('should handle closing modal multiple times', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal();
    });

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);

    // Closing again should not cause errors
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should preserve modal state across re-renders', () => {
    const { result, rerender } = renderHook(() => useModal<string>());

    act(() => {
      result.current.openModal('test-data');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test-data');

    // Force re-render
    rerender();

    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBe('test-data');
  });
});
