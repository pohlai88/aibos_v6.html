import { supabase } from '../../../lib/supabase';

export interface LedgerEntry {
  id?: string;
  organization_id: string;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  transaction_date: string;
  reference: string;
  description: string;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaxRecord {
  id?: string;
  organization_id: string;
  tax_type: 'GST' | 'SST' | 'INCOME_TAX';
  period: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  due_date: string;
  created_at?: string;
}

export interface ComplianceRecord {
  id?: string;
  organization_id: string;
  standard: 'MFRS_9' | 'MFRS_112' | 'MFRS_113' | 'MFRS_117' | 'MFRS_138';
  period: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
  details: Record<string, any>;
  created_at?: string;
}

export class AccountingService {
  // Ledger Management
  async createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'created_at' | 'updated_at'>): Promise<LedgerEntry> {
    const { data, error } = await supabase
      .from('ledger_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw new Error(`Failed to create ledger entry: ${error.message}`);
    return data;
  }

  async getLedgerEntries(organizationId: string, filters?: {
    startDate?: string;
    endDate?: string;
    accountCode?: string;
  }): Promise<LedgerEntry[]> {
    let query = supabase
      .from('ledger_entries')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }
    if (filters?.accountCode) {
      query = query.eq('account_code', filters.accountCode);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch ledger entries: ${error.message}`);
    return data || [];
  }

  // Tax Management
  async createTaxRecord(record: Omit<TaxRecord, 'id' | 'created_at'>): Promise<TaxRecord> {
    const { data, error } = await supabase
      .from('tax_records')
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(`Failed to create tax record: ${error.message}`);
    return data;
  }

  async getTaxRecords(organizationId: string): Promise<TaxRecord[]> {
    const { data, error } = await supabase
      .from('tax_records')
      .select('*')
      .eq('organization_id', organizationId)
      .order('due_date', { ascending: true });

    if (error) throw new Error(`Failed to fetch tax records: ${error.message}`);
    return data || [];
  }

  // Compliance Management
  async createComplianceRecord(record: Omit<ComplianceRecord, 'id' | 'created_at'>): Promise<ComplianceRecord> {
    const { data, error } = await supabase
      .from('compliance_records')
      .insert(record)
      .select()
      .single();

    if (error) throw new Error(`Failed to create compliance record: ${error.message}`);
    return data;
  }

  async getComplianceRecords(organizationId: string): Promise<ComplianceRecord[]> {
    const { data, error } = await supabase
      .from('compliance_records')
      .select('*')
      .eq('organization_id', organizationId)
      .order('period', { ascending: false });

    if (error) throw new Error(`Failed to fetch compliance records: ${error.message}`);
    return data || [];
  }

  // Financial Reports
  async generateTrialBalance(organizationId: string, asOfDate: string): Promise<any> {
    // This will call a Supabase function to generate trial balance
    const { data, error } = await supabase.functions.invoke('generate-trial-balance', {
      body: { organizationId, asOfDate }
    });

    if (error) throw new Error(`Failed to generate trial balance: ${error.message}`);
    return data;
  }

  async generateProfitLoss(organizationId: string, startDate: string, endDate: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-profit-loss', {
      body: { organizationId, startDate, endDate }
    });

    if (error) throw new Error(`Failed to generate profit & loss: ${error.message}`);
    return data;
  }

  async generateBalanceSheet(organizationId: string, asOfDate: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('generate-balance-sheet', {
      body: { organizationId, asOfDate }
    });

    if (error) throw new Error(`Failed to generate balance sheet: ${error.message}`);
    return data;
  }
}

export const accountingService = new AccountingService(); 