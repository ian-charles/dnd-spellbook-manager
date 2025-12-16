function formatDurationWithNonBreakingSpaces(duration) {
  return duration.replace(/(\d+)\s+/g, '$1\u00A0');
}

console.log('Test 1:', JSON.stringify(formatDurationWithNonBreakingSpaces('Up to 1 minute')));
console.log('Test 2:', JSON.stringify(formatDurationWithNonBreakingSpaces('10 minutes')));
console.log('Test 3:', JSON.stringify(formatDurationWithNonBreakingSpaces('1 hour')));
