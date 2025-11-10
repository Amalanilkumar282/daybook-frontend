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

export enum Tenant {
  TATA_NURSING = 'TATANursing',
  DEARCARE = 'Dearcare',
  DEARCARE_ACADEMY = 'DearcareAcademy'
}

export enum UserRole {
  ADMIN = 'admin',
  ACCOUNTANT = 'accountant',
  STAFF = 'staff'
}

// Main interfaces
export interface DaybookEntry {
  id: number;
  created_at: string;
  amount: number;
  payment_type: PayType;
  pay_status: PayStatus;
  description?: string;
  mode_of_pay: ModeOfPay;
  tenant: Tenant;
  nurse_id?: string;
  client_id?: string;
  receipt?: string;
}

export interface DaybookFormData {
  amount: number;
  payment_type: PayType;
  pay_status: PayStatus;
  mode_of_pay: ModeOfPay;
  tenant: Tenant;
  description?: string;
  nurse_id?: string;
  client_id?: string;
  receipt?: File;
}

// Authentication interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant?: Tenant;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  tenant: Tenant;
}

export interface CreateAdminCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  tenant?: Tenant;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Summary data from backend /api/daybook/summary/amounts
export interface SummaryAmountsResponse {
  total_paid_amount: number;
  total_pending_amount: number;
  total_entries: number;
  paid_entries_count: number;
  pending_entries_count: number;
}

// Revenue data from backend /api/daybook/revenue/net
export interface RevenueNetResponse {
  total_incoming: number;
  total_outgoing: number;
  net_revenue: number;
  incoming_count: number;
  outgoing_count: number;
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
