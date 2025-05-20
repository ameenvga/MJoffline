const { BrowserWindow, screen, shell } = require('electron');
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
    win.on('close', (e) => {
      // Prevent closing if there are unsaved changes
      win.webContents.send('window-close-requested');
      
      // If there are unsaved changes, the renderer will respond with 'confirm-close'
      const handleConfirmClose = (event, shouldClose) => {
        if (shouldClose) {
          saveState();
          win.destroy();
          this.windows.delete(win.id);
          this.windowCount--;
          
          if (win === this.mainWindow) {
            this.mainWindow = null;
          }
          
          // Quit if all windows are closed (except on macOS)
          if (this.windowCount === 0 && process.platform !== 'darwin') {
            app.quit();
          }
        }
      };
      
      // Listen for confirmation from renderer
      ipcMain.once('confirm-close', handleConfirmClose);
      
      // Set a timeout in case the renderer doesn't respond
      setTimeout(() => {
        ipcMain.removeListener('confirm-close', handleConfirmClose);
        if (!win.isDestroyed()) {
          win.destroy();
        }
      }, 1000);
      
      // Prevent default close behavior
      e.preventDefault();
    });

    // Handle window closed
    win.on('closed', () => {
      // Clean up
      if (win === this.mainWindow) {
        this.mainWindow = null;
      }
      this.windows.delete(win.id);
      this.windowCount--;
      
      // Quit if all windows are closed (except on macOS)
      if (this.windowCount === 0 && process.platform !== 'darwin') {
        app.quit();
      }
    });
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
      // Allow other URLs to open in the app
      return { action: 'allow' };
    });
  }

  /**
   * Create a new editor window
   * @param {Object} options - Window options
   * @returns {BrowserWindow} The created window
   */
  createEditorWindow(options = {}) {
    const defaults = {
      width: 1000,
      height: 700,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, '../../preload.js'),
        additionalArguments: [
          `--user-data-dir=${app.getPath('userData')}`,
          `--app-version=${app.getVersion()}`
        ]
      },
      ...options
    };

    const win = new BrowserWindow({
      ...defaults,
      webPreferences: {
        ...defaults.webPreferences,
        // Add any additional web preferences
      }
    });

    // Track this window
    this.windows.set(win.id, win);
    this.windowCount++;

    // Load the app
    const startUrl = process.env.ELECTRON_START_URL || url.format({
      pathname: path.join(__dirname, '../../build/index.html'),
      protocol: 'file:',
      slashes: true,
      hash: options.hash || ''
    });

    win.loadURL(startUrl);

    // Show window when ready
    win.once('ready-to-show', () => {
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

    logger.info('Editor window created');
    return win;
  }

  /**
   * Get the main window
   * @returns {BrowserWindow|null} The main window
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * Get all windows
   * @returns {BrowserWindow[]} Array of all windows
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * Focus the main window or create it if it doesn't exist
   */
  focusMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    } else {
      this.createMainWindow();
    }
  }

  /**
   * Create a new window with the given URL
   * @param {string} url - The URL to load in the new window
   * @param {Object} options - Window options
   * @returns {BrowserWindow} The created window
   */
  createWindowWithUrl(url, options = {}) {
    const win = new BrowserWindow({
      width: 1000,
      height: 700,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: path.join(__dirname, '../../preload.js')
      },
      ...options
    });

    // Track this window
    this.windows.set(win.id, win);
    this.windowCount++;

    // Load the URL
    win.loadURL(url);

    // Handle window events
    win.on('closed', () => {
      this.windows.delete(win.id);
      this.windowCount--;
    });

    // Handle external links
    this.setupExternalLinks(win);

    logger.info(`Window created with URL: ${url}`);
    return win;
  }

  /**
   * Close all windows
   */
  closeAllWindows() {
    this.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.close();
      }
    });
    this.windows.clear();
    this.windowCount = 0;
    this.mainWindow = null;
  }
}

// Export a singleton instance
const windowManager = new WindowManager();
module.exports = windowManager;
