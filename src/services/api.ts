import axios from 'axios';
import { 
  DaybookEntry, 
  DaybookFormData, 
  SummaryData,
  SummaryAmountsResponse,
  RevenueNetResponse,
  LoginCredentials, 
  RegisterCredentials,
  CreateAdminCredentials,
  AuthResponse,
  User,
  PayType,
  PayStatus,
  Tenant
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
  
  // Decode JWT token to see payload (for debugging)
  decodeToken: (): any => {
    const token = localStorage.getItem('daybook_token');
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  },
  
  setAuth: (token: string, user: User): void => {
    localStorage.setItem('daybook_token', token);
    localStorage.setItem('daybook_user', JSON.stringify(user));
  },
  
  clearAuth: (): void => {
    localStorage.removeItem('daybook_token');
    localStorage.removeItem('daybook_user');
  },

  isAdmin: (): boolean => {
    const user = authUtils.getUser();
    return user?.role === 'admin';
  }
};

// Authentication API
export const authApi = {
  // Register new user (requires admin role)
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', credentials);
      const { token, user } = response.data;
      authUtils.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Registration failed');
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
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Login failed');
    }
  },

  // Create admin user (bootstrap first admin)
  createAdmin: async (credentials: CreateAdminCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/create-admin', credentials);
      const { token, user } = response.data;
      authUtils.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Admin creation failed');
    }
  },

  // Get current user info
  me: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch user info');
    }
  },

  // Admin test endpoint
  adminTest: async (): Promise<any> => {
    try {
      const response = await api.get('/auth/admin-test');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Admin test failed');
    }
  },

  // Logout user
  logout: (): void => {
    authUtils.clearAuth();
  }
};

