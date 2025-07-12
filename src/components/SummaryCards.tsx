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
      icon: '📅',
    },
    {
      title: 'This Week',
      debit: summaryData?.week.debit || 0,
      credit: summaryData?.week.credit || 0,
      icon: '📊',
    },
    {
      title: 'This Month',
      debit: summaryData?.month.debit || 0,
      credit: summaryData?.month.credit || 0,
      icon: '📈',
    },
  ];

  if (loading) {
    return (
      <div className="grid-classic-3 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="stat-card-classic">
            <div className="animate-pulse">
              <div className="h-4 bg-tally-300 mb-2 w-20"></div>
              <div className="h-6 bg-tally-300 mb-1 w-24"></div>
              <div className="h-6 bg-tally-300 w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-classic-3 mb-6">
      {summaryItems.map((item, index) => (
        <div key={index} className="stat-card-classic">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-tally-300">
            <div className="text-classic-subtitle font-semibold text-tally-700">
              {item.title}
            </div>
            <span className="text-lg">{item.icon}</span>
          </div>
          
          {/* Financial data */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-classic-body text-tally-600">Debit:</span>
              <span className="text-debit font-bold text-sm">
                {formatCurrency(item.debit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-classic-body text-tally-600">Credit:</span>
              <span className="text-credit font-bold text-sm">
                {formatCurrency(item.credit)}
              </span>
            </div>
            <div className="border-t border-tally-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-classic-body font-medium text-tally-700">Balance:</span>
                <span className={`font-bold text-sm ${
                  (item.credit - item.debit) >= 0 ? 'text-credit' : 'text-debit'
                }`}>
                  {formatCurrency(item.credit - item.debit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
