import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxCalculationResult, TaxType } from '../types';

interface DeferredTaxItem {
  id: string;
  description: string;
  carrying_amount: number;
  tax_base: number;
  temporary_difference: number;
  tax_rate: number;
  deferred_tax_asset: number;
  deferred_tax_liability: number;
  category: 'asset' | 'liability';
}

interface IncomeTaxProvision {
  id: string;
  period: string;
  current_tax_expense: number;
  deferred_tax_expense: number;
  total_tax_expense: number;
  effective_tax_rate: number;
  reconciliation_items: ReconciliationItem[];
}

interface ReconciliationItem {
  id: string;
  description: string;
  amount: number;
  type: 'addition' | 'deduction';
}

const MFRS112Tab: React.FC = () => {
  const [deferredTaxItems, setDeferredTaxItems] = useState<DeferredTaxItem[]>([]);
  const [incomeTaxProvisions, setIncomeTaxProvisions] = useState<IncomeTaxProvision[]>([]);
  const [currentProvision, setCurrentProvision] = useState<IncomeTaxProvision | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const taxService = new TaxService();

  useEffect(() => {
    loadMFRS112Data();
  }, [selectedPeriod]);

  const loadMFRS112Data = async () => {
    setLoading(true);
    try {
      // Simulate loading deferred tax items and provisions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockDeferredTaxItems: DeferredTaxItem[] = [
        {
          id: '1',
          description: 'Depreciation - Buildings',
          carrying_amount: 500000,
          tax_base: 400000,
          temporary_difference: 100000,
          tax_rate: 0.24,
          deferred_tax_asset: 0,
          deferred_tax_liability: 24000,
          category: 'liability'
        },
        {
          id: '2',
          description: 'Provisions - Warranty',
          carrying_amount: 50000,
          tax_base: 0,
          temporary_difference: 50000,
          tax_rate: 0.24,
          deferred_tax_asset: 12000,
          deferred_tax_liability: 0,
          category: 'asset'
        },
        {
          id: '3',
          description: 'Unrealized Gains - Investments',
          carrying_amount: 200000,
          tax_base: 150000,
          temporary_difference: 50000,
          tax_rate: 0.24,
          deferred_tax_asset: 0,
          deferred_tax_liability: 12000,
          category: 'liability'
        }
      ];

      const mockProvision: IncomeTaxProvision = {
        id: '1',
        period: selectedPeriod,
        current_tax_expense: 150000,
        deferred_tax_expense: 24000,
        total_tax_expense: 174000,
        effective_tax_rate: 0.24,
        reconciliation_items: [
          {
            id: '1',
            description: 'Statutory tax rate',
            amount: 0.24,
            type: 'addition'
          },
          {
            id: '2',
            description: 'Non-deductible expenses',
            amount: 0.02,
            type: 'addition'
          },
          {
            id: '3',
            description: 'Tax-exempt income',
            amount: -0.01,
            type: 'deduction'
          },
          {
            id: '4',
            description: 'Other adjustments',
            amount: -0.01,
            type: 'deduction'
          }
        ]
      };

      setDeferredTaxItems(mockDeferredTaxItems);
      setIncomeTaxProvisions([mockProvision]);
      setCurrentProvision(mockProvision);
    } catch (error) {
      console.error('Error loading MFRS 112 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeferredTax = (item: DeferredTaxItem) => {
    const difference = item.carrying_amount - item.tax_base;
    const deferredTax = Math.abs(difference * item.tax_rate);
    
    if (difference > 0) {
      return { asset: 0, liability: deferredTax };
    } else {
      return { asset: deferredTax, liability: 0 };
    }
  };

  const totalDeferredTaxAsset = deferredTaxItems
    .filter(item => item.category === 'asset')
    .reduce((sum, item) => sum + item.deferred_tax_asset, 0);

  const totalDeferredTaxLiability = deferredTaxItems
    .filter(item => item.category === 'liability')
    .reduce((sum, item) => sum + item.deferred_tax_liability, 0);

  const netDeferredTax = totalDeferredTaxAsset - totalDeferredTaxLiability;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">MFRS 112 - Income Taxes</h2>
          <p className="text-gray-600 text-sm">Deferred tax calculations and income tax provisions</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <button
            onClick={loadMFRS112Data}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Calculate
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Current Tax Expense</h3>
          <p className="text-2xl font-bold text-blue-600">
            RM {currentProvision?.current_tax_expense?.toLocaleString() || '0'}
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Deferred Tax Asset</h3>
          <p className="text-2xl font-bold text-green-600">
            RM {totalDeferredTaxAsset.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 text-sm">Deferred Tax Liability</h3>
          <p className="text-2xl font-bold text-red-600">
            RM {totalDeferredTaxLiability.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 text-sm">Net Deferred Tax</h3>
          <p className={`text-2xl font-bold ${netDeferredTax >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RM {netDeferredTax.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deferred Tax Items */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Deferred Tax Items</h3>
          <div className="space-y-4">
            {deferredTaxItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.description}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.category === 'asset' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.category.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Carrying Amount:</span>
                    <span className="ml-2 font-medium">RM {item.carrying_amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tax Base:</span>
                    <span className="ml-2 font-medium">RM {item.tax_base.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temporary Difference:</span>
                    <span className="ml-2 font-medium">RM {item.temporary_difference.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tax Rate:</span>
                    <span className="ml-2 font-medium">{(item.tax_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deferred Tax Asset:</span>
                    <span className="font-medium text-green-600">RM {item.deferred_tax_asset.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deferred Tax Liability:</span>
                    <span className="font-medium text-red-600">RM {item.deferred_tax_liability.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Tax Provision */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Income Tax Provision</h3>
          {currentProvision && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Current Tax Expense</span>
                  <p className="text-lg font-semibold text-gray-900">
                    RM {currentProvision.current_tax_expense.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Deferred Tax Expense</span>
                  <p className="text-lg font-semibold text-gray-900">
                    RM {currentProvision.deferred_tax_expense.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Total Tax Expense</span>
                  <span className="text-2xl font-bold text-blue-600">
                    RM {currentProvision.total_tax_expense.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-blue-700">Effective Tax Rate: {(currentProvision.effective_tax_rate * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Tax Rate Reconciliation</h4>
                <div className="space-y-2">
                  {currentProvision.reconciliation_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{item.description}</span>
                      <span className={`text-sm font-medium ${
                        item.type === 'addition' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.type === 'addition' ? '+' : '-'}{(item.amount * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Add Deferred Tax Item
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Generate Provision
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Export Report
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default MFRS112Tab; 