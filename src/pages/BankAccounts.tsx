import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankingApi, authUtils } from '../services/api';
import { BankAccount, BankAccountFormData } from '../types/banking';
import { Tenant } from '../types/daybook';
import BankAccountForm from '../components/BankAccountForm';
import BankAccountList from '../components/BankAccountList';
import Pagination from '../components/Pagination';
import { usePagination } from '../hooks/usePagination';

const BankAccounts: React.FC = () => {
  const navigate = useNavigate();
  const user = authUtils.getUser();
  const isAdmin = user?.role === 'admin';
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bankingApi.getAllAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter accounts by tenant
  const filteredAccounts = useMemo(() => {
    if (selectedTenant === 'all') {
      return accounts;
    }
    if (selectedTenant === 'null') {
      return accounts.filter(account => !account.tenant || account.tenant === null);
    }
    return accounts.filter(account => account.tenant === selectedTenant);
  }, [accounts, selectedTenant]);

  // Get unique tenants from accounts (including null)
  const availableTenants = useMemo(() => {
    const tenants = new Set<string>();
    accounts.forEach(account => {
      if (account.tenant) {
        tenants.add(account.tenant);
      } else {
        tenants.add('null');
      }
    });
    return Array.from(tenants).sort();
  }, [accounts]);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedAccounts,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredAccounts, { initialItemsPerPage: 10 });

  // Reset pagination when filter changes
  useEffect(() => {
    resetPagination();
  }, [selectedTenant, resetPagination]);

  const handleCreate = () => {
    setEditingAccount(undefined);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(undefined);
  };

  const handleSubmit = async (data: BankAccountFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingAccount) {
        await bankingApi.updateAccount(editingAccount.id, data);
        setSuccess('Bank account updated successfully!');
      } else {
        await bankingApi.createAccount(data);
        setSuccess('Bank account created successfully!');
      }
      
      setShowForm(false);
      setEditingAccount(undefined);
      await fetchAccounts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save bank account');
      console.error('Error saving account:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setSuccess(null);
    
    try {
      await bankingApi.deleteAccount(id);
      setSuccess('Bank account deleted successfully!');
      await fetchAccounts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete bank account');
      console.error('Error deleting account:', err);
    }
  };

  const handleViewTransactions = (accountId: number) => {
    navigate(`/banking/transactions?account=${accountId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-slate-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your organization's bank accounts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tenant Filter */}
              {!showForm && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Tenant:</label>
                  <select
                    value={selectedTenant}
                    onChange={(e) => setSelectedTenant(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Tenants</option>
                    {Object.values(Tenant).map(tenant => (
                      <option key={tenant} value={tenant}>{tenant}</option>
                    ))}
                    {availableTenants.includes('null') && (
                      <option value="null">No Tenant</option>
                    )}
                  </select>
                </div>
              )}
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
                    New Account
                  </button>
                )}
              </div>
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
          <BankAccountForm
            initialData={editingAccount}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            mode={editingAccount ? 'edit' : 'create'}
          />
        ) : (
          <>
            <BankAccountList
              accounts={paginatedAccounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewTransactions={handleViewTransactions}
              isLoading={isLoading}
            />
            {!isLoading && filteredAccounts.length > 0 && (
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

export default BankAccounts;
