import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

const PayrollPage: React.FC = () => {
  const tabs = [
    { id: 'dashboard', label: 'Payroll Management Dashboard', component: <div className="p-6"><h2>Payroll Management Dashboard</h2><p>Employee payroll and benefits management dashboard coming soon...</p></div> },
    { id: 'management', label: 'Payroll Management Management', component: <div className="p-6"><h2>Payroll Management Management</h2><p>Employee payroll and benefits management management coming soon...</p></div> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-2">Employee payroll and benefits management</p>
      </div>
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default PayrollPage;