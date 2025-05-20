const { app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

// Encryption algorithm and settings
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256 bits for AES-256
const ITERATIONS = 100000; // PBKDF2 iterations
const DIGEST = 'sha512';

class StorageManager {
  constructor() {
    this.storagePath = path.join(app.getPath('userData'), 'secure-storage');
    this.encryptionKey = null;
    this.initialized = false;
  }

  /**
   * Initialize the storage manager
   * @param {string} [passphrase] - Optional passphrase for encryption
   */
  async initialize(passphrase) {
    if (this.initialized) {
      logger.warn('StorageManager already initialized');
      return;
    }

    try {
      // Create storage directory if it doesn't exist
      await fs.mkdir(this.storagePath, { recursive: true });
      
      // If passphrase is provided, derive a key from it
      if (passphrase) {
        await this.setPassphrase(passphrase);
      } else {
        // Try to load existing key from keychain/secure storage
        await this.loadEncryptionKey();
      }
      
      this.initialized = true;
      logger.info('StorageManager initialized');
    } catch (error) {
      logger.error('Error initializing StorageManager:', error);
      throw error;
    }
  }

  /**
   * Set a passphrase for encryption
   * @param {string} passphrase - Passphrase to derive encryption key from
   */
  async setPassphrase(passphrase) {
    if (!passphrase) {
      throw new Error('Passphrase is required');
    }
    
    try {
      // Generate a random salt
      const salt = crypto.randomBytes(SALT_LENGTH);
      
      // Derive key using PBKDF2
      const key = crypto.pbkdf2Sync(
        passphrase,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        DIGEST
      );
      
      // Store the salt and derived key
      this.encryptionKey = key;
      
      // Save the salt for future use
      await this.saveEncryptionKey(key, salt);
      
      logger.info('Encryption key derived from passphrase');
    } catch (error) {
      logger.error('Error setting passphrase:', error);
      throw error;
    }
  }

  /**
   * Save the encryption key and salt securely
   * @private
   */
  async saveEncryptionKey(key, salt) {
    try {
      // In a real app, you'd use the system keychain here
      // This is a simplified example that stores them in files (not secure for production)
      await fs.writeFile(
        path.join(this.storagePath, 'key.bin'),
        key.toString('hex')
      );
      
      await fs.writeFile(
        path.join(this.storagePath, 'salt.bin'),
        salt.toString('hex')
      );
      
      // Set restricted permissions on the key file (Unix-like systems only)
      if (process.platform !== 'win32') {
        await fs.chmod(path.join(this.storagePath, 'key.bin'), 0o600);
        await fs.chmod(path.join(this.storagePath, 'salt.bin'), 0o600);
      }
      
      logger.debug('Encryption key and salt saved');
    } catch (error) {
      logger.error('Error saving encryption key:', error);
      throw error;
    }
  }

  /**
   * Load the encryption key from secure storage
   * @private
   */
  async loadEncryptionKey() {
    try {
      // In a real app, you'd load this from the system keychain
      // This is a simplified example that loads from files
      const [keyHex, saltHex] = await Promise.all([
        fs.readFile(path.join(this.storagePath, 'key.bin'), 'utf8'),
        fs.readFile(path.join(this.storagePath, 'salt.bin'), 'utf8')
      ]);
      
      const key = Buffer.from(keyHex, 'hex');
      const salt = Buffer.from(saltHex, 'hex');
      
      this.encryptionKey = key;
      logger.debug('Encryption key loaded');
      return { key, salt };
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.debug('No existing encryption key found');
        return null;
      }
      logger.error('Error loading encryption key:', error);
      throw error;
    }
  }

  /**
   * Check if the storage is encrypted
   * @returns {Promise<boolean>} - Whether the storage is encrypted
   */
  async isEncrypted() {
    try {
      await fs.access(path.join(this.storagePath, 'key.bin'));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypt data
   * @param {string|Buffer} data - Data to encrypt
   * @returns {Promise<{iv: string, data: string}>} - Encrypted data with IV
   * @private
   */
  async encrypt(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        iv: iv.toString('hex'),
        data: encrypted
      };
    } catch (error) {
      logger.error('Error encrypting data:', error);
      throw error;
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Encrypted data
   * @param {string} iv - Initialization vector
   * @returns {Promise<string>} - Decrypted data
   * @private
   */
  async decrypt(encryptedData, iv) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    try {
      const ivBuffer = Buffer.from(iv, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, ivBuffer);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data. The passphrase may be incorrect.');
    }
  }

  /**
   * Store a value in secure storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   */
  async setItem(key, value) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      const data = JSON.stringify(value);
      
      // If encryption is enabled, encrypt the data
      if (this.encryptionKey) {
        const { iv, data: encryptedData } = await this.encrypt(data);
        
        // Store both the IV and encrypted data
        await fs.writeFile(
          path.join(this.storagePath, `${key}.dat`),
          JSON.stringify({ iv, data: encryptedData }),
          'utf8'
        );
      } else {
        // Store as plain text (not recommended for sensitive data)
        await fs.writeFile(
          path.join(this.storagePath, `${key}.json`),
          data,
          'utf8'
        );
      }
      
      logger.debug(`Item stored: ${key}`);
    } catch (error) {
      logger.error(`Error storing item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value from secure storage
   * @param {string} key - Storage key
   * @returns {Promise<*>} - Stored value (or null if not found)
   */
  async getItem(key) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      // Try to load encrypted data first
      try {
        const encryptedData = await fs.readFile(
          path.join(this.storagePath, `${key}.dat`),
          'utf8'
        );
        
        if (this.encryptionKey) {
          const { iv, data } = JSON.parse(encryptedData);
          const decrypted = await this.decrypt(data, iv);
          return JSON.parse(decrypted);
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.error(`Error reading encrypted item ${key}:`, error);
        }
        // Fall through to try JSON file
      }
      
      // Try to load plain JSON data
      try {
        const data = await fs.readFile(
          path.join(this.storagePath, `${key}.json`),
          'utf8'
        );
        return JSON.parse(data);
      } catch (error) {
        if (error.code === 'ENOENT') {
          return null; // Key not found
        }
        throw error;
      }
    } catch (error) {
      logger.error(`Error retrieving item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Remove an item from secure storage
   * @param {string} key - Storage key to remove
   */
  async removeItem(key) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      // Try to remove both encrypted and JSON files
      const files = [
        path.join(this.storagePath, `${key}.dat`),
        path.join(this.storagePath, `${key}.json`)
      ];
      
      await Promise.all(
        files.map(file => 
          fs.unlink(file).catch(error => {
            if (error.code !== 'ENOENT') {
              throw error;
            }
          })
        )
      );
      
      logger.debug(`Item removed: ${key}`);
    } catch (error) {
      logger.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all items from secure storage
   */
  async clear() {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      const files = await fs.readdir(this.storagePath);
      await Promise.all(
        files
          .filter(file => file.endsWith('.dat') || file.endsWith('.json'))
          .map(file => fs.unlink(path.join(this.storagePath, file)))
      );
      
      logger.info('All items cleared from storage');
    } catch (error) {
      logger.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get all storage keys
   * @returns {Promise<string[]>} - Array of storage keys
   */
  async keys() {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      const files = await fs.readdir(this.storagePath);
      return files
        .filter(file => file.endsWith('.dat') || file.endsWith('.json'))
        .map(file => {
          const ext = path.extname(file);
          return file.slice(0, -ext.length);
        })
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    } catch (error) {
      logger.error('Error listing storage keys:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists in storage
   * @param {string} key - Storage key to check
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async hasItem(key) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      const files = [
        path.join(this.storagePath, `${key}.dat`),
        path.join(this.storagePath, `${key}.json`)
      ];
      
      const results = await Promise.all(
        files.map(file => 
          fs.access(file)
            .then(() => true)
            .catch(() => false)
        )
      );
      
      return results.some(exists => exists);
    } catch (error) {
      logger.error(`Error checking if item ${key} exists:`, error);
      throw error;
    }
  }

  /**
   * Change the encryption passphrase
   * @param {string} oldPassphrase - Current passphrase
   * @param {string} newPassphrase - New passphrase
   */
  async changePassphrase(oldPassphrase, newPassphrase) {
    if (!this.initialized) {
      throw new Error('StorageManager not initialized');
    }
    
    try {
      // Verify old passphrase
      const oldKey = this.encryptionKey;
      await this.verifyPassphrase(oldPassphrase);
      
      // Store all items in memory
      const keys = await this.keys();
      const items = await Promise.all(
        keys.map(async key => [key, await this.getItem(key)])
      );
      
      // Set new passphrase (this will update the encryption key)
      await this.setPassphrase(newPassphrase);
      
      // Re-encrypt all items with the new key
      await Promise.all(
        items.map(([key, value]) => this.setItem(key, value))
      );
      
      logger.info('Passphrase changed successfully');
    } catch (error) {
      logger.error('Error changing passphrase:', error);
      throw error;
    }
  }

  /**
   * Verify if a passphrase is correct
   * @param {string} passphrase - Passphrase to verify
   * @returns {Promise<boolean>} - Whether the passphrase is correct
   */
  async verifyPassphrase(passphrase) {
    if (!passphrase) {
      throw new Error('Passphrase is required');
    }
    
    try {
      // Try to load the salt and derive the key
      const { salt } = await this.loadEncryptionKey();
      if (!salt) {
        throw new Error('No existing encryption key found');
      }
      
      // Derive key using the provided passphrase and stored salt
      const key = crypto.pbkdf2Sync(
        passphrase,
        salt,
        ITERATIONS,
        KEY_LENGTH,
        DIGEST
      );
      
      // Compare with stored key
      return key.equals(this.encryptionKey);
    } catch (error) {
      logger.error('Error verifying passphrase:', error);
      return false;
    }
  }
}

// Export a singleton instance
const storageManager = new StorageManager();
module.exports = storageManager;
