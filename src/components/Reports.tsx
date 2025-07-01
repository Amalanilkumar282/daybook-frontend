import React, { useState } from 'react';
import { DaybookEntry } from '../types/daybook';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

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

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-xl font-bold text-dark-900 mb-4">Financial Overview Charts</h3>
        
        {/* Chart Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Account Types Distribution</h4>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assets', value: trialBalance.filter(acc => acc.type === 'Asset').reduce((sum, acc) => sum + acc.debit, 0), color: '#3B82F6' },
                      { name: 'Liabilities', value: trialBalance.filter(acc => acc.type === 'Liability').reduce((sum, acc) => sum + acc.credit, 0), color: '#EF4444' },
                      { name: 'Equity', value: trialBalance.filter(acc => acc.type === 'Equity').reduce((sum, acc) => sum + acc.credit, 0), color: '#10B981' },
                      { name: 'Revenue', value: trialBalance.filter(acc => acc.type === 'Revenue').reduce((sum, acc) => sum + acc.credit, 0), color: '#F59E0B' },
                      { name: 'Expenses', value: trialBalance.filter(acc => acc.type === 'Expense').reduce((sum, acc) => sum + acc.debit, 0), color: '#8B5CF6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={window.innerWidth < 640 ? 25 : 30}
                    outerRadius={window.innerWidth < 640 ? 60 : 70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { name: 'Assets', value: trialBalance.filter(acc => acc.type === 'Asset').reduce((sum, acc) => sum + acc.debit, 0), color: '#3B82F6' },
                      { name: 'Liabilities', value: trialBalance.filter(acc => acc.type === 'Liability').reduce((sum, acc) => sum + acc.credit, 0), color: '#EF4444' },
                      { name: 'Equity', value: trialBalance.filter(acc => acc.type === 'Equity').reduce((sum, acc) => sum + acc.credit, 0), color: '#10B981' },
                      { name: 'Revenue', value: trialBalance.filter(acc => acc.type === 'Revenue').reduce((sum, acc) => sum + acc.credit, 0), color: '#F59E0B' },
                      { name: 'Expenses', value: trialBalance.filter(acc => acc.type === 'Expense').reduce((sum, acc) => sum + acc.debit, 0), color: '#8B5CF6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend 
                    wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 text-sm mb-2">Revenue vs Expenses</h4>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Revenue', amount: profitLoss.totalRevenue, color: '#10B981' },
                    { name: 'Expenses', amount: profitLoss.totalExpenses, color: '#EF4444' }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: window.innerWidth < 640 ? 11 : 12 }}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 11 }}
                    stroke="#6B7280"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {[
                      { name: 'Revenue', amount: profitLoss.totalRevenue, color: '#10B981' },
                      { name: 'Expenses', amount: profitLoss.totalExpenses, color: '#EF4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-purple-800 text-sm mb-2">Cash Flow Trends</h4>
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Operating', amount: cashFlow.netOperating, cumulative: cashFlow.netOperating },
                    { name: 'Investing', amount: cashFlow.netInvesting, cumulative: cashFlow.netOperating + cashFlow.netInvesting },
                    { name: 'Financing', amount: cashFlow.netFinancing, cumulative: cashFlow.netCashFlow }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 11 }}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    tick={{ fontSize: window.innerWidth < 640 ? 10 : 11 }}
                    stroke="#6B7280"
                    tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`}
                  />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#8B5CF6" 
                    fill="url(#colorCashFlow)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Revenue Breakdown Chart */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-indigo-800 text-sm mb-4">Revenue Sources Breakdown</h4>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profitLoss.revenues}
                margin={{ top: 20, right: 30, left: 20, bottom: window.innerWidth < 640 ? 60 : 5 }}
                layout={window.innerWidth < 640 ? 'horizontal' : 'vertical'}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                {window.innerWidth < 640 ? (
                  <>
                    <XAxis 
                      type="number" 
                      tick={{ fontSize: 10 }}
                      stroke="#6B7280"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      stroke="#6B7280"
                      width={100}
                    />
                  </>
                ) : (
                  <>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      stroke="#6B7280"
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      stroke="#6B7280"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                  </>
                )}
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar 
                  dataKey="amount" 
                  fill="url(#colorRevenue)" 
                  radius={window.innerWidth < 640 ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2={window.innerWidth < 640 ? "1" : "0"} y2={window.innerWidth < 640 ? "0" : "1"}>
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {selectedReport === 'trial-balance' && (
          <div>
            <h3 className="text-xl font-bold text-dark-900 mb-4">Trial Balance</h3>
            <p className="text-dark-600 mb-6">As of {new Date(dateRange.endDate).toLocaleDateString()}</p>
            
            {/* Mobile View */}
            <div className="lg:hidden">
              <div className="space-y-3">
                {trialBalance.map((account, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 xs:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-dark-900 text-sm xs:text-base truncate">{account.name}</h4>
                        <p className="text-xs xs:text-sm text-dark-600 mt-1">{account.type}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 mt-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Debit</p>
                        <p className={`font-semibold text-sm xs:text-base ${account.debit > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Credit</p>
                        <p className={`font-semibold text-sm xs:text-base ${account.credit > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Mobile Total */}
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3 xs:p-4 mt-4">
                  <h4 className="font-bold text-dark-900 text-sm xs:text-base mb-3 text-center">Total</h4>
                  <div className="grid grid-cols-2 gap-3 xs:gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Total Debit</p>
                      <p className="font-bold text-red-600 text-sm xs:text-base">
                        {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.debit, 0))}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Total Credit</p>
                      <p className="font-bold text-green-600 text-sm xs:text-base">
                        {formatCurrency(trialBalance.reduce((sum, acc) => sum + acc.credit, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
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
