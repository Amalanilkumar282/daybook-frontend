import React, { useState, useEffect } from 'react';
import { DaybookEntry, PayType, PayStatus } from '../types/daybook';
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
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { reportsApi, daybookApi } from '../services/api';
import { currencyUtils, dateUtils } from '../utils';

interface ReportsProps {
  entries?: DaybookEntry[];
}

const Reports: React.FC<ReportsProps> = ({ entries: propEntries = [] }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [selectedReport, setSelectedReport] = useState<'summary' | 'profit-loss' | 'cash-flow'>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [entries, setEntries] = useState<DaybookEntry[]>(propEntries);

  // Load entries and generate report when component mounts or date range changes
  useEffect(() => {
    if (propEntries.length === 0) {
      loadEntriesAndGenerateReport();
    } else {
      setEntries(propEntries);
      generateReport(propEntries);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propEntries, dateRange, selectedReport]);

  const loadEntriesAndGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get entries based on date range
      let entries: DaybookEntry[];
      if (dateRange.startDate && dateRange.endDate) {
        entries = await daybookApi.getEntriesByDateRange(dateRange.startDate, dateRange.endDate);
      } else if (dateRange.startDate) {
        entries = await daybookApi.getEntriesFromDate(dateRange.startDate);
      } else {
        entries = await daybookApi.getAllEntries();
      }
      
      setEntries(entries);
      await generateReport(entries);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (entriesData: DaybookEntry[]) => {
    try {
      setLoading(true);
      setError(null);

      switch (selectedReport) {
        case 'profit-loss':
          const profitLossData = await reportsApi.generateProfitLoss(dateRange.startDate, dateRange.endDate);
          setReportData(profitLossData);
          break;
        
        case 'cash-flow':
          const cashFlowData = await reportsApi.generateCashFlow(dateRange.startDate, dateRange.endDate);
          setReportData(cashFlowData);
          break;
        
        case 'summary':
        default:
          const summaryData = await reportsApi.generateSummaryReport(dateRange.startDate, dateRange.endDate);
          setReportData(summaryData);
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    return currencyUtils.formatCurrency(amount || 0);
  };

  // Prepare chart data from entries
  const getChartData = () => {
    if (!entries.length) return null;

    const incomingTotal = entries
      .filter(entry => entry.payment_type === PayType.INCOMING)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const outgoingTotal = entries
      .filter(entry => entry.payment_type === PayType.OUTGOING)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const paidTotal = entries
      .filter(entry => entry.pay_status === PayStatus.PAID)
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const unpaidTotal = entries
      .filter(entry => entry.pay_status === PayStatus.UNPAID)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      paymentTypeData: [
        { name: 'Incoming', value: incomingTotal, color: '#10B981' },
        { name: 'Outgoing', value: outgoingTotal, color: '#EF4444' }
      ],
      paymentStatusData: [
        { name: 'Paid', value: paidTotal, color: '#10B981' },
        { name: 'Unpaid', value: unpaidTotal, color: '#F59E0B' }
      ],
      revenueVsExpenses: [
        { name: 'Incoming', amount: incomingTotal },
        { name: 'Outgoing', amount: outgoingTotal }
      ]
    };
  };

  const chartData = getChartData();

  // Pagination for entries table
  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedEntries,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(entries, { 
    initialPage: 1, 
    initialItemsPerPage: 10 
  });

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = () => {
    loadEntriesAndGenerateReport();
  };

  if (loading && entries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Selection and Date Range */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-dark-900">Financial Reports</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="summary">Summary Report</option>
              <option value="profit-loss">Profit & Loss Statement</option>
              <option value="cash-flow">Cash Flow Statement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {!loading && !error && chartData && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-xl font-bold text-dark-900 mb-4">Financial Overview Charts</h3>
          
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <span className="ml-3 text-gray-600">Generating charts...</span>
            </div>
          )}

          {chartData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Payment Type Distribution */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 text-sm mb-2">Payment Type Distribution</h4>
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.paymentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth < 640 ? 25 : 30}
                        outerRadius={window.innerWidth < 640 ? 60 : 70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.paymentTypeData.map((entry, index) => (
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

              {/* Payment Status Distribution */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 text-sm mb-2">Payment Status</h4>
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.paymentStatusData}>
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
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Incoming vs Outgoing */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 text-sm mb-2">Incoming vs Outgoing</h4>
                <div className="h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.revenueVsExpenses}>
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
                        dataKey="amount" 
                        stroke="#8B5CF6" 
                        fill="url(#colorGradient)" 
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">Generating report...</span>
          </div>
        )}

        {!loading && reportData && (
          <>
            {selectedReport === 'summary' && (
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-4">Summary Report</h3>
                <p className="text-dark-600 mb-6">
                  For the period {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Total Entries</h4>
                    <p className="text-2xl font-bold text-blue-600">{reportData.totalEntries}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Total Incoming</h4>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalIncoming)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Total Outgoing</h4>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totalOutgoing)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">Net Amount</h4>
                    <p className={`text-2xl font-bold ${reportData.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(reportData.netAmount))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-dark-800 mb-3">Payment Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-dark-700">Paid Entries</span>
                        <span className="font-medium text-green-600">{reportData.paidEntries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-700">Unpaid Entries</span>
                        <span className="font-medium text-yellow-600">{reportData.unpaidEntries}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-dark-800 mb-3">Period Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-dark-700">Start Date</span>
                        <span className="font-medium">{new Date(dateRange.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-700">End Date</span>
                        <span className="font-medium">{new Date(dateRange.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'profit-loss' && (
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-4">Profit & Loss Statement</h3>
                <p className="text-dark-600 mb-6">
                  For the period {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
                
                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-dark-800 mb-3 text-green-700">Revenue (Incoming)</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 font-bold text-lg">
                        <span className="text-dark-800">Total Revenue</span>
                        <span className="text-green-600">{formatCurrency(reportData.revenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-dark-800 mb-3 text-red-700">Expenses (Outgoing)</h4>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 font-bold text-lg">
                        <span className="text-dark-800">Total Expenses</span>
                        <span className="text-red-600">{formatCurrency(reportData.expenses)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-dark-900">Net Income</span>
                      <span className={`text-xl font-bold ${reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(reportData.netIncome))} {reportData.netIncome >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'cash-flow' && (
              <div>
                <h3 className="text-xl font-bold text-dark-900 mb-4">Cash Flow Statement</h3>
                <p className="text-dark-600 mb-6">
                  For the period {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                </p>
                
                <div className="space-y-6">
                  {/* Cash Inflows */}
                  <div>
                    <h4 className="text-lg font-semibold text-dark-800 mb-3 text-green-700">Cash Inflows (Paid Incoming)</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-dark-800">Total Cash Inflows</span>
                        <span className="text-green-600">{formatCurrency(reportData.inflows)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cash Outflows */}
                  <div>
                    <h4 className="text-lg font-semibold text-dark-800 mb-3 text-red-700">Cash Outflows (Paid Outgoing)</h4>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between py-2 font-bold">
                        <span className="text-dark-800">Total Cash Outflows</span>
                        <span className="text-red-600">{formatCurrency(reportData.outflows)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Cash Flow */}
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-dark-900">Net Cash Flow</span>
                      <span className={`text-xl font-bold ${reportData.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(reportData.netCashFlow))} {reportData.netCashFlow >= 0 ? 'Inflow' : 'Outflow'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !reportData && !error && (
          <div className="text-center py-8">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-dark-900 mb-2">No data available</h3>
              <p className="text-dark-600 mb-4">
                No entries found for the selected date range. Try adjusting the date range or adding some entries.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Entries Table */}
      {!loading && entries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-dark-900 mb-4">Entries Details</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-900">
                      {dateUtils.formatDate(entry.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-900">
                      <div className="max-w-xs truncate">
                        {entry.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.client_id && `Client: ${entry.client_id}`}
                        {entry.nurse_id && `Nurse: ${entry.nurse_id}`}
                        {!entry.client_id && !entry.nurse_id && `ID: ${entry.id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        entry.payment_type === PayType.INCOMING 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.payment_type === PayType.INCOMING ? 'Incoming' : 'Outgoing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        entry.pay_status === PayStatus.PAID 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.pay_status === PayStatus.PAID ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span className={entry.payment_type === PayType.INCOMING ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(entry.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;