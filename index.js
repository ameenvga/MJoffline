const { app, BrowserWindow, dialog, ipcMain, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 600,
    title: "മലയാള ജാലകം",
    frame: true,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  win.loadFile('home.html');

  // Handle window close confirmation
  win.on('close', async (e) => {
    // Check if there are unsaved changes
    const hasUnsavedChanges = await win.webContents.executeJavaScript('window.hasUnsavedChanges()');
    
    if (hasUnsavedChanges) {
      const choice = await dialog.showMessageBox(win, {
        type: 'question',
        buttons: ['Save', 'Cancel', 'Don\'t Save'],
        title: 'Save Changes',
        message: 'Do you want to save the changes you made?',
        detail: 'Your changes will be lost if you don\'t save them.'
      });

      if (choice.response === 0) { // Save
        e.preventDefault();
        win.webContents.send('save-before-close');
      } else if (choice.response === 1) { // Cancel
        e.preventDefault();
        return;
      }
      // If 'Don't Save' (2), continue with close
    }
  });

  // Handle save before close
  ipcMain.on('can-close', () => {
    win.destroy();
  });
}

// IPC Handlers
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(win, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(win, options);
  return result;
});

ipcMain.handle('clipboard-read-text', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard-write-text', (event, text) => {
  clipboard.writeText(text);
});

ipcMain.handle('show-confirm-dialog', async (event, options) => {
  const result = await dialog.showMessageBox(win, {
    type: 'question',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    ...options
  });
  return result.response === 0; // true for 'Yes', false for 'No'
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


