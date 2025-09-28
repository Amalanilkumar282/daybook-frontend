// Enums to match backend schema
export enum PayType {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export enum PayStatus {
  PAID = 'paid',
  UNPAID = 'un_paid'
}

export enum ModeOfPay {
  CASH = 'cash',
  UPI = 'upi',
  ACCOUNT_TRANSFER = 'account_transfer'
}

// Main interfaces
export interface DaybookEntry {
  id: number;
  created_at: string;
  id_in_out: string;
  amount: number;
  payment_type: PayType;
  pay_status: PayStatus;
  description?: string;
  mode_of_pay: ModeOfPay;
}

export interface DaybookFormData {
  id_in_out: string;
  amount: number;
  payment_type: PayType;
  pay_status: PayStatus;
  mode_of_pay: ModeOfPay;
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
