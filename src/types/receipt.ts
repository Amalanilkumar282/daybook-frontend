// Receipt Types and Interfaces

import { PayType, PayStatus, ModeOfPay, Tenant, PaymentTypeSpecific } from './daybook';

// Company/Organization Information for Receipt
export interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  gstNumber?: string;
  panNumber?: string;
}

// Client/Payer Information
export interface PayerInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  patientName?: string;  // For healthcare clients
  patientPhone?: string;
}

// Receipt Data Structure
export interface ReceiptData {
  // Receipt Identifiers
  receiptNumber: string;
  receiptDate: string;
  paymentDate?: string;
  
  // Organization Details
  company: CompanyInfo;
  tenant: Tenant;
  
  // Payer Details
  payer?: PayerInfo;
  
  // Payment Information
  amount: number;
  amountInWords: string;
  paymentType: PayType;
  paymentStatus: PayStatus | null;
  modeOfPayment: ModeOfPay | null;
  paymentTypeSpecific?: PaymentTypeSpecific | null;
  
  // Transaction Details
  description?: string;
  paymentDescription?: string;
  referenceId: number;  // Daybook entry ID
  
  // Additional Info
  createdBy?: string;
  nurseInfo?: {
    name: string;
    phone?: string;
    regNo?: string;
  };
}

// Receipt Configuration
export interface ReceiptConfig {
  showLogo: boolean;
  showCompanyAddress: boolean;
  showGST: boolean;
  showSignatureArea: boolean;
  showTerms: boolean;
  showQRCode?: boolean;
  paperSize: 'A4' | 'A5' | 'letter';
  orientation: 'portrait' | 'landscape';
}

// Default Receipt Configuration
export const DEFAULT_RECEIPT_CONFIG: ReceiptConfig = {
  showLogo: true,
  showCompanyAddress: true,
  showGST: true,
  showSignatureArea: true,
  showTerms: true,
  showQRCode: false,
  paperSize: 'A4',
  orientation: 'portrait',
};

// Company Info based on Tenant
export const TENANT_COMPANY_INFO: Record<string, CompanyInfo> = {
  TATANursing: {
    name: 'TATA Nursing Services',
    address: 'Nursing Care Center, Healthcare Complex',
    phone: '+91 XXXXXXXXXX',
    email: 'contact@tatanursing.com',
    website: 'www.tatanursing.com',
  },
  Dearcare: {
    name: 'Dearcare Healthcare Services',
    address: 'Healthcare Plaza, Main Road',
    phone: '+91 XXXXXXXXXX',
    email: 'contact@dearcare.com',
    website: 'www.dearcare.com',
  },
  DearcareAcademy: {
    name: 'Dearcare Academy',
    address: 'Education Center, Training Complex',
    phone: '+91 XXXXXXXXXX',
    email: 'academy@dearcare.com',
    website: 'academy.dearcare.com',
  },
  Personal: {
    name: 'Personal Account',
    address: '',
    phone: '',
    email: '',
  },
};

// Convert number to words (Indian numbering system)
export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  // Handle Indian numbering system (Crore, Lakh, Thousand)
  const intPart = Math.floor(num);
  const decimalPart = Math.round((num - intPart) * 100);
  
  let words = '';
  
  if (intPart >= 10000000) {
    words += convertLessThanThousand(Math.floor(intPart / 10000000)) + ' Crore ';
  }
  if (intPart >= 100000 && intPart % 10000000 >= 100000) {
    words += convertLessThanThousand(Math.floor((intPart % 10000000) / 100000)) + ' Lakh ';
  }
  if (intPart >= 1000 && intPart % 100000 >= 1000) {
    words += convertLessThanThousand(Math.floor((intPart % 100000) / 1000)) + ' Thousand ';
  }
  if (intPart % 1000 > 0) {
    words += convertLessThanThousand(intPart % 1000);
  }
  
  words = words.trim();
  
  if (decimalPart > 0) {
    words += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
  }
  
  return words + ' Rupees Only';
}

// Generate Receipt Number
export function generateReceiptNumber(entryId: number, tenant: string, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const tenantCode = tenant.substring(0, 3).toUpperCase();
  return `RCP-${tenantCode}-${year}${month}-${String(entryId).padStart(6, '0')}`;
}
