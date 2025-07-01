import React from 'react';
import { SummaryData } from '../types/daybook';

interface SummaryCardsProps {
  summaryData: SummaryData | null;
  loading: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summaryData, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const summaryItems = [
    {
      title: 'Today',
      debit: summaryData?.today.debit || 0,
      credit: summaryData?.today.credit || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'This Week',
      debit: summaryData?.week.debit || 0,
      credit: summaryData?.week.credit || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'This Month',
      debit: summaryData?.month.debit || 0,
      credit: summaryData?.month.credit || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryItems.map((item, index) => {
        const balance = item.credit - item.debit;
        const isPositive = balance >= 0;
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <div className="text-blue-500">{item.icon}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Debit:</span>
                <span className="font-medium text-red-600">{formatCurrency(item.debit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Credit:</span>
                <span className="font-medium text-green-600">{formatCurrency(item.credit)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Balance:</span>
                <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(balance))} {isPositive ? 'CR' : 'DR'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
