/**
 * Modal Scroll Lock Utility
 *
 * Manages document.body scroll locking for modals.
 * Handles multiple concurrent modals by tracking a reference count.
 *
 * Problem:
 * When multiple modals are stacked (e.g., CreateSpellbookModal opens on top
 * of SelectSpellbookModal), each modal's useEffect independently manages
 * document.body.style.overflow. When the inner modal closes and restores
 * overflow, it re-enables scrolling even though the outer modal is still open.
 *
 * Solution:
 * Track how many modals are currently open. Only disable scrolling on the
 * first modal open, and only restore scrolling when the last modal closes.
 */

let modalCount = 0;
let originalOverflow = '';

/**
 * Lock document body scroll (call when modal opens)
 */
export function lockScroll(): void {
  if (modalCount === 0) {
    // Save original overflow value before locking
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  modalCount++;
}

/**
 * Unlock document body scroll (call when modal closes)
 */
export function unlockScroll(): void {
  modalCount = Math.max(0, modalCount - 1);

  if (modalCount === 0) {
    // Restore original overflow when last modal closes
    document.body.style.overflow = originalOverflow;
  }
}

/**
 * Reset scroll lock state (useful for testing)
 */
export function resetScrollLock(): void {
  modalCount = 0;
  document.body.style.overflow = originalOverflow;
}
