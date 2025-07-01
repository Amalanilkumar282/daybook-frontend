import React, { useState, useEffect } from 'react';
import { DaybookEntry } from '../types/daybook';
import { daybookApi } from '../services/api';
import Search from '../components/Search';

const SearchPage: React.FC = () => {
  const [entries, setEntries] = useState<DaybookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const entriesData = await daybookApi.getAllEntries();
      setEntries(entriesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Failed to load entries. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Search</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEntries}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8 max-w-none xs:max-w-none sm:max-w-none lg:max-w-7xl xl:max-w-7xl mx-auto">
      <div className="mb-4 xs:mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-dark-900">Search Entries</h1>
        <p className="text-sm xs:text-base text-dark-600 mt-1 xs:mt-2">Find specific daybook entries using search filters and advanced options</p>
      </div>

      <Search entries={entries} />
    </div>
  );
};

export default SearchPage;
