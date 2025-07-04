import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';

interface RevenuePageProps {
  // Add props as needed
}

const RevenuePage: React.FC<RevenuePageProps> = () => {
  const tabs = [
    { id: 'dashboard', label: 'Revenue Dashboard', component: <RevenueDashboardTab /> },
    { id: 'mfrs15', label: 'MFRS 15 - Revenue Recognition', component: <MFRS15Tab /> },
    { id: 'contracts', label: 'Contract Management', component: <ContractsTab /> },
    { id: 'obligations', label: 'Performance Obligations', component: <ObligationsTab /> },
    { id: 'allocation', label: 'Revenue Allocation', component: <AllocationTab /> },
    { id: 'forecasting', label: 'Revenue Forecasting', component: <ForecastingTab /> },
    { id: 'sst', label: 'SST Compliance', component: <SSTTab /> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Revenue Recognition</h1>
        <p className="text-gray-600 mt-2">
          MFRS 15 compliant revenue recognition and contract management
        </p>
      </div>
      
      <TabNavigation tabs={tabs} />
    </div>
  );
};

// Placeholder components - will be implemented in separate files
const RevenueDashboardTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Revenue Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800">Total Revenue</h3>
        <p className="text-2xl font-bold text-blue-600">RM 2.5M</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-800">Active Contracts</h3>
        <p className="text-2xl font-bold text-green-600">45</p>
      </div>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800">Pending Recognition</h3>
        <p className="text-2xl font-bold text-yellow-600">RM 180K</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800">MFRS 15 Compliance</h3>
        <p className="text-2xl font-bold text-purple-600">100%</p>
      </div>
    </div>
  </div>
);

const MFRS15Tab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">MFRS 15 - Revenue Recognition</h2>
    <p className="text-gray-600">Revenue recognition compliance and validation coming soon...</p>
  </div>
);

const ContractsTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Contract Management</h2>
    <p className="text-gray-600">Contract lifecycle management and analysis coming soon...</p>
  </div>
);

const ObligationsTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Performance Obligations</h2>
    <p className="text-gray-600">Performance obligation identification and tracking coming soon...</p>
  </div>
);

const AllocationTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Revenue Allocation</h2>
    <p className="text-gray-600">Automated revenue allocation to performance obligations coming soon...</p>
  </div>
);

const ForecastingTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">Revenue Forecasting</h2>
    <p className="text-gray-600">Predictive revenue modeling and forecasting coming soon...</p>
  </div>
);

const SSTTab: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-semibold mb-4">SST Compliance</h2>
    <p className="text-gray-600">SST registration validation and compliance coming soon...</p>
  </div>
);

export default RevenuePage; 