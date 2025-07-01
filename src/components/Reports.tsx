import React, { useState } from 'react';
import { DaybookEntry } from '../types/daybook';

interface ReportsProps {
  entries: DaybookEntry[];
}

const Reports: React.FC<ReportsProps> = ({ entries }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [selectedReport, setSelectedReport] = useState<'trial-balance' | 'profit-loss' | 'cash-flow'>('trial-balance');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Generate dummy account categories for trial balance
  const generateTrialBalance = () => {
    const accounts = [
      { name: 'Cash', debit: 5000, credit: 0, type: 'Asset' },
      { name: 'Accounts Receivable', debit: 2500, credit: 0, type: 'Asset' },
      { name: 'Equipment', debit: 1200, credit: 0, type: 'Asset' },
      { name: 'Office Supplies', debit: 250, credit: 0, type: 'Asset' },
      { name: 'Accounts Payable', debit: 0, credit: 1500, type: 'Liability' },
      { name: 'Owner\'s Capital', debit: 0, credit: 5000, type: 'Equity' },
      { name: 'Service Revenue', debit: 0, credit: 3500, type: 'Revenue' },
      { name: 'Consulting Revenue', debit: 0, credit: 2000, type: 'Revenue' },
      { name: 'Rent Expense', debit: 800, credit: 0, type: 'Expense' },
      { name: 'Utility Expense', debit: 180, credit: 0, type: 'Expense' },
    ];

    return accounts;
  };

  const generateProfitLoss = () => {
    const revenues = [
      { name: 'Service Revenue', amount: 3500 },
      { name: 'Consulting Revenue', amount: 2000 },
      { name: 'Training Revenue', amount: 1200 },
      { name: 'Software License Revenue', amount: 800 },
    ];

    const expenses = [
      { name: 'Rent Expense', amount: 800 },
      { name: 'Utility Expense', amount: 180 },
      { name: 'Office Supplies Expense', amount: 250 },
      { name: 'Equipment Depreciation', amount: 100 },
    ];

    const totalRevenue = revenues.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

    return { revenues, expenses, totalRevenue, totalExpenses, netIncome: totalRevenue - totalExpenses };
  };

  const generateCashFlow = () => {
    const operatingActivities = [
      { name: 'Cash from customers', amount: 5500 },
      { name: 'Cash paid to suppliers', amount: -1000 },
      { name: 'Cash paid for rent', amount: -800 },
      { name: 'Cash paid for utilities', amount: -180 },
    ];

    const investingActivities = [
      { name: 'Purchase of equipment', amount: -1200 },
      { name: 'Sale of old equipment', amount: 300 },
    ];

    const financingActivities = [
      { name: 'Owner investment', amount: 5000 },
      { name: 'Owner withdrawal', amount: -1000 },
    ];

    const netOperating = operatingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netInvesting = investingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netFinancing = financingActivities.reduce((sum, item) => sum + item.amount, 0);

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netOperating,
      netInvesting,
      netFinancing,
      netCashFlow: netOperating + netInvesting + netFinancing,
    };
  };

  const trialBalance = generateTrialBalance();
  const profitLoss = generateProfitLoss();
  const cashFlow = generateCashFlow();

  return (
    <div className="space-y-6">
      {/* Report Selection and Date Range */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-dark-900 mb-6">Financial Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="trial-balance">Trial Balance</option>
              <option value="profit-loss">Profit & Loss Statement</option>
              <option value="cash-flow">Cash Flow Statement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {selectedReport === 'trial-balance' && (
          <div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Trial Balance</h3>
            <p className="text-dark-600 mb-6">As of {new Date(dateRange.endDate).toLocaleDateString()}</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trialBalance.map((account, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">{account.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-900" colSpan={2}>Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600">
                      {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.debit, 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600">
                      {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.credit, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'profit-loss' && (
          <div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Profit & Loss Statement</h3>
            <p className="text-dark-600 mb-6">For the period {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}</p>
            
            <div className="space-y-6">
              {/* Revenue Section */}
              <div>
                <h4 className="text-lg font-semibold text-dark-800 mb-3">Revenue</h4>
                {profitLoss.revenues.map((revenue, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-dark-700">{revenue.name}</span>
                    <span className="text-green-600 font-medium">{formatCurrency(revenue.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-300 mt-2">
                  <span className="text-dark-800">Total Revenue</span>
                  <span className="text-green-600">{formatCurrency(profitLoss.totalRevenue)}</span>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h4 className="text-lg font-semibold text-dark-800 mb-3">Expenses</h4>
                {profitLoss.expenses.map((expense, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-dark-700">{expense.name}</span>
                    <span className="text-red-600 font-medium">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-gray-300 mt-2">
                  <span className="text-dark-800">Total Expenses</span>
                  <span className="text-red-600">{formatCurrency(profitLoss.totalExpenses)}</span>
                </div>
              </div>

              {/* Net Income */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-dark-900">Net Income</span>
                  <span className={`text-xl font-bold ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(profitLoss.netIncome))} {profitLoss.netIncome >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'cash-flow' && (
          <div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Cash Flow Statement</h3>
            <p className="text-dark-600 mb-6">For the period {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}</p>
            
            <div className="space-y-6">
              {/* Operating Activities */}
              <div>
                <h4 className="text-lg font-semibold text-dark-800 mb-3">Cash Flow from Operating Activities</h4>
                {cashFlow.operatingActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-dark-700">{activity.name}</span>
                    <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(activity.amount))} {activity.amount >= 0 ? 'IN' : 'OUT'}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                  <span className="text-dark-800">Net Operating Cash Flow</span>
                  <span className={`${cashFlow.netOperating >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(cashFlow.netOperating))} {cashFlow.netOperating >= 0 ? 'IN' : 'OUT'}
                  </span>
                </div>
              </div>

              {/* Investing Activities */}
              <div>
                <h4 className="text-lg font-semibold text-dark-800 mb-3">Cash Flow from Investing Activities</h4>
                {cashFlow.investingActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-dark-700">{activity.name}</span>
                    <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(activity.amount))} {activity.amount >= 0 ? 'IN' : 'OUT'}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                  <span className="text-dark-800">Net Investing Cash Flow</span>
                  <span className={`${cashFlow.netInvesting >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(cashFlow.netInvesting))} {cashFlow.netInvesting >= 0 ? 'IN' : 'OUT'}
                  </span>
                </div>
              </div>

              {/* Financing Activities */}
              <div>
                <h4 className="text-lg font-semibold text-dark-800 mb-3">Cash Flow from Financing Activities</h4>
                {cashFlow.financingActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-dark-700">{activity.name}</span>
                    <span className={`font-medium ${activity.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(activity.amount))} {activity.amount >= 0 ? 'IN' : 'OUT'}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-bold border-t-2 border-gray-300 mt-2">
                  <span className="text-dark-800">Net Financing Cash Flow</span>
                  <span className={`${cashFlow.netFinancing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(cashFlow.netFinancing))} {cashFlow.netFinancing >= 0 ? 'IN' : 'OUT'}
                  </span>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-dark-900">Net Cash Flow</span>
                  <span className={`text-xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(cashFlow.netCashFlow))} {cashFlow.netCashFlow >= 0 ? 'IN' : 'OUT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
