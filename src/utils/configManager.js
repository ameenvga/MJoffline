const { app } = require('electron');
const path = require('path');
const { writeFile, readFile, fileExists } = require('./fileUtils');

const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');
const DEFAULT_CONFIG = {
  windowBounds: { width: 1080, height: 600 },
  recentFiles: [],
  settings: {
    autoSave: true,
    fontSize: 14,
    theme: 'light',
    language: 'ml',
    keyboardLayout: 'phonetic',
  },
};

class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.isLoaded = false;
  }

  /**
   * Load configuration from file
   */
  async load() {
    try {
      if (await fileExists(CONFIG_FILE)) {
        const data = await readFile(CONFIG_FILE);
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      } else {
        this.config = { ...DEFAULT_CONFIG };
        await this.save();
      }
      this.isLoaded = true;
      return this.config;
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = { ...DEFAULT_CONFIG };
      this.isLoaded = true;
      return this.config;
    }
  }

  /**
   * Save current configuration to file
   */
  async save() {
    try {
      await writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  /**
   * Get a configuration value
   * @param {string} key - Dot notation path to the config value (e.g., 'settings.fontSize')
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*}
   */
  get(key, defaultValue = undefined) {
    if (!this.isLoaded) {
      console.warn('Config not loaded yet, using default value');
      const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), {
        ...DEFAULT_CONFIG,
      });
      return value !== undefined ? value : defaultValue;
    }

    const value = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), this.config);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set a configuration value
   * @param {string} key - Dot notation path to the config value
   * @param {*} value - Value to set
   * @param {boolean} saveToDisk - Whether to save to disk immediately
   */
  async set(key, value, saveToDisk = true) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) {
        obj[k] = {};
      }
      return obj[k];
    }, this.config);

    target[lastKey] = value;

    if (saveToDisk) {
      await this.save();
    }
  }

  /**
   * Add a file to recent files list
   * @param {string} filePath - Path to the file
   */
  async addToRecentFiles(filePath) {
    const recentFiles = this.get('recentFiles', []);
    const index = recentFiles.indexOf(filePath);
    
    if (index !== -1) {
      recentFiles.splice(index, 1);
    }
    
    recentFiles.unshift(filePath);
    
    // Keep only the 10 most recent files
    if (recentFiles.length > 10) {
      recentFiles.length = 10;
    }
    
    await this.set('recentFiles', recentFiles);
  }
}

// Export a singleton instance
const configManager = new ConfigManager();
module.exports = configManager;
