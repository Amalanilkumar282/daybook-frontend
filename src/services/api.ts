// import axios from 'axios';
import { DaybookEntry, DaybookFormData, SummaryData } from '../types/daybook';

// BACKEND CONNECTION - COMMENTED OUT FOR FRONTEND DEMO
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
// 
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// 
// // Request interceptor for auth tokens (if needed later)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
// 
// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// DUMMY DATA FOR FRONTEND DEVELOPMENT
let dummyEntries: DaybookEntry[] = [
  {
    _id: '1',
    date: '2025-06-30',
    particulars: 'Office Supplies Purchase',
    voucherNumber: 'V001',
    debit: 250.00,
    credit: 0,
    createdAt: '2025-06-30T08:00:00.000Z',
    updatedAt: '2025-06-30T08:00:00.000Z',
  },
  {
    _id: '2',
    date: '2025-06-29',
    particulars: 'Client Service Revenue',
    voucherNumber: 'V002',
    debit: 0,
    credit: 1500.00,
    createdAt: '2025-06-29T14:30:00.000Z',
    updatedAt: '2025-06-29T14:30:00.000Z',
  },
  {
    _id: '3',
    date: '2025-06-28',
    particulars: 'Rent Payment',
    voucherNumber: 'V003',
    debit: 800.00,
    credit: 0,
    createdAt: '2025-06-28T10:15:00.000Z',
    updatedAt: '2025-06-28T10:15:00.000Z',
  },
  {
    _id: '4',
    date: '2025-06-27',
    particulars: 'Consulting Fee Received',
    voucherNumber: 'V004',
    debit: 0,
    credit: 2000.00,
    createdAt: '2025-06-27T16:45:00.000Z',
    updatedAt: '2025-06-27T16:45:00.000Z',
  },
  {
    _id: '5',
    date: '2025-06-26',
    particulars: 'Equipment Purchase',
    voucherNumber: 'V005',
    debit: 1200.00,
    credit: 0,
    createdAt: '2025-06-26T11:20:00.000Z',
    updatedAt: '2025-06-26T11:20:00.000Z',
  },
  {
    _id: '6',
    date: '2025-06-25',
    particulars: 'Software License Revenue',
    voucherNumber: 'V006',
    debit: 0,
    credit: 800.00,
    createdAt: '2025-06-25T09:30:00.000Z',
    updatedAt: '2025-06-25T09:30:00.000Z',
  },
  {
    _id: '7',
    date: '2025-06-24',
    particulars: 'Utility Bills',
    voucherNumber: 'V007',
    debit: 180.00,
    credit: 0,
    createdAt: '2025-06-24T13:10:00.000Z',
    updatedAt: '2025-06-24T13:10:00.000Z',
  },
  {
    _id: '8',
    date: '2025-06-23',
    particulars: 'Training Program Income',
    voucherNumber: 'V008',
    debit: 0,
    credit: 1200.00,
    createdAt: '2025-06-23T15:45:00.000Z',
    updatedAt: '2025-06-23T15:45:00.000Z',
  },
  {
    _id: '9',
    date: '2025-06-22',
    particulars: 'Marketing Expenses',
    voucherNumber: 'V009',
    debit: 450.00,
    credit: 0,
    createdAt: '2025-06-22T12:20:00.000Z',
    updatedAt: '2025-06-22T12:20:00.000Z',
  },
  {
    _id: '10',
    date: '2025-06-21',
    particulars: 'Product Sales Revenue',
    voucherNumber: 'V010',
    debit: 0,
    credit: 3200.00,
    createdAt: '2025-06-21T17:30:00.000Z',
    updatedAt: '2025-06-21T17:30:00.000Z',
  },
  {
    _id: '11',
    date: '2025-06-20',
    particulars: 'Travel Expenses',
    voucherNumber: 'V011',
    debit: 320.00,
    credit: 0,
    createdAt: '2025-06-20T09:45:00.000Z',
    updatedAt: '2025-06-20T09:45:00.000Z',
  },
  {
    _id: '12',
    date: '2025-06-19',
    particulars: 'Insurance Premium',
    voucherNumber: 'V012',
    debit: 600.00,
    credit: 0,
    createdAt: '2025-06-19T14:15:00.000Z',
    updatedAt: '2025-06-19T14:15:00.000Z',
  },
  {
    _id: '13',
    date: '2025-06-18',
    particulars: 'Interest Income',
    voucherNumber: 'V013',
    debit: 0,
    credit: 125.00,
    createdAt: '2025-06-18T11:00:00.000Z',
    updatedAt: '2025-06-18T11:00:00.000Z',
  },
  {
    _id: '14',
    date: '2025-06-17',
    particulars: 'Telephone Bill',
    voucherNumber: 'V014',
    debit: 85.00,
    credit: 0,
    createdAt: '2025-06-17T16:20:00.000Z',
    updatedAt: '2025-06-17T16:20:00.000Z',
  },
  {
    _id: '15',
    date: '2025-06-16',
    particulars: 'Freelance Project Payment',
    voucherNumber: 'V015',
    debit: 0,
    credit: 2500.00,
    createdAt: '2025-06-16T13:45:00.000Z',
    updatedAt: '2025-06-16T13:45:00.000Z',
  }
];

