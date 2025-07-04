// Re-export types from the service for easy access
export type {
  LedgerEntry,
  TaxRecord,
  ComplianceRecord
} from '../services/accountingService';

// Additional accounting-specific types
export interface ChartOfAccounts {
  id?: string;
  organization_id: string;
  account_code: string;
  account_name: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parent_account?: string;
  is_active: boolean;
  created_at?: string;
}

export interface JournalEntry {
  id?: string;
  organization_id: string;
  entry_number: string;
  transaction_date: string;
  reference: string;
  description: string;
  total_debit: number;
  total_credit: number;
  currency: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  created_at?: string;
  updated_at?: string;
}

export interface FinancialPeriod {
  id?: string;
  organization_id: string;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at?: string;
  created_at?: string;
}

export interface AuditTrail {
  id?: string;
  organization_id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id: string;
  timestamp: string;
  ip_address?: string;
} 