import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

interface AccountingPageProps {
  // Add props as needed
}

const AccountingPage: React.FC<AccountingPageProps> = () => {
  const tabs = [
    { id: 'ledger', label: 'General Ledger', component: <LedgerTab /> },
    { id: 'tax', label: 'Tax Management', component: <TaxTab /> },
    { id: 'compliance', label: 'Compliance', component: <ComplianceTab /> },
    { id: 'reporting', label: 'Financial Reports', component: <ReportingTab /> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive financial management and MFRS compliance
        </p>
      </div>
      
      <TabNavigation tabs={tabs} />
    </div>
  );
};

// Placeholder components - will be implemented in separate files
const LedgerTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">General Ledger</h2>
    <p className="text-gray-600">Ledger management coming soon...</p>
  </div>
);

const TaxTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Tax Management</h2>
    <p className="text-gray-600">Tax compliance features coming soon...</p>
  </div>
);

const ComplianceTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Compliance</h2>
    <p className="text-gray-600">MFRS compliance features coming soon...</p>
  </div>
);

const ReportingTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Financial Reports</h2>
    <p className="text-gray-600">Financial reporting features coming soon...</p>
  </div>
);

export default AccountingPage; 