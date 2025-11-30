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
import {
  PersonalEntry,
  PersonalEntryFormData
} from '../types/personal';
import {
  BankAccount,
  BankAccountFormData,
  BankTransaction,
  DepositFormData,
  WithdrawFormData,
  TransferFormData,
  ChequeFormData,
  TransactionType
} from '../types/banking';

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
      const isAdmin = authUtils.isAdmin();
      
      // Determine the tenant to use: admin can override, non-admin uses their tenant
      const tenantToUse = isAdmin ? data.tenant : (currentUser?.tenant || data.tenant);
      
      console.log('=== CREATE ENTRY DEBUG ===');
      console.log('Current user from localStorage:', currentUser);
      console.log('JWT token payload:', tokenPayload);
      console.log('Is Admin:', isAdmin);
      console.log('Data received:', { ...data, receipt: data.receipt ? 'FILE' : undefined });
      console.log('Tenant from form:', data.tenant);
      console.log('User tenant:', currentUser?.tenant);
      console.log('Token tenant:', tokenPayload?.tenant || tokenPayload?.user_metadata?.tenant);
      console.log('Tenant to use:', tenantToUse);
      
      // If receipt file is present, use multipart/form-data
      if (data.receipt) {
        const formData = new FormData();
        // Send amount as number (FormData will convert to string)
        formData.append('amount', data.amount.toString());
        formData.append('payment_type', data.payment_type);
        formData.append('pay_status', data.pay_status);
        formData.append('tenant', tenantToUse);
        
        if (data.mode_of_pay) formData.append('mode_of_pay', data.mode_of_pay);
        if (data.description) formData.append('description', data.description);
        if (data.payment_type_specific) formData.append('payment_type_specific', data.payment_type_specific);
        if (data.payment_description) formData.append('payment_description', data.payment_description);
        // Only add IDs if they exist and are not empty
        if (data.nurse_id && data.nurse_id.trim() !== '') formData.append('nurse_id', data.nurse_id.trim());
        if (data.client_id && data.client_id.trim() !== '') formData.append('client_id', data.client_id.trim());
        formData.append('receipt', data.receipt);

        console.log('Form data keys:', Array.from(formData.keys()));
        console.log('Checking FormData entries...');
        Array.from(formData.keys()).forEach(key => {
          const value = formData.get(key);
          console.log(`  ${key}:`, value instanceof File ? 'FILE' : value);
        });
        
        // Send FormData with proper headers (let browser set Content-Type with boundary)
        const response = await api.post('/daybook/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.data || response.data;
      } else {
        // Use JSON for non-file uploads
        const payload: any = {
          // Send amount as number
          amount: data.amount,
          payment_type: data.payment_type,
          pay_status: data.pay_status,
          tenant: tenantToUse,
        };
        
        if (data.mode_of_pay) payload.mode_of_pay = data.mode_of_pay;
        if (data.description) payload.description = data.description;
        if (data.payment_type_specific) payload.payment_type_specific = data.payment_type_specific;
        if (data.payment_description) payload.payment_description = data.payment_description;
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
      const currentUser = authUtils.getUser();
      const isAdmin = authUtils.isAdmin();
      
      // Determine the tenant to use: admin can override, non-admin uses their tenant
      const tenantToUse = isAdmin && data.tenant ? data.tenant : (currentUser?.tenant || data.tenant);
      
      // If receipt file is present, use multipart/form-data
      if (data.receipt) {
        const formData = new FormData();
        // Send amount as number (FormData will convert to string)
        if (data.amount !== undefined) formData.append('amount', data.amount.toString());
        if (data.payment_type) formData.append('payment_type', data.payment_type);
        if (data.pay_status) formData.append('pay_status', data.pay_status);
        if (tenantToUse) formData.append('tenant', tenantToUse);
        if (data.mode_of_pay) formData.append('mode_of_pay', data.mode_of_pay);
        if (data.description) formData.append('description', data.description);
        if (data.payment_type_specific) formData.append('payment_type_specific', data.payment_type_specific);
        if (data.payment_description) formData.append('payment_description', data.payment_description);
        if (data.nurse_id) formData.append('nurse_id', data.nurse_id);
        if (data.client_id) formData.append('client_id', data.client_id);
        formData.append('receipt', data.receipt);

        // Send FormData with proper headers (let browser set Content-Type with boundary)
        const response = await api.put(`/daybook/update/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.data || response.data;
      } else {
        // For JSON updates, ensure tenant is set correctly
        const payload: any = { ...data };
        // Amount remains as number, no conversion needed
        if (tenantToUse) {
          payload.tenant = tenantToUse;
        }
        
        const response = await api.put(`/daybook/update/${id}`, payload);
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

  // Search entries (client-side filtering with enhanced nurse/client search)
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
      
      // Text search with enhanced functionality
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        
        // Fetch nurses and clients data for better searching
        let nursesData: any[] = [];
        let clientsData: any[] = [];
        
        try {
          [nursesData, clientsData] = await Promise.all([
            nursesClientsApi.getNurses().catch(() => []),
            nursesClientsApi.getClients().catch(() => [])
          ]);
        } catch (error) {
          console.warn('Could not fetch nurse/client data for search');
        }
        
        entries = entries.filter(entry => {
          // Search in basic fields
          const basicMatch = 
            (entry.description && entry.description.toLowerCase().includes(searchTerm)) ||
            entry.id.toString().toLowerCase().includes(searchTerm) ||
            entry.payment_type.toLowerCase().includes(searchTerm) ||
            entry.mode_of_pay.toLowerCase().includes(searchTerm) ||
            entry.tenant.toLowerCase().includes(searchTerm) ||
            entry.amount.toString().includes(searchTerm);
          
          if (basicMatch) return true;
          
          // Search in nurse data if nurse_id exists
          if (entry.nurse_id && nursesData.length > 0) {
            const nurse = nursesData.find(n => n.nurse_id.toString() === entry.nurse_id);
            if (nurse) {
              const nurseMatch = 
                (nurse.full_name && nurse.full_name.toLowerCase().includes(searchTerm)) ||
                (nurse.first_name && nurse.first_name.toLowerCase().includes(searchTerm)) ||
                (nurse.last_name && nurse.last_name.toLowerCase().includes(searchTerm)) ||
                (nurse.nurse_reg_no && nurse.nurse_reg_no.toLowerCase().includes(searchTerm)) ||
                (nurse.phone_number && nurse.phone_number.includes(searchTerm));
              if (nurseMatch) return true;
            }
          }
          
          // Search in client data if client_id exists
          if (entry.client_id && clientsData.length > 0) {
            const client = clientsData.find(c => c.client_id === entry.client_id);
            if (client) {
              const clientMatch = 
                (client.patient_name && client.patient_name.toLowerCase().includes(searchTerm)) ||
                (client.requestor_name && client.requestor_name.toLowerCase().includes(searchTerm)) ||
                (client.requestor_phone && client.requestor_phone.includes(searchTerm)) ||
                (client.patient_phone && client.patient_phone && client.patient_phone.includes(searchTerm)) ||
                (client.requestor_email && client.requestor_email.toLowerCase().includes(searchTerm)) ||
                (client.service_required && client.service_required.toLowerCase().includes(searchTerm)) ||
                (client.patient_city && client.patient_city.toLowerCase().includes(searchTerm)) ||
                (client.requestor_city && client.requestor_city.toLowerCase().includes(searchTerm));
              if (clientMatch) return true;
            }
          }
          
          return false;
        });
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
      // Fetch entries for the date range
      const entries = await daybookApi.getEntriesByDateRange(startDate, endDate);
      
      // Calculate all metrics from entries
      const totalEntries = entries.length;
      
      const paidEntries = entries.filter(e => e.pay_status === PayStatus.PAID).length;
      const unpaidEntries = entries.filter(e => e.pay_status === PayStatus.UNPAID).length;
      
      const totalIncoming = entries
        .filter(e => e.payment_type === PayType.INCOMING)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const totalOutgoing = entries
        .filter(e => e.payment_type === PayType.OUTGOING)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const netAmount = totalIncoming - totalOutgoing;
      
      const totalPaidAmount = entries
        .filter(e => e.pay_status === PayStatus.PAID)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const totalPendingAmount = entries
        .filter(e => e.pay_status === PayStatus.UNPAID)
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        period: { startDate, endDate },
        totalEntries,
        paidEntries,
        unpaidEntries,
        totalIncoming,
        totalOutgoing,
        netAmount,
        totalPaidAmount,
        totalPendingAmount,
        entries
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate summary report');
    }
  }
};

// Nurses and Clients API
export const nursesClientsApi = {
  // Fetch all nurses with caching
  getNurses: async (): Promise<any[]> => {
    try {
      const response = await axios.get('https://day-book-backend.vercel.app/api/Daybook/nurses');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch nurses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch nurses');
    }
  },

  // Fetch all clients with caching
  getClients: async (): Promise<any[]> => {
    try {
      const response = await axios.get('https://day-book-backend.vercel.app/api/Daybook/clients');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  // Get nurse by ID
  getNurseById: async (nurseId: number): Promise<any | null> => {
    try {
      const nurses = await nursesClientsApi.getNurses();
      return nurses.find(nurse => nurse.nurse_id === nurseId) || null;
    } catch (error: any) {
      console.error('Failed to fetch nurse by ID:', error);
      return null;
    }
  },

  // Get client by ID
  getClientById: async (clientId: string): Promise<any | null> => {
    try {
      const clients = await nursesClientsApi.getClients();
      return clients.find(client => client.client_id === clientId) || null;
    } catch (error: any) {
      console.error('Failed to fetch client by ID:', error);
      return null;
    }
  },
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

// Personal Finance API - Complete CRUD operations
export const personalFinanceApi = {
  // Get all personal finance entries
  getPersonalEntries: async (): Promise<PersonalEntry[]> => {
    try {
      const response = await api.get('/personal/');
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch personal entries');
    }
  },

  // Create new personal finance entry
  createPersonalEntry: async (data: PersonalEntryFormData): Promise<PersonalEntry> => {
    try {
      const payload = {
        paytype: data.paytype,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
        description: data.description
      };
      
      const response = await api.post('/personal/', payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create personal entry');
    }
  },

  // Update personal finance entry
  updatePersonalEntry: async (id: number, data: PersonalEntryFormData): Promise<PersonalEntry> => {
    try {
      const payload = {
        paytype: data.paytype,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
        description: data.description
      };
      
      const response = await api.put(`/personal/${id}`, payload);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update personal entry');
    }
  },

  // Delete personal finance entry
  deletePersonalEntry: async (id: number): Promise<void> => {
    try {
      await api.delete(`/personal/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete personal entry');
    }
  },

  // Calculate summary from entries
  getPersonalSummary: async (): Promise<{ totalIncoming: number; totalOutgoing: number; balance: number; entryCount: number }> => {
    try {
      const entries = await personalFinanceApi.getPersonalEntries();
      
      const totalIncoming = entries
        .filter(entry => entry.paytype === 'incoming')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const totalOutgoing = entries
        .filter(entry => entry.paytype === 'outgoing')
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const balance = totalIncoming - totalOutgoing;
      
      return {
        totalIncoming,
        totalOutgoing,
        balance,
        entryCount: entries.length
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch personal summary');
    }
  },

  // Export to CSV
  exportPersonalToCsv: async (): Promise<Blob> => {
    try {
      const entries = await personalFinanceApi.getPersonalEntries();
      
      const headers = ['ID', 'Date', 'Type', 'Amount', 'Description'];
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.id.toString(),
          entry.created_at,
          entry.paytype,
          entry.amount.toString(),
          `"${entry.description || ''}"`
        ].join(','))
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export personal finance data');
    }
  }
};

