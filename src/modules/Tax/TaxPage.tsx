import React from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';
import TaxDashboardTab from './components/TaxDashboardTab';
import MFRS112Tab from './components/MFRS112Tab';
import GSTSSTTab from './components/GSTSSTTab';
import WithholdingTab from './components/WithholdingTab';
import CorporateTab from './components/CorporateTab';
import TaxReportingTab from './components/TaxReportingTab';
import TaxComplianceTab from './components/TaxComplianceTab';

interface TaxPageProps {
  // Add props as needed
}

const TaxPage: React.FC<TaxPageProps> = () => {
  const tabs = [
    { id: 'dashboard', label: 'Tax Dashboard', component: <TaxDashboardTab /> },
    { id: 'mfrs112', label: 'MFRS 112 - Income Taxes', component: <MFRS112Tab /> },
    { id: 'gst-sst', label: 'GST/SST Management', component: <GSTSSTTab /> },
    { id: 'withholding', label: 'Withholding Tax (MTD)', component: <WithholdingTab /> },
    { id: 'corporate', label: 'Corporate Tax', component: <CorporateTab /> },
    { id: 'reporting', label: 'Tax Reporting', component: <TaxReportingTab /> },
    { id: 'compliance', label: 'Tax Compliance', component: <TaxComplianceTab /> },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive tax management and MFRS 112 compliance
        </p>
      </div>
      
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default TaxPage; 