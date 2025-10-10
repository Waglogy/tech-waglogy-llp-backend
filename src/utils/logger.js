/**
 * Simple logger utility
 * For production, consider using Winston or Bunyan
 */
class Logger {
  static info(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`ℹ️  [INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static error(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`❌ [ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static warn(message, ...args) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`⚠️  [WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }

  static debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

module.exports = Logger;

