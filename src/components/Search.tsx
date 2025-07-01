import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry } from '../types/daybook';

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
    type: 'all', // 'all', 'debit', 'credit'
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'relevance'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '' && Object.values(filters).every(value => value === '' || value === 'all')) {
      setSearchResults([]);
      return;
    }

    let filteredResults = entries.filter(entry => {
      // Text search
      const textMatch = searchTerm.trim() === '' || 
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase());

      // Date filters
      const dateMatch = (!filters.dateFrom || entry.date >= filters.dateFrom) &&
        (!filters.dateTo || entry.date <= filters.dateTo);

      // Amount filters
      const entryAmount = Math.max(entry.debit, entry.credit);
      const amountMatch = (!filters.minAmount || entryAmount >= parseFloat(filters.minAmount)) &&
        (!filters.maxAmount || entryAmount <= parseFloat(filters.maxAmount));

      // Type filter
      const typeMatch = filters.type === 'all' ||
        (filters.type === 'debit' && entry.debit > 0) ||
        (filters.type === 'credit' && entry.credit > 0);

      return textMatch && dateMatch && amountMatch && typeMatch;
    });

    // Sort results
    filteredResults.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          const aAmount = Math.max(a.debit, a.credit);
          const bAmount = Math.max(b.debit, b.credit);
          comparison = aAmount - bAmount;
          break;
        case 'relevance':
          // Simple relevance scoring based on search term position
          if (searchTerm.trim()) {
            const aScore = (a.particulars.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ? 2 : 1) +
              (a.voucherNumber.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ? 1 : 0);
            const bScore = (b.particulars.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ? 2 : 1) +
              (b.voucherNumber.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ? 1 : 0);
            comparison = bScore - aScore;
          } else {
            comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setSearchResults(filteredResults);
  }, [searchTerm, filters, sortBy, sortOrder, entries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : 
        part
    );
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
  };

  const hasActiveFilters = searchTerm.trim() !== '' || 
    Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-dark-900 mb-6">Search Entries</h2>
        
        {/* Main Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by particulars or voucher number..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Advanced Search Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
          >
            <span>{isAdvancedSearch ? 'Hide' : 'Show'} Advanced Filters</span>
            <svg 
              className={`w-4 h-4 transform transition-transform ${isAdvancedSearch ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isAdvancedSearch && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Entry Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="debit">Debit Only</option>
                  <option value="credit">Credit Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  placeholder="999999.99"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-dark-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-dark-700">Order:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-dark-900">
            Search Results {searchResults.length > 0 && `(${searchResults.length} entries found)`}
          </h3>
        </div>

        {!hasActiveFilters ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-500">Enter a search term or use filters to find specific entries.</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or filters.</p>
            <button
              onClick={clearFilters}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {searchResults.map((entry) => (
              <div key={entry._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        entry.debit > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {entry.debit > 0 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          )}
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-dark-900">
                        {highlightText(entry.particulars, searchTerm)}
                      </h4>
                      <p className="text-sm text-dark-600">
                        Voucher: {highlightText(entry.voucherNumber, searchTerm)} • {formatDate(entry.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${entry.debit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {entry.debit > 0 ? formatCurrency(entry.debit) : formatCurrency(entry.credit)}
                      <span className="text-xs ml-1">
                        {entry.debit > 0 ? 'DR' : 'CR'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/view/${entry._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link
                      to={`/edit/${entry._id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                  
                  {entry.createdAt && (
                    <div className="text-xs text-gray-500">
                      Created {new Date(entry.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
