import React from 'react';
import Settings from '../components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <div className="container-wide-classic">
      <div className="mb-6">
        <h1 className="text-classic-title font-bold text-tally-800">Settings</h1>
        <p className="text-classic-body text-tally-600 mt-2">Configure your daybook application preferences and company information</p>
      </div>

      <Settings />
    </div>
  );
};

export default SettingsPage;
