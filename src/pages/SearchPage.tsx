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
      <div className="container-wide-classic">
        <div className="panel-classic p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-tally-200 w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-tally-200"></div>
              <div className="h-4 bg-tally-200 w-1/2"></div>
              <div className="h-4 bg-tally-200 w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-wide-classic">
        <div className="panel-classic bg-red-50 border-red-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <span className="text-4xl text-red-500">⚠️</span>
          </div>
          <h2 className="text-classic-title font-bold text-red-800 mb-2">Error Loading Search</h2>
          <p className="text-classic-body text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEntries}
            className="btn-classic btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide-classic">
      <div className="mb-6">
        <h1 className="text-classic-title font-bold text-tally-800">Search Entries</h1>
        <p className="text-classic-body text-tally-600 mt-2">Find specific daybook entries using search filters and advanced options</p>
      </div>

      <Search entries={entries} />
    </div>
  );
};

export default SearchPage;
