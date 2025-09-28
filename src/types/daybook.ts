export interface DaybookEntry {
  id: number;
  created_at: string;
  id_in_out: string;
  amount: number;
  payment_type: 'incoming' | 'outgoing';
  pay_status: 'paid' | 'un_paid';
  description?: string;
  mode_of_pay: string;
}

export interface DaybookFormData {
  id_in_out: string;
  amount: number;
  payment_type: 'incoming' | 'outgoing';
  pay_status: 'paid' | 'un_paid';
  mode_of_pay: string;
  description?: string;
}

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SummaryData {
  today: {
    incoming: number;
    outgoing: number;
    net: number;
  };
  week: {
    incoming: number;
    outgoing: number;
    net: number;
  };
  month: {
    incoming: number;
    outgoing: number;
    net: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Additional interfaces for enhanced features
export interface AccountCategory {
  id: string;
  name: string;
  type: 'debit' | 'credit';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
}

export interface TrialBalanceItem {
  account: string;
  debit: number;
  credit: number;
  netBalance: number;
}

export interface ProfitLossReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: number;
  expenses: number;
  netIncome: number;
  entries: DaybookEntry[];
}

export interface CashFlowReport {
  period: {
    startDate: string;
    endDate: string;
  };
  inflows: number;
  outflows: number;
  netCashFlow: number;
  entries: DaybookEntry[];
}

export interface UserSettings {
  companyName: string;
  companyAddress: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
  itemsPerPage: number;
  autoBackup: boolean;
  notifications: boolean;
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ImportExportData {
  entries: DaybookEntry[];
  categories: AccountCategory[];
  settings: UserSettings;
  exportDate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export interface DashboardStats {
  totalEntries: number;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  recentEntries: DaybookEntry[];
}
