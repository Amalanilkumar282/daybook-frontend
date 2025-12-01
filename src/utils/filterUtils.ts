import { DaybookEntry, PayType, PayStatus } from '../types/daybook';
import { PersonalEntry } from '../types/personal';
import { BankTransaction } from '../types/banking';

export interface DaybookFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: PayType | 'all';
  payStatus?: PayStatus | 'all';
  nurse_id?: string;
  client_id?: string;
}

export interface NurseClient {
  nurse_id?: string;
  client_id?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  nurse_reg_no?: string;
  phone_number?: string;
  patient_name?: string;
  requestor_name?: string;
  requestor_phone?: string;
  patient_phone?: string;
  requestor_email?: string;
  service_required?: string;
  patient_city?: string;
  requestor_city?: string;
}

/**
 * Optimized client-side filtering for daybook entries
 * This eliminates the need for multiple API calls
 */
export const filterDaybookEntries = (
  entries: DaybookEntry[],
  filters: DaybookFilters,
  nursesMap?: Map<string, NurseClient>,
  clientsMap?: Map<string, NurseClient>
): DaybookEntry[] => {
  let filtered = [...entries];

  // Text search
  if (filters.searchTerm && filters.searchTerm.trim()) {
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    
    filtered = filtered.filter(entry => {
      // Search in basic fields
      const basicMatch = 
        (entry.description && entry.description.toLowerCase().includes(searchTerm)) ||
        entry.id.toString().toLowerCase().includes(searchTerm) ||
        (entry.payment_type && entry.payment_type.toLowerCase().includes(searchTerm)) ||
        (entry.mode_of_pay && entry.mode_of_pay.toLowerCase().includes(searchTerm)) ||
        (entry.tenant && entry.tenant.toLowerCase().includes(searchTerm)) ||
        entry.amount.toString().includes(searchTerm) ||
        (entry.payment_type_specific && entry.payment_type_specific.toLowerCase().includes(searchTerm)) ||
        (entry.payment_description && entry.payment_description.toLowerCase().includes(searchTerm));
      
      if (basicMatch) return true;
      
      // Search in nurse data
      if (entry.nurse_id && nursesMap) {
        const nurse = nursesMap.get(entry.nurse_id);
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
      
      // Search in client data
      if (entry.client_id && clientsMap) {
        const client = clientsMap.get(entry.client_id);
        if (client) {
          const clientMatch = 
            (client.patient_name && client.patient_name.toLowerCase().includes(searchTerm)) ||
            (client.requestor_name && client.requestor_name.toLowerCase().includes(searchTerm)) ||
            (client.requestor_phone && client.requestor_phone.includes(searchTerm)) ||
            (client.patient_phone && client.patient_phone.includes(searchTerm)) ||
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

  // Date range filters
  if (filters.dateFrom) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.created_at.split('T')[0];
      return entryDate >= filters.dateFrom!;
    });
  }
  
  if (filters.dateTo) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.created_at.split('T')[0];
      return entryDate <= filters.dateTo!;
    });
  }

  // Amount range filters
  if (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== 0 && !isNaN(filters.minAmount)) {
    filtered = filtered.filter(entry => entry.amount >= filters.minAmount!);
  }
  
  if (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== 0 && !isNaN(filters.maxAmount)) {
    filtered = filtered.filter(entry => entry.amount <= filters.maxAmount!);
  }

  // Payment type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(entry => entry.payment_type === filters.type);
  }

  // Payment status filter
  if (filters.payStatus && filters.payStatus !== 'all') {
    filtered = filtered.filter(entry => entry.pay_status === filters.payStatus);
  }

  // Nurse filter
  if (filters.nurse_id) {
    filtered = filtered.filter(entry => entry.nurse_id === filters.nurse_id);
  }

  // Client filter
  if (filters.client_id) {
    filtered = filtered.filter(entry => entry.client_id === filters.client_id);
  }

  return filtered;
};

/**
 * Sort daybook entries
 */
