export interface DaybookEntry {
  _id: string;
  date: string; // ISO date string
  particulars: string;
  voucherNumber: string;
  debit: number;
  credit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DaybookFormData {
  date: string;
  particulars: string;
  voucherNumber: string;
  debit: number;
  credit: number;
}

export interface SummaryData {
  today: {
    debit: number;
    credit: number;
  };
  week: {
    debit: number;
    credit: number;
  };
  month: {
    debit: number;
    credit: number;
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
