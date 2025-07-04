import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const InvoicingPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Invoicing Dashboard', component: <div className="p-6"><h2>Invoicing Dashboard</h2><p>Invoice generation and management dashboard coming soon...</p></div> },
    { id: 'management', label: 'Invoicing Management', component: <div className="p-6"><h2>Invoicing Management</h2><p>Invoice generation and management management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoicing</h1>
        <p className="text-gray-600 mt-2">Invoice generation and management</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default InvoicingPage;