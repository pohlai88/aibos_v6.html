import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const LeasesPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Leases Dashboard', component: <div className="p-6"><h2>Leases Dashboard</h2><p>MFRS 16 lease accounting dashboard coming soon...</p></div> },
    { id: 'mfrs16', label: 'MFRS 16 - Leases', component: <div className="p-6"><h2>MFRS 16 - Leases</h2><p>Lease classification and measurement coming soon...</p></div> },
    { id: 'classification', label: 'Lease Classification', component: <div className="p-6"><h2>Lease Classification</h2><p>Finance vs Operating lease classification coming soon...</p></div> },
    { id: 'measurement', label: 'Lease Measurement', component: <div className="p-6"><h2>Lease Measurement</h2><p>Right-of-use asset and lease liability calculations coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lease Accounting</h1>
        <p className="text-gray-600 mt-2">MFRS 16 compliant lease accounting and management</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default LeasesPage; 