import React, { useState } from 'react';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Acme Corporation',
    address: '123 Business Street',
    city: 'Business City',
    state: 'BC',
    zipCode: '12345',
    phone: '(555) 123-4567',
    email: 'info@acmecorp.com',
    website: 'www.acmecorp.com',
    taxId: '12-3456789',
  });

  const [accountingSettings, setAccountingSettings] = useState({
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    fiscalYearStart: '01-01',
    decimalPlaces: 2,
    negativeNumberFormat: 'parentheses',
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'cloud',
    lastBackup: '2025-06-29T14:30:00.000Z',
  });

  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'english',
    timeZone: 'America/New_York',
    defaultView: 'dashboard',
    itemsPerPage: 10,
    showConfirmations: true,
  });

  const handleCompanySettingsChange = (field: string, value: string) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleAccountingSettingsChange = (field: string, value: string | number | boolean) => {
    setAccountingSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBackupSettingsChange = (field: string, value: string | boolean) => {
    setBackupSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleUserPreferencesChange = (field: string, value: string | number | boolean) => {
    setUserPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    // In a real application, this would save to backend
    console.log('Saving settings...', {
      companySettings,
      accountingSettings,
      backupSettings,
      userPreferences,
    });
    
    // Show success message (you could replace with toast notification)
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      company: companySettings,
      accounting: accountingSettings,
      backup: backupSettings,
      user: userPreferences,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daybook-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupNow = () => {
    // Simulate backup process
    setBackupSettings(prev => ({ ...prev, lastBackup: new Date().toISOString() }));
    alert('Backup completed successfully!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-dark-900 mb-6">Settings</h2>
        
        {/* Company Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 border-b pb-2">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Company Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => handleCompanySettingsChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Email</label>
              <input
                type="email"
                value={companySettings.email}
                onChange={(e) => handleCompanySettingsChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Address</label>
              <input
                type="text"
                value={companySettings.address}
                onChange={(e) => handleCompanySettingsChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Phone</label>
              <input
                type="tel"
                value={companySettings.phone}
                onChange={(e) => handleCompanySettingsChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">City</label>
              <input
                type="text"
                value={companySettings.city}
                onChange={(e) => handleCompanySettingsChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Website</label>
              <input
                type="url"
                value={companySettings.website}
                onChange={(e) => handleCompanySettingsChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">State</label>
              <input
                type="text"
                value={companySettings.state}
                onChange={(e) => handleCompanySettingsChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Tax ID</label>
              <input
                type="text"
                value={companySettings.taxId}
                onChange={(e) => handleCompanySettingsChange('taxId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Accounting Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 border-b pb-2">Accounting Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Currency</label>
              <select
                value={accountingSettings.currency}
                onChange={(e) => handleAccountingSettingsChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Date Format</label>
              <select
                value={accountingSettings.dateFormat}
                onChange={(e) => handleAccountingSettingsChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Fiscal Year Start</label>
              <input
                type="text"
                value={accountingSettings.fiscalYearStart}
                onChange={(e) => handleAccountingSettingsChange('fiscalYearStart', e.target.value)}
                placeholder="MM-DD"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Decimal Places</label>
              <select
                value={accountingSettings.decimalPlaces}
                onChange={(e) => handleAccountingSettingsChange('decimalPlaces', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 border-b pb-2">Backup Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={backupSettings.autoBackup}
                  onChange={(e) => handleBackupSettingsChange('autoBackup', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-dark-700">Enable Auto Backup</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Backup Frequency</label>
              <select
                value={backupSettings.backupFrequency}
                onChange={(e) => handleBackupSettingsChange('backupFrequency', e.target.value)}
                disabled={!backupSettings.autoBackup}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Backup Location</label>
              <select
                value={backupSettings.backupLocation}
                onChange={(e) => handleBackupSettingsChange('backupLocation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="local">Local Storage</option>
                <option value="cloud">Cloud Storage</option>
                <option value="both">Both</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Last Backup</label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dark-600">
                  {new Date(backupSettings.lastBackup).toLocaleString()}
                </span>
                <button
                  onClick={handleBackupNow}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-xs font-medium"
                >
                  Backup Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 border-b pb-2">User Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Theme</label>
              <select
                value={userPreferences.theme}
                onChange={(e) => handleUserPreferencesChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Language</label>
              <select
                value={userPreferences.language}
                onChange={(e) => handleUserPreferencesChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Time Zone</label>
              <select
                value={userPreferences.timeZone}
                onChange={(e) => handleUserPreferencesChange('timeZone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Items Per Page</label>
              <select
                value={userPreferences.itemsPerPage}
                onChange={(e) => handleUserPreferencesChange('itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={userPreferences.showConfirmations}
                  onChange={(e) => handleUserPreferencesChange('showConfirmations', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-dark-700">Show confirmation dialogs</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveSettings}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Save Settings
          </button>
          
          <button
            onClick={handleExportData}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Export Settings
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all settings to default values?')) {
                // Reset to default values
                setCompanySettings({
                  companyName: 'Acme Corporation',
                  address: '123 Business Street',
                  city: 'Business City',
                  state: 'BC',
                  zipCode: '12345',
                  phone: '(555) 123-4567',
                  email: 'info@acmecorp.com',
                  website: 'www.acmecorp.com',
                  taxId: '12-3456789',
                });
                alert('Settings reset to default values.');
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
