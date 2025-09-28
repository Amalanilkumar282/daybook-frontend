import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { daybookApi } from '../services/api';
import { DaybookEntry, PayType, PayStatus } from '../types/daybook';
import ConfirmModal from '../components/ConfirmModal';

const ViewEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DaybookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) {
        setError('No entry ID provided');
        setLoading(false);
        return;
      }

      try {
        const entryData = await daybookApi.getEntry(id);
        setEntry(entryData);
      } catch (error: any) {
        setError(error.message || 'Failed to load entry');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    if (!entry) return;

    try {
      setDeleteLoading(true);
      await daybookApi.deleteEntry(entry.id.toString());
      navigate('/', { replace: true });
    } catch (error: any) {
      setError(error.message || 'Failed to delete entry');
      setDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error</div>
          <p className="text-neutral-600 mb-6">{error}</p>
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

  if (!entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-neutral-600 text-xl font-semibold mb-4">Entry Not Found</div>
          <p className="text-neutral-600 mb-6">The requested entry could not be found.</p>
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

  const getPaymentTypeColor = (type: PayType) => {
    return type === PayType.INCOMING ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getPaymentStatusColor = (status: PayStatus) => {
    return status === PayStatus.PAID ? 'text-green-600 bg-green-100' : 'text-orange-600 bg-orange-100';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Entry Details</h1>
          <p className="text-neutral-600 mt-2">View complete information for this daybook entry</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <Link
            to={`/edit/${entry.id}`}
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
              <h2 className="text-xl font-semibold">{entry.id_in_out}</h2>
              <p className="text-primary-100 mt-1">{formatDate(entry.created_at)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(entry.amount)}
              </div>
              <div className={`text-sm px-3 py-1 rounded-full mt-2 ${
                entry.payment_type === PayType.INCOMING ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {entry.payment_type.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Date Created</label>
                <p className="text-neutral-900 font-medium">{formatDate(entry.created_at)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">ID In/Out</label>
                <p className="text-neutral-900 font-medium font-mono">{entry.id_in_out}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Entry ID</label>
                <p className="text-neutral-500 text-sm font-mono">{entry.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Payment Type</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentTypeColor(entry.payment_type)}`}>
                  {entry.payment_type.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-1">Amount</label>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(entry.amount)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(entry.pay_status)}`}>
                  {entry.pay_status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
                <p className="text-gray-900 font-medium capitalize">
                  {entry.mode_of_pay.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {entry.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-neutral-900 whitespace-pre-wrap">{entry.description}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Entry History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
              <div>
                <span className="font-medium">Created:</span>
                <p>{formatDateTime(entry.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link
          to="/"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <Link
          to={`/edit/${entry.id}`}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Edit Entry →
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Entry"
        message={`Are you sure you want to delete this entry? This action cannot be undone.`}
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