import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const CashFlowPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Cash Flow Dashboard', component: <div className="p-6"><h2>Cash Flow Dashboard</h2><p>Cash flow statement preparation dashboard coming soon...</p></div> },
    { id: 'management', label: 'Cash Flow Management', component: <div className="p-6"><h2>Cash Flow Management</h2><p>Cash flow statement preparation management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cash Flow</h1>
        <p className="text-gray-600 mt-2">Cash flow statement preparation</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default CashFlowPage;