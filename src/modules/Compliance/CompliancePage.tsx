import React, { useState, useEffect } from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { mfrsComplianceService } from './services/MFRSComplianceService';
import {
  MFRSStandard,
  ComplianceLevel,
  ValidationResult,
  MFRSRule,
  ValidationViolation,
  GeneratedDisclosure,
  ComplianceReport,
  Transaction,
  FinancialData
} from './types';

const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [violations, setViolations] = useState<ValidationViolation[]>([]);
  const [disclosures, setDisclosures] = useState<GeneratedDisclosure[]>([]);
  const [rules, setRules] = useState<MFRSRule[]>([]);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'rules', label: 'MFRS Rules', icon: '📋' },
    { id: 'violations', label: 'Violations', icon: '⚠️' },
    { id: 'disclosures', label: 'Disclosures', icon: '📄' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'validation', label: 'Validation', icon: '✅' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const tenantId = 'current-tenant'; // Get from auth context
      const report = await mfrsComplianceService.getComplianceReport(tenantId);
      setComplianceReport(report);
      
      const violationsData = await mfrsComplianceService.getViolations({ tenant_id: tenantId, limit: 10 });
      setViolations(violationsData);
      
      const disclosuresData = await mfrsComplianceService.getDisclosures({ tenant_id: tenantId, limit: 10 });
      setDisclosures(disclosuresData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceLevelColor = (level: ComplianceLevel) => {
    switch (level) {
      case ComplianceLevel.CRITICAL:
        return 'text-red-600 bg-red-100';
      case ComplianceLevel.HIGH:
        return 'text-orange-600 bg-orange-100';
      case ComplianceLevel.MEDIUM:
        return 'text-yellow-600 bg-yellow-100';
      case ComplianceLevel.LOW:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Score</h3>
        {complianceReport ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getComplianceScoreColor(complianceReport.compliance_score)}`}>
                {complianceReport.compliance_score}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{complianceReport.critical_violations}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{complianceReport.total_disclosures}</div>
              <div className="text-sm text-gray-600">Total Disclosures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{complianceReport.mandatory_disclosures}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading compliance data...</p>
          </div>
        )}
      </div>

      {/* Recent Violations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Violations</h3>
        <div className="space-y-3">
          {violations.slice(0, 5).map((violation) => (
            <div key={violation.id} className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{violation.rule_title}</h4>
                  <p className="text-sm text-gray-600">{violation.message}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getComplianceLevelColor(violation.compliance_level)}`}>
                    {violation.compliance_level}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(violation.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {complianceReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {complianceReport.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">MFRS Rules</h3>
        <Button onClick={() => setShowAddRuleModal(true)}>
          Add Rule
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Standard
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{rule.title}</div>
                    <div className="text-sm text-gray-500">{rule.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {rule.standard}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceLevelColor(rule.compliance_level)}`}>
                    {rule.compliance_level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderViolations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Compliance Violations</h3>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded px-3 py-1">
            <option>All Standards</option>
            {Object.values(MFRSStandard).map((standard) => (
              <option key={standard} value={standard}>{standard}</option>
            ))}
          </select>
          <select className="border border-gray-300 rounded px-3 py-1">
            <option>All Levels</option>
            {Object.values(ComplianceLevel).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Standard
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {violations.map((violation) => (
              <tr key={violation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{violation.rule_title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {violation.standard}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceLevelColor(violation.compliance_level)}`}>
                    {violation.compliance_level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{violation.message}</div>
                  {violation.suggested_correction && (
                    <div className="text-sm text-blue-600 mt-1">
                      Suggestion: {violation.suggested_correction}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(violation.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDisclosures = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Generated Disclosures</h3>
        <Button onClick={() => generateNewDisclosures()}>
          Generate Disclosures
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Standard
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {disclosures.map((disclosure) => (
              <tr key={disclosure.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{disclosure.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {disclosure.standard}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {disclosure.disclosure_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${disclosure.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {disclosure.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(disclosure.generated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Compliance Reports</h3>
        <Button onClick={() => generateComplianceReport()}>
          Generate Report
        </Button>
      </div>

      {complianceReport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold mb-4">Latest Compliance Report</h4>
          
          {/* Violations by Standard */}
          <div className="mb-6">
            <h5 className="font-medium mb-3">Violations by Standard</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(complianceReport.violations_by_standard).map(([standard, count]) => (
                <div key={standard} className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">{standard}</div>
                  <div className="text-lg font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosures by Standard */}
          <div className="mb-6">
            <h5 className="font-medium mb-3">Disclosures by Standard</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(complianceReport.disclosures_by_standard).map(([standard, count]) => (
                <div key={standard} className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-blue-600">{standard}</div>
                  <div className="text-lg font-semibold text-blue-800">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Generated on: {new Date(complianceReport.generated_at).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Transaction Validation</h3>
        <Button onClick={() => setShowValidationModal(true)}>
          Validate Transaction
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-medium mb-4">Validation Rules</h4>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h5 className="font-medium">Account Balance Validation</h5>
            <p className="text-sm text-gray-600">Validates account balances against MFRS requirements</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <h5 className="font-medium">Transaction Type Validation</h5>
            <p className="text-sm text-gray-600">Ensures transactions are properly classified</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h5 className="font-medium">Amount Threshold Validation</h5>
            <p className="text-sm text-gray-600">Checks amounts against regulatory thresholds</p>
          </div>
        </div>
      </div>
    </div>
  );

  const generateNewDisclosures = async () => {
    setLoading(true);
    try {
      const financialData: FinancialData = {
        accounts: { cash: 100000, receivables: 50000, cash_equivalents: 25000 },
        transactions: [],
        period: '2024-Q1',
        tenant_id: 'current-tenant',
        currency: 'MYR'
      };
      
      const newDisclosures = await mfrsComplianceService.generateDisclosures(financialData);
      setDisclosures(prev => [...newDisclosures, ...prev]);
    } catch (error) {
      console.error('Error generating disclosures:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    setLoading(true);
    try {
      const tenantId = 'current-tenant';
      const report = await mfrsComplianceService.getComplianceReport(tenantId);
      setComplianceReport(report);
    } catch (error) {
      console.error('Error generating compliance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'rules':
        return renderRules();
      case 'violations':
        return renderViolations();
      case 'disclosures':
        return renderDisclosures();
      case 'reports':
        return renderReports();
      case 'validation':
        return renderValidation();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MFRS Compliance</h1>
          <p className="text-gray-600 mt-2">
            Malaysian Financial Reporting Standards compliance management and validation
          </p>
        </div>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal
        isOpen={showAddRuleModal}
        onClose={() => setShowAddRuleModal(false)}
        title="Add MFRS Rule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rule Title</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter rule title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Standard</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {Object.values(MFRSStandard).map((standard) => (
                <option key={standard} value={standard}>{standard}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Compliance Level</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              {Object.values(ComplianceLevel).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowAddRuleModal(false)}>
              Cancel
            </Button>
            <Button>
              Add Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Validation Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Validate Transaction"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="operating">Operating</option>
              <option value="investing">Investing</option>
              <option value="financing">Financing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowValidationModal(false)}>
              Cancel
            </Button>
            <Button>
              Validate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CompliancePage; 