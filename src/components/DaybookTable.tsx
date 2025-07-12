import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DaybookEntry } from '../types/daybook';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';

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

  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <span className="text-tally-400 text-xs">↕</span>;
    }
    
    return sortDirection === 'asc' 
      ? <span className="text-tally-600 text-xs">↑</span>
      : <span className="text-tally-600 text-xs">↓</span>;
  };

  if (loading) {
    return (
      <div className="panel-classic">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-tally-200 w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-tally-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="panel-classic p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-tally-100 border-2 border-tally-300 flex items-center justify-center mb-6">
            <span className="text-3xl text-tally-600">📋</span>
          </div>
          <h3 className="text-classic-title font-bold text-tally-800 mb-2">No entries found</h3>
          <p className="text-classic-body text-tally-600 mb-6 max-w-md">
            Get started by adding your first daybook entry to track your financial transactions.
          </p>
          <Link
            to="/add"
            className="btn-classic btn-primary"
          >
            Add First Entry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-classic">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="panel-header-classic">
          <h3 className="text-classic-subtitle font-semibold text-tally-800">Recent Entries</h3>
          <p className="text-classic-caption text-tally-600">Swipe left for actions</p>
        </div>
        <div className="divide-y divide-tally-200">
          {paginatedEntries.map((entry) => (
            <div key={entry._id} className="p-3 xs:p-4 hover:bg-tally-50 transition-colors">
              <div className="flex justify-between items-start mb-2 xs:mb-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-tally-900 text-xs xs:text-sm mb-1">
                    {formatDate(entry.date)}
                  </div>
                  <div className="text-xs text-tally-500">
                    {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <div className="classic-badge bg-tally-100 text-tally-800 border-tally-300 font-mono text-xs flex-shrink-0">
                  {entry.voucherNumber}
                </div>
              </div>
              
              <div className="mb-2 xs:mb-3">
                <p className="text-xs xs:text-sm text-tally-900 line-clamp-2" title={entry.particulars}>
                  {entry.particulars}
                </p>
              </div>
              
              <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-3 mb-2 xs:mb-3">
                <div className="space-y-1">
                  {entry.debit > 0 && (
                    <div className="text-xs flex items-center gap-1">
                      <span className="text-tally-600">Debit:</span>
                      <span className="font-semibold text-debit break-all xs:break-normal">{formatCurrency(entry.debit)}</span>
                    </div>
                  )}
                  {entry.credit > 0 && (
                    <div className="text-xs flex items-center gap-1">
                      <span className="text-tally-600">Credit:</span>
                      <span className="font-semibold text-credit break-all xs:break-normal">{formatCurrency(entry.credit)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-1 xs:space-x-2">
                <Link
                  to={`/view/${entry._id}`}
                  className="action-btn-classic action-btn-view"
                  title="View Details"
                >
                  👁
                </Link>
                <Link
                  to={`/edit/${entry._id}`}
                  className="action-btn-classic action-btn-edit"
                  title="Edit Entry"
                >
                  ✏️
                </Link>
                <button
                  onClick={() => onDelete(entry._id)}
                  className="action-btn-classic action-btn-delete"
                  title="Delete Entry"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination */}
        {totalItems > 0 && (
          <div className="mt-6 border-t border-tally-200 pt-6">
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
        <table className="table-classic">
          <thead>
          <tr>
            <th
              className="table-header-classic cursor-pointer hover:bg-tally-100"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center space-x-2">
                <span>Date</span>
                {getSortIcon('date')}
              </div>
            </th>
            <th
              className="table-header-classic cursor-pointer hover:bg-tally-100"
              onClick={() => handleSort('particulars')}
            >
              <div className="flex items-center space-x-2">
                <span>Particulars</span>
                {getSortIcon('particulars')}
              </div>
            </th>
            <th className="table-header-classic">
              Voucher No.
            </th>
            <th
              className="table-header-classic text-right cursor-pointer hover:bg-tally-100"
              onClick={() => handleSort('debit')}
            >
              <div className="flex items-center justify-end space-x-2">
                <span>Debit</span>
                {getSortIcon('debit')}
              </div>
            </th>
            <th
              className="table-header-classic text-right cursor-pointer hover:bg-tally-100"
              onClick={() => handleSort('credit')}
            >
              <div className="flex items-center justify-end space-x-2">
                <span>Credit</span>
                {getSortIcon('credit')}
              </div>
            </th>
            <th className="table-header-classic text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedEntries.map((entry, index) => (
            <tr key={entry._id} className="table-row-classic">
              <td className="table-cell-classic font-medium">
                <div className="flex flex-col">
                  <span className="text-tally-900">{formatDate(entry.date)}</span>
                  <span className="text-xs text-tally-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
              </td>
              <td className="table-cell-classic">
                <div className="max-w-xs">
                  <div className="font-medium text-tally-900 truncate" title={entry.particulars}>
                    {entry.particulars}
                  </div>
                </div>
              </td>
              <td className="table-cell-classic">
                <div className="classic-badge bg-tally-100 text-tally-800 border-tally-300 font-mono">
                  {entry.voucherNumber}
                </div>
              </td>
              <td className="table-cell-classic text-right">
                {entry.debit > 0 ? (
                  <span className="text-debit font-bold">
                    {formatCurrency(entry.debit)}
                  </span>
                ) : (
                  <span className="text-tally-400 font-medium">—</span>
                )}
              </td>
              <td className="table-cell-classic text-right">
                {entry.credit > 0 ? (
                  <span className="text-credit font-bold">
                    {formatCurrency(entry.credit)}
                  </span>
                ) : (
                  <span className="text-tally-400 font-medium">—</span>
                )}
              </td>
              <td className="table-cell-classic text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Link
                    to={`/view/${entry._id}`}
                    className="action-btn-classic action-btn-view"
                    title="View Details"
                  >
                    👁
                  </Link>
                  <Link
                    to={`/edit/${entry._id}`}
                    className="action-btn-classic action-btn-edit"
                    title="Edit Entry"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => onDelete(entry._id)}
                    className="action-btn-classic action-btn-delete"
                    title="Delete Entry"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-tally-100 border-t-2 border-tally-400">
          <tr>
            <td colSpan={3} className="px-6 py-4 text-base font-bold text-tally-800">
              Total Summary
            </td>
            <td className="px-6 py-4 text-right">
              <span className="text-debit font-bold text-base">
                {formatCurrency(totalDebit)}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <span className="text-credit font-bold text-base">
                {formatCurrency(totalCredit)}
              </span>
            </td>
            <td className="px-6 py-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    {/* Desktop Pagination */}
    {totalItems > 0 && (
      <div className="hidden lg:block mt-6 border-t border-tally-200 pt-6">
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
