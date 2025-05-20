const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { format } = require('util');
const log = require('electron-log');

// Configure logger
log.transports.file.level = 'info';
log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';

// Custom log format
log.transports.file.format = '{h}:{i}:{s}.{ms} {level} › {text}';

// Ensure logs directory exists
const logDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Set log file path
log.transports.file.resolvePath = () => path.join(logDir, 'main.log');

// Rotate logs
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_LOG_FILES = 5;

function rotateLogs() {
  try {
    const logPath = log.transports.file.getFile().path;
    
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      
      if (stats.size > MAX_LOG_SIZE) {
        // Close the current log file
        log.transports.file.getFile().clear();
        
        // Rotate logs
        for (let i = MAX_LOG_FILES - 1; i > 0; i--) {
          const src = i === 1 ? logPath : `${logPath}.${i - 1}`;
          const dest = `${logPath}.${i}`;
          
          if (fs.existsSync(src)) {
            if (fs.existsSync(dest)) {
              fs.unlinkSync(dest);
            }
            fs.renameSync(src, dest);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error rotating logs:', error);
  }
}

// Initialize log rotation
rotateLogs();

// Custom logger class
class Logger {
  constructor(scope = 'app') {
    this.scope = scope;
  }

  _log(level, message, ...args) {
    const formattedMessage = typeof message === 'string' ? message : format(message);
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    );
    
    const logMessage = `[${this.scope}] ${formattedMessage} ${
      formattedArgs.length ? formattedArgs.join(' ') : ''
    }`;
    
    log[level](logMessage);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      this._log('debug', message, ...args);
    }
  }

  info(message, ...args) {
    this._log('info', message, ...args);
  }

  warn(message, ...args) {
    this._log('warn', message, ...args);
  }

  error(message, ...args) {
    this._log('error', message, ...args);
  }

  // Create a scoped logger
  createScope(scope) {
    return new Logger(`${this.scope}:${scope}`);
  }
}

// Create main logger instance
const logger = new Logger('main');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

module.exports = logger;