// Dummy data for account categories
let accountCategories = [
  { id: '1', name: 'Revenue', type: 'credit' },
  { id: '2', name: 'Expenses', type: 'debit' },
  { id: '3', name: 'Assets', type: 'debit' },
  { id: '4', name: 'Liabilities', type: 'credit' },
  { id: '5', name: 'Equity', type: 'credit' }
];

// Dummy data for reports
let reportTemplates = [
  { id: '1', name: 'Trial Balance', description: 'Shows all accounts with their debit and credit balances' },
  { id: '2', name: 'Profit & Loss', description: 'Shows revenue and expenses for a period' },
  { id: '3', name: 'Balance Sheet', description: 'Shows assets, liabilities, and equity at a point in time' },
  { id: '4', name: 'Cash Flow', description: 'Shows cash inflows and outflows' },
  { id: '5', name: 'Daily Summary', description: 'Daily transaction summary' }
];

// Dummy user settings
let userSettings = {
  companyName: 'Demo Company Ltd.',
  companyAddress: '123 Business Street, Commerce City, BC 12345',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  itemsPerPage: 10,
  autoBackup: true,
  notifications: true
};

// Utility function to simulate API delay
const simulateApiDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility function to generate dummy summary data
const generateDummySummaryData = (): SummaryData => {
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Calculate today's totals
  const todayEntries = dummyEntries.filter(entry => entry.date === today);
  const todayDebit = todayEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const todayCredit = todayEntries.reduce((sum, entry) => sum + entry.credit, 0);

  // Calculate week's totals
  const weekEntries = dummyEntries.filter(entry => entry.date >= oneWeekAgo);
  const weekDebit = weekEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const weekCredit = weekEntries.reduce((sum, entry) => sum + entry.credit, 0);

  // Calculate month's totals
  const monthEntries = dummyEntries.filter(entry => entry.date >= oneMonthAgo);
  const monthDebit = monthEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const monthCredit = monthEntries.reduce((sum, entry) => sum + entry.credit, 0);

  return {
    today: { debit: todayDebit, credit: todayCredit },
    week: { debit: weekDebit, credit: weekCredit },
    month: { debit: monthDebit, credit: monthCredit },
  };
};

