import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="w-full animate-fade-in">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-tally-200 w-48 sm:w-64 mb-4 sm:mb-6"></div>
          <div className="grid-classic-3 mb-6 sm:mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="stat-card-classic">
                <div className="h-4 bg-tally-200 w-20 mb-4"></div>
                <div className="h-6 sm:h-8 bg-tally-200 w-24 sm:w-32 mb-2"></div>
                <div className="h-4 sm:h-6 bg-tally-200 w-16 sm:w-24"></div>
              </div>
            ))}
          </div>
          <div className="panel-classic">
            <div className="h-48 sm:h-64 bg-tally-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-classic-title font-bold text-tally-800 mb-2">Dashboard</h1>
            <p className="text-classic-body text-tally-600">Overview of your financial activities and recent transactions</p>
          </div>
          <div className="flex flex-col xs:flex-row gap-3">
            <div className="flex items-center space-x-2 px-3 py-1 bg-tally-100 border border-tally-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-classic-body text-tally-700 font-medium">Live Data</span>
            </div>
            <Link
              to="/add"
              className="btn-classic btn-primary flex items-center justify-center space-x-2"
            >
              <span>➕</span>
              <span>Quick Add</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-300 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-classic-subtitle font-bold text-red-800">Connection Issue</h3>
              <div className="mt-2 text-classic-body text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={fetchData}
                  className="btn-classic btn-secondary text-classic-body"
                >
                  Retry Connection
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
      <div className="panel-classic">
        <div className="panel-header-classic">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
            <div>
              <h2 className="text-classic-title font-bold text-tally-800">Recent Entries</h2>
              <p className="text-classic-body text-tally-600">Latest daybook transactions and financial records</p>
            </div>
            <Link
              to="/search"
              className="btn-classic btn-secondary text-classic-body flex items-center space-x-2 w-full xs:w-auto justify-center xs:justify-start"
            >
              <span>🔍</span>
              <span>View All</span>
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {entries.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-tally-100 border-2 border-tally-300 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-tally-600">📋</span>
              </div>
              <h3 className="text-classic-subtitle font-bold text-tally-800 mb-2">No entries yet</h3>
              <p className="text-classic-body text-tally-600 mb-6 max-w-md mx-auto">
                Start managing your finances by creating your first daybook entry. Track income, expenses, and transactions with ease.
              </p>
              <div className="flex flex-col xs:flex-row gap-3 justify-center">
                <Link
                  to="/add"
                  className="btn-classic btn-primary flex items-center justify-center space-x-2"
                >
                  <span>➕</span>
                  <span>Create First Entry</span>
                </Link>
                <Link
                  to="/reports"
                  className="btn-classic btn-secondary flex items-center justify-center space-x-2"
                >
                  <span>📊</span>
                  <span>View Reports</span>
                </Link>
              </div>
            </div>
          ) : (
            <DaybookTable 
              entries={entries} 
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
  );
};

export default Dashboard;
