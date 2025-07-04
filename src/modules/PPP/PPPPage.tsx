import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const PPPPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'PPP Dashboard', component: <div className="p-6"><h2>PPP Dashboard</h2><p>Public Private Partnership dashboard coming soon...</p></div> },
    { id: 'contracts', label: 'PPP Contracts', component: <div className="p-6"><h2>PPP Contracts</h2><p>PPP contract management and accounting coming soon...</p></div> },
    { id: 'accounting', label: 'PPP Accounting', component: <div className="p-6"><h2>PPP Accounting</h2><p>PPP-specific accounting treatments coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Public Private Partnerships</h1>
        <p className="text-gray-600 mt-2">PPP contract management and accounting</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default PPPPage; 