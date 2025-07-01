// Utility functions for the daybook application

// Simple validation rules (inline to avoid circular imports)
const VALIDATION_RULES = {
  VOUCHER_NUMBER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Za-z0-9-_]+$/,
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
};

// Simple currency list (inline to avoid circular imports)
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  },

  // Format date for input fields
  formatDateForInput: (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  // Get today's date in YYYY-MM-DD format
  getToday: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  // Get date N days ago
  getDaysAgo: (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },

  // Check if date is valid
  isValidDate: (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && Boolean(dateString.match(/^\d{4}-\d{2}-\d{2}$/));
  },
};

// Number/Currency utilities
export const currencyUtils = {
  // Format number as currency
  formatCurrency: (amount: number, currencyCode: string = 'USD'): string => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || '$';
    
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  // Parse currency string to number
  parseCurrency: (currencyString: string): number => {
    const cleaned = currencyString.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  },

  // Round to 2 decimal places
  roundCurrency: (amount: number): number => {
    return Math.round(amount * 100) / 100;
  },

  // Check if amount is valid
  isValidAmount: (amount: number): boolean => {
    return !isNaN(amount) && 
           amount >= VALIDATION_RULES.AMOUNT.MIN && 
           amount <= VALIDATION_RULES.AMOUNT.MAX;
  }
};

// Validation utilities
export const validationUtils = {
  // Validate voucher number
  validateVoucherNumber: (voucherNumber: string): { isValid: boolean; error?: string } => {
    if (!voucherNumber.trim()) {
      return { isValid: false, error: 'Voucher number is required' };
    }
    
    if (voucherNumber.length < VALIDATION_RULES.VOUCHER_NUMBER.MIN_LENGTH) {
      return { isValid: false, error: 'Voucher number is too short' };
    }
    
    if (voucherNumber.length > VALIDATION_RULES.VOUCHER_NUMBER.MAX_LENGTH) {
      return { isValid: false, error: 'Voucher number is too long' };
    }
    
    if (!VALIDATION_RULES.VOUCHER_NUMBER.PATTERN.test(voucherNumber)) {
      return { isValid: false, error: 'Voucher number contains invalid characters' };
    }
    
    return { isValid: true };
  },

  // Validate particulars
  validateParticulars: (particulars: string): { isValid: boolean; error?: string } => {
    if (!particulars.trim()) {
      return { isValid: false, error: 'Particulars is required' };
    }
    
    if (particulars.length < VALIDATION_RULES.PARTICULARS.MIN_LENGTH) {
      return { isValid: false, error: 'Particulars is too short' };
    }
    
    if (particulars.length > VALIDATION_RULES.PARTICULARS.MAX_LENGTH) {
      return { isValid: false, error: 'Particulars is too long' };
    }
    
    return { isValid: true };
  },

  // Validate required field
  validateRequired: (value: any, fieldName: string): { isValid: boolean; error?: string } => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    return { isValid: true };
  }
};

// File utilities
export const fileUtils = {
  // Download blob as file
  downloadBlob: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Export all utilities
const utils = {
  dateUtils,
  currencyUtils,
  validationUtils,
  fileUtils,
  debounce,
};

export default utils;
