import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry, PayType, SummaryData } from '../types/daybook';
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
      const [entriesData, summaryResponse] = await Promise.all([
        daybookApi.getAllEntries(),
        daybookApi.getSummary()
      ]);

      console.log('DEBUG: Entries received:', entriesData.length);
      console.log('DEBUG: Summary received:', summaryResponse);
      
      setEntries(entriesData);
      setSummaryData(summaryResponse);
      
      console.log('DEBUG: State updated successfully');
    } catch (error: any) {
      console.error('=== DASHBOARD FETCH ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      
      setError(`Failed to load dashboard data: ${error.message}`);
      
      // Don't set fallback data - let the user see the actual error
      setEntries([]);
      setSummaryData(null);
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
      setEntries(entries.filter(entry => entry.id.toString() !== id));
      
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
    const entry = entries.find(e => e.id.toString() === id);
    if (entry) {
      const entryType = entry.payment_type === PayType.INCOMING ? 'Incoming' : 'Outgoing';
      setDeleteModal({
        isOpen: true,
        entryId: entry.id.toString(),
        entryDetails: `${entry.description || 'No description'} (${entryType})`
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
      <div className="container-wide animate-fade-in">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-neutral-200 rounded-xl w-48 sm:w-64 mb-4 sm:mb-6"></div>
          <div className="grid-responsive-3 gap-responsive mb-6 sm:mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-responsive">
                <div className="h-4 bg-neutral-200 rounded w-20 mb-4"></div>
                <div className="h-6 sm:h-8 bg-neutral-200 rounded w-24 sm:w-32 mb-2"></div>
                <div className="h-4 sm:h-6 bg-neutral-200 rounded w-16 sm:w-24"></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="h-48 sm:h-64 bg-neutral-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display gradient-text mb-2 sm:mb-3">Dashboard</h1>
            <p className="text-neutral-600 text-base sm:text-lg lg:text-xl font-medium">Overview of your financial activities and recent transactions</p>
            <div className="absolute -top-2 -left-2 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-100/30 to-accent-100/30 rounded-full blur-2xl -z-10"></div>
          </div>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-2xl shadow-soft">
              <div className="w-3 h-3 bg-gradient-to-r from-success-500 to-success-600 rounded-full animate-pulse shadow-glow"></div>
              <span className="text-sm font-semibold text-neutral-700">Live Data</span>
            </div>
            <Link
              to="/add"
              className="btn-mobile-primary flex items-center justify-center space-x-2 shadow-glow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Quick Add</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-2xl p-6 animate-slide-up">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error-500 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-error-800">Connection Issue</h3>
              <div className="mt-2 text-sm text-error-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchData}
                  className="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
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
      <div className="card">
        <div className="p-4 xs:p-6 sm:p-8 border-b border-neutral-200/50">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
            <div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold font-display text-neutral-900 mb-1 xs:mb-2">Recent Entries</h2>
              <p className="text-sm xs:text-base text-neutral-600 font-medium">Latest daybook transactions and financial records</p>
            </div>
            <Link
              to="/search"
              className="btn-secondary text-xs xs:text-sm flex items-center space-x-2 shadow-glow w-full xs:w-auto justify-center xs:justify-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>View All</span>
            </Link>
          </div>
        </div>
        
        <div className="p-3 xs:p-4 sm:p-6">
          {entries.length === 0 && !loading ? (
            <div className="text-center py-8 xs:py-12 sm:py-16">
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-4 xs:mb-6">
                <svg className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl font-semibold font-display text-neutral-800 mb-2">No entries yet</h3>
              <p className="text-sm xs:text-base text-neutral-600 mb-6 xs:mb-8 max-w-sm xs:max-w-md mx-auto px-4">Start managing your finances by creating your first daybook entry. Track income, expenses, and transactions with ease.</p>
              <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 justify-center px-4">
                <Link
                  to="/add"
                  className="btn-primary flex items-center justify-center space-x-2 text-sm xs:text-base"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First Entry</span>
                </Link>
                <Link
                  to="/reports"
                  className="btn-secondary flex items-center justify-center space-x-2 text-sm xs:text-base"
                >
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
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
