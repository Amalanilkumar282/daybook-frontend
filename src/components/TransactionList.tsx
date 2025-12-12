import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BankTransaction, BankAccount, TransactionType, TransactionStatus, UpdateTransactionFormData } from '../types/banking';
import { bankingApi } from '../services/api';
import ConfirmModal from './ConfirmModal';

interface TransactionListProps {
  transactions: BankTransaction[];
  accounts: BankAccount[];
  isLoading: boolean;
  showAccountColumn?: boolean;
  onTransactionUpdate?: () => void; // Callback to refresh transactions after update/delete
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  accounts,
  isLoading,
  showAccountColumn = true,
  onTransactionUpdate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<BankTransaction | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateTransactionFormData>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<BankTransaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // Handle opening edit modal
  const handleEditClick = (txn: BankTransaction) => {
    setEditingTransaction(txn);
    setEditFormData({
      description: txn.description || '',
      reference: txn.reference || '',
      cheque_number: txn.cheque_number || '',
      status: txn.status as TransactionStatus,
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  // Handle saving edit
  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    setEditLoading(true);
    setEditError(null);
    
    try {
      await bankingApi.updateTransaction(editingTransaction.id, editFormData);
      setEditModalOpen(false);
      setEditingTransaction(null);
      if (onTransactionUpdate) {
        onTransactionUpdate();
      }
    } catch (error: any) {
      setEditError(error.message || 'Failed to update transaction');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle opening delete modal
  const handleDeleteClick = (txn: BankTransaction) => {
    setDeletingTransaction(txn);
    setDeleteModalOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;
    
    setDeleteLoading(true);
    
    try {
      await bankingApi.deleteTransaction(deletingTransaction.id);
      setDeleteModalOpen(false);
      setDeletingTransaction(null);
      if (onTransactionUpdate) {
        onTransactionUpdate();
      }
    } catch (error: any) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Extract daybook entry ID from reference (e.g., "DAYBOOK-123" -> 123)
  const getDaybookEntryId = (reference?: string | null): number | null => {
    if (!reference) return null;
    const match = reference.match(/^DAYBOOK-(\d+)$/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Render reference with link if it's a daybook reference
  const renderReference = (reference?: string | null) => {
    if (!reference) return null;
    const entryId = getDaybookEntryId(reference);
    if (entryId) {
      return (
        <Link
          to={`/view/${entryId}`}
          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          title="View daybook entry"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {reference}
        </Link>
      );
    }
    return <span>{reference}</span>;
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
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              {showAccountColumn && (
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden ipad:table-cell">
                  Account
                </th>
              )}
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Status
              </th>
              <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(txn.created_at)}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(txn.transaction_type)}`}>
                    {txn.transaction_type.charAt(0).toUpperCase() + txn.transaction_type.slice(1)}
                  </span>
                </td>
                {showAccountColumn && (
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-700 hidden ipad:table-cell">
                    {((txn as any).bank_account_id ?? (txn as any).account_id)
                      ? getAccountName(((txn as any).bank_account_id ?? (txn as any).account_id) as number)
                      : '-'}
                  </td>
                )}
                <td className="px-4 md:px-6 py-4 text-sm text-gray-700">
                  <div>
                    {txn.transaction_type === TransactionType.TRANSFER && (
                      <div className="text-xs text-gray-600 mb-1">
                        From: {txn.from_account_id ? getAccountName((txn as any).from_account_id) : '-'} →{' '}
                        To: {txn.to_account_id ? getAccountName((txn as any).to_account_id) : '-'}
                      </div>
                    )}
                    {txn.description && <div className="font-medium">{txn.description}</div>}
                    {txn.reference && <div className="text-xs text-gray-500">Ref: {renderReference(txn.reference)}</div>}
                    {txn.cheque_number && <div className="text-xs text-gray-500">Cheque: {txn.cheque_number}</div>}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                  <span className={`text-sm font-semibold ${
                    txn.transaction_type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.transaction_type === TransactionType.DEPOSIT ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(txn.status)}`}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => handleEditClick(txn)}
                      className="p-1.5 md:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(txn)}
                      className="p-1.5 md:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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

      {/* Edit Transaction Modal */}
      {editModalOpen && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Transaction</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {editError}
                </div>
              )}

              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You can only edit description, reference, cheque number, and status. 
                  Amount and transaction type cannot be modified to maintain balance integrity.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <div className={`px-3 py-2 bg-gray-100 rounded-lg text-sm ${getTypeColor(editingTransaction.transaction_type)}`}>
                    {editingTransaction.transaction_type.charAt(0).toUpperCase() + editingTransaction.transaction_type.slice(1)}
                    {' '}— {formatCurrency(editingTransaction.amount)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={editFormData.reference || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference..."
                  />
                </div>
                
                {editingTransaction.transaction_type === TransactionType.CHEQUE && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      value={editFormData.cheque_number || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cheque_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter cheque number..."
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status || TransactionStatus.COMPLETED}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TransactionStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={TransactionStatus.COMPLETED}>Completed</option>
                    <option value={TransactionStatus.PENDING}>Pending</option>
                    <option value={TransactionStatus.FAILED}>Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-300 flex items-center"
                >
                  {editLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Transaction"
        message={
          deletingTransaction ? (
            <div>
              <p className="mb-3">Are you sure you want to delete this transaction?</p>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Type:</strong> {deletingTransaction.transaction_type}</p>
                <p><strong>Amount:</strong> {formatCurrency(deletingTransaction.amount)}</p>
                {deletingTransaction.description && <p><strong>Description:</strong> {deletingTransaction.description}</p>}
              </div>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Warning:</strong> This will NOT reverse the balance changes. 
                  Account balances will remain as they were after this transaction.
                </p>
              </div>
            </div>
          ) : ''
        }
        confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default TransactionList;
