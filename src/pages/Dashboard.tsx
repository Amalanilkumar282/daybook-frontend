import React, { useState, useEffect } from 'react';
import { DaybookEntry, SummaryData } from '../types/daybook';
import { daybookApi } from '../services/api';
import SummaryCards from '../components/SummaryCards';
import DaybookTable from '../components/DaybookTable';
import ConfirmModal from '../components/ConfirmModal';

const Dashboard: React.FC = () => {
  console.log('DEBUG: Dashboard component rendering');
  const [entries, setEntries] = useState<DaybookEntry[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entryId: '', entryDetails: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DEBUG: Dashboard useEffect running');
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('DEBUG: Fetching data...');
    try {
      setLoading(true);
      setSummaryLoading(true);
      setError(null);
      
      // Fetch entries and summary data
      console.log('DEBUG: Calling API...');
      const entriesData = await daybookApi.getAllEntries();
      const summaryResponse = await daybookApi.getSummary();

      console.log('DEBUG: Data received:', { entries: entriesData.length, summary: summaryResponse });
      setEntries(entriesData);
      setSummaryData(summaryResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Using fallback data for demo.');
      
      // Set fallback data for development
      const fallbackEntries = [
        {
          _id: '1',
          date: '2025-06-30',
          particulars: 'Sample Entry 1',
          voucherNumber: 'V001',
          debit: 100,
          credit: 0,
          createdAt: '2025-06-30T08:00:00.000Z',
          updatedAt: '2025-06-30T08:00:00.000Z',
        },
        {
          _id: '2',
          date: '2025-06-29',
          particulars: 'Sample Entry 2',
          voucherNumber: 'V002',
          debit: 0,
          credit: 200,
          createdAt: '2025-06-29T14:30:00.000Z',
          updatedAt: '2025-06-29T14:30:00.000Z',
        }
      ];
      
      setEntries(fallbackEntries);
      setSummaryData({
        today: { debit: 100, credit: 0 },
        week: { debit: 100, credit: 200 },
        month: { debit: 100, credit: 200 },
      });
    } finally {
      setLoading(false);
      setSummaryLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      await daybookApi.deleteEntry(id);
      
      // Remove from local state
      setEntries(entries.filter(entry => entry._id !== id));
      
      // Refresh summary data
      const summaryResponse = await daybookApi.getSummary();
      setSummaryData(summaryResponse);
      
      setDeleteModal({ isOpen: false, entryId: '', entryDetails: '' });
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (id: string) => {
    const entry = entries.find(e => e._id === id);
    if (entry) {
      setDeleteModal({
        isOpen: true,
        entryId: entry._id,
        entryDetails: `${entry.particulars} (${entry.voucherNumber})`
      });
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, entryId: '', entryDetails: '' });
  };

  console.log('DEBUG: Dashboard render - loading:', loading, 'entries:', entries.length, 'summaryData:', summaryData);

  if (loading) {
    console.log('DEBUG: Dashboard showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Overview of your daybook entries and financial summary</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchData}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards 
            summaryData={summaryData} 
            loading={summaryLoading} 
          />
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Entries</h2>
            <p className="text-sm text-gray-600 mt-1">Latest daybook entries</p>
          </div>
          
          <div className="p-6">
            {entries.length === 0 && !loading ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No entries</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first daybook entry.</p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.href = '/add'}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Entry
                  </button>
                </div>
              </div>
            ) : (
              <DaybookTable 
                entries={entries.slice(0, 10)} 
                onDelete={openDeleteModal}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onConfirm={() => handleDelete(deleteModal.entryId)}
          title="Delete Entry"
          message={`Are you sure you want to delete "${deleteModal.entryDetails}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteLoading}
          onCancel={closeDeleteModal}
        />
      </div>
    </div>
  );
};

export default Dashboard;
