const { Menu, shell, dialog, app } = require('electron');
const path = require('path');
const logger = require('./logger');
const stateManager = require('./stateManager');
const fileManager = require('./fileManager');
const { LAYOUTS } = require('./keyboardLayouts');

class MenuManager {
  constructor(mainWindow) {
    if (!mainWindow) {
      throw new Error('Main window is required for MenuManager');
    }
    
    this.mainWindow = mainWindow;
    this.template = [];
    this.menu = null;
    this.isDarkMode = false;
    this.currentKeyboardLayout = LAYOUTS.PHONETIC;
    
    // Initialize
    this.buildMenuTemplate();
    this.createMenu();
    this.setupEventListeners();
  }

  /**
   * Build the menu template
   */
  buildMenuTemplate() {
    this.template = [
      // App menu (macOS)
      ...(process.platform === 'darwin' ? [{
        label: app.getName(),
        submenu: [
          { label: `About ${app.getName()}`, role: 'about' },
          { type: 'separator' },
          { label: 'Preferences...', accelerator: 'CmdOrCtrl+,', click: () => this.showPreferences() },
          { type: 'separator' },
          { label: 'Hide', role: 'hide' },
          { label: 'Hide Others', role: 'hideOthers' },
          { label: 'Show All', role: 'unhide' },
          { type: 'separator' },
          { label: 'Quit', role: 'quit' }
        ]
      }] : []),
      
      // File menu
      {
        label: 'File',
        submenu: [
          { 
            label: 'New', 
            accelerator: 'CmdOrCtrl+N',
            click: () => this.mainWindow.webContents.send('file-new')
          },
          { 
            label: 'Open...', 
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const filePath = await fileManager.openFileDialog(this.mainWindow);
              if (filePath) {
                this.mainWindow.webContents.send('file-open', filePath);
              }
            }
          },
          { type: 'separator' },
          { 
            label: 'Save', 
            accelerator: 'CmdOrCtrl+S',
            click: () => this.mainWindow.webContents.send('file-save')
          },
          { 
            label: 'Save As...', 
            accelerator: 'CmdOrCtrl+Shift+S',
            click: async () => {
              const filePath = await fileManager.saveFileDialog(this.mainWindow);
              if (filePath) {
                this.mainWindow.webContents.send('file-save-as', filePath);
              }
            }
          },
          { type: 'separator' },
          { 
            label: 'Print...',
            accelerator: 'CmdOrCtrl+P',
            click: () => this.mainWindow.webContents.send('file-print')
          },
          { type: 'separator' },
          { 
            label: 'Exit', 
            role: process.platform === 'win32' ? 'close' : 'quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4'
          }
        ]
      },
      
      // Edit menu
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', role: 'undo' },
          { label: 'Redo', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', role: 'cut' },
          { label: 'Copy', role: 'copy' },
          { label: 'Paste', role: 'paste' },
          { label: 'Select All', role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Find',
            submenu: [
              { label: 'Find...', accelerator: 'CmdOrCtrl+F', click: () => this.mainWindow.webContents.send('find-show') },
              { label: 'Find Next', accelerator: 'F3', click: () => this.mainWindow.webContents.send('find-next') },
              { label: 'Find Previous', accelerator: 'Shift+F3', click: () => this.mainWindow.webContents.send('find-previous') },
              { label: 'Replace...', accelerator: 'CmdOrCtrl+H', click: () => this.mainWindow.webContents.send('find-replace') }
            ]
          }
        ]
      },
      
      // View menu
      {
        label: 'View',
        submenu: [
          { 
            label: 'Reload', 
            accelerator: 'CmdOrCtrl+R',
            click: () => this.mainWindow.reload()
          },
          { 
            label: 'Force Reload', 
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => this.mainWindow.webContents.reloadIgnoringCache()
          },
          { type: 'separator' },
          { 
            label: 'Zoom In', 
            accelerator: 'CmdOrCtrl+=',
            click: () => this.mainWindow.webContents.zoomLevel += 0.5
          },
          { 
            label: 'Zoom Out', 
            accelerator: 'CmdOrCtrl+-',
            click: () => this.mainWindow.webContents.zoomLevel -= 0.5
          },
          { 
            label: 'Reset Zoom', 
            accelerator: 'CmdOrCtrl+0',
            click: () => this.mainWindow.webContents.zoomLevel = 0
          },
          { type: 'separator' },
          { 
            label: 'Toggle Full Screen', 
            role: 'togglefullscreen',
            accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11'
          },
          { 
            label: 'Toggle Developer Tools', 
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => this.mainWindow.webContents.toggleDevTools()
          }
        ]
      },
      
      // Keyboard Layout menu
      {
        label: 'Keyboard Layout',
        submenu: [
          {
            label: 'Phonetic (ഫോണറ്റിക്)',
            type: 'radio',
            checked: this.currentKeyboardLayout === LAYOUTS.PHONETIC,
            click: () => this.setKeyboardLayout(LAYOUTS.PHONETIC)
          },
          {
            label: 'Inscript (ഇൻസ്ക്രിപ്റ്റ്)',
            type: 'radio',
            checked: this.currentKeyboardLayout === LAYOUTS.INSCRIPT,
            click: () => this.setKeyboardLayout(LAYOUTS.INSCRIPT)
          },
          {
            label: 'Swanalekha (സ്വനലേഖ)',
            type: 'radio',
            checked: this.currentKeyboardLayout === LAYOUTS.SWANALEKHA,
            click: () => this.setKeyboardLayout(LAYOUTS.SWANALEKHA)
          },
          { type: 'separator' },
          {
            label: 'Keyboard Shortcuts',
            click: () => this.mainWindow.webContents.send('show-shortcuts')
          }
        ]
      },
      
