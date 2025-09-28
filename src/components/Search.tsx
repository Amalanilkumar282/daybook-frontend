import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry, PayType } from '../types/daybook';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { dateUtils, currencyUtils } from '../utils';

interface SearchProps {
  entries: DaybookEntry[];
}

const Search: React.FC<SearchProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DaybookEntry[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all', // 'all', 'incoming', 'outgoing'
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'relevance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

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

  useEffect(() => {
    if (searchTerm.trim() === '' && Object.values(filters).every(value => value === '' || value === 'all')) {
      setSearchResults([]);
      return;
    }

    let filteredResults = entries.filter(entry => {
      // Text search
      const textMatch = searchTerm.trim() === '' || 
        (entry.description && entry.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.id.toString().includes(searchTerm.toLowerCase());

      // Date filters
      const dateMatch = (!filters.dateFrom || entry.created_at >= filters.dateFrom) &&
        (!filters.dateTo || entry.created_at <= filters.dateTo);

      // Amount filters
      const entryAmount = entry.amount;
      const amountMatch = (!filters.minAmount || entryAmount >= parseFloat(filters.minAmount)) &&
        (!filters.maxAmount || entryAmount <= parseFloat(filters.maxAmount));

      // Type filter
      const typeMatch = filters.type === 'all' ||
        (filters.type === PayType.INCOMING && entry.id_in_out === PayType.INCOMING) ||
        (filters.type === PayType.OUTGOING && entry.id_in_out === PayType.OUTGOING);

      return textMatch && dateMatch && amountMatch && typeMatch;
    });

    // Sorting
    filteredResults.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'relevance':
          // Simple relevance scoring based on search term position
          if (searchTerm.trim()) {
            const aScore = ((a.description && a.description.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0) ? 2 : 1) +
              (a.id.toString().indexOf(searchTerm.toLowerCase()) === 0 ? 1 : 0);
            const bScore = ((b.description && b.description.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0) ? 2 : 1) +
              (b.id.toString().indexOf(searchTerm.toLowerCase()) === 0 ? 1 : 0);
            comparison = bScore - aScore;
          } else {
            comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setSearchResults(filteredResults);
    resetPagination();
  }, [searchTerm, filters, sortBy, sortOrder, entries, resetPagination]);

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
    });
    setSortBy('relevance');
    setSortOrder('desc');
    setIsAdvancedSearch(false);
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

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
              <label className="block text-sm font-medium text-dark-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All</option>
                <option value={PayType.INCOMING}>Incoming</option>
                <option value={PayType.OUTGOING}>Outgoing</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'relevance')}
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
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
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
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
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
                          entry.id_in_out === PayType.OUTGOING ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {entry.id_in_out === PayType.OUTGOING ? (
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
                      </div>
                    </div>

                    <div className="text-left xs:text-right flex-shrink-0">
                      <div className={`text-sm xs:text-base sm:text-lg font-bold ${entry.id_in_out === PayType.OUTGOING ? 'text-red-600' : 'text-green-600'} break-all xs:break-normal`}>
                        {currencyUtils.formatCurrency(entry.amount)}
                        <span className="text-xs ml-1">
                          {entry.id_in_out === PayType.OUTGOING ? 'OUT' : 'IN'}
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