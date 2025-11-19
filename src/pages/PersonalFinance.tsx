import React, { useState, useEffect } from 'react';
import { personalFinanceApi } from '../services/api';
import { PersonalEntry, PersonalEntryFormData } from '../types/personal';
import PersonalFinanceForm from '../components/PersonalFinanceForm';
import PersonalFinanceTable from '../components/PersonalFinanceTable';
import ConfirmModal from '../components/ConfirmModal';
import { currencyUtils } from '../utils';
import { usePagination } from '../hooks/usePagination';

const PersonalFinance: React.FC = () => {
  const [entries, setEntries] = useState<PersonalEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PersonalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entryId: 0, entryDetails: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalIncoming: 0,
    totalOutgoing: 0,
    balance: 0,
    entryCount: 0
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination hook
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(entries, { initialItemsPerPage: 10 });

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await personalFinanceApi.getPersonalEntries();
      setEntries(data);
      
      // Calculate summary
      const summaryData = await personalFinanceApi.getPersonalSummary();
      setSummary(summaryData);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (data: PersonalEntryFormData) => {
    try {
      await personalFinanceApi.createPersonalEntry(data);
      setSuccessMessage('Entry added successfully!');
      await fetchEntries();
      resetPagination(); // Reset to first page after adding
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create entry');
      throw error;
    }
  };

  const handleUpdateEntry = async (data: PersonalEntryFormData) => {
    if (!editingEntry) return;
    
    try {
      await personalFinanceApi.updatePersonalEntry(editingEntry.id, data);
      setSuccessMessage('Entry updated successfully!');
      setEditingEntry(null);
      await fetchEntries();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update entry');
      throw error;
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      setDeleteLoading(true);
      await personalFinanceApi.deletePersonalEntry(id);
      setSuccessMessage('Entry deleted successfully!');
      await fetchEntries();
      setDeleteModal({ isOpen: false, entryId: 0, entryDetails: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (entry: PersonalEntry) => {
    const entryType = entry.paytype === 'incoming' ? 'Incoming' : 'Outgoing';
    setDeleteModal({
      isOpen: true,
      entryId: entry.id,
      entryDetails: `${entry.description || 'No description'} (${entryType})`
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, entryId: 0, entryDetails: '' });
  };

  const handleEditClick = (entry: PersonalEntry) => {
    setEditingEntry(entry);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await personalFinanceApi.exportPersonalToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-finance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage('Exported successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to export data');
    }
  };

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>

          {/* Form Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-end">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Finance</h1>
        <p className="text-gray-600">Track your personal income and expenses</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="absolute top-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="absolute top-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-green-600">{currencyUtils.formatCurrency(summary.totalIncoming)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-red-600">{currencyUtils.formatCurrency(summary.totalOutgoing)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Net Balance</h3>
            <svg className={`w-8 h-8 ${summary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{currencyUtils.formatCurrency(summary.balance)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Entries</h3>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-purple-600">{summary.entryCount}</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="mb-8">
        <PersonalFinanceForm
          onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
          editEntry={editingEntry}
          onCancel={handleCancelEdit}
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>

        <PersonalFinanceTable
          entries={paginatedData}
          onEdit={handleEditClick}
          onDelete={openDeleteModal}
          loading={loading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={() => handleDeleteEntry(deleteModal.entryId)}
        title="Delete Entry"
        message={`Are you sure you want to delete "${deleteModal.entryDetails}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLoading}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default PersonalFinance;
