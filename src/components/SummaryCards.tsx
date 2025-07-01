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
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
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
      gradient: 'from-success-500 to-success-600',
      bgGradient: 'from-success-50 to-success-100',
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
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="grid-responsive-3 gap-responsive mb-6 sm:mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-responsive animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 sm:h-8 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 sm:h-8 bg-neutral-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-responsive-3 gap-responsive mb-6 sm:mb-8 animate-slide-up">
      {summaryItems.map((item, index) => {
        const balance = item.credit - item.debit;
        const isPositive = balance >= 0;
        
        return (
          <div key={index} className={`stat-card bg-gradient-to-br ${item.bgGradient} border-l-4 ${item.gradient} relative overflow-hidden`}>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-white/5 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-neutral-800">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">Financial Overview</p>
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-glow-lg transform hover:scale-105 transition-transform duration-300`}>
                  {item.icon}
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                  <span className="text-xs sm:text-sm font-bold text-neutral-700">Debit:</span>
                  <span className="font-bold text-error-600 text-base sm:text-lg">{formatCurrency(item.debit)}</span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                  <span className="text-xs sm:text-sm font-bold text-neutral-700">Credit:</span>
                  <span className="font-bold text-success-600 text-base sm:text-lg">{formatCurrency(item.credit)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl border border-white/60">
                    <span className="text-xs sm:text-sm font-bold text-neutral-800">Net Balance:</span>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-lg sm:text-xl ${isPositive ? 'text-success-600' : 'text-error-600'}`}>
                        {formatCurrency(Math.abs(balance))} 
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-xl ${isPositive ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'}`}>
                        {isPositive ? 'CR' : 'DR'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
