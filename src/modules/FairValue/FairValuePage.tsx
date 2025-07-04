import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const FairValuePage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Fair Value Dashboard', component: <div className="p-6"><h2>Fair Value Dashboard</h2><p>MFRS 113 fair value measurement dashboard coming soon...</p></div> },
    { id: 'mfrs113', label: 'MFRS 113 - Fair Value', component: <div className="p-6"><h2>MFRS 113 - Fair Value</h2><p>Fair value measurement and disclosure coming soon...</p></div> },
    { id: 'hierarchy', label: 'Fair Value Hierarchy', component: <div className="p-6"><h2>Fair Value Hierarchy</h2><p>Level 1, 2, and 3 fair value hierarchy coming soon...</p></div> },
    { id: 'valuation', label: 'Valuation Techniques', component: <div className="p-6"><h2>Valuation Techniques</h2><p>Market, income, and cost approaches coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Fair Value Measurement</h1>
        <p className="text-gray-600 mt-2">MFRS 113 compliant fair value measurement</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default FairValuePage; 