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
    <nav className="glass-card sticky top-0 z-50 border-0 border-b border-neutral-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4 group">
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white p-3 rounded-2xl shadow-glow-lg group-hover:shadow-intense transition-all duration-300 group-hover:scale-105 border border-primary-400/30">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-display gradient-text">Daybook</span>
                <span className="text-xs text-neutral-500 font-medium -mt-1">Professional Suite</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30' 
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/add"
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/add') 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30' 
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm'
              }`}
            >
              Add Entry
            </Link>
            <Link
              to="/search"
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/search') 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30' 
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm'
              }`}
            >
              Search
            </Link>
            <Link
              to="/reports"
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/reports') 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30' 
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm'
              }`}
            >
              Reports
            </Link>
            <Link
              to="/settings"
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive('/settings') 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30' 
                  : 'text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm'
              }`}
            >
              Settings
            </Link>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent mx-3"></div>
            <button 
              onClick={handleExportCsv}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-95 flex items-center space-x-2 border border-accent-400/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
