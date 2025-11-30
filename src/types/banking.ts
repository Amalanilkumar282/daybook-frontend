// Banking Module Types - Based on backend API documentation

// Transaction Types Enum
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  CHEQUE = 'cheque'
}

// Transaction Status Enum
export enum TransactionStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed'
}

// Bank Account Interface
export interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  shortform: string;
  account_number?: string | null;
  ifsc?: string | null;
  branch?: string | null;
  balance: number;
  tenant?: string | null;
  created_at: string;
  updated_at: string;
}

// Bank Account Form Data (for create/update)
export interface BankAccountFormData {
  bank_name: string;
  account_name: string;
  shortform: string;
  account_number?: string;
  ifsc?: string;
  branch?: string;
  balance?: number;
  tenant?: string;
}

// Bank Transaction Interface
export interface BankTransaction {
  id: number;
  bank_account_id: number;
  transaction_type: TransactionType;
  amount: number;
  from_account_id?: number | null;
  to_account_id?: number | null;
  cheque_number?: string | null;
  reference?: string | null;
  description?: string | null;
  status: TransactionStatus;
  tenant?: string | null;
  created_at: string;
}

// Transaction Form Data (for create)
export interface TransactionFormData {
  bank_account_id: number;
  transaction_type: TransactionType;
  amount: number;
  from_account_id?: number;
  to_account_id?: number;
  cheque_number?: string;
  reference?: string;
  description?: string;
  status?: TransactionStatus;
  tenant?: string;
}

// Deposit Transaction Form
export interface DepositFormData {
  bank_account_id: number;
  amount: number;
  description?: string;
  reference?: string;
  tenant?: string;
}

// Withdraw Transaction Form
export interface WithdrawFormData {
  bank_account_id: number;
  amount: number;
  description?: string;
  reference?: string;
  tenant?: string;
}

// Transfer Transaction Form
export interface TransferFormData {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  description?: string;
  reference?: string;
  tenant?: string;
}

// Cheque Transaction Form
export interface ChequeFormData {
  bank_account_id: number;
  amount: number;
  cheque_number: string;
  description?: string;
  reference?: string;
  tenant?: string;
}

// API Response Types
export interface BankAccountResponse {
  message: string;
  data: BankAccount;
}

export interface BankAccountListResponse {
  message?: string;
  data: BankAccount[];
}

export interface TransactionResponse {
  message: string;
  data: BankTransaction;
}

export interface TransactionListResponse {
  message?: string;
  data: BankTransaction[];
}

export interface BalanceResponse {
  message?: string;
  balance: number;
}

// Enhanced Transaction with Account Details (for display)
export interface TransactionWithDetails extends BankTransaction {
  account_name?: string;
  from_account_name?: string;
  to_account_name?: string;
}
