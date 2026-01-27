/**
 * Delay with random jitter to space out requests.
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<void>}
 */
export async function rateLimit(baseDelay) {
  const jitter = Math.random() * baseDelay * 0.5;
  await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
}
