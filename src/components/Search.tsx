import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry, PayType, PayStatus, PaymentTypeSpecific } from '../types/daybook';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { dateUtils, currencyUtils } from '../utils';
import { filterDaybookEntries, sortDaybookEntries, DaybookFilters } from '../utils/filterUtils';
import { daybookApi, nursesClientsApi } from '../services/api';

interface SearchProps {
  entries?: DaybookEntry[];
}

const Search: React.FC<SearchProps> = ({ entries: propEntries = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allEntries, setAllEntries] = useState<DaybookEntry[]>(propEntries);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all' as PayType | 'all',
    payStatus: 'all' as PayStatus | 'all',
    category: 'all' as PaymentTypeSpecific | 'all' | string,
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'relevance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [nursesMap, setNursesMap] = useState<Map<string, any>>(new Map());
  const [clientsMap, setClientsMap] = useState<Map<string, any>>(new Map());

  // Compute filtered and sorted results using useMemo for performance
  const searchResults = useMemo(() => {
    // Build filter object
    const filterObj: DaybookFilters = {
      searchTerm,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
      type: filters.type,
      payStatus: filters.payStatus,
      category: filters.category,
    };

    // Apply filters
    const filtered = filterDaybookEntries(allEntries, filterObj, nursesMap, clientsMap);
    
    // Apply sorting
    const sorted = sortDaybookEntries(filtered, sortBy, sortOrder, searchTerm);
    
    return sorted;
  }, [allEntries, searchTerm, filters, sortBy, sortOrder, nursesMap, clientsMap]);


  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedResults,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(searchResults, { 
    initialPage: 1, 
    initialItemsPerPage: 10 
  });

  // Load all entries when component mounts
  useEffect(() => {
    if (propEntries.length === 0) {
      loadAllEntries();
    } else {
      setAllEntries(propEntries);
    }
    
    // Fetch nurses and clients for name display
    const fetchNursesAndClients = async () => {
      try {
        const [nurses, clients] = await Promise.all([
          nursesClientsApi.getNurses().catch(() => []),
          nursesClientsApi.getClients().catch(() => [])
        ]);
        
        const nursesMap = new Map(nurses.map(n => [n.nurse_id.toString(), n]));
        const clientsMap = new Map(clients.map(c => [c.client_id, c]));
        
        setNursesMap(nursesMap);
        setClientsMap(clientsMap);
      } catch (error) {
        console.error('Failed to fetch nurse/client data:', error);
      }
    };
    
    fetchNursesAndClients();
  }, [propEntries]);

  const loadAllEntries = async () => {
    try {
      setSearchLoading(true);
      setSearchError(null);
      const entries = await daybookApi.getAllEntries();
      setAllEntries(entries);
    } catch (error) {
      console.error('Error loading entries:', error);
      setSearchError('Failed to load entries. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    resetPagination();
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
    setIsAdvancedSearch(false);
    resetPagination();
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span>
      ) : part
    );
  };
  
  // Helper function to get nurse name
  const getNurseName = (nurseId: string | undefined): string => {
    if (!nurseId) return '';
    const nurse = nursesMap.get(nurseId);
    return nurse ? (nurse.full_name || `${nurse.first_name} ${nurse.last_name}`.trim()) : '';
  };
  
  // Helper function to get client name
  const getClientName = (clientId: string | undefined): string => {
    if (!clientId) return '';
    const client = clientsMap.get(clientId);
    if (!client) return '';
    
    const patientName = client.patient_name?.trim();
    const requestorName = client.requestor_name?.trim();
    
    // If no patient name, use requestor name
    if (!patientName) {
      return requestorName || '';
    }
    
    // If no requestor name, use patient name
    if (!requestorName) {
      return patientName;
    }
    
    // If both names are the same, show only once
    if (patientName.toLowerCase() === requestorName.toLowerCase()) {
      return patientName;
    }
    
    // If both names are different, show both
    return `${patientName} (${requestorName})`;
  };

  if (searchLoading && allEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Search Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900 mb-1">Search Entries</h2>
          <p className="text-sm sm:text-base text-dark-600">
            Find entries by description, amount, or date
          </p>
        </div>
        <button
          onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          <span className="text-sm">{isAdvancedSearch ? 'Simple' : 'Advanced'}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by description or entry ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPagination();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="animate-spin h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {searchError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{searchError}</span>
            <button
              onClick={() => setSearchError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {isAdvancedSearch && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Min Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Max Amount</label>
              <input
                type="number"
                step="0.01"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Payment Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                <option value={PayType.INCOMING}>Incoming</option>
                <option value={PayType.OUTGOING}>Outgoing</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Payment Status</label>
              <select
                value={filters.payStatus}
                onChange={(e) => handleFilterChange('payStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value={PayStatus.PAID}>Paid</option>
                <option value={PayStatus.UNPAID}>Unpaid</option>
              </select>
            </div>

            {/* Payment Category Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Payment Category</label>
              <select
                value={(filters as any).category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
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
              <label className="block text-sm font-medium text-dark-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'date' | 'amount' | 'relevance');
                  resetPagination();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 xs:gap-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sortOrder"
                  value="desc"
                  checked={sortOrder === 'desc'}
                  onChange={(e) => {
                    setSortOrder(e.target.value as 'asc' | 'desc');
                    resetPagination();
                  }}
                  className="text-primary-600"
                />
                <span className="ml-2 text-sm">Descending</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sortOrder"
                  value="asc"
                  checked={sortOrder === 'asc'}
                  onChange={(e) => {
                    setSortOrder(e.target.value as 'asc' | 'desc');
                    resetPagination();
                  }}
                  className="text-primary-600"
                />
                <span className="ml-2 text-sm">Ascending</span>
              </label>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors text-sm"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {searchResults.length > 0 && (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-4 p-3 bg-primary-50 rounded-lg">
          <div className="text-sm sm:text-base">
            <span className="font-semibold text-primary-700">
              {totalItems} result{totalItems !== 1 ? 's' : ''}
            </span>
            <span className="text-primary-600 ml-1">
              {searchTerm && `for "${searchTerm}"`}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-primary-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {/* Results List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {paginatedResults.map((entry) => (
                <div key={entry.id} className="p-3 xs:p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 mb-2">
                    <div className="flex items-center space-x-3 xs:space-x-4 min-w-0 flex-shrink">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 xs:w-10 xs:h-10 rounded-full flex items-center justify-center ${
                          entry.payment_type === PayType.OUTGOING ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {entry.payment_type === PayType.OUTGOING ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            )}
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm xs:text-base sm:text-lg font-medium text-dark-900 truncate">
                          {highlightText(entry.description || 'No description', searchTerm)}
                        </h4>
                        <p className="text-xs xs:text-sm text-dark-600 truncate">
                          Entry ID: {highlightText(entry.id.toString(), searchTerm)} • {dateUtils.formatDate(entry.created_at)}
                        </p>
                        {entry.client_id && getClientName(entry.client_id) && (
                          <p className="text-xs text-dark-600 mt-1">
                            Client: {highlightText(getClientName(entry.client_id), searchTerm)}
                          </p>
                        )}
                        {entry.nurse_id && getNurseName(entry.nurse_id) && (
                          <p className="text-xs text-dark-600 mt-1">
                            Nurse: {highlightText(getNurseName(entry.nurse_id), searchTerm)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-left xs:text-right flex-shrink-0">
                      <div className={`text-sm xs:text-base sm:text-lg font-bold ${entry.payment_type === PayType.OUTGOING ? 'text-red-600' : 'text-green-600'} break-all xs:break-normal`}>
                        {currencyUtils.formatCurrency(entry.amount)}
                        <span className="text-xs ml-1">
                          {entry.payment_type === PayType.OUTGOING ? 'OUT' : 'IN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/view/${entry.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs xs:text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <span className="text-gray-300">|</span>
                      <Link
                        to={`/edit/${entry.id}`}
                        className="text-primary-600 hover:text-primary-700 text-xs xs:text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>

                    {entry.created_at && (
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        Created {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      ) : searchTerm.trim() !== '' || Object.values(filters).some(value => value !== '' && value !== 'all') ? (
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-dark-900 mb-2">No results found</h3>
            <p className="text-dark-600 mb-4">
              No entries match your search criteria. Try adjusting your search terms or filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-dark-900 mb-2">Start searching</h3>
            <p className="text-dark-600">
              Enter a search term or use filters to find specific daybook entries.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;