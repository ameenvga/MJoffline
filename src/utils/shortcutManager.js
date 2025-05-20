const { globalShortcut, ipcMain, BrowserWindow } = require('electron');
const logger = require('./logger');

class ShortcutManager {
  constructor() {
    this.shortcuts = new Map();
    this.isEnabled = true;
  }

  /**
   * Register a global shortcut
   * @param {string} accelerator - The shortcut accelerator (e.g., 'CommandOrControl+S')
   * @param {Function} callback - Function to call when shortcut is pressed
   * @returns {boolean} - Whether the shortcut was registered successfully
   */
  register(accelerator, callback) {
    try {
      if (this.shortcuts.has(accelerator)) {
        logger.warn(`Shortcut already registered: ${accelerator}`);
        return false;
      }

      const success = globalShortcut.register(accelerator, () => {
        if (this.isEnabled) {
          logger.debug(`Shortcut triggered: ${accelerator}`);
          callback();
        }
      });

      if (success) {
        this.shortcuts.set(accelerator, callback);
        logger.info(`Registered shortcut: ${accelerator}`);
      } else {
        logger.error(`Failed to register shortcut: ${accelerator}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error registering shortcut ${accelerator}:`, error);
      return false;
    }
  }

  /**
   * Unregister a shortcut
   * @param {string} accelerator - The shortcut accelerator to unregister
   */
  unregister(accelerator) {
    if (this.shortcuts.has(accelerator)) {
      globalShortcut.unregister(accelerator);
      this.shortcuts.delete(accelerator);
      logger.info(`Unregistered shortcut: ${accelerator}`);
    }
  }

  /**
   * Unregister all shortcuts
   */
  unregisterAll() {
    globalShortcut.unregisterAll();
    this.shortcuts.clear();
    logger.info('Unregistered all shortcuts');
  }

  /**
   * Enable or disable all shortcuts
   * @param {boolean} enabled - Whether to enable or disable shortcuts
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    logger.info(`Shortcuts ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Register application-wide shortcuts
   * @param {BrowserWindow} mainWindow - The main browser window
   */
  registerAppShortcuts(mainWindow) {
    if (!mainWindow || !(mainWindow instanceof BrowserWindow)) {
      throw new Error('Invalid main window provided');
    }

    // Toggle Developer Tools
    this.register('CommandOrControl+Shift+I', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    });

    // Reload the app
    this.register('CommandOrControl+R', () => {
      mainWindow.reload();
    });

    // Toggle fullscreen
    this.register('F11', () => {
      const isFullscreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullscreen);
    });

    // Minimize window
    this.register('CommandOrControl+M', () => {
      mainWindow.minimize();
    });

    logger.info('Registered application shortcuts');
  }

  /**
   * Register IPC handlers for shortcut management
   */
  registerIpcHandlers() {
    // Register a new shortcut from renderer
    ipcMain.handle('register-shortcut', (event, { accelerator, id }) => {
      return new Promise((resolve) => {
        const success = this.register(accelerator, () => {
          event.sender.send('shortcut-pressed', { id });
        });
        resolve(success);
      });
    });

    // Unregister a shortcut from renderer
    ipcMain.handle('unregister-shortcut', (event, accelerator) => {
      this.unregister(accelerator);
      return true;
    });

    // Enable/disable shortcuts from renderer
    ipcMain.handle('set-shortcuts-enabled', (event, enabled) => {
      this.setEnabled(enabled);
      return true;
    });

    logger.info('Registered IPC handlers for shortcut management');
  }
}

// Export a singleton instance
const shortcutManager = new ShortcutManager();
module.exports = shortcutManager;
