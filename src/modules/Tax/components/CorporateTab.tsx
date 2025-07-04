import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxType } from '../types';

interface CP204Installment {
  id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  payment_reference?: string;
}

interface CorporateTaxCalculation {
  id: string;
  tax_year: string;
  accounting_period: string;
  revenue: number;
  expenses: number;
  taxable_income: number;
  tax_rate: number;
  tax_payable: number;
  estimated_tax: number;
  status: 'estimated' | 'final' | 'submitted';
}

interface CorporateTaxSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  tax_payable: number;
  cp204_installments: number;
  total_paid: number;
  outstanding: number;
}

const CorporateTab: React.FC = () => {
  const [cp204Installments, setCp204Installments] = useState<CP204Installment[]>([]);
  const [taxCalculations, setTaxCalculations] = useState<CorporateTaxCalculation[]>([]);
  const [taxSummary, setTaxSummary] = useState<CorporateTaxSummary | null>(null);
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear().toString();
  });
  const [loading, setLoading] = useState(false);
  const [showCalculationForm, setShowCalculationForm] = useState(false);

  const taxService = new TaxService();

  useEffect(() => {
    loadCorporateTaxData();
  }, [selectedYear]);

  const loadCorporateTaxData = async () => {
    setLoading(true);
    try {
      // Simulate loading corporate tax data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock CP204 installments for 2024
      const mockInstallments: CP204Installment[] = [
        {
          id: '1',
          installment_number: 1,
          due_date: '2024-03-31',
          amount: 50000,
          status: 'paid',
          payment_date: '2024-03-28',
          payment_reference: 'CP204-2024-001'
        },
        {
          id: '2',
          installment_number: 2,
          due_date: '2024-06-30',
          amount: 50000,
          status: 'paid',
          payment_date: '2024-06-25',
          payment_reference: 'CP204-2024-002'
        },
        {
          id: '3',
          installment_number: 3,
          due_date: '2024-09-30',
          amount: 50000,
          status: 'paid',
          payment_date: '2024-09-28',
          payment_reference: 'CP204-2024-003'
        },
        {
          id: '4',
          installment_number: 4,
          due_date: '2024-12-31',
          amount: 50000,
          status: 'pending'
        }
      ];

      // Mock tax calculations
      const mockCalculations: CorporateTaxCalculation[] = [
        {
          id: '1',
          tax_year: selectedYear,
          accounting_period: '2024-01-01 to 2024-12-31',
          revenue: 2000000,
          expenses: 1500000,
          taxable_income: 500000,
          tax_rate: 0.24,
          tax_payable: 120000,
          estimated_tax: 120000,
          status: 'estimated'
        }
      ];

      const mockSummary: CorporateTaxSummary = {
        total_revenue: 2000000,
        total_expenses: 1500000,
        net_profit: 500000,
        tax_payable: 120000,
        cp204_installments: 200000,
        total_paid: 150000,
        outstanding: 50000
      };

      setCp204Installments(mockInstallments);
      setTaxCalculations(mockCalculations);
      setTaxSummary(mockSummary);
    } catch (error) {
      console.error('Error loading corporate tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateCorporateTax = async () => {
    try {
      // Simulate tax calculation
      const calculation = taxCalculations[0];
      if (calculation) {
        const updatedCalculation = {
          ...calculation,
          status: 'final' as const
        };
        setTaxCalculations([updatedCalculation]);
      }
    } catch (error) {
      console.error('Error calculating corporate tax:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCalculationStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-green-100 text-green-800';
      case 'estimated': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Corporate Tax</h2>
          <p className="text-gray-600 text-sm">Corporate tax calculations and CP204 installments</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Tax Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button
            onClick={() => setShowCalculationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Add Calculation
          </button>
          <button
            onClick={handleCalculateCorporateTax}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Calculate Tax
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            RM {taxSummary?.net_profit?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-blue-600 mt-1">Taxable income</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Tax Payable</h3>
          <p className="text-2xl font-bold text-green-600">
            RM {taxSummary?.tax_payable?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-green-600 mt-1">24% rate</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 text-sm">CP204 Installments</h3>
          <p className="text-2xl font-bold text-purple-600">
            RM {taxSummary?.cp204_installments?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-purple-600 mt-1">Total due</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 text-sm">Outstanding</h3>
          <p className="text-2xl font-bold text-orange-600">
            RM {taxSummary?.outstanding?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-orange-600 mt-1">To be paid</p>
        </div>
      </div>

      {/* Tax Calculation Details */}
      {taxCalculations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Tax Calculation Details</h3>
          {taxCalculations.map((calculation) => (
            <div key={calculation.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Tax Year:</span>
                  <p className="font-medium text-gray-900">{calculation.tax_year}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Accounting Period:</span>
                  <p className="font-medium text-gray-900">{calculation.accounting_period}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tax Rate:</span>
                  <p className="font-medium text-gray-900">{(calculation.tax_rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCalculationStatusColor(calculation.status)}`}>
                    {calculation.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <p className="text-lg font-semibold text-gray-900">
                    RM {calculation.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Expenses</span>
                  <p className="text-lg font-semibold text-gray-900">
                    RM {calculation.expenses.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <span className="text-sm text-gray-600">Taxable Income</span>
                  <p className="text-lg font-semibold text-gray-900">
                    RM {calculation.taxable_income.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Tax Payable</span>
                  <span className="text-2xl font-bold text-blue-600">
                    RM {calculation.tax_payable.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CP204 Installments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">CP204 Installments - {selectedYear}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cp204Installments.map((installment) => (
                <tr key={installment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {installment.installment_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {installment.due_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {installment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(installment.status)}`}>
                      {installment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {installment.payment_date || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {installment.payment_reference || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {installment.status === 'pending' && (
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Pay
                      </button>
                    )}
                    <button className="text-green-600 hover:text-green-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Payment Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Q1</div>
            <div className="text-sm text-gray-600">March 31</div>
            <div className="text-lg font-semibold text-gray-900">RM 50,000</div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">PAID</span>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Q2</div>
            <div className="text-sm text-gray-600">June 30</div>
            <div className="text-lg font-semibold text-gray-900">RM 50,000</div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">PAID</span>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Q3</div>
            <div className="text-sm text-gray-600">September 30</div>
            <div className="text-lg font-semibold text-gray-900">RM 50,000</div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">PAID</span>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Q4</div>
            <div className="text-sm text-gray-600">December 31</div>
            <div className="text-lg font-semibold text-gray-900">RM 50,000</div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">PENDING</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Generate CP204
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Submit Return
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Download Report
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateTab; 