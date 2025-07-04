// MFRS Compliance Service
// Converted from Python mfrs_compliance_engine.py

import { supabase } from '../../../lib/supabase';
import {
  MFRSStandard,
  ComplianceLevel,
  ValidationResult,
  MFRSRule,
  ValidationViolation,
  DisclosureRequirement,
  GeneratedDisclosure,
  ComplianceReport,
  ValidationLogic,
  FinancialData,
  Transaction,
  IMFRSComplianceService,
  ViolationFilters,
  DisclosureFilters
} from '../types';

export class MFRSComplianceService implements IMFRSComplianceService {
  private defaultRules: MFRSRule[] = [
    {
      id: 'rule_001',
      standard: MFRSStandard.MFRS_101,
      rule_code: 'MFRS101_001',
      title: 'Balance Sheet Classification',
      description: 'Assets and liabilities must be classified as current or non-current',
      compliance_level: ComplianceLevel.CRITICAL,
      validation_logic: JSON.stringify({
        type: 'account_balance',
        account_code: 'current_assets',
        condition: 'greater_than',
        threshold: 0
      }),
      parameters: {},
      effective_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'rule_002',
      standard: MFRSStandard.MFRS_107,
      rule_code: 'MFRS107_001',
      title: 'Cash Flow Classification',
      description: 'Cash flows must be classified as operating, investing, or financing',
      compliance_level: ComplianceLevel.HIGH,
      validation_logic: JSON.stringify({
        type: 'transaction_type',
        transaction_types: ['operating', 'investing', 'financing']
      }),
      parameters: {},
      effective_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'rule_003',
      standard: MFRSStandard.MFRS_109,
      rule_code: 'MFRS109_001',
      title: 'Financial Instrument Classification',
      description: 'Financial instruments must be classified according to MFRS 109',
      compliance_level: ComplianceLevel.HIGH,
      validation_logic: JSON.stringify({
        type: 'custom_logic',
        custom_expression: 'financial_instrument_classification'
      }),
      parameters: {},
      effective_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private defaultDisclosureRequirements: DisclosureRequirement[] = [
    {
      id: 'disc_001',
      standard: MFRSStandard.MFRS_101,
      requirement_code: 'MFRS101_DISC_001',
      title: 'Significant Accounting Policies',
      description: 'Disclosure of significant accounting policies',
      disclosure_type: 'note',
      template: 'The entity applies the following significant accounting policies: {{policies}}',
      required_conditions: { is_mandatory: true },
      is_mandatory: true,
      effective_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'disc_002',
      standard: MFRSStandard.MFRS_107,
      requirement_code: 'MFRS107_DISC_001',
      title: 'Cash and Cash Equivalents',
      description: 'Disclosure of cash and cash equivalents composition',
      disclosure_type: 'note',
      template: 'Cash and cash equivalents comprise: {{composition}}',
      required_conditions: { has_cash_equivalents: true },
      is_mandatory: true,
      effective_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  constructor() {
    this.initializeDefaultRules();
  }

  private async initializeDefaultRules(): Promise<void> {
    try {
      // Check if rules already exist
      const { data: existingRules } = await supabase
        .from('mfrs_rules')
        .select('id')
        .limit(1);

      if (!existingRules || existingRules.length === 0) {
        // Insert default rules
        for (const rule of this.defaultRules) {
          await this.addRule(rule);
        }

        // Insert default disclosure requirements
        for (const requirement of this.defaultDisclosureRequirements) {
          await this.addDisclosureRequirement(requirement);
        }
      }
    } catch (error) {
      console.error('Error initializing default rules:', error);
    }
  }

  async validateTransaction(transaction: Transaction): Promise<ValidationViolation[]> {
    try {
      const { data: rules } = await supabase
        .from('mfrs_rules')
        .select('*')
        .eq('is_active', true);

      if (!rules) return [];

      const violations: ValidationViolation[] = [];

      for (const rule of rules) {
        const [result, message] = await this.validateRule(rule, transaction);
        
        if (result === ValidationResult.FAIL || result === ValidationResult.WARNING) {
          const violation: ValidationViolation = {
            id: crypto.randomUUID(),
            rule_id: rule.id,
            rule_title: rule.title,
            standard: rule.standard,
            compliance_level: rule.compliance_level,
            message: message || 'Validation failed',
            details: { transaction_id: transaction.id, rule_id: rule.id },
            transaction_id: transaction.id,
            amount: transaction.amount,
            suggested_correction: await this.generateSuggestedCorrection(rule, transaction),
            created_at: new Date().toISOString()
          };

          violations.push(violation);
          await this.storeViolation(violation);
        }
      }

      return violations;
    } catch (error) {
      console.error('Error validating transaction:', error);
      return [];
    }
  }

  private async validateRule(rule: MFRSRule, transaction: Transaction): Promise<[ValidationResult, string?]> {
    try {
      const validationLogic: ValidationLogic = JSON.parse(rule.validation_logic);
      
      switch (validationLogic.type) {
        case 'account_balance':
          return this.validateAccountBalance(rule, transaction, validationLogic);
        case 'transaction_type':
          return this.validateTransactionType(rule, transaction, validationLogic);
        case 'amount_threshold':
          return this.validateAmountThreshold(rule, transaction, validationLogic);
        case 'account_relationship':
          return this.validateAccountRelationship(rule, transaction, validationLogic);
        case 'custom_logic':
          return this.validateCustomLogic(rule, transaction, validationLogic);
        default:
          return [ValidationResult.FAIL, `Unknown rule type: ${validationLogic.type}`];
      }
    } catch (error) {
      console.error(`Error validating rule ${rule.id}:`, error);
      return [ValidationResult.FAIL, `Validation error: ${error}`];
    }
  }

  private async validateAccountBalance(
    rule: MFRSRule,
    transaction: Transaction,
    logic: ValidationLogic
  ): Promise<[ValidationResult, string?]> {
    const accountCode = logic.account_code;
    const condition = logic.condition;
    const threshold = logic.threshold || 0;

    if (!accountCode || !transaction.accounts[accountCode]) {
      return [ValidationResult.INFO, `Account ${accountCode} not found in transaction`];
    }

    const balance = transaction.accounts[accountCode];

    switch (condition) {
      case 'greater_than':
        return balance > threshold 
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Account ${accountCode} balance ${balance} is not greater than ${threshold}`];
      
      case 'less_than':
        return balance < threshold
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Account ${accountCode} balance ${balance} is not less than ${threshold}`];
      
      case 'equals':
        return balance === threshold
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Account ${accountCode} balance ${balance} does not equal ${threshold}`];
      
      case 'not_equals':
        return balance !== threshold
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Account ${accountCode} balance ${balance} equals ${threshold}`];
      
      default:
        return [ValidationResult.FAIL, `Unknown condition: ${condition}`];
    }
  }

  private async validateTransactionType(
    rule: MFRSRule,
    transaction: Transaction,
    logic: ValidationLogic
  ): Promise<[ValidationResult, string?]> {
    const allowedTypes = logic.transaction_types || [];
    
    if (allowedTypes.length === 0) {
      return [ValidationResult.INFO, 'No transaction types specified'];
    }

    return allowedTypes.includes(transaction.type)
      ? [ValidationResult.PASS, undefined]
      : [ValidationResult.FAIL, `Transaction type ${transaction.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`];
  }

  private async validateAmountThreshold(
    rule: MFRSRule,
    transaction: Transaction,
    logic: ValidationLogic
  ): Promise<[ValidationResult, string?]> {
    const amountField = logic.amount_field || 'amount';
    const threshold = logic.threshold || 0;
    const condition = logic.condition || 'greater_than';

    const amount = transaction[amountField] || transaction.amount;

    switch (condition) {
      case 'greater_than':
        return amount > threshold
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Amount ${amount} is not greater than threshold ${threshold}`];
      
      case 'less_than':
        return amount < threshold
          ? [ValidationResult.PASS, undefined]
          : [ValidationResult.FAIL, `Amount ${amount} is not less than threshold ${threshold}`];
      
      default:
        return [ValidationResult.FAIL, `Unknown condition: ${condition}`];
    }
  }

  private async validateAccountRelationship(
    rule: MFRSRule,
    transaction: Transaction,
    logic: ValidationLogic
  ): Promise<[ValidationResult, string?]> {
    // Implement account relationship validation logic
    // This would check relationships between accounts (e.g., assets = liabilities + equity)
    return [ValidationResult.PASS, undefined];
  }

  private async validateCustomLogic(
    rule: MFRSRule,
    transaction: Transaction,
    logic: ValidationLogic
  ): Promise<[ValidationResult, string?]> {
    const expression = logic.custom_expression;
    
    if (!expression) {
      return [ValidationResult.FAIL, 'No custom expression provided'];
    }

    // Implement custom validation logic based on expression
    // This could involve complex business rules specific to MFRS standards
    switch (expression) {
      case 'financial_instrument_classification':
        return this.validateFinancialInstrumentClassification(transaction);
      default:
        return [ValidationResult.FAIL, `Unknown custom expression: ${expression}`];
    }
  }

  private async validateFinancialInstrumentClassification(transaction: Transaction): Promise<[ValidationResult, string?]> {
    // Implement MFRS 109 financial instrument classification logic
    // This would check if financial instruments are properly classified
    return [ValidationResult.PASS, undefined];
  }

  private async generateSuggestedCorrection(rule: MFRSRule, transaction: Transaction): Promise<string> {
    // Generate suggested corrections based on rule type and violation
    const validationLogic: ValidationLogic = JSON.parse(rule.validation_logic);
    
    switch (validationLogic.type) {
      case 'account_balance':
        return `Review account ${validationLogic.account_code} balance and ensure it meets the ${validationLogic.condition} ${validationLogic.threshold} requirement.`;
      case 'transaction_type':
        return `Change transaction type to one of: ${validationLogic.transaction_types?.join(', ')}`;
      case 'amount_threshold':
        return `Review amount and ensure it meets the ${validationLogic.condition} ${validationLogic.threshold} requirement.`;
      default:
        return 'Review transaction for compliance with MFRS standards.';
    }
  }

  async generateDisclosures(financialData: FinancialData): Promise<GeneratedDisclosure[]> {
    try {
      const { data: requirements } = await supabase
        .from('disclosure_requirements')
        .select('*')
        .eq('is_mandatory', true);

      if (!requirements) return [];

      const disclosures: GeneratedDisclosure[] = [];

      for (const requirement of requirements) {
        if (await this.checkDisclosureConditions(requirement, financialData)) {
          const disclosure = await this.generateDisclosure(requirement, financialData);
          disclosures.push(disclosure);
          await this.storeDisclosure(disclosure);
        }
      }

      return disclosures;
    } catch (error) {
      console.error('Error generating disclosures:', error);
      return [];
    }
  }

  private async checkDisclosureConditions(
    requirement: DisclosureRequirement,
    financialData: FinancialData
  ): Promise<boolean> {
    const conditions = requirement.required_conditions;
    
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'is_mandatory':
          return value === true;
        case 'has_cash_equivalents':
          return financialData.accounts['cash_equivalents'] > 0;
        default:
          // Check if condition exists in financial data
          if (financialData[key] !== value) {
            return false;
          }
      }
    }
    
    return true;
  }

  private async generateDisclosure(
    requirement: DisclosureRequirement,
    financialData: FinancialData
  ): Promise<GeneratedDisclosure> {
    const content = this.parseTemplate(requirement.template, financialData);
    
    return {
      id: crypto.randomUUID(),
      requirement_id: requirement.id,
      standard: requirement.standard,
      title: requirement.title,
      content,
      disclosure_type: requirement.disclosure_type,
      financial_period: financialData.period,
      tenant_id: financialData.tenant_id,
      generated_at: new Date().toISOString(),
      is_approved: false
    };
  }

  private parseTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  async getViolations(filters?: ViolationFilters): Promise<ValidationViolation[]> {
    try {
      let query = supabase
        .from('validation_violations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters?.standard) {
        query = query.eq('standard', filters.standard);
      }
      if (filters?.compliance_level) {
        query = query.eq('compliance_level', filters.compliance_level);
      }
      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Error getting violations:', error);
      return [];
    }
  }

  async getDisclosures(filters?: DisclosureFilters): Promise<GeneratedDisclosure[]> {
    try {
      let query = supabase
        .from('generated_disclosures')
        .select('*')
        .order('generated_at', { ascending: false });

      if (filters?.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }
      if (filters?.standard) {
        query = query.eq('standard', filters.standard);
      }
      if (filters?.disclosure_type) {
        query = query.eq('disclosure_type', filters.disclosure_type);
      }
      if (filters?.is_approved !== undefined) {
        query = query.eq('is_approved', filters.is_approved);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Error getting disclosures:', error);
      return [];
    }
  }

  async getComplianceReport(
    tenantId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ComplianceReport> {
    try {
      const violations = await this.getViolations({
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate
      });

      const disclosures = await this.getDisclosures({
        tenant_id: tenantId
      });

      const complianceScore = this.calculateComplianceScore(violations, disclosures);
      const violationsByStandard = this.groupViolationsByStandard(violations);
      const disclosuresByStandard = this.groupDisclosuresByStandard(disclosures);

      return {
        tenant_id: tenantId,
        start_date: startDate,
        end_date: endDate,
        compliance_score: complianceScore,
        total_violations: violations.length,
        critical_violations: violations.filter(v => v.compliance_level === ComplianceLevel.CRITICAL).length,
        high_violations: violations.filter(v => v.compliance_level === ComplianceLevel.HIGH).length,
        medium_violations: violations.filter(v => v.compliance_level === ComplianceLevel.MEDIUM).length,
        low_violations: violations.filter(v => v.compliance_level === ComplianceLevel.LOW).length,
        total_disclosures: disclosures.length,
        mandatory_disclosures: disclosures.filter(d => d.is_approved).length,
        optional_disclosures: disclosures.filter(d => !d.is_approved).length,
        violations_by_standard: violationsByStandard,
        disclosures_by_standard: disclosuresByStandard,
        recommendations: this.generateRecommendations(violations, disclosures),
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  private calculateComplianceScore(violations: ValidationViolation[], disclosures: GeneratedDisclosure[]): number {
    if (violations.length === 0 && disclosures.length === 0) {
      return 100;
    }

    const criticalWeight = 10;
    const highWeight = 5;
    const mediumWeight = 2;
    const lowWeight = 1;

    const totalPenalty = violations.reduce((penalty, violation) => {
      switch (violation.compliance_level) {
        case ComplianceLevel.CRITICAL:
          return penalty + criticalWeight;
        case ComplianceLevel.HIGH:
          return penalty + highWeight;
        case ComplianceLevel.MEDIUM:
          return penalty + mediumWeight;
        case ComplianceLevel.LOW:
          return penalty + lowWeight;
        default:
          return penalty;
      }
    }, 0);

    const maxScore = 100;
    const score = Math.max(0, maxScore - totalPenalty);
    
    return Math.round(score);
  }

  private groupViolationsByStandard(violations: ValidationViolation[]): Record<string, number> {
    return violations.reduce((acc, violation) => {
      const standard = violation.standard;
      acc[standard] = (acc[standard] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupDisclosuresByStandard(disclosures: GeneratedDisclosure[]): Record<string, number> {
    return disclosures.reduce((acc, disclosure) => {
      const standard = disclosure.standard;
      acc[standard] = (acc[standard] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendations(violations: ValidationViolation[], disclosures: GeneratedDisclosure[]): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push(`Address ${violations.length} compliance violations to improve compliance score.`);
    }

    const criticalViolations = violations.filter(v => v.compliance_level === ComplianceLevel.CRITICAL);
    if (criticalViolations.length > 0) {
      recommendations.push(`Immediately address ${criticalViolations.length} critical violations.`);
    }

    const unapprovedDisclosures = disclosures.filter(d => !d.is_approved);
    if (unapprovedDisclosures.length > 0) {
      recommendations.push(`Review and approve ${unapprovedDisclosures.length} pending disclosures.`);
    }

    return recommendations;
  }

  async addRule(rule: MFRSRule): Promise<void> {
    try {
      await supabase
        .from('mfrs_rules')
        .insert(rule);
    } catch (error) {
      console.error('Error adding rule:', error);
      throw error;
    }
  }

  async updateRule(ruleId: string, updates: Partial<MFRSRule>): Promise<void> {
    try {
      await supabase
        .from('mfrs_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ruleId);
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  async deactivateRule(ruleId: string): Promise<void> {
    try {
      await supabase
        .from('mfrs_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', ruleId);
    } catch (error) {
      console.error('Error deactivating rule:', error);
      throw error;
    }
  }

  private async addDisclosureRequirement(requirement: DisclosureRequirement): Promise<void> {
    try {
      await supabase
        .from('disclosure_requirements')
        .insert(requirement);
    } catch (error) {
      console.error('Error adding disclosure requirement:', error);
    }
  }

  private async storeViolation(violation: ValidationViolation): Promise<void> {
    try {
      await supabase
        .from('validation_violations')
        .insert(violation);
    } catch (error) {
      console.error('Error storing violation:', error);
    }
  }

  private async storeDisclosure(disclosure: GeneratedDisclosure): Promise<void> {
    try {
      await supabase
        .from('generated_disclosures')
        .insert(disclosure);
    } catch (error) {
      console.error('Error storing disclosure:', error);
    }
  }
}

// Export singleton instance
export const mfrsComplianceService = new MFRSComplianceService(); 