import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const SegmentsPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Segments Dashboard', component: <div className="p-6"><h2>Segments Dashboard</h2><p>MFRS 8 operating segments dashboard coming soon...</p></div> },
    { id: 'mfrs8', label: 'MFRS 8 - Operating Segments', component: <div className="p-6"><h2>MFRS 8 - Operating Segments</h2><p>Operating segment identification and reporting coming soon...</p></div> },
    { id: 'identification', label: 'Segment Identification', component: <div className="p-6"><h2>Segment Identification</h2><p>Operating segment identification criteria coming soon...</p></div> },
    { id: 'reporting', label: 'Segment Reporting', component: <div className="p-6"><h2>Segment Reporting</h2><p>Segment financial information reporting coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Operating Segments</h1>
        <p className="text-gray-600 mt-2">MFRS 8 compliant operating segment management</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default SegmentsPage; 