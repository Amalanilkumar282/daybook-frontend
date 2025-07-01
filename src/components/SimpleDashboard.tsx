import React from 'react';

const SimpleDashboard: React.FC = () => {
  console.log('SimpleDashboard rendered');
  
  return (
    <div className="p-8 bg-white">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Daybook Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome to your accounting dashboard!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Today's Summary</h3>
          <p className="text-blue-600">Debit: $250.00</p>
          <p className="text-blue-600">Credit: $1,500.00</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">This Week</h3>
          <p className="text-green-600">Debit: $2,250.00</p>
          <p className="text-green-600">Credit: $8,500.00</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">This Month</h3>
          <p className="text-purple-600">Debit: $4,250.00</p>
          <p className="text-purple-600">Credit: $12,500.00</p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Recent Entries</h2>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded shadow">
            <span className="font-medium">Office Supplies Purchase</span>
            <span className="float-right text-red-600">$250.00 DR</span>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <span className="font-medium">Client Service Revenue</span>
            <span className="float-right text-green-600">$1,500.00 CR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