// Daybook API calls - USING DUMMY DATA FOR FRONTEND DEVELOPMENT
export const daybookApi = {
  // Get all daybook entries
  getAllEntries: async (): Promise<DaybookEntry[]> => {
    await simulateApiDelay();
    return [...dummyEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get single daybook entry
  getEntry: async (id: string): Promise<DaybookEntry> => {
    await simulateApiDelay();
    const entry = dummyEntries.find(e => e._id === id);
    if (!entry) {
      throw new Error('Entry not found');
    }
    return entry;
  },

  // Create new daybook entry
  createEntry: async (data: DaybookFormData): Promise<DaybookEntry> => {
    await simulateApiDelay();
    const newEntry: DaybookEntry = {
      _id: (Date.now()).toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyEntries.push(newEntry);
    return newEntry;
  },

  // Update daybook entry
  updateEntry: async (id: string, data: DaybookFormData): Promise<DaybookEntry> => {
    await simulateApiDelay();
    const entryIndex = dummyEntries.findIndex(e => e._id === id);
    if (entryIndex === -1) {
      throw new Error('Entry not found');
    }
    const updatedEntry: DaybookEntry = {
      ...dummyEntries[entryIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    dummyEntries[entryIndex] = updatedEntry;
    return updatedEntry;
  },

  // Delete daybook entry
  deleteEntry: async (id: string): Promise<void> => {
    await simulateApiDelay();
    const entryIndex = dummyEntries.findIndex(e => e._id === id);
    if (entryIndex === -1) {
      throw new Error('Entry not found');
    }
    dummyEntries.splice(entryIndex, 1);
  },

  // Get summary data
  getSummary: async (): Promise<SummaryData> => {
    await simulateApiDelay();
    return generateDummySummaryData();
  },

  // Export to CSV
  exportToCsv: async (): Promise<Blob> => {
    await simulateApiDelay();
    
    // Generate CSV content
    const headers = ['Date', 'Particulars', 'Voucher Number', 'Debit', 'Credit'];
    const csvContent = [
      headers.join(','),
      ...dummyEntries.map(entry => [
        entry.date,
        `"${entry.particulars}"`,
        entry.voucherNumber,
        entry.debit.toString(),
        entry.credit.toString()
      ].join(','))
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },

  // Search entries
  searchEntries: async (query: string, filters?: { 
    dateFrom?: string, 
    dateTo?: string, 
    minAmount?: number, 
    maxAmount?: number 
  }): Promise<DaybookEntry[]> => {
    await simulateApiDelay();
    
    let filteredEntries = [...dummyEntries];
    
    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredEntries = filteredEntries.filter(entry => 
        entry.particulars.toLowerCase().includes(searchTerm) ||
        entry.voucherNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    // Date range filter
    if (filters?.dateFrom) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= filters.dateTo!);
    }
    
    // Amount filters
    if (filters?.minAmount !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        Math.max(entry.debit, entry.credit) >= filters.minAmount!
      );
    }
    if (filters?.maxAmount !== undefined) {
      filteredEntries = filteredEntries.filter(entry => 
        Math.max(entry.debit, entry.credit) <= filters.maxAmount!
      );
    }
    
    return filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Get entries by date range
  getEntriesByDateRange: async (startDate: string, endDate: string): Promise<DaybookEntry[]> => {
    await simulateApiDelay();
    return dummyEntries
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Bulk operations
  bulkDeleteEntries: async (ids: string[]): Promise<void> => {
    await simulateApiDelay();
    ids.forEach(id => {
      const index = dummyEntries.findIndex(e => e._id === id);
      if (index !== -1) {
        dummyEntries.splice(index, 1);
      }
    });
  },

  // Validate voucher number uniqueness
  validateVoucherNumber: async (voucherNumber: string, excludeId?: string): Promise<boolean> => {
    await simulateApiDelay();
    const exists = dummyEntries.some(entry => 
      entry.voucherNumber === voucherNumber && 
      (excludeId ? entry._id !== excludeId : true)
    );
    return !exists; // Returns true if valid (not existing)
  }
};

// Account Categories API
export const accountCategoriesApi = {
  getCategories: async () => {
    await simulateApiDelay();
    return [...accountCategories];
  },

  createCategory: async (data: { name: string, type: 'debit' | 'credit' }) => {
    await simulateApiDelay();
    const newCategory = {
      id: (Date.now()).toString(),
      ...data
    };
    accountCategories.push(newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, data: { name: string, type: 'debit' | 'credit' }) => {
    await simulateApiDelay();
    const index = accountCategories.findIndex(cat => cat.id === id);
    if (index === -1) throw new Error('Category not found');
    accountCategories[index] = { ...accountCategories[index], ...data };
    return accountCategories[index];
  },

  deleteCategory: async (id: string) => {
    await simulateApiDelay();
    const index = accountCategories.findIndex(cat => cat.id === id);
    if (index === -1) throw new Error('Category not found');
    accountCategories.splice(index, 1);
  }
};

// Reports API
export const reportsApi = {
  getReportTemplates: async () => {
    await simulateApiDelay();
    return [...reportTemplates];
  },

  generateTrialBalance: async (asOfDate: string) => {
    await simulateApiDelay();
    
    // Calculate balances up to the specified date
    const relevantEntries = dummyEntries.filter(entry => entry.date <= asOfDate);
    
    // Group by particulars (simplified trial balance)
    const balances: { [key: string]: { debit: number, credit: number } } = {};
    
    relevantEntries.forEach(entry => {
      if (!balances[entry.particulars]) {
        balances[entry.particulars] = { debit: 0, credit: 0 };
      }
      balances[entry.particulars].debit += entry.debit;
      balances[entry.particulars].credit += entry.credit;
    });
    
    return Object.entries(balances).map(([account, balance]) => ({
      account,
      debit: balance.debit,
      credit: balance.credit,
      netBalance: balance.debit - balance.credit
    }));
  },

  generateProfitLoss: async (startDate: string, endDate: string) => {
    await simulateApiDelay();
    
    const relevantEntries = dummyEntries.filter(
      entry => entry.date >= startDate && entry.date <= endDate
    );
    
    // Simplified P&L - assuming credits are revenue and debits are expenses
    const totalRevenue = relevantEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const totalExpenses = relevantEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    return {
      period: { startDate, endDate },
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome,
      entries: relevantEntries
    };
  },

  generateCashFlow: async (startDate: string, endDate: string) => {
    await simulateApiDelay();
    
    const relevantEntries = dummyEntries.filter(
      entry => entry.date >= startDate && entry.date <= endDate
    );
    
    const cashInflows = relevantEntries.reduce((sum, entry) => sum + entry.credit, 0);
    const cashOutflows = relevantEntries.reduce((sum, entry) => sum + entry.debit, 0);
    const netCashFlow = cashInflows - cashOutflows;
    
    return {
      period: { startDate, endDate },
      inflows: cashInflows,
      outflows: cashOutflows,
      netCashFlow,
      entries: relevantEntries
    };
  }
};

// Settings API
export const settingsApi = {
  getSettings: async () => {
    await simulateApiDelay();
    return { ...userSettings };
  },

  updateSettings: async (updates: Partial<typeof userSettings>) => {
    await simulateApiDelay();
    userSettings = { ...userSettings, ...updates };
    return { ...userSettings };
  },

  resetSettings: async () => {
    await simulateApiDelay();
    userSettings = {
      companyName: 'Demo Company Ltd.',
      companyAddress: '123 Business Street, Commerce City, BC 12345',
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light',
      itemsPerPage: 10,
      autoBackup: true,
      notifications: true
    };
    return { ...userSettings };
  },

  exportData: async () => {
    await simulateApiDelay();
    const exportData = {
      entries: dummyEntries,
      categories: accountCategories,
      settings: userSettings,
      exportDate: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  },

  importData: async (file: File) => {
    await simulateApiDelay();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          
          if (importData.entries) {
            dummyEntries = [...importData.entries];
          }
          if (importData.categories) {
            accountCategories = [...importData.categories];
          }
          if (importData.settings) {
            userSettings = { ...userSettings, ...importData.settings };
          }
          
          resolve({ success: true, message: 'Data imported successfully' });
        } catch (error) {
          reject(new Error('Invalid file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};

// For backward compatibility - export a dummy axios instance
const dummyApi = {
  get: () => Promise.resolve({ data: { data: [] } }),
  post: () => Promise.resolve({ data: { data: {} } }),
  put: () => Promise.resolve({ data: { data: {} } }),
  delete: () => Promise.resolve({ data: { success: true } }),
};

export default dummyApi;
