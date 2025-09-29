import axios from 'axios';
import { 
  DaybookEntry, 
  DaybookFormData, 
  SummaryData, 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse,
  User,
  PayType,
  PayStatus
} from '../types/daybook';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://day-book-backend.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('daybook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('daybook_token');
      localStorage.removeItem('daybook_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication helper functions
export const authUtils = {
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('daybook_token');
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('daybook_token');
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('daybook_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setAuth: (token: string, user: User): void => {
    localStorage.setItem('daybook_token', token);
    localStorage.setItem('daybook_user', JSON.stringify(user));
  },
  
  clearAuth: (): void => {
    localStorage.removeItem('daybook_token');
    localStorage.removeItem('daybook_user');
  }
};

// Utility functions
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const calculateSummaryData = (entries: DaybookEntry[]): SummaryData => {
  const today = new Date();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const todayStr = formatDateForAPI(today);
  const weekStr = formatDateForAPI(oneWeekAgo);
  const monthStr = formatDateForAPI(oneMonthAgo);

  // Filter entries by date
  const todayEntries = entries.filter(entry => 
    entry.created_at.split('T')[0] === todayStr
  );
  const weekEntries = entries.filter(entry => 
    entry.created_at.split('T')[0] >= weekStr
  );
  const monthEntries = entries.filter(entry => 
    entry.created_at.split('T')[0] >= monthStr
  );

  // Calculate totals for each period
  const calculatePeriodTotals = (periodEntries: DaybookEntry[]) => {
    const incoming = periodEntries
      .filter(entry => entry.payment_type === PayType.INCOMING)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const outgoing = periodEntries
      .filter(entry => entry.payment_type === PayType.OUTGOING)
      .reduce((sum, entry) => sum + entry.amount, 0);
    return {
      incoming,
      outgoing,
      net: incoming - outgoing
    };
  };

  return {
    today: calculatePeriodTotals(todayEntries),
    week: calculatePeriodTotals(weekEntries),
    month: calculatePeriodTotals(monthEntries),
  };
};

// Authentication API
export const authApi = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', credentials);
      const { token, user } = response.data;
      authUtils.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      authUtils.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout user
  logout: (): void => {
    authUtils.clearAuth();
  }
};

// Daybook API calls - CONNECTED TO REAL BACKEND
export const daybookApi = {
  // Get all daybook entries
  getAllEntries: async (): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get('/daybook/list');
      return response.data.data.sort((a: DaybookEntry, b: DaybookEntry) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch entries');
    }
  },

  // Get single daybook entry (using getAllEntries and filtering since backend doesn't have single entry endpoint)
  getEntry: async (id: string): Promise<DaybookEntry> => {
    try {
      const entries = await daybookApi.getAllEntries();
      const entry = entries.find(e => e.id.toString() === id);
      if (!entry) {
        throw new Error('Entry not found');
      }
      return entry;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch entry');
    }
  },

  // Create new daybook entry
  createEntry: async (data: DaybookFormData): Promise<DaybookEntry> => {
    try {
      const response = await api.post('/daybook/create', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create entry');
    }
  },

  // Update daybook entry
  updateEntry: async (id: string, data: Partial<DaybookFormData>): Promise<DaybookEntry> => {
    try {
      const response = await api.put(`/daybook/update/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update entry');
    }
  },

  // Delete daybook entry
  deleteEntry: async (id: string): Promise<void> => {
    try {
      await api.delete(`/daybook/delete/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete entry');
    }
  },

  // Get summary data
  getSummary: async (): Promise<SummaryData> => {
    try {
      const entries = await daybookApi.getAllEntries();
      return calculateSummaryData(entries);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch summary data');
    }
  },

  // Get entries by date range
  getEntriesByDateRange: async (startDate: string, endDate: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/date-range?start_date=${startDate}&end_date=${endDate}`);
      return response.data.data.sort((a: DaybookEntry, b: DaybookEntry) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch entries by date range');
    }
  },

  // Get entries from specific date
  getEntriesFromDate: async (startDate: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/from-date?start_date=${startDate}`);
      return response.data.data.sort((a: DaybookEntry, b: DaybookEntry) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch entries from date');
    }
  },

  // Export to CSV
  exportToCsv: async (): Promise<Blob> => {
    try {
      const entries = await daybookApi.getAllEntries();
      
      // Generate CSV content
      const headers = ['ID', 'Date Created', 'ID In/Out', 'Amount', 'Payment Type', 'Payment Status', 'Mode of Payment', 'Description'];
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.id.toString(),
          entry.created_at,
          entry.id_in_out,
          entry.amount.toString(),
          entry.payment_type,
          entry.pay_status,
          entry.mode_of_pay,
          `"${entry.description || ''}"`
        ].join(','))
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export data');
    }
  },

  // Search entries (client-side filtering since backend doesn't have search endpoint)
  searchEntries: async (query: string, filters?: { 
    dateFrom?: string, 
    dateTo?: string, 
    minAmount?: number, 
    maxAmount?: number,
    paymentType?: PayType,
    payStatus?: 'paid' | 'un_paid'
  }): Promise<DaybookEntry[]> => {
    try {
      let entries = await daybookApi.getAllEntries();
      
      // Text search
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        entries = entries.filter(entry => 
          entry.id_in_out.toLowerCase().includes(searchTerm) ||
          (entry.description && entry.description.toLowerCase().includes(searchTerm)) ||
          entry.payment_type.toLowerCase().includes(searchTerm) ||
          entry.mode_of_pay.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply filters
      if (filters) {
        if (filters.dateFrom) {
          entries = entries.filter(entry => 
            entry.created_at.split('T')[0] >= filters.dateFrom!
          );
        }
        if (filters.dateTo) {
          entries = entries.filter(entry => 
            entry.created_at.split('T')[0] <= filters.dateTo!
          );
        }
        if (filters.minAmount !== undefined) {
          entries = entries.filter(entry => entry.amount >= filters.minAmount!);
        }
        if (filters.maxAmount !== undefined) {
          entries = entries.filter(entry => entry.amount <= filters.maxAmount!);
        }
        if (filters.paymentType) {
          entries = entries.filter(entry => entry.payment_type === filters.paymentType);
        }
        if (filters.payStatus) {
          entries = entries.filter(entry => entry.pay_status === filters.payStatus);
        }
      }
      
      return entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search entries');
    }
  },

  // Bulk operations (implemented client-side as backend doesn't have bulk delete)
  bulkDeleteEntries: async (ids: string[]): Promise<void> => {
    try {
      const promises = ids.map(id => daybookApi.deleteEntry(id));
      await Promise.all(promises);
    } catch (error: any) {
      throw new Error('Failed to delete some entries');
    }
  }
};

