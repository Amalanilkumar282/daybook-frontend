import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry, PayType, PayStatus, SummaryData, PaymentTypeSpecific } from '../types/daybook';
import { daybookApi, authUtils } from '../services/api';
import SummaryCards from '../components/SummaryCards';
import DaybookTable from '../components/DaybookTable';
import ConfirmModal from '../components/ConfirmModal';
import { filterDaybookEntries, sortDaybookEntries, DaybookFilters } from '../utils/filterUtils';

const Dashboard: React.FC = () => {
  console.log('DEBUG: Dashboard component rendering');
  const currentUser = authUtils.getUser();
  const tenantPrefix = currentUser?.tenant ? `${currentUser.tenant} ` : '';
  const [entries, setEntries] = useState<DaybookEntry[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, entryId: '', entryDetails: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DaybookEntry[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all',
    payStatus: 'all',
    category: 'all',
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'relevance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to calculate summary from entries
  const calculateSummaryFromEntries = (entries: DaybookEntry[]): SummaryData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Helper function to check if entry is within date range
    const isWithinRange = (entryDate: string, startDate: Date, endDate: Date): boolean => {
      const entry = new Date(entryDate);
      return entry >= startDate && entry <= endDate;
    };
    
    // Calculate summary for a date range
    const calculateSummary = (startDate: Date, endDate: Date) => {
      const filteredEntries = entries.filter(entry => 
        isWithinRange(entry.created_at, startDate, endDate)
      );
      
      const incoming = filteredEntries
        .filter(entry => entry.payment_type === PayType.INCOMING)
        .reduce((sum, entry) => sum + entry.amount, 0);
        
      const outgoing = filteredEntries
        .filter(entry => entry.payment_type === PayType.OUTGOING)
        .reduce((sum, entry) => sum + entry.amount, 0);
        
      const net = incoming - outgoing;
      
      return { incoming, outgoing, net };
    };
    
    return {
      today: calculateSummary(today, new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)), // End of today
      week: calculateSummary(oneWeekAgo, now),
      month: calculateSummary(oneMonthAgo, now),
    };
  };

  const fetchData = useCallback(async () => {
    console.log('DEBUG: Fetching data...');
    try {
      setLoading(true);
      setSummaryLoading(true);
      setError(null);
      
      // Fetch entries
      console.log('DEBUG: Calling API...');
      const entriesData = await daybookApi.getAllEntries();
      console.log('DEBUG: Entries received:', entriesData.length);
      
      // Calculate summary from entries
      const summaryResponse = calculateSummaryFromEntries(entriesData);
      console.log('DEBUG: Summary calculated:', summaryResponse);
      
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
  }, []); // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    console.log('DEBUG: Dashboard useEffect running');
    fetchData();
  }, [fetchData]);

  const performSearch = useCallback(async () => {
    try {
      // If no search criteria, clear results
      if (searchTerm.trim() === '' && Object.values(filters).every(value => value === '' || value === 'all')) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      // Build filter object for client-side filtering
      const filterObj: DaybookFilters = {
        searchTerm,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        type: filters.type as PayType | 'all',
        payStatus: filters.payStatus as PayStatus | 'all',
        category: filters.category,
      };

      // Apply client-side filters to entries
      const filtered = filterDaybookEntries(entries, filterObj);
      
      // Apply sorting
      const sorted = sortDaybookEntries(filtered, sortBy, sortOrder, searchTerm);

      setSearchResults(sorted);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, filters, sortBy, sortOrder, entries]);

  // Perform search when search criteria change
  useEffect(() => {
    if (isSearchExpanded) {
      performSearch();
    }
  }, [isSearchExpanded, performSearch]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      type: 'all',
      payStatus: 'all',
      category: 'all',
    });
    setSortBy('relevance');
    setSortOrder('desc');
    setSearchResults([]);
  };

  const toggleSearchPanel = () => {
    const newExpandedState = !isSearchExpanded;
    setIsSearchExpanded(newExpandedState);
    if (!newExpandedState) {
      clearFilters();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      await daybookApi.deleteEntry(id);
      
      // Remove from local state
      const updatedEntries = entries.filter(entry => entry.id.toString() !== id);
      setEntries(updatedEntries);
      
      // Recalculate summary from updated entries
      const updatedSummary = calculateSummaryFromEntries(updatedEntries);
      setSummaryData(updatedSummary);
      
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

  // Determine which entries to display
  const displayEntries = isSearchExpanded && (searchTerm.trim() !== '' || Object.values(filters).some(v => v !== '' && v !== 'all'))
    ? searchResults
    : entries;

  const hasActiveSearch = isSearchExpanded && (searchTerm.trim() !== '' || Object.values(filters).some(v => v !== '' && v !== 'all'));

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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display gradient-text mb-2 sm:mb-3">{tenantPrefix}Dashboard</h1>
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

      {/* Integrated Search Panel */}
      <div className="card mb-8 overflow-hidden transition-all duration-300">
        {/* Search Toggle Header */}
        <div 
          className="p-4 xs:p-6 border-b border-neutral-200/50 cursor-pointer hover:bg-neutral-50/50 transition-colors"
          onClick={toggleSearchPanel}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isSearchExpanded ? 'bg-primary-500 text-white shadow-glow' : 'bg-neutral-100 text-neutral-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Search & Filter Entries</h3>
                <p className="text-sm text-neutral-600">
                  {isSearchExpanded ? 'Click to collapse search panel' : 'Click to expand and search entries'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasActiveSearch && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-primary-100 rounded-lg">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-primary-700">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <svg 
                className={`w-6 h-6 text-neutral-400 transition-transform duration-300 ${
                  isSearchExpanded ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Panel Content */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            isSearchExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="p-4 xs:p-6 bg-gradient-to-br from-neutral-50 to-white">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by description, entry ID, nurse name, or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base shadow-sm hover:shadow-md"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Search Toggle */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <svg className={`w-5 h-5 transition-transform ${isAdvancedSearch ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm sm:text-base">{isAdvancedSearch ? 'Hide' : 'Show'} Advanced Filters</span>
              </button>
              {(searchTerm || Object.values(filters).some(v => v !== '' && v !== 'all')) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl font-medium transition-colors text-sm"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {isAdvancedSearch && (
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Amount Range */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Min Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Max Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Payment Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value={PayType.INCOMING}>Incoming</option>
                      <option value={PayType.OUTGOING}>Outgoing</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Payment Status</label>
                    <select
                      value={filters.payStatus}
                      onChange={(e) => handleFilterChange('payStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value={PayStatus.PAID}>Paid</option>
                      <option value={PayStatus.UNPAID}>Unpaid</option>
                    </select>
                  </div>

                  {/* Payment Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Payment Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value={PaymentTypeSpecific.CLIENT_PAYMENT_RECEIVED}>Client Payment Received</option>
                      <option value={PaymentTypeSpecific.NURSE_SALARY_PAID}>Nurse Salary Paid</option>
                      <option value={PaymentTypeSpecific.OFFICE_EXPENSES_PAID}>Office Expenses Paid</option>
                      <option value={PaymentTypeSpecific.COMMISSION}>Commission</option>
                      <option value={PaymentTypeSpecific.STUDENT_FEE_RECEIVED}>Student Fee Received</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'relevance')}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Sort Order</label>
                    <div className="flex items-center space-x-4 pt-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sortOrder"
                          value="desc"
                          checked={sortOrder === 'desc'}
                          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">Descending</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sortOrder"
                          value="asc"
                          checked={sortOrder === 'asc'}
                          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">Ascending</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Error Display */}
            {searchError && (
              <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-xl animate-slide-up">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-error-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-error-700 text-sm flex-1">{searchError}</span>
                  <button
                    onClick={() => setSearchError(null)}
                    className="ml-auto text-error-500 hover:text-error-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Search Results Summary */}
            {hasActiveSearch && (
              <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm sm:text-base font-semibold text-primary-700">
                      Found {searchResults.length} matching entr{searchResults.length !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                  {searchTerm && (
                    <span className="text-xs sm:text-sm text-primary-600">
                      for "{searchTerm}"
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Entries / Search Results */}
      <div className="card">
        <div className="p-4 xs:p-6 sm:p-8 border-b border-neutral-200/50">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
            <div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold font-display text-neutral-900 mb-1 xs:mb-2">
                {hasActiveSearch ? 'Search Results' : 'Recent Entries'}
              </h2>
              <p className="text-sm xs:text-base text-neutral-600 font-medium">
                {hasActiveSearch 
                  ? `Showing ${displayEntries.length} matching transaction${displayEntries.length !== 1 ? 's' : ''}`
                  : 'Latest daybook transactions and financial records'
                }
              </p>
            </div>
            {!hasActiveSearch && (
              <Link
                to="/search"
                className="btn-secondary text-xs xs:text-sm flex items-center space-x-2 shadow-glow w-full xs:w-auto justify-center xs:justify-start"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Advanced Search Page</span>
              </Link>
            )}
          </div>
        </div>
        
        <div className="p-3 xs:p-4 sm:p-6">
          {displayEntries.length === 0 && !loading && !searchLoading ? (
            hasActiveSearch ? (
              <div className="text-center py-8 xs:py-12 sm:py-16">
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center mx-auto mb-4 xs:mb-6">
                  <svg className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold font-display text-neutral-800 mb-2">No results found</h3>
                <p className="text-sm xs:text-base text-neutral-600 mb-6 xs:mb-8 max-w-sm xs:max-w-md mx-auto px-4">
                  No entries match your search criteria. Try adjusting your search terms or filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary text-sm xs:text-base"
                >
                  Clear Search
                </button>
              </div>
            ) : (
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
            )
          ) : (
            <DaybookTable 
              entries={displayEntries}
              onDelete={openDeleteModal}
              loading={loading || searchLoading}
              searchTerm={searchTerm}
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
