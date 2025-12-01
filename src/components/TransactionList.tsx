import React, { useState } from 'react';
import { BankTransaction, BankAccount, TransactionType } from '../types/banking';

interface TransactionListProps {
  transactions: BankTransaction[];
  accounts: BankAccount[];
  isLoading: boolean;
  showAccountColumn?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  isLoading,
  showAccountColumn = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

  const getAccountName = (accountId?: number | null): string => {
    if (accountId === undefined || accountId === null) return 'Unknown';
    const account = accountMap.get(accountId);
    return account ? `${account.shortform} - ${account.account_name}` : 'Unknown';
  };

  const filteredTransactions = transactions.filter(txn => {
    const accountId = (txn as any).bank_account_id ?? (txn as any).account_id ?? null;
    const accountName = getAccountName(accountId);

    const matchesSearch = 
      (txn.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.reference?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.cheque_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      txn.amount.toString().includes(searchTerm) ||
      accountName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || txn.transaction_type === filterType;

    return matchesSearch && matchesType;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'bg-green-100 text-green-800';
      case TransactionType.WITHDRAW:
        return 'bg-red-100 text-red-800';
      case TransactionType.TRANSFER:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.CHEQUE:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value={TransactionType.DEPOSIT}>Deposit</option>
            <option value={TransactionType.WITHDRAW}>Withdraw</option>
            <option value={TransactionType.TRANSFER}>Transfer</option>
            <option value={TransactionType.CHEQUE}>Cheque</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Newest First' : 'Oldest First'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'} Date
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              {showAccountColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(txn.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(txn.transaction_type)}`}>
                    {txn.transaction_type.charAt(0).toUpperCase() + txn.transaction_type.slice(1)}
                  </span>
                </td>
                {showAccountColumn && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {((txn as any).bank_account_id ?? (txn as any).account_id)
                      ? getAccountName(((txn as any).bank_account_id ?? (txn as any).account_id) as number)
                      : '-'}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>
                    {txn.transaction_type === TransactionType.TRANSFER && (
                      <div className="text-xs text-gray-600 mb-1">
                        From: {txn.from_account_id ? getAccountName((txn as any).from_account_id) : '-'} →{' '}
                        To: {txn.to_account_id ? getAccountName((txn as any).to_account_id) : '-'}
                      </div>
                    )}
                    {txn.description && <div className="font-medium">{txn.description}</div>}
                    {txn.reference && <div className="text-xs text-gray-500">Ref: {txn.reference}</div>}
                    {txn.cheque_number && <div className="text-xs text-gray-500">Cheque: {txn.cheque_number}</div>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`text-sm font-semibold ${
                    txn.transaction_type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.transaction_type === TransactionType.DEPOSIT ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-600">Total Transactions</span>
            <div className="text-xl font-bold text-gray-900">{sortedTransactions.length}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Deposits</span>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(
                sortedTransactions
                  .filter(txn => txn.transaction_type === TransactionType.DEPOSIT)
                  .reduce((sum, txn) => sum + txn.amount, 0)
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Withdrawals</span>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(
                sortedTransactions
                  .filter(txn => txn.transaction_type === TransactionType.WITHDRAW || txn.transaction_type === TransactionType.CHEQUE)
                  .reduce((sum, txn) => sum + txn.amount, 0)
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Transfers</span>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(
                sortedTransactions
                  .filter(txn => txn.transaction_type === TransactionType.TRANSFER)
                  .reduce((sum, txn) => sum + txn.amount, 0)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
