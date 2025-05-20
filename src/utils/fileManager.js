const { dialog, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class FileManager {
  constructor() {
    this.currentFilePath = null;
    this.recentFiles = [];
    this.maxRecentFiles = 10;
  }

  /**
   * Open a file dialog and return the selected file path
   * @param {Electron.BrowserWindow} window - The browser window
   * @param {Object} options - Options for the dialog
   * @returns {Promise<string|null>} - The selected file path or null if cancelled
   */
  async openFileDialog(window, options = {}) {
    try {
      const result = await dialog.showOpenDialog(window, {
        title: 'Open File',
        properties: ['openFile'],
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md', 'text', 'ml'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        ...options,
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const filePath = result.filePaths[0];
      return filePath;
    } catch (error) {
      logger.error('Error in openFileDialog:', error);
      throw error;
    }
  }

  /**
   * Open a save dialog and return the selected file path
   * @param {Electron.BrowserWindow} window - The browser window
   * @param {Object} options - Options for the dialog
   * @returns {Promise<string|null>} - The selected file path or null if cancelled
   */
  async saveFileDialog(window, options = {}) {
    try {
      const result = await dialog.showSaveDialog(window, {
        title: 'Save File',
        filters: [
          { name: 'Text Files', extensions: ['txt', 'md', 'text', 'ml'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        ...options,
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      return result.filePath;
    } catch (error) {
      logger.error('Error in saveFileDialog:', error);
      throw error;
    }
  }

  /**
   * Read the content of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} - The file content
   */
  async readFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.currentFilePath = filePath;
      this.addToRecentFiles(filePath);
      return content;
    } catch (error) {
      logger.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Write content to a file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  async writeFile(filePath, content) {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      this.currentFilePath = filePath;
      this.addToRecentFiles(filePath);
    } catch (error) {
      logger.error(`Error writing to file ${filePath}:`, error);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * Add a file to the recent files list
   * @param {string} filePath - Path to the file
   */
  addToRecentFiles(filePath) {
    if (!filePath) return;

    // Remove if already exists
    const index = this.recentFiles.indexOf(filePath);
    if (index !== -1) {
      this.recentFiles.splice(index, 1);
    }

    // Add to the beginning
    this.recentFiles.unshift(filePath);

    // Limit the number of recent files
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles.pop();
    }
  }

  /**
   * Get the list of recent files
   * @returns {string[]} - Array of recent file paths
   */
  getRecentFiles() {
    return [...this.recentFiles];
  }

  /**
   * Clear the recent files list
   */
  clearRecentFiles() {
    this.recentFiles = [];
  }

  /**
   * Open a file in the default system application
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  async openInSystem(filePath) {
    try {
      await shell.openPath(filePath);
    } catch (error) {
      logger.error(`Error opening file ${filePath} in system:`, error);
      throw new Error(`Failed to open file: ${error.message}`);
    }
  }

  /**
   * Show the file in the system file manager
   * @param {string} filePath - Path to the file
   * @returns {Promise<void>}
   */
  async showInFolder(filePath) {
    try {
      await shell.showItemInFolder(path.resolve(filePath));
    } catch (error) {
      logger.error(`Error showing file ${filePath} in folder:`, error);
      throw new Error(`Failed to show file in folder: ${error.message}`);
    }
  }

  /**
   * Get file information
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} - File information
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
      };
    } catch (error) {
      logger.error(`Error getting file info for ${filePath}:`, error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }
}

// Export a singleton instance
const fileManager = new FileManager();
module.exports = fileManager;
