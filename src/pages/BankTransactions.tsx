import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bankingApi, authUtils } from '../services/api';
import { BankAccount, BankTransaction, TransactionType } from '../types/banking';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const BankTransactions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const isAdmin = user?.role === 'admin';
  const accountIdParam = searchParams.get('account');
  
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accountIdParam) {
      fetchTransactionsByAccount(parseInt(accountIdParam));
    } else {
      fetchAllTransactions();
    }
  }, [accountIdParam]);

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    setError(null);
    try {
      const data = await bankingApi.getAllAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const fetchAllTransactions = async () => {
    setIsLoadingTransactions(true);
    setError(null);
    try {
      const data = await bankingApi.getAllTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchTransactionsByAccount = async (accountId: number) => {
    setIsLoadingTransactions(true);
    setError(null);
    try {
      const data = await bankingApi.getTransactionsByAccount(accountId);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleCreate = () => {
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmit = async (payload: { type: TransactionType; data: any }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      switch (payload.type) {
        case TransactionType.DEPOSIT:
          await bankingApi.deposit(payload.data);
          setSuccess('Deposit transaction completed successfully!');
          break;
        case TransactionType.WITHDRAW:
          await bankingApi.withdraw(payload.data);
          setSuccess('Withdrawal transaction completed successfully!');
          break;
        case TransactionType.TRANSFER:
          await bankingApi.transfer(payload.data);
          setSuccess('Transfer transaction completed successfully!');
          break;
        case TransactionType.CHEQUE:
          await bankingApi.issueCheque(payload.data);
          setSuccess('Cheque issued successfully!');
          break;
      }
      
      setShowForm(false);
      
      // Refresh data
      await fetchAccounts();
      if (accountIdParam) {
        await fetchTransactionsByAccount(parseInt(accountIdParam));
      } else {
        await fetchAllTransactions();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to process transaction');
      console.error('Error processing transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await bankingApi.exportTransactionsToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bank-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSuccess('Transactions exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to export transactions');
      console.error('Error exporting:', err);
    }
  };

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedTransactions,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(transactions, { initialItemsPerPage: 10 });

  const selectedAccount = accountIdParam 
    ? accounts.find(acc => acc.id === parseInt(accountIdParam))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-slate-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedAccount ? `Transactions - ${selectedAccount.shortform}` : 'All Transactions'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {selectedAccount 
                  ? `View and manage transactions for ${selectedAccount.account_name}`
                  : 'View and manage all banking transactions'
                }
              </p>
              {selectedAccount && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Balance:</span>{' '}
                    <span className={`font-bold ${selectedAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{selectedAccount.balance.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/banking/accounts')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    ← Back to Accounts
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              )}
              {!showForm && (
                <button
                  onClick={handleCreate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Transaction
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Form or List */}
        {showForm ? (
          <TransactionForm
            accounts={accounts}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        ) : (
          <>
            <TransactionList
              transactions={paginatedTransactions}
              accounts={accounts}
              isLoading={isLoadingTransactions || isLoadingAccounts}
              showAccountColumn={!accountIdParam}
              onTransactionUpdate={async () => {
                // Refresh data after update/delete
                await fetchAccounts();
                if (accountIdParam) {
                  await fetchTransactionsByAccount(parseInt(accountIdParam));
                } else {
                  await fetchAllTransactions();
                }
                setSuccess('Transaction updated successfully!');
                setTimeout(() => setSuccess(null), 3000);
              }}
            />
            {!isLoadingTransactions && !isLoadingAccounts && transactions.length > 0 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BankTransactions;
