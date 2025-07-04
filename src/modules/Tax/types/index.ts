// Tax Module Types
// Converted from Python tax calculation files

export enum LHDNStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR"
}

export enum TaxType {
  GST = "GST",
  SST = "SST",
  VAT = "VAT",
  WHT = "WHT",
  CP204 = "CP204",
  MTD = "MTD",
  SST_EXEMPT = "SST_EXEMPT",
  SST_ZERO_RATED = "SST_ZERO_RATED"
}

export enum TaxRate {
  GST = 0.06,
  SST = 0.06,
  VAT = 0.10,
  WHT = 0.05,
  CP204 = 0.24,
  SST_EXEMPT = 0.00,
  SST_ZERO_RATED = 0.00
}

export interface LHDNConfig {
  api_endpoint: string;
  client_id: string;
  client_secret: string;
  certificate_path: string;
  private_key_path: string;
  timeout: number;
  max_retries: number;
  retry_delay: number;
  sandbox_mode: boolean;
}

export interface EInvoiceData {
  invoice_number: string;
  invoice_date: string;
  supplier_tax_id: string;
  customer_tax_id: string;
  total_amount: number;
  tax_amount: number;
  currency: string;
  items: InvoiceItem[];
  payment_terms: string;
  delivery_address: string;
  notes: string;
  tenant_id: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
  tax_amount?: number;
}

export interface LHDNResponse {
  success: boolean;
  status_code: number;
  data: Record<string, any>;
  message: string;
  submission_id?: string;
  timestamp: string;
}

export interface TaxCalculationResult {
  tax_type: TaxType;
  amount: number;
  tax: number;
  rate: number;
  lhdn_status?: LHDNStatus;
  message: string;
  calculation_date: string;
  tenant_id: string;
}

export interface SSTReturn {
  tax_period: string;
  tax_due: number;
  payment_due_date: string;
  taxable_supplies: number;
  tenant_id: string;
}

export interface MTDCalculation {
  range1: { min: number; max: number; rate: number };
  range2: { min: number; max: number; rate: number };
  range3: { min: number; max: number; rate: number };
}

export interface MalaysianTaxRates {
  SST: number;
  CP204: number;
  MTD: MTDCalculation;
}

export interface TaxValidationError {
  field: string;
  message: string;
  code: string;
}

export interface TaxSubmission {
  id: string;
  invoice_number: string;
  submission_id: string;
  status: LHDNStatus;
  submitted_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  tenant_id: string;
  tax_amount: number;
  total_amount: number;
}

export interface TaxReport {
  period: string;
  total_taxable_amount: number;
  total_tax_amount: number;
  submissions_count: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  tax_breakdown: Record<TaxType, number>;
  tenant_id: string;
  generated_at: string;
}

export interface TaxSettings {
  tenant_id: string;
  tax_registration_number: string;
  tax_registration_date: string;
  tax_period: 'monthly' | 'quarterly' | 'annually';
  auto_submit: boolean;
  lhdn_integration_enabled: boolean;
  default_tax_rate: number;
  tax_exemptions: string[];
  created_at: string;
  updated_at: string;
}

// Service interfaces
export interface ITaxService {
  calculateTax(transaction: any, taxType: TaxType): Promise<TaxCalculationResult>;
  calculateSSTReturn(taxableSupplies: number, tenantId: string): Promise<SSTReturn>;
  calculateWithholding(amount: number, taxType: TaxType): Promise<number>;
  validateTaxData(data: EInvoiceData): Promise<TaxValidationError[]>;
  submitEInvoice(invoice: EInvoiceData): Promise<LHDNResponse>;
  getSubmissionStatus(submissionId: string): Promise<LHDNResponse>;
  downloadEInvoice(submissionId: string, format: string): Promise<ArrayBuffer>;
  cancelEInvoice(submissionId: string, reason: string): Promise<LHDNResponse>;
  getTaxReport(period: string, tenantId: string): Promise<TaxReport>;
  getTaxSettings(tenantId: string): Promise<TaxSettings>;
  updateTaxSettings(settings: Partial<TaxSettings>): Promise<void>;
}

// Validation interfaces
export interface TaxValidator {
  validateInvoiceData(data: EInvoiceData): Promise<TaxValidationError[]>;
  validateTaxId(taxId: string): boolean;
  validateInvoiceNumber(invoiceNumber: string): boolean;
  validateItem(item: InvoiceItem, index: number): TaxValidationError[];
}

// LHDN Client interfaces
export interface ILHDNClient {
  submitEInvoice(invoice: EInvoiceData): Promise<LHDNResponse>;
  getSubmissionStatus(submissionId: string): Promise<LHDNResponse>;
  downloadEInvoice(submissionId: string, format: string): Promise<ArrayBuffer>;
  cancelEInvoice(submissionId: string, reason: string): Promise<LHDNResponse>;
}

// Tax calculation filters
export interface TaxCalculationFilters {
  tenant_id?: string;
  tax_type?: TaxType;
  start_date?: string;
  end_date?: string;
  status?: LHDNStatus;
  limit?: number;
}

// Tax reporting filters
export interface TaxReportFilters {
  tenant_id?: string;
  period?: string;
  tax_type?: TaxType;
  include_rejected?: boolean;
}

// Malaysian tax ID validation
export const TAX_ID_PATTERN = /^\d{10,12}$/;
export const INVOICE_NUMBER_PATTERN = /^[A-Za-z0-9\-_]{3,50}$/;

// Default Malaysian tax rates
export const MALAYSIAN_TAX_RATES: MalaysianTaxRates = {
  SST: 0.06,
  CP204: 0.24,
  MTD: {
    range1: { min: 0, max: 5000, rate: 0 },
    range2: { min: 5001, max: 20000, rate: 0.01 },
    range3: { min: 20001, max: 35000, rate: 0.03 }
  }
};

// Tax calculation constants
export const TAX_CALCULATION_CONSTANTS = {
  DEFAULT_CURRENCY: 'MYR',
  SUPPORTED_CURRENCIES: ['MYR', 'USD', 'SGD'],
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 30000,
  RETRY_DELAY: 1000
}; 