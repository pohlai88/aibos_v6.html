// Ledger Module TypeScript Types
// Converted from Python journal_entries.py

export enum AccountType {
  ASSET = "asset",
  LIABILITY = "liability",
  EQUITY = "equity",
  REVENUE = "revenue",
  EXPENSE = "expense"
}

export enum TransactionType {
  SALE = "sale",
  PURCHASE = "purchase",
  PAYMENT = "payment",
  RECEIPT = "receipt",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment"
}

export enum AccountSubType {
  CURRENT_ASSET = "current_asset",
  FIXED_ASSET = "fixed_asset",
  CURRENT_LIABILITY = "current_liability",
  LONG_TERM_LIABILITY = "long_term_liability"
}

export enum Currency {
  MYR = "MYR",
  USD = "USD",
  EUR = "EUR"
}

export enum WorkflowStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  POSTED = "posted"
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sub_type?: AccountSubType;
  tenant_id?: string;
}

export interface ApprovalComment {
  id: string;
  user_id: string;
  comment: string;
  timestamp: string;
  status: WorkflowStatus;
}

export interface JournalEntryLine {
  id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  reference?: string;
  currency: string;
  fx_rate: number;
  tenant_id?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalEntryLine[];
  transaction_type?: TransactionType;
  created_at: string;
  created_by?: string;
  is_posted: boolean;
  posted_at?: string;
  tenant_id?: string;
  status: WorkflowStatus;
  approver_comments: ApprovalComment[];
  version: number;
  base_currency: string;
  user_id: string;
  entity_id: string;
  originating_module: string;
  finalized: boolean;
  superseded_by?: string;
}

export interface MFRSViolation {
  rule_id: string;
  standard: string;
  compliance_level: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceReport {
  compliance_score: number;
  violations: MFRSViolation[];
  recommendations: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  confidence_score: number;
}

export interface CurrencySummary {
  [currency: string]: number;
}

export interface TrialBalance {
  [account_id: string]: number;
}

export interface JournalEntryTemplate {
  id?: string;
  name: string;
  description: string;
  lines: Omit<JournalEntryLine, 'id'>[];
  transaction_type?: TransactionType;
}

// Service interfaces
export interface ILedgerService {
  createAccount(code: string, name: string, type: AccountType, parent_id?: string): Promise<Account>;
  createJournalEntry(reference: string, description: string, date?: string, transaction_type?: TransactionType): Promise<JournalEntry>;
  postJournalEntry(entry: JournalEntry, user_id?: string): Promise<void>;
  getAccountBalance(account_id: string, as_of_date?: string): Promise<number>;
  getTrialBalance(as_of_date?: string): Promise<TrialBalance>;
  validateJournalEntry(entry: JournalEntry): Promise<ValidationResult>;
  getComplianceReport(entity_id: string): Promise<ComplianceReport>;
}

export interface IJournalEntryTemplates {
  saleEntry(customer_account_id: string, revenue_account_id: string, amount: number, reference: string, description: string): Promise<JournalEntry>;
  paymentEntry(customer_account_id: string, bank_account_id: string, amount: number, reference: string, description: string): Promise<JournalEntry>;
  monthlySaasRevenue(customer_account_id: string, revenue_account_id: string, amount: number, reference: string, description: string): Promise<JournalEntry>;
  deferredRevenueRecognition(deferred_revenue_account_id: string, revenue_account_id: string, amount: number, reference: string, description: string): Promise<JournalEntry>;
  proratedSubscriptionBilling(customer_account_id: string, revenue_account_id: string, full_amount: number, prorated_amount: number, reference: string, description: string): Promise<JournalEntry>;
  subscriptionUpgrade(customer_account_id: string, revenue_account_id: string, old_amount: number, new_amount: number, reference: string, description: string): Promise<JournalEntry>;
  subscriptionCancellation(customer_account_id: string, revenue_account_id: string, refund_amount: number, reference: string, description: string): Promise<JournalEntry>;
  annualSubscriptionPrepayment(customer_account_id: string, deferred_revenue_account_id: string, amount: number, reference: string, description: string): Promise<JournalEntry>;
} 