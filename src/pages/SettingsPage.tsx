import React from 'react';
import Settings from '../components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark-900">Settings</h1>
        <p className="text-dark-600 mt-2">Configure your daybook application preferences and company information</p>
      </div>

      <Settings />
    </div>
  );
};

export default SettingsPage;
