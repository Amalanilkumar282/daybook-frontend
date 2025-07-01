import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { daybookApi } from '../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleExportCsv = async () => {
    try {
      const blob = await daybookApi.exportToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daybook-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      // You could add a toast notification here
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Daybook</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/add"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/add') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Add Entry
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/search') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Search
            </Link>
            <Link
              to="/reports"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/reports') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Reports
            </Link>
            <Link
              to="/settings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/settings') 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              Settings
            </Link>
            <button 
              onClick={handleExportCsv}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
