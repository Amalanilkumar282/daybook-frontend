import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry, PayType, PayStatus } from '../types/daybook';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { authUtils } from '../services/api';

interface DaybookTableProps {
  entries: DaybookEntry[];
  loading: boolean;
  onDelete: (id: string) => void;
}

type SortField = 'created_at' | 'amount' | 'payment_type' | 'tenant';
type SortDirection = 'asc' | 'desc';

const DaybookTable: React.FC<DaybookTableProps> = ({ entries, loading, onDelete }) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const isAdmin = authUtils.isAdmin();

  const sortedEntries = [...entries].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'tenant':
        aValue = a.tenant.toLowerCase();
        bValue = b.tenant.toLowerCase();
        break;
      case 'payment_type':
        aValue = a.payment_type.toLowerCase();
        bValue = b.payment_type.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData: paginatedEntries,
    handlePageChange,
    handleItemsPerPageChange,
  } = usePagination(sortedEntries, { 
    initialPage: 1, 
    initialItemsPerPage: 10 
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function for date formatting (currently using dateUtils.formatDate instead)
  // const formatDateTime = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });
  // };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalIncoming = entries.reduce((sum, entry) => 
    entry.payment_type === PayType.INCOMING ? sum + entry.amount : sum, 0);
  const totalOutgoing = entries.reduce((sum, entry) => 
    entry.payment_type === PayType.OUTGOING ? sum + entry.amount : sum, 0);

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

  const getPaymentTypeColor = (type: PayType) => {
    return type === PayType.INCOMING 
      ? 'modern-badge from-success-500 to-success-600 text-white border-success-400/30'
      : 'modern-badge from-error-500 to-error-600 text-white border-error-400/30';
  };

  const getPaymentStatusColor = (status: PayStatus) => {
    return status === PayStatus.PAID
      ? 'modern-badge from-green-500 to-green-600 text-white border-green-400/30'
      : 'modern-badge from-orange-500 to-orange-600 text-white border-orange-400/30';
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
        <div className="p-3 xs:p-4 border-b border-neutral-200">
          <h3 className="text-base xs:text-lg font-semibold text-neutral-900">Recent Entries</h3>
          <p className="text-xs xs:text-sm text-neutral-600">Swipe left for actions</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {paginatedEntries.map((entry) => (
            <div key={entry.id} className="p-3 xs:p-4 hover:bg-neutral-50/50 transition-colors">
              <div className="flex justify-between items-start mb-2 xs:mb-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-neutral-900 text-xs xs:text-sm mb-1">
                    {formatDate(entry.created_at)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <div className="modern-badge from-neutral-100 to-neutral-200 text-neutral-800 border-neutral-300/50 font-mono text-xs flex-shrink-0">
                  ID: {entry.id}
                </div>
              </div>
              
              <div className="mb-2 xs:mb-3">
                <p className="text-xs xs:text-sm text-neutral-900 line-clamp-2">
                  {entry.description || 'No description'}
                </p>
                {entry.client_id && (
                  <p className="text-xs text-neutral-600 mt-1">Client: {entry.client_id}</p>
                )}
                {entry.nurse_id && (
                  <p className="text-xs text-neutral-600 mt-1">Nurse: {entry.nurse_id}</p>
                )}
                {entry.receipt && (
                  <a 
                    href={entry.receipt} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline mt-1 inline-block"
                  >
                    View Receipt
                  </a>
                )}
              </div>
              
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="space-y-1">
                  <div className="text-xs flex items-center gap-2">
                    <span className={getPaymentTypeColor(entry.payment_type)}>
                      {entry.payment_type.toUpperCase()}
                    </span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(entry.amount)}</span>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    <span className={getPaymentStatusColor(entry.pay_status)}>
                      {entry.pay_status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-neutral-600">{entry.mode_of_pay}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-1 xs:space-x-2">
                <Link
                  to={`/view/${entry.id}`}
                  className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors touch-target"
                  title="View Details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link
                  to={`/edit/${entry.id}`}
                  className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50 rounded-xl transition-colors touch-target"
                  title="Edit Entry"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={() => onDelete(entry.id.toString())}
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

        {/* Mobile Pagination */}
        {totalItems > 0 && (
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              itemsPerPageOptions={[5, 10, 25, 50]}
            />
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              <th
                className="table-header cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-2">
                  <span>Date</span>
                  {getSortIcon('created_at')}
                </div>
              </th>
              {isAdmin && (
                <th
                  className="table-header cursor-pointer hover:bg-neutral-100 transition-colors"
                  onClick={() => handleSort('tenant')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Tenant</span>
                    {getSortIcon('tenant')}
                  </div>
                </th>
              )}
              <th className="table-header">
                Client/Nurse ID
              </th>
              <th className="table-header">
                Description
              </th>
              <th
                className="table-header cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('payment_type')}
              >
                <div className="flex items-center space-x-2">
                  <span>Type</span>
                  {getSortIcon('payment_type')}
                </div>
              </th>
              <th
                className="table-header text-right cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end space-x-2">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="table-header text-center">
                Status
              </th>
              <th className="table-header text-center">
                Mode
              </th>
              <th className="table-header text-center">
                Receipt
              </th>
              <th className="table-header text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paginatedEntries.map((entry, index) => (
              <tr key={entry.id} className="table-row">
                <td className="table-cell font-medium">
                  <div className="flex flex-col">
                    <span className="text-neutral-900">{formatDate(entry.created_at)}</span>
                    <span className="text-xs text-neutral-500">{new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                </td>
                {isAdmin && (
                  <td className="table-cell">
                    <div className="modern-badge from-blue-100 to-blue-200 text-blue-800 border-blue-300/50">
                      {entry.tenant}
                    </div>
                  </td>
                )}
                <td className="table-cell">
                  {entry.client_id && (
                    <div className="text-sm text-neutral-700">
                      <span className="text-xs text-neutral-500">Client:</span> {entry.client_id}
                    </div>
                  )}
                  {entry.nurse_id && (
                    <div className="text-sm text-neutral-700">
                      <span className="text-xs text-neutral-500">Nurse:</span> {entry.nurse_id}
                    </div>
                  )}
                  {!entry.client_id && !entry.nurse_id && (
                    <span className="text-neutral-400 text-sm">-</span>
                  )}
                </td>
                <td className="table-cell">
                  <div className="max-w-xs">
                    <div className="font-medium text-neutral-900 truncate" title={entry.description || 'No description'}>
                      {entry.description || 'No description'}
                    </div>
                  </div>
                </td>
                <td className="table-cell">
                  <div className={getPaymentTypeColor(entry.payment_type)}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {entry.payment_type === PayType.INCOMING ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      )}
                    </svg>
                    {entry.payment_type.toUpperCase()}
                  </div>
                </td>
                <td className="table-cell text-right">
                  <div className="font-semibold text-neutral-900">
                    {formatCurrency(entry.amount)}
                  </div>
                </td>
                <td className="table-cell text-center">
                  <div className={getPaymentStatusColor(entry.pay_status)}>
                    {entry.pay_status.replace('_', ' ').toUpperCase()}
                  </div>
                </td>
                <td className="table-cell text-center">
                  <span className="text-neutral-600 text-sm capitalize">
                    {entry.mode_of_pay.replace('_', ' ')}
                  </span>
                </td>
                <td className="table-cell text-center">
                  {entry.receipt ? (
                    <a 
                      href={entry.receipt} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-neutral-400 text-sm">-</span>
                  )}
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      to={`/view/${entry.id}`}
                      className="p-2.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-soft hover:shadow-medium group"
                      title="View Details"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      to={`/edit/${entry.id}`}
                      className="p-2.5 text-accent-600 hover:text-accent-700 hover:bg-accent-50/80 backdrop-blur-sm rounded-2xl transition-all duration-300 shadow-soft hover:shadow-medium group"
                      title="Edit Entry"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => onDelete(entry.id.toString())}
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
              <td colSpan={isAdmin ? 5 : 4} className="px-6 py-5 text-base font-bold font-display text-neutral-800">
                Total Summary
              </td>
              <td className="px-6 py-5 text-right">
                <div className="modern-badge from-success-500 to-success-600 text-white border-success-400/30 text-base">
                  Incoming: {formatCurrency(totalIncoming)}
                </div>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="modern-badge from-error-500 to-error-600 text-white border-error-400/30 text-base">
                  Outgoing: {formatCurrency(totalOutgoing)}
                </div>
              </td>
              <td className="px-6 py-5 text-right" colSpan={2}>
                <div className="modern-badge from-primary-500 to-primary-600 text-white border-primary-400/30 text-base">
                  Net: {formatCurrency(totalIncoming - totalOutgoing)}
                </div>
              </td>
              <td className="px-6 py-5"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Desktop Pagination */}
      {totalItems > 0 && (
        <div className="hidden lg:block mt-6 border-t border-neutral-200 pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            showItemsPerPage={true}
            itemsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      )}
    </div>
  );
};

export default DaybookTable;