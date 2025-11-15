import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DaybookEntry, PayType, PayStatus } from '../types/daybook';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { authUtils, nursesClientsApi } from '../services/api';

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
  const [nursesMap, setNursesMap] = useState<Map<string, any>>(new Map());
  const [clientsMap, setClientsMap] = useState<Map<string, any>>(new Map());
  const navigate = useNavigate();
  const isAdmin = authUtils.isAdmin();

  // Fetch nurses and clients data for displaying names
  useEffect(() => {
    const fetchNursesAndClients = async () => {
      try {
        const [nurses, clients] = await Promise.all([
          nursesClientsApi.getNurses().catch(() => []),
          nursesClientsApi.getClients().catch(() => [])
        ]);
        
        // Create maps for quick lookup
        const nursesMap = new Map(nurses.map(n => [n.nurse_id.toString(), n]));
        const clientsMap = new Map(clients.map(c => [c.client_id, c]));
        
        setNursesMap(nursesMap);
        setClientsMap(clientsMap);
      } catch (error) {
        console.error('Failed to fetch nurse/client data:', error);
      }
    };
    
    fetchNursesAndClients();
  }, []);
  
  // Helper function to get nurse name
  const getNurseName = (nurseId: string | number | undefined): string => {
    if (!nurseId) return '';
    const nurseIdString = nurseId.toString();
    const nurse = nursesMap.get(nurseIdString);
    if (nurse) {
      return nurse.full_name || `${nurse.first_name} ${nurse.last_name}`.trim();
    }
    return `Nurse ID: ${nurseId}`;
  };
  
  // Helper function to get client name
  const getClientName = (clientId: string | undefined): string => {
    if (!clientId) return '';
    const client = clientsMap.get(clientId);
    if (!client) return clientId;
    
    const patientName = client.patient_name?.trim();
    const requestorName = client.requestor_name?.trim();
    
    // If no patient name, use requestor name
    if (!patientName) {
      return requestorName || clientId;
    }
    
    // If no requestor name, use patient name
    if (!requestorName) {
      return patientName;
    }
    
    // If both names are the same, show only once
    if (patientName.toLowerCase() === requestorName.toLowerCase()) {
      return patientName;
    }
    
    // If both names are different, show both
    return `${patientName} (${requestorName})`;
  };

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
    <div className="animate-fade-in">
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="card">
          <div className="p-3 xs:p-4 border-b border-neutral-200">
            <h3 className="text-base xs:text-lg font-semibold text-neutral-900">Recent Entries</h3>
            <p className="text-xs xs:text-sm text-neutral-600">Tap on an entry to view details</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {paginatedEntries.map((entry) => (
              <Link
                key={entry.id}
                to={`/view/${entry.id}`}
                className="block p-3 xs:p-4 hover:bg-neutral-50/50 transition-colors active:bg-neutral-100/50"
              >
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
                    <p className="text-xs text-neutral-600 mt-1">
                      <span className="font-medium">Client:</span> {getClientName(entry.client_id)}
                    </p>
                  )}
                  {entry.nurse_id && (
                    <p className="text-xs text-neutral-600 mt-1">
                      <span className="font-medium">Nurse:</span> {getNurseName(entry.nurse_id)}
                    </p>
                  )}
                  {entry.receipt && (
                    <span className="text-xs text-blue-600 mt-1 inline-block">
                      Has Receipt
                    </span>
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
                
                <div className="flex justify-end space-x-1 xs:space-x-2" onClick={(e) => e.preventDefault()}>
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(entry.id.toString());
                    }}
                    className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-xl transition-colors touch-target"
                    title="Delete Entry"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-6 px-4">
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
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="card">
          {/* Sticky scroll hint */}
          <div className="bg-blue-50/80 border-b border-blue-200/50 px-6 py-2 text-xs text-blue-700 font-medium">
            💡 Tip: Scroll horizontally to see all columns. Click on any row to view details.
          </div>
          
          {/* Table container with improved scrolling */}
          <div className="relative">
            {/* Top scrollbar */}
            <div className="overflow-x-auto border-b border-neutral-200" style={{ direction: 'rtl' }}>
              <div style={{ width: 'fit-content', minWidth: '100%', height: '1px' }}></div>
            </div>
            
            {/* Main table with horizontal scroll */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200/50">
                <thead className="bg-gradient-to-r from-neutral-50/90 to-neutral-100/90 backdrop-blur-sm sticky top-0 z-10">
                  <tr>
                    <th className="table-header text-center w-32">
                      Actions
                    </th>
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
                    <th className="table-header">
                      Description
                    </th>
                    <th className="table-header">
                      Client/Nurse
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white/80">
                  {paginatedEntries.map((entry, index) => (
                    <tr 
                      key={entry.id} 
                      className="table-row cursor-pointer hover:bg-blue-50/30"
                      onClick={() => navigate(`/view/${entry.id}`)}
                    >
                      <td className="table-cell text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <Link
                            to={`/view/${entry.id}`}
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 group"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/edit/${entry.id}`}
                            className="p-2 text-accent-600 hover:text-accent-700 hover:bg-accent-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 group"
                            title="Edit Entry"
                          >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(entry.id.toString());
                            }}
                            className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50/80 backdrop-blur-sm rounded-xl transition-all duration-200 group"
                            title="Delete Entry"
                          >
                            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
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
                      <td className="table-cell">
                        <div className="max-w-xs">
                          <div className="font-medium text-neutral-900 truncate" title={entry.description || 'No description'}>
                            {entry.description || 'No description'}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {entry.client_id && (
                          <div className="text-sm text-neutral-700">
                            <div className="font-medium">{getClientName(entry.client_id)}</div>
                            <div className="text-xs text-neutral-500">Client</div>
                          </div>
                        )}
                        {entry.nurse_id && (
                          <div className="text-sm text-neutral-700">
                            <div className="font-medium">{getNurseName(entry.nurse_id)}</div>
                            <div className="text-xs text-neutral-500">Nurse</div>
                          </div>
                        )}
                        {!entry.client_id && !entry.nurse_id && (
                          <span className="text-neutral-400 text-sm">-</span>
                        )}
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
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-700 text-sm underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-neutral-50/95 to-neutral-100/95 backdrop-blur-sm border-t-2 border-neutral-300 sticky bottom-0">
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-5 text-base font-bold font-display text-neutral-800">
                      Total Summary
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="modern-badge from-success-500 to-success-600 text-white border-success-400/30 text-sm whitespace-nowrap">
                        In: ₹{formatCurrency(totalIncoming).replace('₹', '')}
                      </div>
                    </td>
                    <td className="px-6 py-5" colSpan={3}>
                      <div className="flex items-center justify-center gap-3">
                        <div className="modern-badge from-error-500 to-error-600 text-white border-error-400/30 text-sm whitespace-nowrap">
                          Out: {formatCurrency(totalOutgoing)}
                        </div>
                        <div className="modern-badge from-primary-500 to-primary-600 text-white border-primary-400/30 text-sm whitespace-nowrap">
                          Net: {formatCurrency(totalIncoming - totalOutgoing)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"></td>
                    <td className="px-6 py-5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Desktop Pagination */}
          {totalItems > 0 && (
            <div className="mt-6 border-t border-neutral-200 pt-6 px-6">
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
      </div>
    </div>
  );
};

export default DaybookTable;