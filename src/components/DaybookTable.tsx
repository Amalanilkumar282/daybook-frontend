import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry } from '../types/daybook';

interface DaybookTableProps {
  entries: DaybookEntry[];
  loading: boolean;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'debit' | 'credit' | 'particulars';
type SortDirection = 'asc' | 'desc';

const DaybookTable: React.FC<DaybookTableProps> = ({ entries, loading, onDelete }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'debit':
        aValue = a.debit;
        bValue = b.debit;
        break;
      case 'credit':
        aValue = a.credit;
        bValue = b.credit;
        break;
      case 'particulars':
        aValue = a.particulars.toLowerCase();
        bValue = b.particulars.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold font-display text-neutral-800 mb-2">No entries found</h3>
          <p className="text-neutral-600 mb-6 max-w-md">Get started by adding your first daybook entry to track your financial transactions.</p>
          <Link
            to="/add"
            className="btn-primary"
          >
            Add First Entry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Entries</h3>
          <p className="text-sm text-neutral-600">Swipe left for actions</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {sortedEntries.map((entry) => (
            <div key={entry._id} className="p-4 hover:bg-neutral-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-medium text-neutral-900 text-sm mb-1">
                    {formatDate(entry.date)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <div className="modern-badge from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300/50 font-mono text-xs">
                  {entry.voucherNumber}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-neutral-900 line-clamp-2" title={entry.particulars}>
                  {entry.particulars}
                </p>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="space-y-1">
                  {entry.debit > 0 && (
                    <div className="text-xs">
                      <span className="text-neutral-600">Debit: </span>
                      <span className="font-semibold text-error-600">{formatCurrency(entry.debit)}</span>
                    </div>
                  )}
                  {entry.credit > 0 && (
                    <div className="text-xs">
                      <span className="text-neutral-600">Credit: </span>
                      <span className="font-semibold text-success-600">{formatCurrency(entry.credit)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Link
                  to={`/view/${entry._id}`}
                  className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors touch-target"
                  title="View Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link
                  to={`/edit/${entry._id}`}
                  className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-xl transition-colors touch-target"
                  title="Edit Entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={() => onDelete(entry._id)}
                  className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-xl transition-colors touch-target"
                  title="Delete Entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              <th
                className="table-header cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-2">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th
                className="table-header cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('particulars')}
              >
                <div className="flex items-center space-x-2">
                  <span>Particulars</span>
                  {getSortIcon('particulars')}
                </div>
              </th>
              <th className="table-header">
                Voucher No.
              </th>
              <th
                className="table-header text-right cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('debit')}
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Debit</span>
                  {getSortIcon('debit')}
                </div>
              </th>
              <th
                className="table-header text-right cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('credit')}
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Credit</span>
                  {getSortIcon('credit')}
                </div>
              </th>
              <th className="table-header text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedEntries.map((entry, index) => (
              <tr key={entry._id} className="table-row">
                <td className="table-cell font-medium">
                  <div className="flex flex-col">
                    <span className="text-neutral-900">{formatDate(entry.date)}</span>
                    <span className="text-xs text-neutral-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="max-w-xs">
                    <div className="font-medium text-neutral-900 truncate" title={entry.particulars}>
                      {entry.particulars}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="modern-badge from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300/50 font-mono">
                    {entry.voucherNumber}
                  </div>
                </td>
                <td className="table-cell text-right">
                  {entry.debit > 0 ? (
                    <div className="modern-badge from-error-500 to-error-600 text-white border-error-400/30">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {formatCurrency(entry.debit)}
                    </div>
                  ) : (
                    <span className="text-neutral-400 font-medium">—</span>
                  )}
                </td>
                <td className="table-cell text-right">
                  {entry.credit > 0 ? (
                    <div className="modern-badge from-success-500 to-success-600 text-white border-success-400/30">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                      {formatCurrency(entry.credit)}
                    </div>
                  ) : (
                    <span className="text-neutral-400 font-medium">—</span>
                  )}
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      to={`/view/${entry._id}`}
                      className="p-2.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-soft hover:shadow-medium group"
                      title="View Details"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      to={`/edit/${entry._id}`}
                      className="p-2.5 text-accent-600 hover:text-accent-700 hover:bg-accent-50/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-soft hover:shadow-medium group"
                      title="Edit Entry"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => onDelete(entry._id)}
                      className="p-2.5 text-error-600 hover:text-error-700 hover:bg-error-50/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-soft hover:shadow-medium group"
                      title="Delete Entry"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-neutral-50/95 to-neutral-100/95 backdrop-blur-sm border-t-2 border-neutral-300">
            <tr>
              <td colSpan={3} className="px-6 py-5 text-base font-bold font-display text-neutral-800">
                Total Summary
              </td>
              <td className="px-6 py-5 text-right">
                <div className="modern-badge from-error-500 to-error-600 text-white border-error-400/30 text-base">
                  {formatCurrency(totalDebit)}
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="modern-badge from-success-500 to-success-600 text-white border-success-400/30 text-base">
                  {formatCurrency(totalCredit)}
                </div>
              </td>
              <td className="px-6 py-5"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DaybookTable;
