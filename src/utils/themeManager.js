const { nativeTheme, ipcMain, BrowserWindow } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');
const stateManager = require('./stateManager');

class ThemeManager {
  constructor() {
    this.themes = new Map();
    this.currentTheme = 'system';
    this.styles = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the theme manager
   */
  async initialize() {
    if (this.initialized) {
      logger.warn('ThemeManager already initialized');
      return;
    }

    try {
      // Load built-in themes
      await this.loadBuiltInThemes();
      
      // Load user themes
      await this.loadUserThemes();
      
      // Set initial theme from state or default to system
      const savedTheme = stateManager.get('preferences.theme') || 'system';
      await this.setTheme(savedTheme);
      
      // Listen for system theme changes
      nativeTheme.on('updated', () => {
        if (this.currentTheme === 'system') {
          this.applyThemeToWindows();
        }
      });
      
      this.initialized = true;
      logger.info('ThemeManager initialized');
    } catch (error) {
      logger.error('Error initializing ThemeManager:', error);
      throw error;
    }
  }

  /**
   * Load built-in themes
   * @private
   */
  async loadBuiltInThemes() {
    const builtInThemes = [
      { id: 'light', name: 'Light', isBuiltIn: true },
      { id: 'dark', name: 'Dark', isBuiltIn: true },
      { id: 'system', name: 'System', isBuiltIn: true },
      { id: 'solarized-light', name: 'Solarized Light', isBuiltIn: true },
      { id: 'solarized-dark', name: 'Solarized Dark', isBuiltIn: true },
      { id: 'monokai', name: 'Monokai', isBuiltIn: true },
      { id: 'github', name: 'GitHub', isBuiltIn: true },
      { id: 'dracula', name: 'Dracula', isBuiltIn: true },
    ];

    for (const theme of builtInThemes) {
      this.themes.set(theme.id, theme);
    }

    logger.debug(`Loaded ${builtInThemes.length} built-in themes`);
  }

  /**
   * Load user themes from the themes directory
   * @private
   */
  async loadUserThemes() {
    try {
      const themesDir = path.join(app.getPath('userData'), 'themes');
      
      // Create themes directory if it doesn't exist
      try {
        await fs.access(themesDir);
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.mkdir(themesDir, { recursive: true });
          return; // No themes to load yet
        }
        throw error;
      }
      
      // Read theme files
      const files = await fs.readdir(themesDir);
      let loadedThemes = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const themePath = path.join(themesDir, file);
            const themeData = JSON.parse(await fs.readFile(themePath, 'utf-8'));
            
            if (this.validateTheme(themeData)) {
              themeData.isBuiltIn = false;
              themeData.path = themePath;
              this.themes.set(themeData.id, themeData);
              loadedThemes++;
            }
          } catch (error) {
            logger.error(`Error loading theme from ${file}:`, error);
          }
        }
      }
      
      logger.debug(`Loaded ${loadedThemes} user themes`);
    } catch (error) {
      logger.error('Error loading user themes:', error);
      throw error;
    }
  }

  /**
   * Validate a theme object
   * @param {Object} theme - Theme object to validate
   * @returns {boolean} - Whether the theme is valid
   * @private
   */
  validateTheme(theme) {
    if (!theme.id || typeof theme.id !== 'string') return false;
    if (!theme.name || typeof theme.name !== 'string') return false;
    if (!theme.colors || typeof theme.colors !== 'object') return false;
    
    // Check for required color properties
    const requiredColors = [
      'primary', 'primary-light', 'primary-dark', 'secondary', 'success', 
      'danger', 'warning', 'info', 'background', 'background-alt', 
      'text', 'text-muted', 'border', 'shadow'
    ];
    
    return requiredColors.every(color => color in theme.colors);
  }

  /**
   * Get all available themes
   * @returns {Array} - Array of theme objects
   */
  getThemes() {
    return Array.from(this.themes.values());
  }

  /**
   * Get the current theme
   * @returns {Object} - Current theme object
   */
  getCurrentTheme() {
    if (this.currentTheme === 'system') {
      return this.getSystemTheme();
    }
    return this.themes.get(this.currentTheme) || this.themes.get('light');
  }

  /**
   * Get the system theme (light/dark)
   * @returns {Object} - System theme object
   */
  getSystemTheme() {
    return nativeTheme.shouldUseDarkColors 
      ? this.themes.get('dark') 
      : this.themes.get('light');
  }

  /**
   * Set the current theme
   * @param {string} themeId - ID of the theme to set
   * @returns {Promise<boolean>} - Whether the theme was set successfully
   */
  async setTheme(themeId) {
    if (!this.themes.has(themeId) && themeId !== 'system') {
      logger.warn(`Theme not found: ${themeId}`);
      return false;
    }

    try {
      this.currentTheme = themeId;
      
      // Save to state
      stateManager.set('preferences.theme', themeId);
      
      // Apply theme to all windows
      this.applyThemeToWindows();
      
      logger.info(`Theme set to: ${themeId}`);
      return true;
    } catch (error) {
      logger.error(`Error setting theme to ${themeId}:`, error);
      return false;
    }
  }

  /**
   * Apply the current theme to all windows
   */
  applyThemeToWindows() {
    const theme = this.getCurrentTheme();
    const isDark = theme.id === 'dark' || 
                  (theme.id === 'system' && nativeTheme.shouldUseDarkColors);
    
    // Update native theme
    nativeTheme.themeSource = isDark ? 'dark' : 'light';
    
    // Notify all windows
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('theme-changed', {
          theme: theme.id,
          isDark,
          colors: theme.colors
        });
      }
    });
    
    // Update app menu bar on macOS
    if (process.platform === 'darwin') {
      const { Menu } = require('electron');
      Menu.setApplicationMenu(Menu.getApplicationMenu());
    }
  }

  /**
   * Load a custom theme from a file
   * @param {string} filePath - Path to the theme file
   * @returns {Promise<Object>} - The loaded theme object
   */
  async loadThemeFromFile(filePath) {
    try {
      const themeData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      
      if (!this.validateTheme(themeData)) {
        throw new Error('Invalid theme format');
      }
      
      // Add to themes
      themeData.isBuiltIn = false;
      themeData.path = filePath;
      this.themes.set(themeData.id, themeData);
      
      logger.info(`Loaded theme from file: ${filePath}`);
      return themeData;
    } catch (error) {
      logger.error(`Error loading theme from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Save a custom theme
   * @param {Object} theme - Theme object to save
   * @returns {Promise<Object>} - The saved theme object
   */
  async saveTheme(theme) {
    if (!this.validateTheme(theme)) {
      throw new Error('Invalid theme format');
    }
    
    try {
      const themesDir = path.join(app.getPath('userData'), 'themes');
      await fs.mkdir(themesDir, { recursive: true });
      
      const themePath = path.join(themesDir, `${theme.id}.json`);
      await fs.writeFile(themePath, JSON.stringify(theme, null, 2), 'utf-8');
      
      // Update in memory
      theme.isBuiltIn = false;
      theme.path = themePath;
      this.themes.set(theme.id, theme);
      
      logger.info(`Saved theme: ${theme.id}`);
      return theme;
    } catch (error) {
      logger.error(`Error saving theme ${theme.id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a custom theme
   * @param {string} themeId - ID of the theme to delete
   * @returns {Promise<boolean>} - Whether the theme was deleted successfully
   */
  async deleteTheme(themeId) {
    const theme = this.themes.get(themeId);
    
    if (!theme || theme.isBuiltIn) {
      throw new Error('Cannot delete built-in themes');
    }
    
    try {
      // Delete the theme file
      if (theme.path) {
        await fs.unlink(theme.path);
      }
      
      // Remove from memory
      this.themes.delete(themeId);
      
      // If the current theme was deleted, fall back to system theme
      if (this.currentTheme === themeId) {
        await this.setTheme('system');
      }
      
      logger.info(`Deleted theme: ${themeId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting theme ${themeId}:`, error);
      throw error;
    }
  }

  /**
   * Generate CSS variables for a theme
   * @param {Object} theme - Theme object
   * @returns {string} - CSS variables as a string
   */
  generateThemeCSS(theme) {
    if (!theme || !theme.colors) return '';
    
    let css = ':root {\n';
    
    // Add color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      css += `  --color-${key}: ${value};\n`;
    });
    
    // Add theme class
    const isDark = theme.id === 'dark' || 
                  (theme.id === 'system' && nativeTheme.shouldUseDarkColors);
    
    css += `  --theme-is-dark: ${isDark ? 'true' : 'false'};\n`;
    css += '}';
    
    return css;
  }
}

// Export a singleton instance
const themeManager = new ThemeManager();
module.exports = themeManager;
