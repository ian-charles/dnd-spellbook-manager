/**
 * Haptic feedback utilities using the Vibration API
 * Provides tactile feedback for mobile interactions
 */

/**
 * Trigger a light haptic feedback (10ms vibration)
 * Used for subtle interactions like reaching a threshold
 */
export function hapticLight(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}

/**
 * Trigger a medium haptic feedback (25ms vibration)
 * Used for standard interactions like button presses
 */
export function hapticMedium(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(25);
  }
}

/**
 * Trigger a strong haptic feedback (50ms vibration)
 * Used for important actions like confirmations or completions
 */
export function hapticHeavy(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

/**
 * Trigger a success pattern (double tap)
 * Used for successful completion of actions
 */
export function hapticSuccess(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([30, 50, 30]);
  }
}

/**
 * Trigger an error pattern (triple tap)
 * Used for errors or invalid actions
 */
export function hapticError(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 50, 50, 50, 50]);
  }
}
