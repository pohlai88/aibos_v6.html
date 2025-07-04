import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxType } from '../types';

interface MTDEmployee {
  id: string;
  employee_id: string;
  name: string;
  salary: number;
  allowances: number;
  deductions: number;
  taxable_income: number;
  mtd_amount: number;
  cumulative_mtd: number;
  status: 'active' | 'inactive' | 'terminated';
}

interface MTDCalculation {
  id: string;
  employee_id: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  taxable_income: number;
  mtd_rate: number;
  mtd_amount: number;
  cumulative_taxable_income: number;
  cumulative_mtd: number;
  net_salary: number;
}

interface MTDRange {
  min: number;
  max: number;
  rate: number;
  tax: number;
}

const WithholdingTab: React.FC = () => {
  const [employees, setEmployees] = useState<MTDEmployee[]>([]);
  const [calculations, setCalculations] = useState<MTDCalculation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [showCalculationForm, setShowCalculationForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<MTDEmployee | null>(null);

  const taxService = new TaxService();

  // MTD tax brackets for Malaysia (2024)
  const mtdRanges: MTDRange[] = [
    { min: 0, max: 5000, rate: 0, tax: 0 },
    { min: 5001, max: 20000, rate: 0.01, tax: 0 },
    { min: 20001, max: 35000, rate: 0.03, tax: 150 },
    { min: 35001, max: 50000, rate: 0.08, tax: 600 },
    { min: 50001, max: 70000, rate: 0.14, tax: 1800 },
    { min: 70001, max: 100000, rate: 0.21, tax: 4200 },
    { min: 100001, max: 400000, rate: 0.24, tax: 10500 },
    { min: 400001, max: 600000, rate: 0.245, tax: 82500 },
    { min: 600001, max: 2000000, rate: 0.25, tax: 132500 },
    { min: 2000001, max: Infinity, rate: 0.26, tax: 532500 }
  ];

  useEffect(() => {
    loadMTDData();
  }, [selectedMonth]);

  const loadMTDData = async () => {
    setLoading(true);
    try {
      // Simulate loading MTD data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockEmployees: MTDEmployee[] = [
        {
          id: '1',
          employee_id: 'EMP001',
          name: 'Ahmad bin Abdullah',
          salary: 5000,
          allowances: 500,
          deductions: 200,
          taxable_income: 5300,
          mtd_amount: 53,
          cumulative_mtd: 318,
          status: 'active'
        },
        {
          id: '2',
          employee_id: 'EMP002',
          name: 'Siti binti Mohamed',
          salary: 8000,
          allowances: 800,
          deductions: 300,
          taxable_income: 8500,
          mtd_amount: 85,
          cumulative_mtd: 510,
          status: 'active'
        },
        {
          id: '3',
          employee_id: 'EMP003',
          name: 'Raj Kumar',
          salary: 12000,
          allowances: 1200,
          deductions: 500,
          taxable_income: 12700,
          mtd_amount: 381,
          cumulative_mtd: 2286,
          status: 'active'
        }
      ];

      const mockCalculations: MTDCalculation[] = mockEmployees.map(emp => ({
        id: emp.id,
        employee_id: emp.employee_id,
        month: selectedMonth,
        basic_salary: emp.salary,
        allowances: emp.allowances,
        deductions: emp.deductions,
        taxable_income: emp.taxable_income,
        mtd_rate: emp.mtd_amount / emp.taxable_income,
        mtd_amount: emp.mtd_amount,
        cumulative_taxable_income: emp.taxable_income * 6, // Assuming 6 months
        cumulative_mtd: emp.cumulative_mtd,
        net_salary: emp.salary + emp.allowances - emp.deductions - emp.mtd_amount
      }));

      setEmployees(mockEmployees);
      setCalculations(mockCalculations);
    } catch (error) {
      console.error('Error loading MTD data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMTD = (taxableIncome: number): number => {
    for (const range of mtdRanges) {
      if (taxableIncome >= range.min && taxableIncome <= range.max) {
        const excess = taxableIncome - range.min;
        return range.tax + (excess * range.rate);
      }
    }
    return 0;
  };

  const handleCalculateMTD = async (employee: MTDEmployee) => {
    try {
      const taxableIncome = employee.salary + employee.allowances - employee.deductions;
      const mtdAmount = calculateMTD(taxableIncome);
      
      // Update employee with new MTD calculation
      const updatedEmployee = {
        ...employee,
        taxable_income: taxableIncome,
        mtd_amount: mtdAmount
      };
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employee.id ? updatedEmployee : emp
      ));
      
      // Update calculations
      const calculation: MTDCalculation = {
        id: employee.id,
        employee_id: employee.employee_id,
        month: selectedMonth,
        basic_salary: employee.salary,
        allowances: employee.allowances,
        deductions: employee.deductions,
        taxable_income: taxableIncome,
        mtd_rate: mtdAmount / taxableIncome,
        mtd_amount: mtdAmount,
        cumulative_taxable_income: taxableIncome * 6,
        cumulative_mtd: mtdAmount * 6,
        net_salary: employee.salary + employee.allowances - employee.deductions - mtdAmount
      };
      
      setCalculations(prev => prev.map(calc => 
        calc.employee_id === employee.employee_id ? calculation : calc
      ));
    } catch (error) {
      console.error('Error calculating MTD:', error);
    }
  };

  const totalMTD = employees.reduce((sum, emp) => sum + emp.mtd_amount, 0);
  const totalTaxableIncome = employees.reduce((sum, emp) => sum + emp.taxable_income, 0);

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
          <h2 className="text-xl font-semibold">Withholding Tax (MTD)</h2>
          <p className="text-gray-600 text-sm">Monthly Tax Deduction calculations and management</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <button
            onClick={() => setShowCalculationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Add Employee
          </button>
          <button
            onClick={loadMTDData}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Calculate All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
          <p className="text-xs text-blue-600 mt-1">Active employees</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Total Taxable Income</h3>
          <p className="text-2xl font-bold text-green-600">
            RM {totalTaxableIncome.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-1">This month</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 text-sm">Total MTD</h3>
          <p className="text-2xl font-bold text-purple-600">
            RM {totalMTD.toLocaleString()}
          </p>
          <p className="text-xs text-purple-600 mt-1">To be deducted</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 text-sm">Average MTD Rate</h3>
          <p className="text-2xl font-bold text-orange-600">
            {totalTaxableIncome > 0 ? ((totalMTD / totalTaxableIncome) * 100).toFixed(1) : '0'}%
          </p>
          <p className="text-xs text-orange-600 mt-1">Effective rate</p>
        </div>
      </div>

      {/* MTD Tax Brackets */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">MTD Tax Brackets (2024)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range (RM)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax (RM)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mtdRanges.map((range, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {range.min.toLocaleString()} - {range.max === Infinity ? '∞' : range.max.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(range.rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {range.tax.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {range.rate > 0 ? `Tax + (Excess × ${(range.rate * 100).toFixed(1)}%)` : 'No tax'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee MTD Calculations */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Employee MTD Calculations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowances</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Income</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MTD Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.employee_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {employee.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {employee.allowances.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {employee.deductions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {employee.taxable_income.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    RM {employee.mtd_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RM {(employee.salary + employee.allowances - employee.deductions - employee.mtd_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleCalculateMTD(employee)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Recalculate
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowCalculationForm(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Generate MTD Report
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Submit to LHDN
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Download Payslips
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithholdingTab; 