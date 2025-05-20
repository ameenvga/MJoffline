const { contextBridge, ipcRenderer } = require('electron');

// Create a safe handler for IPC calls with error handling
const createSafeIpcHandler = (channel) => {
  return async (...args) => {
    try {
      return await ipcRenderer.invoke(channel, ...args);
    } catch (error) {
      console.error(`Error in IPC call ${channel}:`, error);
      throw error; // Re-throw to allow handling in renderer
    }
  };
};

// Whitelist of valid channels for send
const validSendChannels = [
  'save-before-close',
  'file-saved',
  'file-loaded',
  'update-unsaved-changes',
  'show-context-menu'
];

// Whitelist of valid channels for receive
const validReceiveChannels = [
  'update-available',
  'update-downloaded',
  'before-close',
  'file-opened',
  'file-save-error'
];

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: createSafeIpcHandler('read-file'),
  writeFile: createSafeIpcHandler('write-file'),
  showSaveDialog: createSafeIpcHandler('show-save-dialog'),
  showOpenDialog: createSafeIpcHandler('show-open-dialog'),
  openFile: createSafeIpcHandler('open-file'),
  saveFile: createSafeIpcHandler('save-file'),
  
  // Clipboard operations
  clipboard: {
    readText: createSafeIpcHandler('clipboard-read-text'),
    writeText: createSafeIpcHandler('clipboard-write-text')
  },
  
  // App state
  getAppInfo: createSafeIpcHandler('get-app-info'),
  getConfig: createSafeIpcHandler('get-config'),
  updateConfig: createSafeIpcHandler('update-config'),
  
  // Window controls
  minimize: createSafeIpcHandler('window-minimize'),
  maximize: createSafeIpcHandler('window-maximize'),
  close: createSafeIpcHandler('window-close'),
  
  // Auto-update
  checkForUpdates: createSafeIpcHandler('check-for-updates'),
  installUpdate: createSafeIpcHandler('install-update'),
  
  // Send messages to main process
  send: (channel, data) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Attempted to send on invalid channel: ${channel}`);
    }
  },
  
  // Receive messages from main process
  on: (channel, callback) => {
    if (validReceiveChannels.includes(channel)) {
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    console.warn(`Attempted to subscribe to invalid channel: ${channel}`);
    return () => {};
  },
  
  // One-time event listener
  once: (channel, callback) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => callback(...args));
    } else {
      console.warn(`Attempted to subscribe once to invalid channel: ${channel}`);
    }
  },
  
  // Remove event listener
  removeListener: (channel, callback) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  }
});

// Expose a logger that forwards logs to the main process
contextBridge.exposeInMainWorld('logger', {
  info: (...args) => ipcRenderer.send('log', 'info', args),
  warn: (...args) => ipcRenderer.send('log', 'warn', args),
  error: (...args) => ipcRenderer.send('log', 'error', args),
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      ipcRenderer.send('log', 'debug', args);
    }
  }
});

// Expose environment variables
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV,
  PLATFORM: process.platform,
  VERSION: process.env.npm_package_version,
  IS_DEV: process.env.NODE_ENV === 'development'
});
