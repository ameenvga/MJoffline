const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

class StateManager {
  constructor() {
    this.stateFile = path.join(app.getPath('userData'), 'app-state.json');
    this.defaultState = {
      window: {
        width: 1024,
        height: 768,
        x: undefined,
        y: undefined,
        isMaximized: false,
        isFullScreen: false,
      },
      preferences: {
        theme: 'system',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        checkForUpdates: true,
        autoUpdate: true,
        language: 'en',
        keyboardLayout: 'phonetic',
        spellCheck: true,
        spellCheckLanguages: ['en-US'],
      },
      recentFiles: [],
      openFiles: [],
      lastOpened: null,
      version: app.getVersion(),
    };
    this.state = { ...this.defaultState };
    this.isDirty = false;
    this.saveTimeout = null;
    this.initialized = false;
  }

  /**
   * Initialize the state manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('StateManager already initialized');
      return;
    }

    try {
      await this.loadState();
      this.setupAutoSave();
      this.initialized = true;
      logger.info('StateManager initialized');
    } catch (error) {
      logger.error('Error initializing StateManager:', error);
      // Continue with default state if loading fails
      this.state = { ...this.defaultState };
      this.initialized = true;
    }
  }

  /**
   * Load state from disk
   * @private
   */
  async loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      const savedState = JSON.parse(data);
      
      // Merge with default state to ensure all properties exist
      this.state = this.mergeDeep(this.defaultState, savedState);
      
      // Ensure version is up to date
      this.state.version = app.getVersion();
      
      logger.info('State loaded from disk');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist yet, use default state
        logger.info('No saved state found, using default state');
        this.state = { ...this.defaultState };
      } else {
        logger.error('Error loading state:', error);
        throw error;
      }
    }
  }

  /**
   * Save state to disk
   * @param {boolean} [force=false] - Force save immediately
   * @returns {Promise<void>}
   */
  async saveState(force = false) {
    if (!this.isDirty && !force) {
      return;
    }

    // Clear any pending save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    try {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
      
      // Write to a temporary file first, then rename (atomic operation)
      const tempFile = `${this.stateFile}.tmp`;
      const data = JSON.stringify(this.state, null, 2);
      
      await fs.writeFile(tempFile, data, 'utf-8');
      await fs.rename(tempFile, this.stateFile);
      
      this.isDirty = false;
      logger.debug('State saved to disk');
    } catch (error) {
      logger.error('Error saving state:', error);
      throw error;
    }
  }

  /**
   * Schedule a state save (debounced)
   * @private
   */
  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.isDirty = true;
    this.saveTimeout = setTimeout(() => this.saveState(), 1000);
  }

  /**
   * Set up auto-save functionality
   * @private
   */
  setupAutoSave() {
    // Save state when app is about to quit
    app.on('will-quit', async (event) => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        await this.saveState(true);
      }
    });

    // Periodically save state
    setInterval(() => {
      if (this.isDirty) {
        this.saveState();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Get the entire state or a specific path
   * @param {string} [path] - Path to the state property (e.g., 'window.width')
   * @returns {*}
   */
  get(path) {
    if (!path) {
      return this.state;
    }

    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, this.state);
  }

  /**
   * Set a state value
   * @param {string} path - Path to the state property (e.g., 'window.width')
   * @param {*} value - Value to set
   * @param {boolean} [immediate=false] - Whether to save immediately
   */
  set(path, value, immediate = false) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    // Navigate to the parent object
    const parent = keys.reduce((obj, key) => {
      if (obj[key] === undefined || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      return obj[key];
    }, this.state);
    
    // Set the value if it has changed
    if (parent[lastKey] !== value) {
      parent[lastKey] = value;
      this.scheduleSave();
      
      if (immediate) {
        this.saveState(true);
      }
    }
  }

  /**
   * Reset state to defaults
   * @param {string} [path] - Path to reset (e.g., 'window' or 'preferences.theme')
   */
  reset(path) {
    if (!path) {
      this.state = { ...this.defaultState };
    } else {
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      // Navigate to the parent object
      const parent = keys.reduce((obj, key) => {
        if (obj[key] === undefined || typeof obj[key] !== 'object') {
          obj[key] = {};
        }
        return obj[key];
      }, this.state);
      
      // Reset to default value
      const defaultParent = keys.reduce((obj, key) => obj[key], this.defaultState);
      parent[lastKey] = defaultParent ? { ...defaultParent[lastKey] } : undefined;
    }
    
    this.scheduleSave();
  }

  /**
   * Add a file to recent files
   * @param {string} filePath - Path to the file
   * @param {number} [maxRecent=10] - Maximum number of recent files to keep
   */
  addRecentFile(filePath, maxRecent = 10) {
    if (!filePath) return;
    
    // Remove if already exists
    const recentFiles = this.state.recentFiles.filter(file => file.path !== filePath);
    
    // Add to the beginning
    recentFiles.unshift({
      path: filePath,
      timestamp: Date.now(),
      name: path.basename(filePath)
    });
    
    // Limit the number of recent files
    this.state.recentFiles = recentFiles.slice(0, maxRecent);
    this.scheduleSave();
  }

  /**
   * Clear recent files
   */
  clearRecentFiles() {
    this.state.recentFiles = [];
    this.scheduleSave();
  }

  /**
   * Deep merge two objects
   * @private
   */
  mergeDeep(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  /**
   * Check if a value is an object
   * @private
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

// Export a singleton instance
const stateManager = new StateManager();
module.exports = stateManager;