// Daybook API calls - CONNECTED TO REAL BACKEND
export const daybookApi = {
  // Get all daybook entries with optional filters
  getAllEntries: async (filters?: {
    type?: PayType;
    nurse_id?: string;
    client_id?: string;
  }): Promise<DaybookEntry[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.nurse_id) params.append('nurse_id', filters.nurse_id);
      if (filters?.client_id) params.append('client_id', filters.client_id);
      
      const queryString = params.toString();
      const url = queryString ? `/daybook/list?${queryString}` : '/daybook/list';
      
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch entries');
    }
  },

  // Get single daybook entry by ID
  getEntry: async (id: string): Promise<DaybookEntry> => {
    try {
      const response = await api.get(`/daybook/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch entry');
    }
  },

  // Get entries for a specific nurse
  getEntriesByNurse: async (nurse_id: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/nurse/${nurse_id}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch nurse entries');
    }
  },

  // Get entries for a specific client
  getEntriesByClient: async (client_id: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/client/${client_id}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch client entries');
    }
  },

  // Create new daybook entry
  createEntry: async (data: DaybookFormData): Promise<DaybookEntry> => {
    try {
      // Get current user for debugging
      const currentUser = authUtils.getUser();
      const tokenPayload = authUtils.decodeToken();
      console.log('=== CREATE ENTRY DEBUG ===');
      console.log('Current user from localStorage:', currentUser);
      console.log('JWT token payload:', tokenPayload);
      console.log('Data received:', { ...data, receipt: data.receipt ? 'FILE' : undefined });
      console.log('Tenant being sent:', data.tenant);
      console.log('User tenant:', currentUser?.tenant);
      console.log('Token tenant:', tokenPayload?.tenant || tokenPayload?.user_metadata?.tenant);
      console.log('Match:', data.tenant === currentUser?.tenant);
      
      // If receipt file is present, use multipart/form-data
      if (data.receipt) {
        const formData = new FormData();
        formData.append('amount', data.amount.toString());
        formData.append('payment_type', data.payment_type);
        formData.append('pay_status', data.pay_status);
        formData.append('tenant', data.tenant);
        
        if (data.mode_of_pay) formData.append('mode_of_pay', data.mode_of_pay);
        if (data.description) formData.append('description', data.description);
        // Only add IDs if they exist and are not empty
        if (data.nurse_id && data.nurse_id.trim() !== '') formData.append('nurse_id', data.nurse_id.trim());
        if (data.client_id && data.client_id.trim() !== '') formData.append('client_id', data.client_id.trim());
        if (data.receipt) formData.append('receipt', data.receipt);

        console.log('Form data keys:', Array.from(formData.keys()));
        console.log('Checking FormData entries...');
        Array.from(formData.keys()).forEach(key => {
          const value = formData.get(key);
          console.log(`  ${key}:`, value instanceof File ? 'FILE' : value);
        });
        
        const response = await api.post('/daybook/create', formData);
        return response.data.data || response.data;
      } else {
        // Use JSON for non-file uploads
        const payload: any = {
          amount: data.amount,
          payment_type: data.payment_type,
          pay_status: data.pay_status,
          tenant: data.tenant,
        };
        
        if (data.mode_of_pay) payload.mode_of_pay = data.mode_of_pay;
        if (data.description) payload.description = data.description;
        // Only add IDs if they exist and are not empty
        if (data.nurse_id && data.nurse_id.trim() !== '') payload.nurse_id = data.nurse_id.trim();
        if (data.client_id && data.client_id.trim() !== '') payload.client_id = data.client_id.trim();

        console.log('Creating entry (JSON):', payload);

        const response = await api.post('/daybook/create', payload);
        return response.data.data || response.data;
      }
    } catch (error: any) {
      console.error('=== CREATE ENTRY ERROR ===');
      console.error('Full error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to create entry';
      throw new Error(errorMsg);
    }
  },

  // Update daybook entry
  updateEntry: async (id: string, data: Partial<DaybookFormData>): Promise<DaybookEntry> => {
    try {
      // If receipt file is present, use multipart/form-data
      if (data.receipt) {
        const formData = new FormData();
        if (data.amount !== undefined) formData.append('amount', data.amount.toString());
        if (data.payment_type) formData.append('payment_type', data.payment_type);
        if (data.pay_status) formData.append('pay_status', data.pay_status);
        if (data.tenant) formData.append('tenant', data.tenant);
        if (data.mode_of_pay) formData.append('mode_of_pay', data.mode_of_pay);
        if (data.description) formData.append('description', data.description);
        if (data.nurse_id) formData.append('nurse_id', data.nurse_id);
        if (data.client_id) formData.append('client_id', data.client_id);
        if (data.receipt) formData.append('receipt', data.receipt);

        const response = await api.put(`/daybook/update/${id}`, formData);
        return response.data.data || response.data;
      } else {
        const response = await api.put(`/daybook/update/${id}`, data);
        return response.data.data || response.data;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update entry');
    }
  },

  // Delete daybook entry
  deleteEntry: async (id: string): Promise<void> => {
    try {
      await api.delete(`/daybook/delete/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete entry');
    }
  },

  // Get entries by date range
  getEntriesByDateRange: async (startDate: string, endDate: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/date-range?start_date=${startDate}&end_date=${endDate}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch entries by date range');
    }
  },

  // Get entries from specific date
  getEntriesFromDate: async (startDate: string): Promise<DaybookEntry[]> => {
    try {
      const response = await api.get(`/daybook/from-date?start_date=${startDate}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch entries from date');
    }
  },

  // Download Excel export
  downloadExcel: async (filters?: {
    start_date?: string;
    end_date?: string;
    type?: PayType;
  }): Promise<Blob> => {
    try {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.type) params.append('type', filters.type);
      
      const queryString = params.toString();
      const url = queryString ? `/daybook/download/excel?${queryString}` : '/daybook/download/excel';
      
      const response = await api.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to download Excel file');
    }
  },

  // Get summary amounts (paid/pending)
  getSummaryAmounts: async (filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<SummaryAmountsResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      
      const queryString = params.toString();
      const url = queryString ? `/daybook/summary/amounts?${queryString}` : '/daybook/summary/amounts';
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch summary amounts');
    }
  },

  // Get net revenue (incoming - outgoing)
  getNetRevenue: async (filters?: {
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueNetResponse> => {
    try {
      const params = new URLSearchParams();
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      
      const queryString = params.toString();
      const url = queryString ? `/daybook/revenue/net?${queryString}` : '/daybook/revenue/net';
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch net revenue');
    }
  },

  // Get summary data for dashboard (calculated from entries)
  getSummary: async (): Promise<SummaryData> => {
    try {
      console.log('=== GET SUMMARY DEBUG ===');
      
      // Fetch all entries and calculate summary client-side
      const entries = await daybookApi.getAllEntries();
      console.log('Total entries fetched:', entries.length);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      console.log('Date ranges:', {
        today: today.toISOString().split('T')[0],
        weekStart: oneWeekAgo.toISOString().split('T')[0],
        monthStart: oneMonthAgo.toISOString().split('T')[0]
      });
      
      // Helper function to check if entry is within date range
      const isWithinRange = (entryDate: string, startDate: Date, endDate: Date): boolean => {
        const entry = new Date(entryDate);
        return entry >= startDate && entry <= endDate;
      };
      
      // Calculate summary for a date range
      const calculateSummary = (startDate: Date, endDate: Date) => {
        const filteredEntries = entries.filter(entry => 
          isWithinRange(entry.created_at, startDate, endDate)
        );
        
        const incoming = filteredEntries
          .filter(entry => entry.payment_type === PayType.INCOMING)
          .reduce((sum, entry) => sum + entry.amount, 0);
          
        const outgoing = filteredEntries
          .filter(entry => entry.payment_type === PayType.OUTGOING)
          .reduce((sum, entry) => sum + entry.amount, 0);
          
        const net = incoming - outgoing;
        
        return { incoming, outgoing, net };
      };
      
      const summary = {
        today: calculateSummary(today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)), // End of today
        week: calculateSummary(oneWeekAgo, now),
        month: calculateSummary(oneMonthAgo, now),
      };
      
      console.log('Summary calculated:', summary);
      return summary;
    } catch (error: any) {
      console.error('=== GET SUMMARY ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      throw new Error(error.message || 'Failed to fetch summary data');
    }
  },

  // Search entries (client-side filtering)
  searchEntries: async (query: string, filters?: { 
    dateFrom?: string, 
    dateTo?: string, 
    minAmount?: number, 
    maxAmount?: number,
    paymentType?: PayType,
    payStatus?: 'paid' | 'un_paid',
    tenant?: Tenant
  }): Promise<DaybookEntry[]> => {
    try {
      let entries = await daybookApi.getAllEntries();
      
      // Text search
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        entries = entries.filter(entry => 
          (entry.nurse_id && entry.nurse_id.toLowerCase().includes(searchTerm)) ||
          (entry.client_id && entry.client_id.toLowerCase().includes(searchTerm)) ||
          (entry.description && entry.description.toLowerCase().includes(searchTerm)) ||
          entry.payment_type.toLowerCase().includes(searchTerm) ||
          entry.mode_of_pay.toLowerCase().includes(searchTerm) ||
          entry.tenant.toLowerCase().includes(searchTerm)
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
        if (filters.tenant) {
          entries = entries.filter(entry => entry.tenant === filters.tenant);
        }
      }
      
      return entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search entries');
    }
  },

  // Bulk operations
  bulkDeleteEntries: async (ids: string[]): Promise<void> => {
    try {
      const promises = ids.map(id => daybookApi.deleteEntry(id));
      await Promise.all(promises);
    } catch (error: any) {
      throw new Error('Failed to delete some entries');
    }
  },

  // Export to CSV (client-side generation)
  exportToCsv: async (): Promise<Blob> => {
    try {
      const entries = await daybookApi.getAllEntries();
      
      // Generate CSV content
      const headers = ['ID', 'Date', 'Amount', 'Payment Type', 'Status', 'Mode', 'Tenant', 'Nurse ID', 'Client ID', 'Description'];
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.id.toString(),
          entry.created_at,
          entry.amount.toString(),
          entry.payment_type,
          entry.pay_status,
          entry.mode_of_pay,
          entry.tenant,
          entry.nurse_id || '',
          entry.client_id || '',
          `"${entry.description || ''}"`
        ].join(','))
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export data');
    }
  }
};

// Reports API - Generate reports from daybook data
export const reportsApi = {
  generateProfitLoss: async (startDate: string, endDate: string) => {
    try {
      const revenue = await daybookApi.getNetRevenue({ start_date: startDate, end_date: endDate });
      const entries = await daybookApi.getEntriesByDateRange(startDate, endDate);
      
      return {
        period: { startDate, endDate },
        revenue: revenue.total_incoming,
        expenses: revenue.total_outgoing,
        netIncome: revenue.net_revenue,
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
      const [summary, revenue, entries] = await Promise.all([
        daybookApi.getSummaryAmounts({ start_date: startDate, end_date: endDate }),
        daybookApi.getNetRevenue({ start_date: startDate, end_date: endDate }),
        daybookApi.getEntriesByDateRange(startDate, endDate)
      ]);
      
      return {
        period: { startDate, endDate },
        totalEntries: summary.total_entries,
        paidEntries: summary.paid_entries_count,
        unpaidEntries: summary.pending_entries_count,
        totalIncoming: revenue.total_incoming,
        totalOutgoing: revenue.total_outgoing,
        netAmount: revenue.net_revenue,
        totalPaidAmount: summary.total_paid_amount,
        totalPendingAmount: summary.total_pending_amount,
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
