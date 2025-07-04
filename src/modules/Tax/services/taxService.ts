import { supabase } from '../../../lib/supabase';
import {
  TaxType,
  TaxRate,
  LHDNStatus,
  EInvoiceData,
  InvoiceItem,
  TaxCalculationResult,
  SSTReturn,
  LHDNResponse,
  TaxValidationError,
  TaxSubmission,
  TaxReport,
  TaxSettings,
  ITaxService,
  TaxValidator,
  ILHDNClient,
  TaxCalculationFilters,
  TaxReportFilters,
  MALAYSIAN_TAX_RATES,
  TAX_ID_PATTERN,
  INVOICE_NUMBER_PATTERN,
  TAX_CALCULATION_CONSTANTS
} from '../types';

export interface TaxCalculation {
  id?: string;
  organization_id: string;
  tax_type: 'SST' | 'CP204' | 'MTD' | 'CORPORATE';
  amount: number;
  calculated_tax: number;
  rate: number;
  period: string;
  created_at?: string;
}

export interface MTDRange {
  min: number;
  max: number;
  rate: number;
}

export interface TaxRates {
  SST: number;
  CP204: number;
  MTD: MTDRange[];
}

export class TaxValidator implements TaxValidator {
  async validateInvoiceData(data: EInvoiceData): Promise<TaxValidationError[]> {
    const errors: TaxValidationError[] = [];

    // Check required fields
    const requiredFields = [
      'invoice_number', 'invoice_date', 'supplier_tax_id',
      'customer_tax_id', 'total_amount', 'tax_amount'
    ];

    for (const field of requiredFields) {
      const value = (data as any)[field];
      if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        errors.push({
          field,
          message: `Missing required field: ${field}`,
          code: 'MISSING_FIELD'
        });
      }
    }

    // Validate tax IDs
    if (!this.validateTaxId(data.supplier_tax_id)) {
      errors.push({
        field: 'supplier_tax_id',
        message: 'Invalid supplier tax ID format',
        code: 'INVALID_TAX_ID'
      });
    }

    if (!this.validateTaxId(data.customer_tax_id)) {
      errors.push({
        field: 'customer_tax_id',
        message: 'Invalid customer tax ID format',
        code: 'INVALID_TAX_ID'
      });
    }

    // Validate amounts
    if (data.total_amount <= 0) {
      errors.push({
        field: 'total_amount',
        message: 'Total amount must be greater than 0',
        code: 'INVALID_AMOUNT'
      });
    }

    if (data.tax_amount < 0) {
      errors.push({
        field: 'tax_amount',
        message: 'Tax amount cannot be negative',
        code: 'INVALID_TAX_AMOUNT'
      });
    }

    if (data.tax_amount > data.total_amount) {
      errors.push({
        field: 'tax_amount',
        message: 'Tax amount cannot exceed total amount',
        code: 'INVALID_TAX_AMOUNT'
      });
    }

    // Validate currency
    if (!TAX_CALCULATION_CONSTANTS.SUPPORTED_CURRENCIES.includes(data.currency)) {
      errors.push({
        field: 'currency',
        message: 'Unsupported currency',
        code: 'UNSUPPORTED_CURRENCY'
      });
    }

    // Validate invoice number format
    if (!this.validateInvoiceNumber(data.invoice_number)) {
      errors.push({
        field: 'invoice_number',
        message: 'Invalid invoice number format',
        code: 'INVALID_INVOICE_NUMBER'
      });
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push({
        field: 'items',
        message: 'At least one item is required',
        code: 'MISSING_ITEMS'
      });
    } else {
      for (let i = 0; i < data.items.length; i++) {
        const itemErrors = this.validateItem(data.items[i], i);
        errors.push(...itemErrors);
      }
    }

