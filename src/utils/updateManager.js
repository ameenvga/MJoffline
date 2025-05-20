const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const logger = require('./logger');

class UpdateManager {
  constructor() {
    this.autoUpdater = autoUpdater;
    this.mainWindow = null;
    this.updateAvailable = false;
    this.updateDownloaded = false;
    this.autoInstallOnAppQuit = true;
    this.autoDownload = true;
    this.initialized = false;

    // Configure autoUpdater
    this.autoUpdater.logger = logger;
    this.autoUpdater.autoDownload = this.autoDownload;
    this.autoUpdater.autoInstallOnAppQuit = this.autoInstallOnAppQuit;
    this.autoUpdater.allowPrerelease = false;

    // Set feed URL based on environment
    if (process.env.NODE_ENV === 'development') {
      this.autoUpdater.updateConfigPath = path.join(__dirname, '../../dev-app-update.yml');
    }
  }

  /**
   * Initialize the update manager
   * @param {BrowserWindow} mainWindow - The main browser window
   */
  initialize(mainWindow) {
    if (this.initialized) {
      logger.warn('UpdateManager already initialized');
      return;
    }

    if (!mainWindow || !(mainWindow instanceof BrowserWindow)) {
      throw new Error('Invalid main window provided for UpdateManager');
    }

    this.mainWindow = mainWindow;
    this.setupEventListeners();
    this.initialized = true;
    logger.info('UpdateManager initialized');
  }

  /**
   * Set up event listeners for auto-updater
   */
  setupEventListeners() {
    // Update available for download
    this.autoUpdater.on('update-available', (info) => {
      this.updateAvailable = true;
      logger.info('Update available:', info.version);
      
      // Notify renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', info);
      }

      // If auto-download is enabled, it will start automatically
      if (this.autoDownload) {
        logger.info('Auto-downloading update...');
      } else {
        // Show notification to user
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'Update Available',
          message: `Version ${info.version} is available. Would you like to download it now?`,
          buttons: ['Download', 'Later'],
          defaultId: 0,
          cancelId: 1,
        }).then(({ response }) => {
          if (response === 0) {
            this.downloadUpdate();
          }
        });
      }
    });

    // Update downloaded and ready to install
    this.autoUpdater.on('update-downloaded', (info) => {
      this.updateDownloaded = true;
      logger.info('Update downloaded, ready to install');

      // Notify renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-downloaded', info);
      }

      // Ask user to restart the app
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart the application to apply the updates.',
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        cancelId: 1,
      }).then(({ response }) => {
        if (response === 0) {
          this.installUpdate();
        }
      });
    });

    // Error handling
    this.autoUpdater.on('error', (error) => {
      logger.error('Update error:', error);
      
      // Notify renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-error', error);
      }

      // Show error to user
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
    });

    // Check for updates
    this.autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
    });

    // No update available
    this.autoUpdater.on('update-not-available', () => {
      logger.info('No updates available');
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-not-available');
      }
    });

    // Download progress
    this.autoUpdater.on('download-progress', (progressObj) => {
      const progress = {
        bytesPerSecond: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      };
      
      // Notify renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('download-progress', progress);
      }
    });
  }

  /**
   * Check for updates
   * @param {boolean} force - Force check for updates
   */
  checkForUpdates(force = false) {
    if (!this.initialized) {
      throw new Error('UpdateManager not initialized');
    }

    try {
      if (force) {
        this.autoUpdater.forceDevUpdateConfig = true;
      }
      
      logger.info('Checking for updates...');
      this.autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('Error checking for updates:', error);
      throw error;
    }
  }

  /**
   * Download the available update
   */
  downloadUpdate() {
    if (!this.updateAvailable) {
      logger.warn('No update available to download');
      return;
    }

    try {
      logger.info('Downloading update...');
      this.autoUpdater.downloadUpdate();
    } catch (error) {
      logger.error('Error downloading update:', error);
      throw error;
    }
  }

  /**
   * Install the downloaded update
   */
  installUpdate() {
    if (!this.updateDownloaded) {
      logger.warn('No update downloaded to install');
      return;
    }

    try {
      logger.info('Installing update...');
      this.autoUpdater.quitAndInstall();
    } catch (error) {
      logger.error('Error installing update:', error);
      throw error;
    }
  }

  /**
   * Set whether to automatically download updates
   * @param {boolean} auto - Whether to auto-download updates
   */
  setAutoDownload(auto) {
    this.autoDownload = auto;
    this.autoUpdater.autoDownload = auto;
  }

  /**
   * Set whether to automatically install updates on app quit
   * @param {boolean} auto - Whether to auto-install updates on quit
   */
  setAutoInstallOnQuit(auto) {
    this.autoInstallOnAppQuit = auto;
    this.autoUpdater.autoInstallOnAppQuit = auto;
  }
}

// Export a singleton instance
const updateManager = new UpdateManager();
module.exports = updateManager;