// Banking API - Complete CRUD operations for bank accounts and transactions
export const bankingApi = {
  // ==================== Bank Accounts ====================
  
  // Create new bank account
  createAccount: async (data: BankAccountFormData): Promise<BankAccount> => {
    try {
      const response = await api.post('/banking/accounts/create', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create bank account');
    }
  },

  // Get all bank accounts
  getAllAccounts: async (): Promise<BankAccount[]> => {
    try {
      const response = await api.get('/banking/accounts/list');
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch bank accounts');
    }
  },

  // Get bank account by ID
  getAccountById: async (id: number): Promise<BankAccount> => {
    try {
      const response = await api.get(`/banking/accounts/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch bank account');
    }
  },

  // Get account balance
  getAccountBalance: async (id: number): Promise<number> => {
    try {
      const response = await api.get(`/banking/accounts/${id}/balance`);
      return response.data.balance;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch account balance');
    }
  },

  // Update bank account
  updateAccount: async (id: number, data: Partial<BankAccountFormData>): Promise<BankAccount> => {
    try {
      const response = await api.put(`/banking/accounts/update/${id}`, data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update bank account');
    }
  },

  // Delete bank account
  deleteAccount: async (id: number): Promise<void> => {
    try {
      await api.delete(`/banking/accounts/delete/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to delete bank account');
    }
  },

  // ==================== Transactions ====================

  // Deposit money to account
  deposit: async (data: DepositFormData): Promise<BankTransaction> => {
    try {
      const response = await api.post('/banking/transactions/deposit', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to deposit money');
    }
  },

  // Withdraw money from account
  withdraw: async (data: WithdrawFormData): Promise<BankTransaction> => {
    try {
      const response = await api.post('/banking/transactions/withdraw', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to withdraw money');
    }
  },

  // Transfer money between accounts
  transfer: async (data: TransferFormData): Promise<BankTransaction> => {
    try {
      const response = await api.post('/banking/transactions/transfer', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to transfer money');
    }
  },

  // Issue cheque
  issueCheque: async (data: ChequeFormData): Promise<BankTransaction> => {
    try {
      const response = await api.post('/banking/transactions/cheque', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to issue cheque');
    }
  },

  // Get all transactions
  getAllTransactions: async (): Promise<BankTransaction[]> => {
    try {
      const response = await api.get('/banking/transactions/list');
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: number): Promise<BankTransaction> => {
    try {
      const response = await api.get(`/banking/transactions/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transaction');
    }
  },

  // Get transactions for a specific account
  getTransactionsByAccount: async (accountId: number): Promise<BankTransaction[]> => {
    try {
      const response = await api.get(`/banking/transactions/account/${accountId}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch account transactions');
    }
  },

  // Get transactions by type
  getTransactionsByType: async (type: TransactionType): Promise<BankTransaction[]> => {
    try {
      const response = await api.get(`/banking/transactions/type/${type}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transactions by type');
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate: string, endDate: string): Promise<BankTransaction[]> => {
    try {
      const response = await api.get(`/banking/transactions/date-range?start_date=${startDate}&end_date=${endDate}`);
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch transactions by date range');
    }
  },

  // Export transactions to CSV (client-side)
  exportTransactionsToCsv: async (): Promise<Blob> => {
    try {
      const transactions = await bankingApi.getAllTransactions();
      const accounts = await bankingApi.getAllAccounts();
      
      // Create a map for quick account lookup
      const accountMap = new Map(accounts.map(acc => [acc.id, acc]));
      
      const headers = ['ID', 'Date', 'Type', 'Amount', 'Account', 'From Account', 'To Account', 'Cheque Number', 'Reference', 'Description', 'Status'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(txn => {
          const account = accountMap.get(txn.bank_account_id);
          const fromAccount = txn.from_account_id ? accountMap.get(txn.from_account_id) : null;
          const toAccount = txn.to_account_id ? accountMap.get(txn.to_account_id) : null;
          
          return [
            txn.id.toString(),
            txn.created_at,
            txn.transaction_type,
            txn.amount.toString(),
            account?.account_name || '',
            fromAccount?.account_name || '',
            toAccount?.account_name || '',
            txn.cheque_number || '',
            txn.reference || '',
            `"${txn.description || ''}"`,
            txn.status
          ].join(',');
        })
      ].join('\n');
      
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export transactions');
    }
  }
};

export default api;
