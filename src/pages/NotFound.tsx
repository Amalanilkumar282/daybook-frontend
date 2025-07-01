import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h1 className="text-6xl font-bold text-dark-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-dark-700 mb-4">Page Not Found</h2>
        <p className="text-lg text-dark-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/add"
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Add New Entry
          </Link>
        </div>
        
        <div className="mt-12 text-left bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-dark-800 mb-2">Navigation</h4>
              <ul className="space-y-1 text-sm text-dark-600">
                <li><Link to="/" className="text-primary-600 hover:text-primary-700">Dashboard</Link></li>
                <li><Link to="/add" className="text-primary-600 hover:text-primary-700">Add Entry</Link></li>
                <li><Link to="/search" className="text-primary-600 hover:text-primary-700">Search Entries</Link></li>
                <li><Link to="/reports" className="text-primary-600 hover:text-primary-700">Financial Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-dark-800 mb-2">Help</h4>
              <ul className="space-y-1 text-sm text-dark-600">
                <li><Link to="/settings" className="text-primary-600 hover:text-primary-700">Settings</Link></li>
                <li><span className="text-gray-500">Documentation (Coming Soon)</span></li>
                <li><span className="text-gray-500">Support (Coming Soon)</span></li>
                <li><span className="text-gray-500">FAQ (Coming Soon)</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
