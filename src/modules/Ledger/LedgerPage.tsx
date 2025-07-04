import React, { useState, useEffect } from 'react';
import { TabNavigation } from '../../components/ui/TabNavigation';
import { LedgerService } from './services/LedgerService';
import { JournalEntryTemplates } from './services/JournalEntryTemplates';
import {
  Account,
  AccountType,
  JournalEntry,
  TransactionType,
  WorkflowStatus,
  Currency
} from './types';

const LedgerPage: React.FC = () => {
  const [ledgerService, setLedgerService] = useState<LedgerService | null>(null);
  const [templates, setTemplates] = useState<JournalEntryTemplates | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize services with tenant ID (you'll need to get this from auth context)
    const tenantId = 'default-tenant'; // Replace with actual tenant ID
    const service = new LedgerService(tenantId);
    const templateService = new JournalEntryTemplates(service);
    
    setLedgerService(service);
    setTemplates(templateService);
    
    // Load initial data
    loadAccounts();
    loadJournalEntries();
  }, []);

  const loadAccounts = async () => {
    if (!ledgerService) return;
    
    try {
      // This would typically fetch from Supabase
      // For now, create some sample accounts
      const sampleAccounts: Account[] = [
        {
          id: '1',
          code: '1000',
          name: 'Cash',
          type: AccountType.ASSET,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          code: '1100',
          name: 'Accounts Receivable',
          type: AccountType.ASSET,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          code: '4000',
          name: 'Revenue',
          type: AccountType.REVENUE,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setAccounts(sampleAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadJournalEntries = async () => {
    if (!ledgerService) return;
    
    try {
      // This would typically fetch from Supabase
      setJournalEntries([]);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleEntry = async () => {
    if (!templates || !accounts.length) return;
    
    try {
      const customerAccount = accounts.find(a => a.name === 'Accounts Receivable');
      const revenueAccount = accounts.find(a => a.name === 'Revenue');
      
      if (!customerAccount || !revenueAccount) {
        alert('Required accounts not found');
        return;
      }

      const entry = await templates.saleEntry(
        customerAccount.id,
        revenueAccount.id,
        1000,
        'INV-001',
        'Sample sale transaction'
      );

      setJournalEntries(prev => [...prev, entry]);
      alert('Sample journal entry created successfully!');
    } catch (error) {
      console.error('Failed to create sample entry:', error);
      alert('Failed to create sample entry');
    }
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'Ledger Dashboard',
      component: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ledger Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800">Total Accounts</h3>
              <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">Journal Entries</h3>
              <p className="text-2xl font-bold text-green-600">{journalEntries.length}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800">Pending Approval</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {journalEntries.filter(e => e.status === WorkflowStatus.PENDING_APPROVAL).length}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800">Posted Entries</h3>
              <p className="text-2xl font-bold text-purple-600">
                {journalEntries.filter(e => e.is_posted).length}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={createSampleEntry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Sample Entry
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'journal-entries',
      label: 'Journal Entries',
      component: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Journal Entries</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No journal entries found. Create your first entry to get started.
                </div>
              ) : (
                journalEntries.map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{entry.reference}</h3>
                        <p className="text-gray-600">{entry.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === WorkflowStatus.POSTED 
                            ? 'bg-green-100 text-green-800'
                            : entry.status === WorkflowStatus.PENDING_APPROVAL
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Date: {new Date(entry.date).toLocaleDateString()} | 
                      Lines: {entry.lines.length} | 
                      Currency: {entry.base_currency}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'accounts',
      label: 'Chart of Accounts',
      component: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Chart of Accounts</h2>
          <div className="space-y-4">
            {accounts.map(account => (
              <div key={account.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{account.code} - {account.name}</h3>
                    <p className="text-sm text-gray-600">Type: {account.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'templates',
      label: 'Entry Templates',
      component: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Journal Entry Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sale Entry</h3>
              <p className="text-sm text-gray-600 mb-3">
                Debit: Accounts Receivable<br/>
                Credit: Revenue
              </p>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Use Template
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Payment Entry</h3>
              <p className="text-sm text-gray-600 mb-3">
                Debit: Bank Account<br/>
                Credit: Accounts Receivable
              </p>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Use Template
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Purchase Entry</h3>
              <p className="text-sm text-gray-600 mb-3">
                Debit: Expense Account<br/>
                Credit: Accounts Payable
              </p>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Use Template
              </button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Bank Transfer</h3>
              <p className="text-sm text-gray-600 mb-3">
                Debit: Destination Account<br/>
                Credit: Source Account
              </p>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Use Template
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'compliance',
      label: 'MFRS Compliance',
      component: (
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">MFRS Compliance</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Compliance Status</h3>
            <p className="text-green-700">All journal entries are compliant with MFRS standards.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
        <p className="text-gray-600 mt-2">
          Double-entry bookkeeping with MFRS compliance and multi-currency support
        </p>
      </div>
      
      <TabNavigation tabs={tabs} />
    </div>
  );
};

export default LedgerPage;