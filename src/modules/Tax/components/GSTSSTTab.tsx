import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { SSTReturn, EInvoiceData, LHDNResponse, TaxValidationError } from '../types';

interface SSTTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  type: 'sale' | 'purchase';
  status: 'pending' | 'processed' | 'submitted';
}

interface SSTSummary {
  total_sales: number;
  total_purchases: number;
  output_tax: number;
  input_tax: number;
  net_tax_payable: number;
  period: string;
}

const GSTSSTTab: React.FC = () => {
  const [sstTransactions, setSstTransactions] = useState<SSTTransaction[]>([]);
  const [sstSummary, setSstSummary] = useState<SSTSummary | null>(null);
  const [sstReturn, setSstReturn] = useState<SSTReturn | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceData, setInvoiceData] = useState<Partial<EInvoiceData>>({});
  const [validationErrors, setValidationErrors] = useState<TaxValidationError[]>([]);

  const taxService = new TaxService();

  useEffect(() => {
    loadSSTData();
  }, [selectedPeriod]);

  const loadSSTData = async () => {
    setLoading(true);
    try {
      // Simulate loading SST data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockTransactions: SSTTransaction[] = [
        {
          id: '1',
          date: '2024-01-15',
          description: 'Sales - Product A',
          amount: 10000,
          tax_rate: 0.10,
          tax_amount: 1000,
          type: 'sale',
          status: 'processed'
        },
        {
          id: '2',
          date: '2024-01-20',
          description: 'Purchase - Raw Materials',
          amount: 5000,
          tax_rate: 0.10,
          tax_amount: 500,
          type: 'purchase',
          status: 'processed'
        },
        {
          id: '3',
          date: '2024-01-25',
          description: 'Sales - Service B',
          amount: 8000,
          tax_rate: 0.10,
          tax_amount: 800,
          type: 'sale',
          status: 'pending'
        }
      ];

      const mockSummary: SSTSummary = {
        total_sales: 18000,
        total_purchases: 5000,
        output_tax: 1800,
        input_tax: 500,
        net_tax_payable: 1300,
        period: selectedPeriod
      };

      const mockReturn: SSTReturn = {
        id: '1',
        period: selectedPeriod,
        taxable_supplies: 18000,
        output_tax: 1800,
        input_tax: 500,
        net_tax_payable: 1300,
        payment_due_date: '2024-02-28',
        status: 'pending',
        submission_date: null
      };

      setSstTransactions(mockTransactions);
      setSstSummary(mockSummary);
      setSstReturn(mockReturn);
    } catch (error) {
      console.error('Error loading SST data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateSST = async () => {
    if (!sstSummary) return;
    
    try {
      const result = await taxService.calculateSSTReturn(sstSummary.total_sales, 'current-tenant');
      setSstReturn(result);
    } catch (error) {
      console.error('Error calculating SST return:', error);
    }
  };

  const handleSubmitInvoice = async () => {
    if (!invoiceData.invoice_number || !invoiceData.total_amount) return;
    
    try {
      setLoading(true);
      const errors = await taxService.validateTaxData(invoiceData as EInvoiceData);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        const response = await taxService.submitEInvoice(invoiceData as EInvoiceData);
        console.log('Invoice submitted:', response);
        setShowInvoiceForm(false);
        setInvoiceData({});
        loadSSTData(); // Refresh data
      }
    } catch (error) {
      console.error('Error submitting invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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
          <h2 className="text-xl font-semibold">GST/SST Management</h2>
          <p className="text-gray-600 text-sm">Sales and Service Tax calculations and reporting</p>
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
            onClick={() => setShowInvoiceForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Add Invoice
          </button>
          <button
            onClick={handleCalculateSST}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Calculate SST
          </button>
        </div>
      </div>

      {/* SST Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Total Sales</h3>
          <p className="text-2xl font-bold text-blue-600">
            RM {sstSummary?.total_sales?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-blue-600 mt-1">Taxable supplies</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Output Tax</h3>
          <p className="text-2xl font-bold text-green-600">
            RM {sstSummary?.output_tax?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-green-600 mt-1">Tax collected</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 text-sm">Input Tax</h3>
          <p className="text-2xl font-bold text-purple-600">
            RM {sstSummary?.input_tax?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-purple-600 mt-1">Tax paid</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 text-sm">Net Tax Payable</h3>
          <p className="text-2xl font-bold text-orange-600">
            RM {sstSummary?.net_tax_payable?.toLocaleString() || '0'}
          </p>
          <p className="text-xs text-orange-600 mt-1">Due to LHDN</p>
        </div>
      </div>

      {/* SST Return Details */}
      {sstReturn && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">SST Return Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Period:</span>
              <p className="font-medium text-gray-900">{sstReturn.period}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Payment Due Date:</span>
              <p className="font-medium text-gray-900">{sstReturn.payment_due_date}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(sstReturn.status)}`}>
                {sstReturn.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Submission Date:</span>
              <p className="font-medium text-gray-900">{sstReturn.submission_date || 'Not submitted'}</p>
            </div>
          </div>
        </div>
      )}

      {/* SST Transactions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">SST Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sstTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(transaction.tax_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {transaction.tax_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add SST Invoice</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceData.invoice_number || ''}
                    onChange={(e) => setInvoiceData({...invoiceData, invoice_number: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="INV-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.invoice_date || ''}
                    onChange={(e) => setInvoiceData({...invoiceData, invoice_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <input
                    type="number"
                    value={invoiceData.total_amount || ''}
                    onChange={(e) => setInvoiceData({...invoiceData, total_amount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="1000.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax Amount</label>
                  <input
                    type="number"
                    value={invoiceData.tax_amount || ''}
                    onChange={(e) => setInvoiceData({...invoiceData, tax_amount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="100.00"
                  />
                </div>

                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-red-800">Validation Errors:</h4>
                    <ul className="mt-2 text-sm text-red-700">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInvoiceForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitInvoice}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Submit Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Generate SST Return
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Submit to LHDN
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

export default GSTSSTTab; 