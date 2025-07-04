import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

interface ReportingPageProps {
  // Add props as needed
}

const ReportingPage: React.FC<ReportingPageProps> = () => {
  const tabs = [
    { id: 'dashboard', label: 'Reporting Dashboard', component: <ReportingDashboardTab /> },
    { id: 'mfrs101', label: 'MFRS 101 - Financial Statements', component: <MFRS101Tab /> },
    { id: 'bursa', label: 'Bursa Submission', component: <BursaTab /> },
    { id: 'templates', label: 'Report Templates', component: <TemplatesTab /> },
    { id: 'validation', label: 'Compliance Validation', component: <ValidationTab /> },
    { id: 'export', label: 'Export Reports', component: <ExportTab /> },
    { id: 'audit', label: 'Reporting Audit', component: <ReportingAuditTab /> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reporting</h1>
        <p className="text-gray-600 mt-2">
          Automated financial reporting and MFRS 101 compliance
        </p>
      </div>
      
      <TabNavigation tabs={tabs} />
    </div>
  );
};

// Placeholder components - will be implemented in separate files
const ReportingDashboardTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Reporting Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800">Reports Generated</h3>
        <p className="text-2xl font-bold text-blue-600">24</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800">Bursa Submissions</h3>
        <p className="text-2xl font-bold text-green-600">12</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Pending Validation</h3>
        <p className="text-2xl font-bold text-yellow-600">3</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800">Compliance Score</h3>
        <p className="text-2xl font-bold text-purple-600">98%</p>
      </div>
    </div>
  </div>
);

const MFRS101Tab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">MFRS 101 - Financial Statements</h2>
    <p className="text-gray-600">Financial statement generation and validation coming soon...</p>
  </div>
);

const BursaTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Bursa Submission</h2>
    <p className="text-gray-600">Automated Bursa Malaysia submission coming soon...</p>
  </div>
);

const TemplatesTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
    <p className="text-gray-600">Standardized financial report templates coming soon...</p>
  </div>
);

const ValidationTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Compliance Validation</h2>
    <p className="text-gray-600">MFRS compliance validation engine coming soon...</p>
  </div>
);

const ExportTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
    <p className="text-gray-600">PDF, Excel, and XML export capabilities coming soon...</p>
  </div>
);

const ReportingAuditTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Reporting Audit</h2>
    <p className="text-gray-600">Complete reporting audit trail coming soon...</p>
  </div>
);

export default ReportingPage; 