export const sortDaybookEntries = (
  entries: DaybookEntry[],
  sortBy: 'date' | 'amount' | 'relevance',
  sortOrder: 'asc' | 'desc',
  searchTerm?: string
): DaybookEntry[] => {
  const sorted = [...entries];

  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
        
      case 'amount':
        comparison = a.amount - b.amount;
        break;
        
      case 'relevance':
        if (searchTerm && searchTerm.trim()) {
          // Relevance scoring based on where the search term appears
          const term = searchTerm.toLowerCase();
          
          const scoreEntry = (entry: DaybookEntry): number => {
            let score = 0;
            
            // Exact ID match gets highest score
            if (entry.id.toString() === term) score += 100;
            // ID starts with search term
            else if (entry.id.toString().startsWith(term)) score += 50;
            // ID contains search term
            else if (entry.id.toString().includes(term)) score += 25;
            
            // Description matches
            if (entry.description) {
              const desc = entry.description.toLowerCase();
              if (desc === term) score += 80;
              else if (desc.startsWith(term)) score += 40;
              else if (desc.includes(term)) score += 20;
            }
            
            // Amount exact match
            if (entry.amount.toString() === term) score += 60;
            
            // Payment type match
            if (entry.payment_type.toLowerCase() === term) score += 30;
            
            // Mode of pay match
            if (entry.mode_of_pay && entry.mode_of_pay.toLowerCase().includes(term)) score += 15;
            
            // Newer entries get slight boost
            const daysOld = (Date.now() - new Date(entry.created_at).getTime()) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 10 - daysOld / 30); // Up to 10 points for recent entries
            
            return score;
          };
          
          const scoreA = scoreEntry(a);
          const scoreB = scoreEntry(b);
          comparison = scoreB - scoreA; // Higher score first
        } else {
          // No search term, sort by date (newest first)
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Filter personal finance entries
 */
export const filterPersonalEntries = (
  entries: PersonalEntry[],
  searchTerm?: string,
  dateFrom?: string,
  dateTo?: string,
  minAmount?: number,
  maxAmount?: number
): PersonalEntry[] => {
  let filtered = [...entries];

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(entry =>
      (entry.description && entry.description.toLowerCase().includes(term)) ||
      (entry.paytype && entry.paytype.toLowerCase().includes(term)) ||
      entry.amount.toString().includes(term) ||
      entry.id.toString().includes(term)
    );
  }

  if (dateFrom) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.created_at.split('T')[0];
      return entryDate >= dateFrom;
    });
  }

  if (dateTo) {
    filtered = filtered.filter(entry => {
      const entryDate = entry.created_at.split('T')[0];
      return entryDate <= dateTo;
    });
  }

  if (minAmount !== undefined && !isNaN(minAmount)) {
    filtered = filtered.filter(entry => entry.amount >= minAmount);
  }

  if (maxAmount !== undefined && !isNaN(maxAmount)) {
    filtered = filtered.filter(entry => entry.amount <= maxAmount);
  }

  return filtered;
};

/**
 * Filter bank transactions
 */
export const filterBankTransactions = (
  transactions: BankTransaction[],
  searchTerm?: string,
  dateFrom?: string,
  dateTo?: string,
  minAmount?: number,
  maxAmount?: number,
  transactionType?: string
): BankTransaction[] => {
  let filtered = [...transactions];

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(transaction =>
      (transaction.description && transaction.description.toLowerCase().includes(term)) ||
      (transaction.transaction_type && transaction.transaction_type.toLowerCase().includes(term)) ||
      (transaction.cheque_number && transaction.cheque_number.toString().includes(term)) ||
      transaction.amount.toString().includes(term)
    );
  }

  if (dateFrom) {
    filtered = filtered.filter(transaction => {
      const txDate = transaction.created_at.split('T')[0];
      return txDate >= dateFrom;
    });
  }

  if (dateTo) {
    filtered = filtered.filter(transaction => {
      const txDate = transaction.created_at.split('T')[0];
      return txDate <= dateTo;
    });
  }

  if (minAmount !== undefined && !isNaN(minAmount)) {
    filtered = filtered.filter(transaction => transaction.amount >= minAmount);
  }

  if (maxAmount !== undefined && !isNaN(maxAmount)) {
    filtered = filtered.filter(transaction => transaction.amount <= maxAmount);
  }

  if (transactionType && transactionType !== 'all') {
    filtered = filtered.filter(transaction => 
      transaction.transaction_type.toLowerCase() === transactionType.toLowerCase()
    );
  }

  return filtered;
};

/**
 * Check if any filter is active
 */
export const hasActiveFilters = (filters: DaybookFilters): boolean => {
  return !!(
    (filters.searchTerm && filters.searchTerm.trim()) ||
    filters.dateFrom ||
    filters.dateTo ||
    (filters.minAmount !== undefined && filters.minAmount !== null && filters.minAmount !== 0) ||
    (filters.maxAmount !== undefined && filters.maxAmount !== null && filters.maxAmount !== 0) ||
    (filters.type && filters.type !== 'all') ||
    (filters.payStatus && filters.payStatus !== 'all') ||
    filters.nurse_id ||
    filters.client_id
  );
};
