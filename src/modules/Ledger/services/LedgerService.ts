// Ledger Service Implementation
// Converted from Python journal_entries.py

import { supabase } from '../../../lib/supabase';
import {
  Account,
  AccountType,
  JournalEntry,
  JournalEntryLine,
  TransactionType,
  WorkflowStatus,
  ValidationResult,
  ComplianceReport,
  MFRSViolation,
  TrialBalance,
  Currency,
  ILedgerService
} from '../types';

export class LedgerService implements ILedgerService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async createAccount(
    code: string, 
    name: string, 
    type: AccountType, 
    parent_id?: string
  ): Promise<Account> {
    if (!code || !name) {
      throw new Error("Account code and name are required");
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        code,
        name,
        type,
        parent_id,
        is_active: true,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }

    return data as Account;
  }

  async createJournalEntry(
    reference: string,
    description: string,
    date?: string,
    transaction_type?: TransactionType
  ): Promise<JournalEntry> {
    if (!reference || !description) {
      throw new Error("Journal entry reference and description are required");
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        reference,
        description,
        date: date || new Date().toISOString(),
        transaction_type,
        status: WorkflowStatus.DRAFT,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        version: 1,
        finalized: false,
        lines: []
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create journal entry: ${error.message}`);
    }

    return data as JournalEntry;
  }

  async postJournalEntry(entry: JournalEntry, user_id?: string): Promise<void> {
    // Validate the entry before posting
    const validation = await this.validateJournalEntry(entry);
    if (!validation.valid) {
      throw new Error(`Journal entry validation failed: ${validation.errors.join(', ')}`);
    }

    const { error } = await supabase
      .from('journal_entries')
      .update({
        is_posted: true,
        posted_at: new Date().toISOString(),
        status: WorkflowStatus.POSTED,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Failed to post journal entry: ${error.message}`);
    }

    // Log the posting event
    await this.logAuditEvent('journal_entry_posted', {
      entry_id: entry.id,
      user_id: user_id,
      reference: entry.reference
    });
  }

  async getAccountBalance(account_id: string, as_of_date?: string): Promise<number> {
    let query = supabase
      .from('journal_entry_lines')
      .select('debit_amount, credit_amount')
      .eq('account_id', account_id)
      .eq('tenant_id', this.tenantId);

    if (as_of_date) {
      query = query.lte('created_at', as_of_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get account balance: ${error.message}`);
    }

    const totalDebits = data?.reduce((sum, line) => sum + (line.debit_amount || 0), 0) || 0;
    const totalCredits = data?.reduce((sum, line) => sum + (line.credit_amount || 0), 0) || 0;

    return totalDebits - totalCredits;
  }

  async getTrialBalance(as_of_date?: string): Promise<TrialBalance> {
    let query = supabase
      .from('journal_entry_lines')
      .select('account_id, debit_amount, credit_amount')
      .eq('tenant_id', this.tenantId);

    if (as_of_date) {
      query = query.lte('created_at', as_of_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get trial balance: ${error.message}`);
    }

    const trialBalance: TrialBalance = {};

    data?.forEach(line => {
      const accountId = line.account_id;
      const currentBalance = trialBalance[accountId] || 0;
      const lineBalance = (line.debit_amount || 0) - (line.credit_amount || 0);
      trialBalance[accountId] = currentBalance + lineBalance;
    });

    return trialBalance;
  }

  async validateJournalEntry(entry: JournalEntry): Promise<ValidationResult> {
    const errors: string[] = [];

    // Basic validation
    if (!entry.reference || !entry.description) {
      errors.push("Reference and description are required");
    }

    if (!entry.user_id || !entry.entity_id || !entry.originating_module) {
      errors.push("Missing required metadata");
    }

    if (entry.finalized) {
      errors.push("Entry is finalized and cannot be edited");
    }

    // Double-entry validation
    const totalDebits = entry.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = entry.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) { // Allow for rounding differences
      errors.push("Debits and credits must balance");
    }

    // MFRS compliance validation
    const complianceReport = await this.getComplianceReport(entry.entity_id);
    const violations = await this.validateMFRSCompliance(entry);

    if (violations.length > 0) {
      violations.forEach(violation => {
        errors.push(`MFRS Violation [${violation.standard}][${violation.compliance_level}]: ${violation.message}`);
      });
    }

    // Confidence score check
    if (complianceReport.compliance_score < 70) {
      errors.push(`HITM: Compliance confidence score is low (${complianceReport.compliance_score}%) - review required`);
    }

    return {
      valid: errors.length === 0,
      errors,
      confidence_score: complianceReport.compliance_score
    };
  }

  async getComplianceReport(entity_id: string): Promise<ComplianceReport> {
    // This would typically call the MFRS compliance engine
    // For now, return a mock implementation
    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('entity_id', entity_id)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to get compliance report: ${error.message}`);
    }

    if (data) {
      return data as ComplianceReport;
    }

    // Return default report if none exists
    return {
      compliance_score: 85,
      violations: [],
      recommendations: []
    };
  }

  private async validateMFRSCompliance(entry: JournalEntry): Promise<MFRSViolation[]> {
    // This would integrate with the MFRS compliance engine
    // For now, return empty array
    return [];
  }

  private async logAuditEvent(event_type: string, payload: any): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type,
        payload,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Utility methods
  async addLineToJournalEntry(
    entry_id: string,
    line: Omit<JournalEntryLine, 'id'>
  ): Promise<JournalEntryLine> {
    const { data, error } = await supabase
      .from('journal_entry_lines')
      .insert({
        ...line,
        tenant_id: this.tenantId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add line to journal entry: ${error.message}`);
    }

    return data as JournalEntryLine;
  }

  async finalizeJournalEntry(entry_id: string): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .update({
        finalized: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry_id)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Failed to finalize journal entry: ${error.message}`);
    }
  }

  async cloneAndSupersede(
    entry_id: string,
    new_reference: string,
    user_id: string
  ): Promise<JournalEntry> {
    // Get the original entry
    const { data: originalEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entry_id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch original entry: ${fetchError.message}`);
    }

    if (!originalEntry.finalized) {
      throw new Error("Only finalized entries can be superseded");
    }

    // Create new entry
    const newEntry = await this.createJournalEntry(
      new_reference,
      originalEntry.description,
      new Date().toISOString(),
      originalEntry.transaction_type
    );

    // Copy lines
    const { data: lines, error: linesError } = await supabase
      .from('journal_entry_lines')
      .select('*')
      .eq('journal_entry_id', entry_id)
      .eq('tenant_id', this.tenantId);

    if (linesError) {
      throw new Error(`Failed to fetch entry lines: ${linesError.message}`);
    }

    for (const line of lines || []) {
      await this.addLineToJournalEntry(newEntry.id, {
        account_id: line.account_id,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        description: line.description,
        reference: line.reference,
        currency: line.currency,
        fx_rate: line.fx_rate
      });
    }

    // Mark original as superseded
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({
        superseded_by: newEntry.reference,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry_id)
      .eq('tenant_id', this.tenantId);

    if (updateError) {
      throw new Error(`Failed to mark entry as superseded: ${updateError.message}`);
    }

    return newEntry;
  }
} 