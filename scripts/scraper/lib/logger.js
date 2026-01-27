const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

/**
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
 */
export function createLogger(level = 'INFO') {
  const threshold = LOG_LEVELS[level] ?? LOG_LEVELS.INFO;

  function log(lvl, msg, ...args) {
    if (LOG_LEVELS[lvl] >= threshold) {
      const prefix = `[${new Date().toISOString()}] [${lvl}]`;
      console.log(prefix, msg, ...args);
    }
  }

  return {
    debug: (msg, ...args) => log('DEBUG', msg, ...args),
    info: (msg, ...args) => log('INFO', msg, ...args),
    warn: (msg, ...args) => log('WARN', msg, ...args),
    error: (msg, ...args) => log('ERROR', msg, ...args),
    progress: (current, total, msg) => {
      log('INFO', `[${current}/${total}] ${msg}`);
    },
  };
}
