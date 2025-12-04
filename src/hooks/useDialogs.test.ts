import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDialogs } from './useDialogs';

describe('useDialogs', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useDialogs());

        expect(result.current.confirmDialog.isOpen).toBe(false);
        expect(result.current.alertDialog.isOpen).toBe(false);
    });

    it('should open and close confirm dialog', () => {
        const { result } = renderHook(() => useDialogs());

        act(() => {
            result.current.showConfirm('123', 'Test Spellbook');
        });

        expect(result.current.confirmDialog).toEqual({
            isOpen: true,
            spellbookId: '123',
            spellbookName: 'Test Spellbook',
        });

        act(() => {
            result.current.closeConfirm();
        });

        expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should open and close alert dialog', () => {
        const { result } = renderHook(() => useDialogs());

        act(() => {
            result.current.showAlert('Title', 'Message', 'error');
        });

        expect(result.current.alertDialog).toEqual({
            isOpen: true,
            title: 'Title',
            message: 'Message',
            variant: 'error',
        });

        act(() => {
            result.current.closeAlert();
        });

        expect(result.current.alertDialog.isOpen).toBe(false);
    });
    it('should use default variant "info" if not provided', () => {
        const { result } = renderHook(() => useDialogs());

        act(() => {
            result.current.showAlert('Title', 'Message');
        });

        expect(result.current.alertDialog.variant).toBe('info');
    });

    it('should allow direct setting of alert dialog state', () => {
        const { result } = renderHook(() => useDialogs());

        act(() => {
            result.current.setAlertDialog({
                isOpen: true,
                title: 'Direct',
                message: 'Message',
                variant: 'warning',
            });
        });

        expect(result.current.alertDialog).toEqual({
            isOpen: true,
            title: 'Direct',
            message: 'Message',
            variant: 'warning',
        });
    });

    it('should handle rapid consecutive calls to showConfirm', () => {
        const { result } = renderHook(() => useDialogs());

        act(() => {
            result.current.showConfirm('1', 'First');
            result.current.showConfirm('2', 'Second');
        });

        // Should show the last one
        expect(result.current.confirmDialog).toEqual({
            isOpen: true,
            spellbookId: '2',
            spellbookName: 'Second',
        });
    });

    it('should handle closeConfirm when already closed', () => {
        const { result } = renderHook(() => useDialogs());

        // Ensure initially closed
        expect(result.current.confirmDialog.isOpen).toBe(false);

        act(() => {
            result.current.closeConfirm();
        });

        expect(result.current.confirmDialog.isOpen).toBe(false);
    });

    it('should handle closeAlert when already closed', () => {
        const { result } = renderHook(() => useDialogs());

        // Ensure initially closed
        expect(result.current.alertDialog.isOpen).toBe(false);

        act(() => {
            result.current.closeAlert();
        });

        expect(result.current.alertDialog.isOpen).toBe(false);
    });
});