    return errors;
  }

  validateTaxId(taxId: string): boolean {
    return TAX_ID_PATTERN.test(taxId);
  }

  validateInvoiceNumber(invoiceNumber: string): boolean {
    return INVOICE_NUMBER_PATTERN.test(invoiceNumber);
  }

  validateItem(item: InvoiceItem, index: number): TaxValidationError[] {
    const errors: TaxValidationError[] = [];

    const requiredFields = ['description', 'quantity', 'unit_price', 'total_price'];
    for (const field of requiredFields) {
      if (!(field in item) || (item as any)[field] === null || (item as any)[field] === undefined) {
        errors.push({
          field: `items[${index}].${field}`,
          message: `Missing required field '${field}'`,
          code: 'MISSING_ITEM_FIELD'
        });
      }
    }

    if (item.quantity <= 0) {
      errors.push({
        field: `items[${index}].quantity`,
        message: 'Quantity must be greater than 0',
        code: 'INVALID_QUANTITY'
      });
    }

    if (item.unit_price < 0) {
      errors.push({
        field: `items[${index}].unit_price`,
        message: 'Unit price cannot be negative',
        code: 'INVALID_UNIT_PRICE'
      });
    }

    return errors;
  }
}

export class LHDNClient implements ILHDNClient {
  private config: any;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private validator: TaxValidator;

