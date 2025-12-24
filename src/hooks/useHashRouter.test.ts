/**
 * useHashRouter Hook Tests
 *
 * Tests for hash-based routing hook.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHashRouter } from './useHashRouter';

describe('useHashRouter', () => {
  let originalHash: string;

  beforeEach(() => {
    // Mock window.scrollTo (not implemented in jsdom)
    window.scrollTo = vi.fn();
    // Save original hash
    originalHash = window.location.hash;
    // Reset hash before each test
    window.location.hash = '';
  });

  afterEach(() => {
    // Restore original hash
    window.location.hash = originalHash;
  });

  it('should initialize with browse view for empty hash', () => {
    window.location.hash = '';
    const { result } = renderHook(() => useHashRouter());

    expect(result.current.currentView).toBe('browse');
    expect(result.current.selectedSpellbookId).toBeNull();
  });

  it('should initialize with browse view for root hash', () => {
    window.location.hash = '#/';
    const { result } = renderHook(() => useHashRouter());

    expect(result.current.currentView).toBe('browse');
    expect(result.current.selectedSpellbookId).toBeNull();
  });

  it('should initialize with spellbooks view for #/spellbooks', () => {
    window.location.hash = '#/spellbooks';
    const { result } = renderHook(() => useHashRouter());

    expect(result.current.currentView).toBe('spellbooks');
    expect(result.current.selectedSpellbookId).toBeNull();
  });

  it('should initialize with spellbook-detail view and ID for #/spellbooks/:id', () => {
    window.location.hash = '#/spellbooks/test-id-123';
    const { result } = renderHook(() => useHashRouter());

    expect(result.current.currentView).toBe('spellbook-detail');
    expect(result.current.selectedSpellbookId).toBe('test-id-123');
  });

  it('should navigate to browse view', () => {
    window.location.hash = '#/spellbooks';
    const { result } = renderHook(() => useHashRouter());

    act(() => {
      result.current.navigateToBrowse();
      // Manually dispatch hashchange event (navigation functions change hash but don't auto-dispatch in tests)
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(window.location.hash).toBe('');
    expect(result.current.currentView).toBe('browse');
  });

  it('should navigate to spellbooks view', () => {
    const { result } = renderHook(() => useHashRouter());

    act(() => {
      result.current.navigateToSpellbooks();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(window.location.hash).toBe('#/spellbooks');
    expect(result.current.currentView).toBe('spellbooks');
  });

  it('should navigate to spellbook detail view with ID', () => {
    const { result } = renderHook(() => useHashRouter());

    act(() => {
      result.current.navigateToSpellbookDetail('my-spellbook');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(window.location.hash).toBe('#/spellbooks/my-spellbook');
    expect(result.current.currentView).toBe('spellbook-detail');
    expect(result.current.selectedSpellbookId).toBe('my-spellbook');
  });

  it('should update view when hash changes externally', () => {
    const { result } = renderHook(() => useHashRouter());

    expect(result.current.currentView).toBe('browse');

    // Simulate external hash change
    act(() => {
      window.location.hash = '#/spellbooks';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.currentView).toBe('spellbooks');
  });

  it('should update selectedSpellbookId when navigating to detail', () => {
    const { result } = renderHook(() => useHashRouter());

    act(() => {
      result.current.navigateToSpellbookDetail('spellbook-1');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.selectedSpellbookId).toBe('spellbook-1');

    act(() => {
      result.current.navigateToSpellbookDetail('spellbook-2');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.selectedSpellbookId).toBe('spellbook-2');
  });

  it('should clear selectedSpellbookId when navigating away from detail', () => {
    const { result } = renderHook(() => useHashRouter());

    act(() => {
      result.current.navigateToSpellbookDetail('test-id');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.selectedSpellbookId).toBe('test-id');

    act(() => {
      result.current.navigateToSpellbooks();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current.selectedSpellbookId).toBeNull();
  });
});
