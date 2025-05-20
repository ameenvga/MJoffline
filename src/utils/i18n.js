const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');
const logger = require('./logger');
const stateManager = require('./stateManager');

class I18n {
  constructor() {
    this.translations = new Map();
    this.currentLanguage = 'en';
    this.fallbackLanguage = 'en';
    this.initialized = false;
    this.availableLanguages = [];
  }

  /**
   * Initialize the i18n system
   * @param {string} [defaultLanguage] - Default language code (e.g., 'en')
   */
  async initialize(defaultLanguage) {
    if (this.initialized) {
      logger.warn('I18n already initialized');
      return;
    }

    try {
      // Load built-in translations
      await this.loadTranslations();
      
      // Set current language from state or use system/default
      const savedLanguage = stateManager.get('preferences.language');
      const systemLanguage = app.getLocale().split('-')[0];
      
      this.currentLanguage = savedLanguage || defaultLanguage || systemLanguage || 'en';
      
      // If the saved language isn't available, try to find a close match
      if (!this.translations.has(this.currentLanguage)) {
        const similarLang = this.findSimilarLanguage(this.currentLanguage);
        if (similarLang) {
          this.currentLanguage = similarLang;
          logger.info(`Using similar language: ${similarLang} instead of ${savedLanguage}`);
        } else {
          this.currentLanguage = this.fallbackLanguage;
          logger.warn(`Language ${savedLanguage} not found, falling back to ${this.fallbackLanguage}`);
        }
      }
      
      // Update available languages
      this.availableLanguages = Array.from(this.translations.keys());
      
      this.initialized = true;
      logger.info(`I18n initialized with language: ${this.currentLanguage}`);
    } catch (error) {
      logger.error('Error initializing i18n:', error);
      throw error;
    }
  }