  constructor(config: any) {
    this.config = config;
    this.validator = new TaxValidator();
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Simulate OAuth2 token request
      // In production, this would make actual API call to LHDN
      this.accessToken = 'mock_access_token_' + Date.now();
      this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to obtain access token:', error);
      throw new Error('Authentication failed');
    }
  }

  private createSignature(data: string, timestamp: string): string {
    // Simulate HMAC signature creation
    const message = `${data}${timestamp}`;
    return btoa(message); // Base64 encode for demo
  }

  private prepareInvoiceData(invoice: EInvoiceData): Record<string, any> {
    return {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: invoice.invoice_date,
      supplierTaxId: invoice.supplier_tax_id,
      customerTaxId: invoice.customer_tax_id,
      totalAmount: Math.round(invoice.total_amount * 100) / 100,
      taxAmount: Math.round(invoice.tax_amount * 100) / 100,
      currency: invoice.currency,
      items: invoice.items,
      paymentTerms: invoice.payment_terms,
      deliveryAddress: invoice.delivery_address,
      notes: invoice.notes,
      tenantId: invoice.tenant_id
    };
  }

  async submitEInvoice(invoice: EInvoiceData): Promise<LHDNResponse> {
    try {
      // Validate invoice data
      const validationErrors = await this.validator.validateInvoiceData(invoice);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.map(e => e.message).join('; ');
        throw new Error(errorMessage);
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      // Prepare request data
      const invoiceData = this.prepareInvoiceData(invoice);
      const timestamp = Date.now().toString();

      // Create signature
      const dataString = JSON.stringify(invoiceData);
      const signature = this.createSignature(dataString, timestamp);

      // Simulate API submission
      // In production, this would make actual API call to LHDN
      const submissionId = 'sub_' + Date.now();

      // Store submission in database
      await this.storeSubmission(invoice, submissionId);

      return {
        success: true,
        status_code: 200,
        data: { submissionId, status: LHDNStatus.SUBMITTED },
        message: 'E-invoice submitted successfully',
        submission_id: submissionId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('E-invoice submission failed:', error);
      return {
        success: false,
        status_code: 400,
        data: {},
        message: error instanceof Error ? error.message : 'Submission failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getSubmissionStatus(submissionId: string): Promise<LHDNResponse> {
    try {
      const { data: submission } = await supabase
        .from('tax_submissions')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (!submission) {
        throw new Error('Submission not found');
      }

      return {
        success: true,
        status_code: 200,
        data: { status: submission.status, submissionId },
        message: 'Status retrieved successfully',
        submission_id: submissionId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting submission status:', error);
      return {
        success: false,
        status_code: 404,
        data: {},
        message: error instanceof Error ? error.message : 'Status check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async downloadEInvoice(submissionId: string, format: string = 'PDF'): Promise<ArrayBuffer> {
    try {
      // Simulate document download
      // In production, this would download actual document from LHDN
      const mockDocument = `Mock ${format} document for submission ${submissionId}`;
      const encoder = new TextEncoder();
      return encoder.encode(mockDocument).buffer;
    } catch (error) {
      console.error('Error downloading e-invoice:', error);
      throw new Error('Download failed');
    }
  }

  async cancelEInvoice(submissionId: string, reason: string): Promise<LHDNResponse> {
    try {
      // Update submission status in database
      await supabase
        .from('tax_submissions')
        .update({ 
          status: LHDNStatus.REJECTED,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('submission_id', submissionId);

      return {
        success: true,
        status_code: 200,
        data: { submissionId, status: LHDNStatus.REJECTED },
        message: 'E-invoice cancelled successfully',
        submission_id: submissionId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error cancelling e-invoice:', error);
      return {
        success: false,
        status_code: 400,
        data: {},
        message: error instanceof Error ? error.message : 'Cancellation failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async storeSubmission(invoice: EInvoiceData, submissionId: string): Promise<void> {
    try {
      await supabase
        .from('tax_submissions')
        .insert({
          id: crypto.randomUUID(),
          invoice_number: invoice.invoice_number,
          submission_id,
          status: LHDNStatus.SUBMITTED,
          submitted_at: new Date().toISOString(),
          tenant_id: invoice.tenant_id,
          tax_amount: invoice.tax_amount,
          total_amount: invoice.total_amount
        });
    } catch (error) {
      console.error('Error storing submission:', error);
    }
  }
}

export class TaxService implements ITaxService {
  private validator: TaxValidator;
  private lhdnClient: LHDNClient;

  constructor() {
    this.validator = new TaxValidator();
    this.lhdnClient = new LHDNClient({
      api_endpoint: process.env.LHDN_API_ENDPOINT || 'https://api.lhdn.gov.my/v1',
      client_id: process.env.LHDN_CLIENT_ID || '',
      client_secret: process.env.LHDN_CLIENT_SECRET || '',
      certificate_path: process.env.LHDN_CERTIFICATE_PATH || '',
      private_key_path: process.env.LHDN_PRIVATE_KEY_PATH || '',
      timeout: 30000,
      max_retries: 3,
      retry_delay: 1000,
      sandbox_mode: process.env.NODE_ENV !== 'production'
    });
  }

  async calculateTax(transaction: any, taxType: TaxType): Promise<TaxCalculationResult> {
    const amount = transaction.amount || 0;
    let rate = 0;

    switch (taxType) {
      case TaxType.GST:
        rate = TaxRate.GST;
        break;
      case TaxType.SST:
        rate = TaxRate.SST;
        break;
      case TaxType.VAT:
        rate = TaxRate.VAT;
        break;
      case TaxType.WHT:
        rate = TaxRate.WHT;
        break;
      case TaxType.SST_EXEMPT:
        rate = TaxRate.SST_EXEMPT;
        break;
      case TaxType.SST_ZERO_RATED:
        rate = TaxRate.SST_ZERO_RATED;
        break;
      default:
        rate = 0;
    }

    const tax = amount * rate;

    return {
      tax_type: taxType,
      amount,
      tax: Math.round(tax * 100) / 100,
      rate,
      message: `${taxType} calculated successfully`,
      calculation_date: new Date().toISOString(),
      tenant_id: transaction.tenant_id || 'default'
    };
  }

  async calculateSSTReturn(taxableSupplies: number, tenantId: string): Promise<SSTReturn> {
    const taxDue = taxableSupplies * MALAYSIAN_TAX_RATES.SST;
    const dueDate = this.calculatePaymentDueDate();

    return {
      tax_period: 'Monthly',
      tax_due: Math.round(taxDue * 100) / 100,
      payment_due_date: dueDate,
      taxable_supplies: taxableSupplies,
      tenant_id: tenantId
    };
  }

  async calculateWithholding(amount: number, taxType: TaxType): Promise<number> {
    if (taxType === TaxType.MTD) {
      const mtdRates = MALAYSIAN_TAX_RATES.MTD;
      
      if (amount <= mtdRates.range1.max) {
        return amount * mtdRates.range1.rate;
      } else if (amount <= mtdRates.range2.max) {
        return amount * mtdRates.range2.rate;
      } else if (amount <= mtdRates.range3.max) {
        return amount * mtdRates.range3.rate;
      }
    }

    const rate = MALAYSIAN_TAX_RATES[taxType as keyof typeof MALAYSIAN_TAX_RATES] || 0;
    return amount * rate;
  }

  async validateTaxData(data: EInvoiceData): Promise<TaxValidationError[]> {
    return this.validator.validateInvoiceData(data);
  }

  async submitEInvoice(invoice: EInvoiceData): Promise<LHDNResponse> {
    return this.lhdnClient.submitEInvoice(invoice);
  }

  async getSubmissionStatus(submissionId: string): Promise<LHDNResponse> {
    return this.lhdnClient.getSubmissionStatus(submissionId);
  }

  async downloadEInvoice(submissionId: string, format: string): Promise<ArrayBuffer> {
    return this.lhdnClient.downloadEInvoice(submissionId, format);
  }

  async cancelEInvoice(submissionId: string, reason: string): Promise<LHDNResponse> {
    return this.lhdnClient.cancelEInvoice(submissionId, reason);
  }

  async getTaxReport(period: string, tenantId: string): Promise<TaxReport> {
    try {
      const { data: submissions } = await supabase
        .from('tax_submissions')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('submitted_at', this.getPeriodStartDate(period))
        .lte('submitted_at', this.getPeriodEndDate(period));

      const totalTaxableAmount = submissions?.reduce((sum, sub) => sum + sub.total_amount, 0) || 0;
      const totalTaxAmount = submissions?.reduce((sum, sub) => sum + sub.tax_amount, 0) || 0;
      const submissionsCount = submissions?.length || 0;
      const approvedCount = submissions?.filter(s => s.status === LHDNStatus.APPROVED).length || 0;
      const pendingCount = submissions?.filter(s => s.status === LHDNStatus.PENDING).length || 0;
      const rejectedCount = submissions?.filter(s => s.status === LHDNStatus.REJECTED).length || 0;

      const taxBreakdown: Record<TaxType, number> = {
        [TaxType.GST]: 0,
        [TaxType.SST]: totalTaxAmount,
        [TaxType.VAT]: 0,
        [TaxType.WHT]: 0,
        [TaxType.CP204]: 0,
        [TaxType.MTD]: 0,
        [TaxType.SST_EXEMPT]: 0,
        [TaxType.SST_ZERO_RATED]: 0
      };

      return {
        period,
        total_taxable_amount: totalTaxableAmount,
        total_tax_amount: totalTaxAmount,
        submissions_count: submissionsCount,
        approved_count: approvedCount,
        pending_count: pendingCount,
        rejected_count: rejectedCount,
        tax_breakdown: taxBreakdown,
        tenant_id: tenantId,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  }

  async getTaxSettings(tenantId: string): Promise<TaxSettings> {
    try {
      const { data: settings } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (!settings) {
        // Return default settings
        return {
          tenant_id: tenantId,
          tax_registration_number: '',
          tax_registration_date: '',
          tax_period: 'monthly',
          auto_submit: false,
          lhdn_integration_enabled: false,
          default_tax_rate: TaxRate.SST,
          tax_exemptions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return settings;
    } catch (error) {
      console.error('Error getting tax settings:', error);
      throw error;
    }
  }

  async updateTaxSettings(settings: Partial<TaxSettings>): Promise<void> {
    try {
      const { error } = await supabase
        .from('tax_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating tax settings:', error);
      throw error;
    }
  }

  private calculatePaymentDueDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return nextMonth.toISOString().split('T')[0];
  }

  private getPeriodStartDate(period: string): string {
    const now = new Date();
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1).toISOString();
      case 'annually':
        return new Date(now.getFullYear(), 0, 1).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  }

  private getPeriodEndDate(period: string): string {
    const now = new Date();
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString();
      case 'annually':
        return new Date(now.getFullYear(), 11, 31).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    }
  }
}

// Export singleton instance
export const taxService = new TaxService(); 