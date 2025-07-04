import React, { useState, useEffect } from 'react';
import { accountingService, LedgerEntry } from '../services/accountingService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface LedgerTableProps {
  organizationId: string;
  filters?: {
    startDate?: string;
    endDate?: string;
    accountCode?: string;
  };
}

const LedgerTable: React.FC<LedgerTableProps> = ({ organizationId, filters }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLedgerEntries();
  }, [organizationId, filters]);

  const loadLedgerEntries = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getLedgerEntries(organizationId, filters);
      setEntries(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ledger entries');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Debit
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Credit
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(entry.transaction_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.account_code} - {entry.account_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {entry.reference}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {entry.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {entry.debit_amount > 0 ? entry.debit_amount.toLocaleString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {entry.credit_amount > 0 ? entry.credit_amount.toLocaleString() : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No ledger entries found for the selected criteria.
        </div>
      )}
    </div>
  );
};

export default LedgerTable; 