      // Window menu (macOS)
      ...(process.platform === 'darwin' ? [{
        label: 'Window',
        role: 'window',
        submenu: [
          { label: 'Minimize', role: 'minimize' },
          { label: 'Zoom', role: 'zoom' },
          { type: 'separator' },
          { label: 'Bring All to Front', role: 'front' }
        ]
      }] : []),
      
      // Help menu
      {
        label: 'Help',
        role: 'help',
        submenu: [
          {
            label: 'Documentation',
            click: () => shell.openExternal('https://github.com/ameenvga/MJoffline')
          },
          {
            label: 'Report Issue',
            click: () => shell.openExternal('https://github.com/ameenvga/MJoffline/issues')
          },
          { type: 'separator' },
          {
            label: 'Check for Updates...',
            click: () => this.mainWindow.webContents.send('check-for-updates')
          },
          { type: 'separator' },
          {
            label: 'About',
            click: () => this.showAboutDialog()
          }
        ]
      }
    ];
    
    // Add recent files to File menu
    this.updateRecentFilesMenu();
  }

  /**
   * Create the application menu
   */
  createMenu() {
    this.menu = Menu.buildFromTemplate(this.template);
    Menu.setApplicationMenu(this.menu);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for theme changes
    stateManager.on('theme-changed', (theme) => {
      this.isDarkMode = theme === 'dark' || (theme === 'system' && 
        require('electron').nativeTheme.shouldUseDarkColors);
      this.updateMenu();
    });
    
    // Listen for keyboard layout changes
    stateManager.on('keyboard-layout-changed', (layout) => {
      this.currentKeyboardLayout = layout;
      this.updateMenu();
    });
  }

  /**
   * Update the menu with the latest template
   */
  updateMenu() {
    this.buildMenuTemplate();
    this.createMenu();
  }

  /**
   * Update the recent files menu
   */
  updateRecentFilesMenu() {
    const recentFiles = stateManager.get('recentFiles') || [];
    
    // Find the File menu
    const fileMenu = this.template.find(item => item.label === 'File');
    if (!fileMenu) return;
    
    // Find the separator before Exit/Quit
    const exitIndex = fileMenu.submenu.findIndex(item => 
      item.role === 'quit' || item.role === 'close' || 
      item.label === 'Exit' || item.label === 'Quit'
    );
    
    if (exitIndex === -1) return;
    
    // Remove existing recent files
    fileMenu.submenu = fileMenu.submenu.filter(item => 
      !item.isRecentFile && item.type !== 'recent-files-separator'
    );
    
    if (recentFiles.length > 0) {
      // Add recent files
      fileMenu.submenu.splice(exitIndex, 0, { type: 'separator', id: 'recent-files-separator' });
      
      recentFiles.forEach((file, index) => {
        if (index >= 10) return; // Show max 10 recent files
        
        fileMenu.submenu.splice(exitIndex + index + 1, 0, {
          label: file.name || path.basename(file.path),
          isRecentFile: true,
          click: () => this.mainWindow.webContents.send('file-open', file.path)
        });
      });
      
      // Add clear recent files option
      fileMenu.submenu.splice(
        exitIndex + Math.min(recentFiles.length, 10) + 1, 
        0, 
        {
          label: 'Clear Recent Files',
          enabled: recentFiles.length > 0,
          click: () => {
            stateManager.clearRecentFiles();
            this.updateMenu();
          }
        },
        { type: 'separator' }
      );
    }
  }

  /**
   * Set the keyboard layout
   * @param {string} layout - The layout to set (from LAYOUTS)
   */
  setKeyboardLayout(layout) {
    if (Object.values(LAYOUTS).includes(layout)) {
      this.currentKeyboardLayout = layout;
      stateManager.set('preferences.keyboardLayout', layout);
      this.mainWindow.webContents.send('keyboard-layout-changed', layout);
      this.updateMenu();
    }
  }

  /**
   * Show the about dialog
   */
  showAboutDialog() {
    const appName = app.getName();
    const version = app.getVersion();
    const copyright = `Copyright © ${new Date().getFullYear()} ${appName}`;
    const iconPath = path.join(__dirname, '../../assets/icon.png');
    
    dialog.showMessageBox(this.mainWindow, {
      title: `About ${appName}`,
      message: `${appName} v${version}`,
      detail: `${copyright}\nA Malayalam text editor for offline use.`,
      icon: iconPath,
      buttons: ['OK'],
      defaultId: 0,
      noLink: true
    });
  }

  /**
   * Show the preferences dialog
   */
  showPreferences() {
    this.mainWindow.webContents.send('show-preferences');
  }

  /**
   * Get the current menu
   * @returns {Electron.Menu}
   */
  getMenu() {
    return this.menu;
  }
}

module.exports = MenuManager;
