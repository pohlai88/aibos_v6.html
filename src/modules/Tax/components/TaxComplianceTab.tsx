import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxType } from '../types';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'SST' | 'MTD' | 'Corporate' | 'General';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'compliant' | 'non-compliant' | 'warning' | 'pending';
  last_checked: string;
  next_check: string;
}

interface ComplianceViolation {
  id: string;
  rule_id: string;
  rule_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_date: string;
  due_date: string;
  status: 'open' | 'in_progress' | 'resolved' | 'overdue';
  assigned_to?: string;
  resolution_notes?: string;
}

interface ComplianceAudit {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  ip_address: string;
  user_agent: string;
}

interface ComplianceSummary {
  total_rules: number;
  compliant_rules: number;
  non_compliant_rules: number;
  warning_rules: number;
  compliance_score: number;
  open_violations: number;
  overdue_violations: number;
  last_audit_date: string;
}

const TaxComplianceTab: React.FC = () => {
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [auditTrail, setAuditTrail] = useState<ComplianceAudit[]>([]);
  const [complianceSummary, setComplianceSummary] = useState<ComplianceSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const taxService = new TaxService();

  useEffect(() => {
    loadComplianceData();
  }, [selectedCategory]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Simulate loading compliance data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock compliance rules
      const mockRules: ComplianceRule[] = [
        {
          id: '1',
          name: 'SST Return Submission',
          description: 'SST returns must be submitted by the 30th of each month',
          category: 'SST',
          severity: 'high',
          status: 'compliant',
          last_checked: '2024-01-31',
          next_check: '2024-02-28'
        },
        {
          id: '2',
          name: 'MTD Deduction',
          description: 'Monthly Tax Deduction must be calculated and deducted correctly',
          category: 'MTD',
          severity: 'high',
          status: 'compliant',
          last_checked: '2024-01-31',
          next_check: '2024-02-28'
        },
        {
          id: '3',
          name: 'CP204 Installments',
          description: 'CP204 installments must be paid on time',
          category: 'Corporate',
          severity: 'critical',
          status: 'warning',
          last_checked: '2024-01-31',
          next_check: '2024-03-31'
        },
        {
          id: '4',
          name: 'Tax Record Retention',
          description: 'Tax records must be retained for 7 years',
          category: 'General',
          severity: 'medium',
          status: 'compliant',
          last_checked: '2024-01-31',
          next_check: '2024-12-31'
        },
        {
          id: '5',
          name: 'E-Invoice Submission',
          description: 'E-invoices must be submitted to LHDN within 24 hours',
          category: 'SST',
          severity: 'high',
          status: 'non-compliant',
          last_checked: '2024-01-31',
          next_check: '2024-02-28'
        }
      ];

      // Mock violations
      const mockViolations: ComplianceViolation[] = [
        {
          id: '1',
          rule_id: '5',
          rule_name: 'E-Invoice Submission',
          description: 'E-invoice INV-2024-001 was not submitted within 24 hours',
          severity: 'high',
          detected_date: '2024-01-15',
          due_date: '2024-01-16',
          status: 'open',
          assigned_to: 'Tax Manager'
        },
        {
          id: '2',
          rule_id: '3',
          rule_name: 'CP204 Installments',
          description: 'Q4 CP204 installment payment is due in 30 days',
          severity: 'critical',
          detected_date: '2024-01-31',
          due_date: '2024-12-31',
          status: 'in_progress',
          assigned_to: 'Finance Manager',
          resolution_notes: 'Payment scheduled for December 28, 2024'
        }
      ];

      // Mock audit trail
      const mockAuditTrail: ComplianceAudit[] = [
        {
          id: '1',
          action: 'SST Return Submitted',
          user: 'tax.manager@company.com',
          timestamp: '2024-01-31 23:59:59',
          details: 'SST return for January 2024 submitted successfully',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
          id: '2',
          action: 'MTD Calculation Updated',
          user: 'hr.manager@company.com',
          timestamp: '2024-01-31 15:30:00',
          details: 'MTD calculations updated for all employees',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
          id: '3',
          action: 'Compliance Rule Violation Detected',
          user: 'system@company.com',
          timestamp: '2024-01-15 10:15:00',
          details: 'E-invoice submission violation detected for INV-2024-001',
          ip_address: '192.168.1.1',
          user_agent: 'System/1.0'
        }
      ];

      const mockSummary: ComplianceSummary = {
        total_rules: mockRules.length,
        compliant_rules: mockRules.filter(r => r.status === 'compliant').length,
        non_compliant_rules: mockRules.filter(r => r.status === 'non-compliant').length,
        warning_rules: mockRules.filter(r => r.status === 'warning').length,
        compliance_score: Math.round((mockRules.filter(r => r.status === 'compliant').length / mockRules.length) * 100),
        open_violations: mockViolations.filter(v => v.status === 'open').length,
        overdue_violations: mockViolations.filter(v => v.status === 'overdue').length,
        last_audit_date: '2024-01-31'
      };

      // Filter by category if selected
      const filteredRules = selectedCategory === 'all' 
        ? mockRules 
        : mockRules.filter(rule => rule.category === selectedCategory);

      setComplianceRules(filteredRules);
      setViolations(mockViolations);
      setAuditTrail(mockAuditTrail);
      setComplianceSummary(mockSummary);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Tax Compliance</h2>
          <p className="text-gray-600 text-sm">Compliance monitoring and audit trails</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="SST">SST</option>
            <option value="MTD">MTD</option>
            <option value="Corporate">Corporate</option>
            <option value="General">General</option>
          </select>
          <button
            onClick={loadComplianceData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Compliance Summary */}
      {complianceSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 text-sm">Compliance Score</h3>
            <p className="text-2xl font-bold text-blue-600">{complianceSummary.compliance_score}%</p>
            <p className="text-xs text-blue-600 mt-1">
              {complianceSummary.compliant_rules} of {complianceSummary.total_rules} rules
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 text-sm">Compliant Rules</h3>
            <p className="text-2xl font-bold text-green-600">{complianceSummary.compliant_rules}</p>
            <p className="text-xs text-green-600 mt-1">Rules in compliance</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 text-sm">Open Violations</h3>
            <p className="text-2xl font-bold text-red-600">{complianceSummary.open_violations}</p>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 text-sm">Overdue Violations</h3>
            <p className="text-2xl font-bold text-orange-600">{complianceSummary.overdue_violations}</p>
            <p className="text-xs text-orange-600 mt-1">Past due date</p>
          </div>
        </div>
      )}

      {/* Compliance Rules */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Compliance Rules</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Check</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complianceRules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-500">{rule.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                      {rule.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {rule.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.last_checked}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rule.next_check}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Check
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Violations */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Compliance Violations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {violations.map((violation) => (
                <tr key={violation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {violation.rule_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {violation.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                      {violation.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(violation.status)}`}>
                      {violation.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {violation.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {violation.assigned_to || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Resolve
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Audit Trail</h3>
        <div className="space-y-3">
          {auditTrail.map((audit) => (
            <div key={audit.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{audit.action}</p>
                    <p className="text-sm text-gray-600">{audit.details}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{audit.user}</p>
                    <p className="text-xs text-gray-500">{audit.timestamp}</p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  IP: {audit.ip_address} | User Agent: {audit.user_agent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Run Compliance Check
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Generate Report
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Export Audit Trail
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxComplianceTab; 