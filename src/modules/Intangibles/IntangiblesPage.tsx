import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const IntangiblesPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Intangibles Dashboard', component: <div className="p-6"><h2>Intangibles Dashboard</h2><p>MFRS 138 intangible assets dashboard coming soon...</p></div> },
    { id: 'mfrs138', label: 'MFRS 138 - Intangible Assets', component: <div className="p-6"><h2>MFRS 138 - Intangible Assets</h2><p>Intangible asset recognition and measurement coming soon...</p></div> },
    { id: 'recognition', label: 'Asset Recognition', component: <div className="p-6"><h2>Asset Recognition</h2><p>Intangible asset recognition criteria coming soon...</p></div> },
    { id: 'amortization', label: 'Amortization', component: <div className="p-6"><h2>Amortization</h2><p>Intangible asset amortization calculations coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Intangible Assets</h1>
        <p className="text-gray-600 mt-2">MFRS 138 compliant intangible asset management</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default IntangiblesPage; 