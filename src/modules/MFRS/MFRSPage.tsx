import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const MFRSPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'MFRS Standards Dashboard', component: <div className="p-6"><h2>MFRS Standards Dashboard</h2><p>Malaysian Financial Reporting Standards dashboard coming soon...</p></div> },
    { id: 'management', label: 'MFRS Standards Management', component: <div className="p-6"><h2>MFRS Standards Management</h2><p>Malaysian Financial Reporting Standards management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">MFRS Standards</h1>
        <p className="text-gray-600 mt-2">Malaysian Financial Reporting Standards</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default MFRSPage;