// Reports API - Generate reports from daybook data
export const reportsApi = {
  generateProfitLoss: async (startDate: string, endDate: string) => {
    try {
      const entries = await daybookApi.getEntriesByDateRange(startDate, endDate);
      
      const totalIncoming = entries
        .filter(entry => entry.payment_type === PayType.INCOMING)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const totalOutgoing = entries
        .filter(entry => entry.payment_type === PayType.OUTGOING)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const netIncome = totalIncoming - totalOutgoing;
      
      return {
        period: { startDate, endDate },
        revenue: totalIncoming,
        expenses: totalOutgoing,
        netIncome,
        entries
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate profit & loss report');
    }
  },

  generateCashFlow: async (startDate: string, endDate: string) => {
    try {
      const entries = await daybookApi.getEntriesByDateRange(startDate, endDate);
      
      const cashInflows = entries
        .filter(entry => entry.payment_type === PayType.INCOMING && entry.pay_status === PayStatus.PAID)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const cashOutflows = entries
        .filter(entry => entry.payment_type === PayType.OUTGOING && entry.pay_status === PayStatus.PAID)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const netCashFlow = cashInflows - cashOutflows;
      
      return {
        period: { startDate, endDate },
        inflows: cashInflows,
        outflows: cashOutflows,
        netCashFlow,
        entries
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate cash flow report');
    }
  },

  generateSummaryReport: async (startDate: string, endDate: string) => {
    try {
      const entries = await daybookApi.getEntriesByDateRange(startDate, endDate);
      
      const totalEntries = entries.length;
      const paidEntries = entries.filter(entry => entry.pay_status === PayStatus.PAID).length;
      const unpaidEntries = entries.filter(entry => entry.pay_status === PayStatus.UNPAID).length;
      
      const totalIncoming = entries
        .filter(entry => entry.payment_type === PayType.INCOMING)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const totalOutgoing = entries
        .filter(entry => entry.payment_type === PayType.OUTGOING)
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        period: { startDate, endDate },
        totalEntries,
        paidEntries,
        unpaidEntries,
        totalIncoming,
        totalOutgoing,
        netAmount: totalIncoming - totalOutgoing,
        entries
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate summary report');
    }
  }
};

// Settings API - Local storage based settings
const DEFAULT_SETTINGS = {
  companyName: 'Your Company Name',
  companyAddress: 'Your Company Address',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light' as const,
  itemsPerPage: 10,
  autoBackup: true,
  notifications: true
};

export const settingsApi = {
  getSettings: async () => {
    const saved = localStorage.getItem('daybook_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
  },

  updateSettings: async (updates: Partial<typeof DEFAULT_SETTINGS>) => {
    const current = await settingsApi.getSettings();
    const newSettings = { ...current, ...updates };
    localStorage.setItem('daybook_settings', JSON.stringify(newSettings));
    return newSettings;
  },

  resetSettings: async () => {
    localStorage.removeItem('daybook_settings');
    return { ...DEFAULT_SETTINGS };
  },

  exportData: async () => {
    try {
      const entries = await daybookApi.getAllEntries();
      const settings = await settingsApi.getSettings();
      
      const exportData = {
        entries,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const jsonContent = JSON.stringify(exportData, null, 2);
      return new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export data');
    }
  }
};

export default api;
