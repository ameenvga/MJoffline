const { ipcMain, dialog, app, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');
const stateManager = require('./stateManager');
const fileManager = require('./fileManager');
const windowManager = require('./windowManager');
const { LAYOUTS, convertToMalayalam } = require('./keyboardLayouts');
const updateManager = require('./updateManager');
const shortcutManager = require('./shortcutManager');

class IpcManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the IPC manager
   */
  initialize() {
    if (this.initialized) {
      logger.warn('IpcManager already initialized');
      return;
    }

    this.setupIpcHandlers();
    this.initialized = true;
    logger.info('IpcManager initialized');
  }

  /**
   * Set up all IPC handlers
   */
  setupIpcHandlers() {
    // App related handlers
    this.setupAppHandlers();
    
    // File system handlers
    this.setupFileHandlers();
    
    // Window management handlers
    this.setupWindowHandlers();
    
    // State management handlers
    this.setStateHandlers();
    
    // Keyboard and input handlers
    this.setupInputHandlers();
    
    // Update handlers
    this.setupUpdateHandlers();
    
    // Dialog handlers
    this.setupDialogHandlers();
    
    // System handlers
    this.setupSystemHandlers();
    
    // Shortcut handlers
    this.setupShortcutHandlers();
  }

  /**
   * Set up app-related IPC handlers
   */
  setupAppHandlers() {
    // Get app version
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    // Get app path
    ipcMain.handle('get-app-path', (event, name) => {
      return app.getPath(name);
    });

    // Get app name
    ipcMain.handle('get-app-name', () => {
      return app.getName();
    });

    // Get app locale
    ipcMain.handle('get-locale', () => {
      return app.getLocale();
    });

    // Get system information
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.getSystemVersion(),
        totalMemory: process.getSystemMemoryInfo().total,
        freeMemory: process.getSystemMemoryInfo().free,
        cpuUsage: process.getCPUUsage(),
      };
    });

    // Get environment variables
    ipcMain.handle('get-env', (event, key) => {
      return process.env[key];
    });

    // Reload the app
    ipcMain.handle('reload', () => {
      const win = windowManager.getMainWindow();
      if (win) {
        win.reload();
      }
    });

    // Quit the app
    ipcMain.handle('quit', () => {
      app.quit();
    });
  }

  /**
   * Set up file system IPC handlers
   */
  setupFileHandlers() {
    // Read file
    ipcMain.handle('read-file', async (event, filePath) => {
      try {
        const content = await fileManager.readFile(filePath);
        return { success: true, content };
      } catch (error) {
        logger.error('Error reading file:', error);
        return { success: false, error: error.message };
      }
    });

    // Write file
    ipcMain.handle('write-file', async (event, { filePath, content }) => {
      try {
        await fileManager.writeFile(filePath, content);
        return { success: true };
      } catch (error) {
        logger.error('Error writing file:', error);
        return { success: false, error: error.message };
      }
    });

    // Show open dialog
    ipcMain.handle('show-open-dialog', async (event, options) => {
      try {
        const win = windowManager.getMainWindow();
        const result = await dialog.showOpenDialog(win, {
          properties: ['openFile'],
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'text', 'ml'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          ...options,
        });

        return {
          canceled: result.canceled,
          filePaths: result.filePaths,
        };
      } catch (error) {
        logger.error('Error showing open dialog:', error);
        throw error;
      }
    });

    // Show save dialog
    ipcMain.handle('show-save-dialog', async (event, options) => {
      try {
        const win = windowManager.getMainWindow();
        const result = await dialog.showSaveDialog(win, {
          filters: [
            { name: 'Text Files', extensions: ['txt', 'md', 'text', 'ml'] },
            { name: 'All Files', extensions: ['*'] },
          ],
          ...options,
        });

        return {
          canceled: result.canceled,
          filePath: result.filePath,
        };
      } catch (error) {
        logger.error('Error showing save dialog:', error);
        throw error;
      }
    });

    // Get file info
    ipcMain.handle('get-file-info', async (event, filePath) => {
      try {
        const stats = await fs.stat(filePath);
        return {
          exists: true,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      } catch (error) {
        if (error.code === 'ENOENT') {
          return { exists: false };
        }
        logger.error('Error getting file info:', error);
        throw error;
      }
    });

    // Read directory
    ipcMain.handle('read-directory', async (event, dirPath) => {
      try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        return files.map((file) => ({
          name: file.name,
          path: path.join(dirPath, file.name),
          isDirectory: file.isDirectory(),
          isFile: file.isFile(),
        }));
      } catch (error) {
        logger.error('Error reading directory:', error);
        throw error;
      }
    });
  }

  /**
   * Set up window management IPC handlers
   */
  setupWindowHandlers() {
    // Create a new window
    ipcMain.handle('create-window', (event, options) => {
      const win = windowManager.createEditorWindow(options);
      return win ? win.id : null;
    });

    // Close the current window
    ipcMain.handle('close-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.close();
      }
    });

    // Minimize window
    ipcMain.handle('minimize-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.minimize();
      }
    });

    // Maximize/Restore window
    ipcMain.handle('toggle-maximize-window', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
        return win.isMaximized();
      }
      return false;
    });

    // Check if window is maximized
    ipcMain.handle('is-window-maximized', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      return win ? win.isMaximized() : false;
    });

    // Set window title
    ipcMain.handle('set-window-title', (event, title) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.setTitle(title);
      }
    });

    // Set window progress
    ipcMain.handle('set-progress-bar', (event, progress) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (progress < 0) {
          win.setProgressBar(-1); // Removes progress bar
        } else {
          win.setProgressBar(Math.min(Math.max(0, progress), 1));
        }
      }
    });
  }

  /**
   * Set up state management IPC handlers
   */
  setStateHandlers() {
    // Get state
    ipcMain.handle('get-state', (event, key) => {
      return stateManager.get(key);
    });

    // Set state
    ipcMain.handle('set-state', (event, { key, value }) => {
      stateManager.set(key, value);
      return true;
    });

    // Reset state
    ipcMain.handle('reset-state', (event, key) => {
      stateManager.reset(key);
      return true;
    });

    // Watch for state changes
    ipcMain.handle('watch-state', (event, key) => {
      return new Promise((resolve) => {
        const unsubscribe = stateManager.watch(key, (newValue) => {
          event.sender.send('state-changed', { key, value: newValue });
        });
        
        // Clean up when renderer is done
        event.sender.on('unwatch-state', () => {
          unsubscribe();
        });
        
        // Initial value
        resolve(stateManager.get(key));
      });
    });
  }

  /**
   * Set up input and keyboard IPC handlers
   */
  setupInputHandlers() {
    // Convert text to Malayalam
    ipcMain.handle('convert-to-malayalam', (event, { text, layout }) => {
      try {
        const malayalamText = convertToMalayalam(text, layout);
        return { success: true, text: malayalamText };
      } catch (error) {
        logger.error('Error converting to Malayalam:', error);
        return { success: false, error: error.message };
      }
    });

    // Get available keyboard layouts
    ipcMain.handle('get-keyboard-layouts', () => {
      return Object.values(LAYOUTS);
    });

    // Get current keyboard layout
    ipcMain.handle('get-keyboard-layout', () => {
      return stateManager.get('preferences.keyboardLayout') || LAYOUTS.PHONETIC;
    });

    // Set keyboard layout
    ipcMain.handle('set-keyboard-layout', (event, layout) => {
      if (Object.values(LAYOUTS).includes(layout)) {
        stateManager.set('preferences.keyboardLayout', layout);
        return true;
      }
      return false;
    });
  }

  /**
   * Set up update-related IPC handlers
   */
  setupUpdateHandlers() {
    // Check for updates
    ipcMain.handle('check-for-updates', async (event, options = {}) => {
      try {
        await updateManager.checkForUpdates(options.force);
        return { success: true };
      } catch (error) {
        logger.error('Error checking for updates:', error);
        return { success: false, error: error.message };
      }
    });

    // Download update
    ipcMain.handle('download-update', async () => {
      try {
        await updateManager.downloadUpdate();
        return { success: true };
      } catch (error) {
        logger.error('Error downloading update:', error);
        return { success: false, error: error.message };
      }
    });

    // Install update
    ipcMain.handle('install-update', () => {
      try {
        updateManager.installUpdate();
        return { success: true };
      } catch (error) {
        logger.error('Error installing update:', error);
        return { success: false, error: error.message };
      }
    });

    // Toggle auto-update
    ipcMain.handle('set-auto-update', (event, enabled) => {
      stateManager.set('preferences.autoUpdate', enabled);
      return true;
    });
  }

  /**
   * Set up dialog-related IPC handlers
   */
  setupDialogHandlers() {
    // Show message box
    ipcMain.handle('show-message-box', async (event, options) => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showMessageBox(win, {
          type: 'info',
          buttons: ['OK'],
          ...options,
        });
        return result;
      } catch (error) {
        logger.error('Error showing message box:', error);
        throw error;
      }
    });

    // Show error box
    ipcMain.handle('show-error-box', (event, { title, content }) => {
      dialog.showErrorBox(title, content);
    });

    // Show open dialog
    ipcMain.handle('show-open-dialog', async (event, options) => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showOpenDialog(win, options);
        return result;
      } catch (error) {
        logger.error('Error showing open dialog:', error);
        throw error;
      }
    });

    // Show save dialog
    ipcMain.handle('show-save-dialog', async (event, options) => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender);
        const result = await dialog.showSaveDialog(win, options);
        return result;
      } catch (error) {
        logger.error('Error showing save dialog:', error);
        throw error;
      }
    });
  }

  /**
   * Set up system-related IPC handlers
   */
  setupSystemHandlers() {
    // Open external URL
    ipcMain.handle('open-external', (event, url) => {
      try {
        shell.openExternal(url);
        return true;
      } catch (error) {
        logger.error('Error opening external URL:', error);
        return false;
      }
    });

    // Open path in file manager
    ipcMain.handle('show-item-in-folder', (event, path) => {
      try {
        shell.showItemInFolder(path);
        return true;
      } catch (error) {
        logger.error('Error showing item in folder:', error);
        return false;
      }
    });

    // Get system info
    ipcMain.handle('get-system-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.getSystemVersion(),
        totalMemory: process.getSystemMemoryInfo().total,
        freeMemory: process.getSystemMemoryInfo().free,
        cpuUsage: process.getCPUUsage(),
      };
    });

    // Get app metrics
    ipcMain.handle('get-app-metrics', () => {
      return app.getAppMetrics();
    });
  }

  /**
   * Set up shortcut-related IPC handlers
   */
  setupShortcutHandlers() {
    // Register a global shortcut
    ipcMain.handle('register-shortcut', (event, { accelerator, id }) => {
      return new Promise((resolve) => {
        const success = shortcutManager.register(accelerator, () => {
          event.sender.send('shortcut-pressed', { id });
        });
        resolve(success);
      });
    });

    // Unregister a shortcut
    ipcMain.handle('unregister-shortcut', (event, accelerator) => {
      shortcutManager.unregister(accelerator);
      return true;
    });

    // Check if a shortcut is registered
    ipcMain.handle('is-shortcut-registered', (event, accelerator) => {
      return shortcutManager.isRegistered(accelerator);
    });

    // Enable/disable shortcuts
    ipcMain.handle('set-shortcuts-enabled', (event, enabled) => {
      shortcutManager.setEnabled(enabled);
      return true;
    });
  }
}

// Export a singleton instance
const ipcManager = new IpcManager();
module.exports = ipcManager;
