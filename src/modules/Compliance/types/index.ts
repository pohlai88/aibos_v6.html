// MFRS Compliance Engine Types
// Converted from Python mfrs_compliance_engine.py

export enum MFRSStandard {
  MFRS_101 = "MFRS 101 - Presentation of Financial Statements",
  MFRS_107 = "MFRS 107 - Statement of Cash Flows",
  MFRS_108 = "MFRS 108 - Accounting Policies, Changes in Accounting Estimates and Errors",
  MFRS_109 = "MFRS 109 - Financial Instruments",
  MFRS_110 = "MFRS 110 - Consolidated Financial Statements",
  MFRS_112 = "MFRS 112 - Income Taxes",
  MFRS_113 = "MFRS 113 - Fair Value Measurement",
  MFRS_115 = "MFRS 115 - Revenue from Contracts with Customers",
  MFRS_116 = "MFRS 116 - Leases",
  MFRS_117 = "MFRS 117 - Insurance Contracts",
  MFRS_118 = "MFRS 118 - Employee Benefits",
  MFRS_119 = "MFRS 119 - Employee Benefits",
  MFRS_120 = "MFRS 120 - Accounting for Government Grants and Disclosure of Government Assistance",
  MFRS_121 = "MFRS 121 - The Effects of Changes in Foreign Exchange Rates",
  MFRS_123 = "MFRS 123 - Borrowing Costs",
  MFRS_124 = "MFRS 124 - Related Party Disclosures",
  MFRS_128 = "MFRS 128 - Investments in Associates and Joint Ventures",
  MFRS_129 = "MFRS 129 - Financial Reporting in Hyperinflationary Economies",
  MFRS_132 = "MFRS 132 - Financial Instruments: Presentation",
  MFRS_133 = "MFRS 133 - Earnings Per Share",
  MFRS_134 = "MFRS 134 - Interim Financial Reporting",
  MFRS_136 = "MFRS 136 - Impairment of Assets",
  MFRS_137 = "MFRS 137 - Provisions, Contingent Liabilities and Contingent Assets",
  MFRS_138 = "MFRS 138 - Intangible Assets",
  MFRS_140 = "MFRS 140 - Investment Property",
  MFRS_141 = "MFRS 141 - Agriculture",
  MFRS_1000 = "MFRS 1000 - Framework for the Preparation and Presentation of Financial Statements"
}

export enum ComplianceLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFO = "INFO"
}

export enum ValidationResult {
  PASS = "PASS",
  FAIL = "FAIL",
  WARNING = "WARNING",
  INFO = "INFO"
}

export interface MFRSRule {
  id: string;
  standard: MFRSStandard;
  rule_code: string;
  title: string;
  description: string;
  compliance_level: ComplianceLevel;
  validation_logic: string; // JSON-serialized validation logic
  parameters: Record<string, any>;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationViolation {
  id: string;
  rule_id: string;
  rule_title: string;
  standard: MFRSStandard;
  compliance_level: ComplianceLevel;
  message: string;
  details: Record<string, any>;
  transaction_id?: string;
  account_id?: string;
  amount?: number;
  suggested_correction?: string;
  created_at: string;
}

export interface DisclosureRequirement {
  id: string;
  standard: MFRSStandard;
  requirement_code: string;
  title: string;
  description: string;
  disclosure_type: string; // "note", "statement", "annex"
  template: string; // Template for generating disclosure
  required_conditions: Record<string, any>;
  is_mandatory: boolean;
  effective_date: string;
  created_at: string;
}

export interface GeneratedDisclosure {
  id: string;
  requirement_id: string;
  standard: MFRSStandard;
  title: string;
  content: string;
  disclosure_type: string;
  financial_period: string;
  tenant_id: string;
  generated_at: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface ComplianceReport {
  tenant_id: string;
  start_date?: string;
  end_date?: string;
  compliance_score: number;
  total_violations: number;
  critical_violations: number;
  high_violations: number;
  medium_violations: number;
  low_violations: number;
  total_disclosures: number;
  mandatory_disclosures: number;
  optional_disclosures: number;
  violations_by_standard: Record<string, number>;
  disclosures_by_standard: Record<string, number>;
  recommendations: string[];
  generated_at: string;
}

export interface ValidationLogic {
  type: 'account_balance' | 'transaction_type' | 'amount_threshold' | 'account_relationship' | 'custom_logic';
  account_code?: string;
  condition?: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold?: number;
  transaction_types?: string[];
  amount_field?: string;
  relationship_type?: string;
  custom_expression?: string;
}

export interface FinancialData {
  accounts: Record<string, number>;
  transactions: Record<string, any>[];
  period: string;
  tenant_id: string;
  currency: string;
  [key: string]: any;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  accounts: Record<string, number>;
  date: string;
  reference: string;
  description: string;
  tenant_id: string;
  [key: string]: any;
}

// Service interfaces
export interface IMFRSComplianceService {
  validateTransaction(transaction: Transaction): Promise<ValidationViolation[]>;
  generateDisclosures(financialData: FinancialData): Promise<GeneratedDisclosure[]>;
  getViolations(filters?: ViolationFilters): Promise<ValidationViolation[]>;
  getDisclosures(filters?: DisclosureFilters): Promise<GeneratedDisclosure[]>;
  getComplianceReport(tenantId: string, startDate?: string, endDate?: string): Promise<ComplianceReport>;
  addRule(rule: MFRSRule): Promise<void>;
  updateRule(ruleId: string, updates: Partial<MFRSRule>): Promise<void>;
  deactivateRule(ruleId: string): Promise<void>;
}

export interface ViolationFilters {
  tenant_id?: string;
  standard?: MFRSStandard;
  compliance_level?: ComplianceLevel;
  start_date?: string;
  end_date?: string;
  limit?: number;
}

export interface DisclosureFilters {
  tenant_id?: string;
  standard?: MFRSStandard;
  disclosure_type?: string;
  is_approved?: boolean;
  limit?: number;
}

// Rule validation interfaces
export interface RuleValidator {
  validateRule(rule: MFRSRule, transaction: Transaction): Promise<[ValidationResult, string?]>;
}

export interface DisclosureGenerator {
  generateDisclosure(requirement: DisclosureRequirement, financialData: FinancialData): Promise<GeneratedDisclosure>;
} 