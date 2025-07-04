import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const ConsolidationPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Consolidation Dashboard', component: <div className="p-6"><h2>Consolidation Dashboard</h2><p>MFRS 10 consolidation dashboard coming soon...</p></div> },
    { id: 'mfrs10', label: 'MFRS 10 - Consolidation', component: <div className="p-6"><h2>MFRS 10 - Consolidation</h2><p>Consolidated financial statements coming soon...</p></div> },
    { id: 'subsidiaries', label: 'Subsidiary Management', component: <div className="p-6"><h2>Subsidiary Management</h2><p>Subsidiary identification and control coming soon...</p></div> },
    { id: 'eliminations', label: 'Intercompany Eliminations', component: <div className="p-6"><h2>Intercompany Eliminations</h2><p>Intercompany transaction eliminations coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Consolidation</h1>
        <p className="text-gray-600 mt-2">MFRS 10 compliant consolidated financial statements</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default ConsolidationPage; 