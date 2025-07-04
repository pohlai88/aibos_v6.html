import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const PoliciesPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Accounting Policies Dashboard', component: <div className="p-6"><h2>Accounting Policies Dashboard</h2><p>Accounting policy management and disclosure dashboard coming soon...</p></div> },
    { id: 'management', label: 'Accounting Policies Management', component: <div className="p-6"><h2>Accounting Policies Management</h2><p>Accounting policy management and disclosure management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounting Policies</h1>
        <p className="text-gray-600 mt-2">Accounting policy management and disclosure</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default PoliciesPage;