// Personal Finance Entry Types

export interface PersonalEntry {
  id: number;
  created_at: string;
  user_id: string;
  paytype: 'incoming' | 'outgoing';
  amount: number;
  description: string;
}

export interface PersonalEntryFormData {
  paytype: 'incoming' | 'outgoing';
  amount: number | string;
  description: string;
}

export interface PersonalEntriesResponse {
  message: string;
  data: PersonalEntry[];
}

export interface PersonalEntryResponse {
  message: string;
  data: PersonalEntry;
}

export interface DeletePersonalEntryResponse {
  message: string;
}

export interface PersonalFinanceSummary {
  totalIncoming: number;
  totalOutgoing: number;
  balance: number;
  entryCount: number;
}