  /**
   * Load all translation files from the translations directory
   */
  async loadTranslations() {
    try {
      const translationsDir = path.join(__dirname, '../../translations');
      
      // Check if translations directory exists
      try {
        await fs.access(translationsDir);
      } catch (error) {
        if (error.code === 'ENOENT') {
          logger.warn('Translations directory not found, using empty translations');
          return;
        }
        throw error;
      }
      
      // Read all JSON files in the translations directory
      const files = await fs.readdir(translationsDir);
      let loadedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const langCode = path.basename(file, '.json');
            const filePath = path.join(translationsDir, file);
            const data = await fs.readFile(filePath, 'utf-8');
            const translations = JSON.parse(data);
            
            this.translations.set(langCode, translations);
            loadedCount++;
            
            logger.debug(`Loaded translations for: ${langCode}`);
          } catch (error) {
            logger.error(`Error loading translation file ${file}:`, error);
          }
        }
      }
      
      if (loadedCount === 0) {
        logger.warn('No translation files found');
      } else {
        logger.info(`Loaded ${loadedCount} translation(s)`);
      }
    } catch (error) {
      logger.error('Error loading translations:', error);
      throw error;
    }
  }

  /**
   * Find a similar language if exact match is not found
   * @param {string} langCode - Language code to find a match for
   * @returns {string|undefined} - Similar language code or undefined
   */
  findSimilarLanguage(langCode) {
    // Try to find a language with the same base (e.g., 'pt-BR' -> 'pt')
    const baseLang = langCode.split('-')[0];
    const availableLangs = Array.from(this.translations.keys());
    
    // First try exact match
    if (availableLangs.includes(langCode)) {
      return langCode;
    }
    
    // Then try base language
    if (baseLang !== langCode && availableLangs.includes(baseLang)) {
      return baseLang;
    }
    
    // Then try case-insensitive match
    const langLower = langCode.toLowerCase();
    for (const lang of availableLangs) {
      if (lang.toLowerCase() === langLower) {
        return lang;
      }
    }
    
    // No match found
    return undefined;
  }

  /**
   * Set the current language
   * @param {string} langCode - Language code to set (e.g., 'en', 'es')
   * @returns {boolean} - Whether the language was set successfully
   */
  setLanguage(langCode) {
    if (!this.translations.has(langCode)) {
      const similarLang = this.findSimilarLanguage(langCode);
      if (!similarLang) {
        logger.warn(`Language not found: ${langCode}`);
        return false;
      }
      langCode = similarLang;
    }
    
    this.currentLanguage = langCode;
    stateManager.set('preferences.language', langCode);
    
    // Notify all windows of the language change
    const { BrowserWindow } = require('electron');
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('language-changed', langCode);
      }
    });
    
    logger.info(`Language set to: ${langCode}`);
    return true;
  }

  /**
   * Get the current language
   * @returns {string} - Current language code
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get all available languages
   * @returns {Array} - Array of language codes
   */
  getAvailableLanguages() {
    return this.availableLanguages;
  }

  /**
   * Translate a key with optional replacements
   * @param {string} key - Translation key (e.g., 'menu.file.open')
   * @param {Object} [replacements] - Key-value pairs for replacements
   * @returns {string} - Translated string with replacements
   */
  t(key, replacements = {}) {
    if (!key || typeof key !== 'string') {
      logger.warn('Invalid translation key:', key);
      return key || '';
    }
    
    // Get translations for current language or fallback
    const translations = this.translations.get(this.currentLanguage) || 
                        this.translations.get(this.fallbackLanguage) || {};
    
    // Get the translation string
    let result = key.split('.').reduce((obj, k) => {
      return (obj && obj[k] !== undefined) ? obj[k] : undefined;
    }, translations);
    
    // If translation not found, try fallback language
    if (result === undefined && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage) || {};
      result = key.split('.').reduce((obj, k) => {
        return (obj && obj[k] !== undefined) ? obj[k] : key;
      }, fallbackTranslations);
    }
    
    // If still not found, return the key
    if (result === undefined) {
      logger.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Apply replacements
    if (typeof result === 'string' && Object.keys(replacements).length > 0) {
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), v);
      });
    }
    
    return result;
  }

  /**
   * Get all translations for the current language
   * @returns {Object} - All translations for the current language
   */
  getAllTranslations() {
    return this.translations.get(this.currentLanguage) || {};
  }

  /**
   * Format a number according to the current locale
   * @param {number} number - Number to format
   * @param {Object} [options] - Intl.NumberFormat options
   * @returns {string} - Formatted number
   */
  formatNumber(number, options = {}) {
    try {
      return new Intl.NumberFormat(this.currentLanguage, options).format(number);
    } catch (error) {
      logger.error('Error formatting number:', error);
      return String(number);
    }
  }

  /**
   * Format a date according to the current locale
   * @param {Date|number|string} date - Date to format
   * @param {Object} [options] - Intl.DateTimeFormat options
   * @returns {string} - Formatted date
   */
  formatDate(date, options = {}) {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(this.currentLanguage, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      }).format(dateObj);
    } catch (error) {
      logger.error('Error formatting date:', error);
      return String(date);
    }
  }

  /**
   * Format a time according to the current locale
   * @param {Date|number|string} time - Time to format
   * @param {Object} [options] - Intl.DateTimeFormat options
   * @returns {string} - Formatted time
   */
  formatTime(time, options = {}) {
    try {
      const dateObj = time instanceof Date ? time : new Date(time);
      return new Intl.DateTimeFormat(this.currentLanguage, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        ...options
      }).format(dateObj);
    } catch (error) {
      logger.error('Error formatting time:', error);
      return String(time);
    }
  }

  /**
   * Format a relative time (e.g., "2 days ago")
   * @param {Date|number|string} time - Time to format
   * @param {string} [unit] - Time unit ('second', 'minute', 'hour', 'day', 'month', 'year')
   * @returns {string} - Formatted relative time
   */
  formatRelativeTime(time, unit) {
    try {
      const date = time instanceof Date ? time : new Date(time);
      const now = new Date();
      const diffInMs = now - date;
      
      // If no unit provided, determine the most appropriate one
      if (!unit) {
        const seconds = Math.floor(diffInMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = (now.getFullYear() - date.getFullYear()) * 12 + 
                      now.getMonth() - date.getMonth();
        const years = now.getFullYear() - date.getFullYear();
        
        if (seconds < 60) {
          unit = 'second';
        } else if (minutes < 60) {
          unit = 'minute';
        } else if (hours < 24) {
          unit = 'hour';
        } else if (days < 30) {
          unit = 'day';
        } else if (months < 12) {
          unit = 'month';
        } else {
          unit = 'year';
        }
      }
      
      // Calculate the value
      let value;
      switch (unit) {
        case 'second':
          value = Math.floor(diffInMs / 1000);
          break;
        case 'minute':
          value = Math.floor(diffInMs / (1000 * 60));
          break;
        case 'hour':
          value = Math.floor(diffInMs / (1000 * 60 * 60));
          break;
        case 'day':
          value = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          break;
        case 'month':
          value = (now.getFullYear() - date.getFullYear()) * 12 + 
                 now.getMonth() - date.getMonth();
          break;
        case 'year':
          value = now.getFullYear() - date.getFullYear();
          break;
        default:
          throw new Error(`Invalid unit: ${unit}`);
      }
      
      // Use Intl.RelativeTimeFormat if available
      if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
        return new Intl.RelativeTimeFormat(this.currentLanguage, {
          numeric: 'auto',
          style: 'long',
        }).format(-value, unit);
      }
      
      // Fallback implementation
      const units = {
        second: ['second', 'seconds'],
        minute: ['minute', 'minutes'],
        hour: ['hour', 'hours'],
        day: ['day', 'days'],
        month: ['month', 'months'],
        year: ['year', 'years']
      };
      
      const unitStr = value === 1 ? units[unit][0] : units[unit][1];
      return `${value} ${unitStr} ago`;
      
    } catch (error) {
      logger.error('Error formatting relative time:', error);
      return '';
    }
  }
}

// Export a singleton instance
const i18n = new I18n();
module.exports = i18n;
