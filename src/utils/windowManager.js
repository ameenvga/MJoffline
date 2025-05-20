const { BrowserWindow, screen, shell, dialog, app, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const logger = require('./logger');
const stateManager = require('./stateManager');

class WindowManager {
  constructor() {
    this.mainWindow = null;
    this.windows = new Map(); // Track all windows
    this.windowCount = 0;
    this.initialized = false;
  }

  /**
   * Initialize the window manager
   */
  initialize() {
    if (this.initialized) {
      logger.warn('WindowManager already initialized');
      return;
    }

    this.initialized = true;
    logger.info('WindowManager initialized');
  }

  /**
   * Create the main application window
   * @returns {BrowserWindow} The created window
   */
  createMainWindow() {
    if (this.mainWindow) {
      return this.mainWindow;
    }

    // Get saved window state or use defaults
    const savedState = stateManager.get('window') || {};
    const { width, height, x, y, isMaximized, isFullScreen } = savedState;

    // Calculate window position (ensure it's on screen)
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const defaultWidth = Math.min(1200, display.workAreaSize.width - 100);
    const defaultHeight = Math.min(800, display.workAreaSize.height - 100);
    
    const winX = x !== undefined ? Math.min(x, display.bounds.x + display.workAreaSize.width - 100) : undefined;
    const winY = y !== undefined ? Math.min(y, display.bounds.y + display.workAreaSize.height - 100) : undefined;

    // Create the browser window
    const win = new BrowserWindow({
      width: width || defaultWidth,
      height: height || defaultHeight,
      x: winX,
      y: winY,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: 'hiddenInset',
      titleBarOverlay: {
        color: '#f8f9fa',
        symbolColor: '#495057',
        height: 30
      },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        webgl: true,
        enableRemoteModule: false,
        spellcheck: stateManager.get('preferences.spellCheck') || false,
        preload: path.join(__dirname, '../../preload.js'),
        additionalArguments: [
          `--user-data-dir=${app.getPath('userData')}`,
          `--app-version=${app.getVersion()}`
        ]
      },
      show: false,
      backgroundColor: '#ffffff',
      icon: path.join(__dirname, '../../assets/icon.png')
    });

    // Track this window
    this.mainWindow = win;
    this.windows.set(win.id, win);
    this.windowCount++;

    // Load the app
    const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, '../../build/index.html'),
      protocol: 'file:',
      slashes: true
    });

    win.loadURL(startUrl);

    // Show window when ready to prevent flickering
    win.once('ready-to-show', () => {
      if (isMaximized) {
        win.maximize();
      }
      if (isFullScreen) {
        win.setFullScreen(true);
      }
      win.show();
      
      // Open dev tools in development
      if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools({ mode: 'detach' });
      }
    });

    // Handle window events
    this.setupWindowEvents(win);
    
    // Handle external links
    this.setupExternalLinks(win);

    logger.info('Main window created');
    return win;
  }

  /**
   * Set up window event listeners
   * @param {BrowserWindow} win - The window to set up events for
   */
  setupWindowEvents(win) {
    // Save window state on close
    const saveState = () => {
      if (!win.isDestroyed()) {
        const bounds = win.getNormalBounds();
        
        stateManager.set('window', {
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
          isMaximized: win.isMaximized(),
          isFullScreen: win.isFullScreen()
        });
      }
    };

    // Save state on various window events
    win.on('resize', saveState);
    win.on('move', saveState);
    win.on('maximize', () => stateManager.set('window.isMaximized', true));
    win.on('unmaximize', () => stateManager.set('window.isMaximized', false));
    win.on('enter-full-screen', () => stateManager.set('window.isFullScreen', true));
    win.on('leave-full-screen', () => stateManager.set('window.isFullScreen', false));

    // Handle window close
    win.on('close', async (e) => {
      // Check for unsaved changes before closing
      try {
        const hasUnsavedChanges = await win.webContents.executeJavaScript('window.getHasUnsavedChanges?.() || false');
        
        if (hasUnsavedChanges) {
          // Prevent the close for now
          e.preventDefault();
          
          // Ask the user to confirm
          const { response } = await dialog.showMessageBox(win, {
            type: 'question',
            buttons: ['Don\'t Save', 'Cancel', 'Save'],
            defaultId: 2,
            cancelId: 1,
            message: 'Do you want to save the changes you made?',
            detail: 'Your changes will be lost if you don\'t save them.'
          });
          
          switch (response) {
            case 0: // Don't Save
              // Close without saving
              this.cleanupWindow(win);
              win.destroy();
              break;
              
            case 1: // Cancel
              // Do nothing, window will stay open
              return;
              
            case 2: // Save
              try {
                // Request the renderer to save the document
                const saveResult = await win.webContents.executeJavaScript('window.saveDocument?.()');
                
                if (saveResult && saveResult.success) {
                  // If save was successful, close the window
                  this.cleanupWindow(win);
                  win.destroy();
                } else {
                  // If save was cancelled or failed, keep the window open
                  return;
                }
              } catch (error) {
                logger.error('Error during save:', error);
                dialog.showErrorBox('Save Error', 'Failed to save the document.');
                return;
              }
              break;
          }
        } else {
          // No unsaved changes, just close
          saveState();
          this.cleanupWindow(win);
          win.destroy();
        }
      } catch (error) {
        logger.error('Error during window close:', error);
        // In case of error, allow the window to close
        saveState();
        this.cleanupWindow(win);
        win.destroy();
      }
    });

    // Set up closed handler
    win.on('closed', () => this.handleWindowClosed(win));
  }

  /**
   * Clean up window references
   * @param {BrowserWindow} win - The window to clean up
   */
  cleanupWindow(win) {
    if (win === this.mainWindow) {
      this.mainWindow = null;
    }
    this.windows.delete(win.id);
    this.windowCount--;
    
    // Quit if all windows are closed (except on macOS)
    if (this.windowCount === 0 && process.platform !== 'darwin') {
      app.quit();
    }
  }

  /**
   * Handle window closed event
   * @param {BrowserWindow} win - The window that was closed
   */
  handleWindowClosed(win) {
    this.cleanupWindow(win);
  }

  /**
   * Set up external link handling
   * @param {BrowserWindow} win - The window to set up external links for
   */
  setupExternalLinks(win) {
    win.webContents.setWindowOpenHandler(({ url }) => {
      // Open external links in default browser
      if (url.startsWith('http:') || url.startsWith('https:')) {
        shell.openExternal(url);
        return { action: 'deny' };
      }
      return { action: 'allow' };
    });
  }

  /**
   * Create a new window
   * @param {Object} options - Window options
   * @returns {BrowserWindow} The created window
   */
  createWindow(options = {}) {
    const win = new BrowserWindow({
      width: 1024,
      height: 768,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        preload: path.join(__dirname, '../../preload.js')
      },
      ...options
    });

    // Track this window
    this.windows.set(win.id, win);
    this.windowCount++;

    // Set up window events
    this.setupWindowEvents(win);
    this.setupExternalLinks(win);

    return win;
  }

  /**
   * Get a window by ID
   * @param {number} id - Window ID
   * @returns {BrowserWindow|undefined} The window or undefined if not found
   */
  getWindowById(id) {
    return this.windows.get(id);
  }

  /**
   * Get all windows
   * @returns {BrowserWindow[]} Array of all windows
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * Focus a window
   * @param {BrowserWindow} win - Window to focus
   */
  focusWindow(win) {
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    }
  }
}

// Export a singleton instance
const windowManager = new WindowManager();
module.exports = windowManager;
