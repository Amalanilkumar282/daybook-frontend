// Application Constants and Configuration

// API Configuration
export const API_CONFIG = {
  // BACKEND CONNECTION - UNCOMMENT WHEN READY
  // BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  // TIMEOUT: 10000,
  
  // DUMMY DATA CONFIGURATION (REMOVE WHEN BACKEND IS READY)
  SIMULATE_DELAY: 500, // milliseconds
  DUMMY_MODE: true,
};

// Application Settings
export const APP_CONFIG = {
  NAME: 'Daybook System',
  VERSION: '1.0.0',
  COMPANY_NAME: process.env.REACT_APP_COMPANY_NAME || 'Demo Company Ltd.',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_DATE_FORMAT: 'YYYY-MM-DD',
};

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 100,
  DEFAULT_THEME: 'light',
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300, // for search inputs
};

// Validation Rules
export const VALIDATION_RULES = {
  VOUCHER_NUMBER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Za-z0-9-_]+$/, // alphanumeric, hyphens, underscores
  },
  PARTICULARS: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255,
  },
  AMOUNT: {
    MIN: 0.01,
    MAX: 999999999.99,
    DECIMAL_PLACES: 2,
  },
  COMPANY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  ADDRESS: {
    MAX_LENGTH: 500,
  },
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  EXPORT: 'YYYY-MM-DD',
  REPORT_TITLE: 'MMMM YYYY',
};

// Currency Options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Theme Colors
export const THEME_COLORS = {
  light: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
  },
};

// Report Types
export const REPORT_TYPES = {
  TRIAL_BALANCE: 'trial-balance',
  PROFIT_LOSS: 'profit-loss',
  BALANCE_SHEET: 'balance-sheet',
  CASH_FLOW: 'cash-flow',
  DAILY_SUMMARY: 'daily-summary',
};

// Account Types
export const ACCOUNT_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
};

// Status Messages
export const MESSAGES = {
  SUCCESS: {
    ENTRY_CREATED: 'Entry created successfully!',
    ENTRY_UPDATED: 'Entry updated successfully!',
    ENTRY_DELETED: 'Entry deleted successfully!',
    ENTRIES_DELETED: 'Entries deleted successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!',
    DATA_EXPORTED: 'Data exported successfully!',
    DATA_IMPORTED: 'Data imported successfully!',
  },
  ERROR: {
    GENERIC: 'An error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    NOT_FOUND: 'Record not found.',
    DUPLICATE_VOUCHER: 'Voucher number already exists.',
    INVALID_DATE: 'Please enter a valid date.',
    INVALID_AMOUNT: 'Please enter a valid amount.',
    REQUIRED_FIELD: 'This field is required.',
    FILE_UPLOAD: 'Error uploading file. Please try again.',
    EXPORT_FAILED: 'Export failed. Please try again.',
    IMPORT_FAILED: 'Import failed. Please check the file format.',
  },
  CONFIRM: {
    DELETE_ENTRY: 'Are you sure you want to delete this entry?',
    DELETE_ENTRIES: 'Are you sure you want to delete the selected entries?',
    RESET_SETTINGS: 'Are you sure you want to reset all settings to default?',
    IMPORT_DATA: 'This will replace all existing data. Are you sure?',
  },
};

// File Export Settings
export const EXPORT_CONFIG = {
  CSV: {
    FILENAME: 'daybook-entries',
    HEADERS: ['Date', 'Particulars', 'Voucher Number', 'Debit', 'Credit'],
    MIME_TYPE: 'text/csv',
  },
  JSON: {
    FILENAME: 'daybook-backup',
    MIME_TYPE: 'application/json',
    INDENT: 2,
  },
  PDF: {
    FILENAME: 'daybook-report',
    MIME_TYPE: 'application/pdf',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'daybook_theme',
  SETTINGS: 'daybook_settings',
  LAST_BACKUP: 'daybook_last_backup',
  USER_PREFERENCES: 'daybook_user_preferences',
  SEARCH_HISTORY: 'daybook_search_history',
};

// API Endpoints (for reference - currently using dummy data)
export const ENDPOINTS = {
  // Entries
  ENTRIES: '/entries',
  ENTRY_BY_ID: (id: string) => `/entries/${id}`,
  ENTRIES_SEARCH: '/entries/search',
  ENTRIES_BULK_DELETE: '/entries/bulk',
  ENTRIES_EXPORT_CSV: '/entries/export/csv',
  VALIDATE_VOUCHER: '/entries/validate-voucher',
  
  // Reports
  REPORTS: '/reports',
  REPORT_TEMPLATES: '/reports/templates',
  TRIAL_BALANCE: '/reports/trial-balance',
  PROFIT_LOSS: '/reports/profit-loss',
  CASH_FLOW: '/reports/cash-flow',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
  
  // Settings
  SETTINGS: '/settings',
  SETTINGS_RESET: '/settings/reset',
  SETTINGS_EXPORT: '/settings/export',
  SETTINGS_IMPORT: '/settings/import',
  
  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  
  // Authentication (optional)
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
};

// Feature Flags
export const FEATURES = {
  AUTHENTICATION: false, // Set to true when auth is implemented
  MULTI_CURRENCY: false, // Future feature
  ADVANCED_REPORTS: true,
  BULK_OPERATIONS: true,
  DATA_BACKUP: true,
  THEME_SWITCHING: true,
  EXPORT_PDF: false, // Future feature
  AUDIT_TRAIL: false, // Future feature
  USER_PERMISSIONS: false, // Future feature
};

// Error Codes (for backend integration)
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  companyName: 'Demo Company Ltd.',
  companyAddress: '123 Business Street, Commerce City, BC 12345',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  itemsPerPage: 10,
  autoBackup: true,
  notifications: true,
};

const constants = {
  API_CONFIG,
  APP_CONFIG,
  UI_CONFIG,
  VALIDATION_RULES,
  DATE_FORMATS,
  CURRENCIES,
  THEME_COLORS,
  REPORT_TYPES,
  ACCOUNT_TYPES,
  MESSAGES,
  EXPORT_CONFIG,
  STORAGE_KEYS,
  ENDPOINTS,
  FEATURES,
  ERROR_CODES,
  DEFAULT_SETTINGS,
};

export default constants;
