import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxReport, TaxSettings } from '../types';

const TaxDashboardTab: React.FC = () => {
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);
  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const taxService = new TaxService();

  useEffect(() => {
    loadDashboardData();
  }, [currentPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [report, taxSettings] = await Promise.all([
        taxService.getTaxReport(currentPeriod, 'current-tenant'),
        taxService.getTaxSettings('current-tenant')
      ]);
      setTaxReport(report);
      setSettings(taxSettings);
    } catch (error) {
      console.error('Error loading tax dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = () => {
    if (!taxReport) return { status: 'Unknown', color: 'gray', percentage: 0 };
    
    const totalObligations = taxReport.total_tax_liability;
    const totalPaid = taxReport.total_tax_paid;
    const percentage = totalObligations > 0 ? (totalPaid / totalObligations) * 100 : 100;
    
    if (percentage >= 95) return { status: 'Excellent', color: 'green', percentage };
    if (percentage >= 80) return { status: 'Good', color: 'blue', percentage };
    if (percentage >= 60) return { status: 'Fair', color: 'yellow', percentage };
    return { status: 'Poor', color: 'red', percentage };
  };

  const compliance = getComplianceStatus();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tax Dashboard</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <input
            type="month"
            value={currentPeriod}
            onChange={(e) => setCurrentPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Total Tax Liability</h3>
          <p className="text-2xl font-bold text-blue-600">
            RM {taxReport?.total_tax_liability?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {taxReport?.tax_types?.join(', ') || 'All types'}
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Tax Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            RM {taxReport?.total_tax_paid?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {taxReport?.payment_status || 'Not paid'}
          </p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 text-sm">Outstanding</h3>
          <p className="text-2xl font-bold text-yellow-600">
            RM {((taxReport?.total_tax_liability || 0) - (taxReport?.total_tax_paid || 0)).toLocaleString()}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Due: {taxReport?.payment_due_date || 'N/A'}
          </p>
        </div>
        
        <div className={`bg-${compliance.color}-50 border border-${compliance.color}-200 rounded-lg p-4`}>
          <h3 className={`font-semibold text-${compliance.color}-800 text-sm`}>Compliance Status</h3>
          <p className={`text-2xl font-bold text-${compliance.color}-600`}>
            {compliance.percentage.toFixed(1)}%
          </p>
          <p className={`text-xs text-${compliance.color}-600 mt-1`}>
            {compliance.status}
          </p>
        </div>
      </div>

      {/* Tax Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Tax Type Breakdown</h3>
          <div className="space-y-3">
            {taxReport?.tax_breakdown?.map((breakdown, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{breakdown.tax_type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(breakdown.amount / (taxReport?.total_tax_liability || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    RM {breakdown.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {taxReport?.recent_activities?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Calculate Tax
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Generate Report
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Submit Return
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View Compliance
          </button>
        </div>
      </div>

      {/* Settings Summary */}
      {settings && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Tax Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Default Currency:</span>
              <span className="ml-2 text-gray-900">{settings.default_currency}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tax Year End:</span>
              <span className="ml-2 text-gray-900">{settings.tax_year_end}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Auto Calculation:</span>
              <span className="ml-2 text-gray-900">{settings.auto_calculate_tax ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxDashboardTab; 