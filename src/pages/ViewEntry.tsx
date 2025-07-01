import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DaybookEntry } from '../types/daybook';
import { daybookApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const ViewEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<DaybookEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEntry(id);
    } else {
      setError('Entry ID is required');
      setIsLoading(false);
    }
  }, [id]);

  const fetchEntry = async (entryId: string) => {
    try {
      setIsLoading(true);
      const entryData = await daybookApi.getEntry(entryId);
      setEntry(entryData);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching entry:', error);
      if (error.response?.status === 404) {
        setError('Entry not found');
      } else {
        setError('Failed to load entry. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      await daybookApi.deleteEntry(id);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry. Please try again.');
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Entry</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const balance = entry.credit - entry.debit;
  const isCredit = balance > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Entry Details</h1>
          <p className="text-dark-600 mt-2">View complete information for this daybook entry</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Link
            to={`/edit/${entry._id}`}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
          >
            Edit Entry
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Delete Entry
          </button>
        </div>
      </div>

      {/* Entry Details Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{entry.voucherNumber}</h2>
              <p className="text-primary-100 mt-1">{formatDate(entry.date)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {balance !== 0 ? formatCurrency(Math.abs(balance)) : 'Balanced'}
              </div>
              {balance !== 0 && (
                <div className={`text-sm ${isCredit ? 'text-green-200' : 'text-red-200'}`}>
                  {isCredit ? 'Credit Balance' : 'Debit Balance'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Date</label>
                <p className="text-dark-900 font-medium">{formatDate(entry.date)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Voucher Number</label>
                <p className="text-dark-900 font-medium">{entry.voucherNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Entry ID</label>
                <p className="text-dark-500 text-sm font-mono">{entry._id}</p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-900 border-b border-gray-200 pb-2">
                Financial Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-red-700 mb-1">Debit Amount</label>
                  <p className="text-xl font-bold text-red-800">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-green-700 mb-1">Credit Amount</label>
                  <p className="text-xl font-bold text-green-800">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-dark-600 mb-1">Net Effect</label>
                <p className={`text-xl font-bold ${isCredit ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {balance === 0 ? 'Balanced Entry' : `${formatCurrency(Math.abs(balance))} ${isCredit ? 'CR' : 'DR'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Particulars */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-dark-900 border-b border-gray-200 pb-2 mb-4">
              Transaction Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-dark-600 mb-2">Particulars</label>
              <p className="text-dark-900 whitespace-pre-wrap">{entry.particulars}</p>
            </div>
          </div>

          {/* Metadata */}
          {(entry.createdAt || entry.updatedAt) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">Entry History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-dark-600">
                {entry.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{formatDateTime(entry.createdAt)}</p>
                  </div>
                )}
                {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                  <div>
                    <span className="font-medium">Last Modified:</span>
                    <p>{formatDateTime(entry.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry.particulars}" (${entry.voucherNumber})? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default ViewEntry;
