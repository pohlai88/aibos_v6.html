import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const RelatedPartiesPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Related Parties Dashboard', component: <div className="p-6"><h2>Related Parties Dashboard</h2><p>MFRS 124 related party disclosures dashboard coming soon...</p></div> },
    { id: 'management', label: 'Related Parties Management', component: <div className="p-6"><h2>Related Parties Management</h2><p>MFRS 124 related party disclosures management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Related Parties</h1>
        <p className="text-gray-600 mt-2">MFRS 124 related party disclosures</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default RelatedPartiesPage;