import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 25, 50],
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return showItemsPerPage ? (
      <div className={`flex flex-col xs:flex-row justify-between items-center gap-4 ${className}`}>
        <div className="text-classic-body text-tally-600 order-2 xs:order-1">
          Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </div>
        
        <div className="flex items-center gap-2 order-1 xs:order-2">
          <label className="text-classic-body text-tally-600">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="input-classic text-classic-body"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
      {/* Items info and per-page selector */}
      <div className="flex flex-col xs:flex-row items-center gap-4 order-2 sm:order-1">
        <div className="text-classic-body text-tally-600">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
        
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <label className="text-classic-body text-tally-600">Items per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="input-classic text-classic-body"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-0 order-1 sm:order-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-classic btn-secondary px-2 xs:px-3 py-1 xs:py-2 text-classic-body disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          ←
        </button>

        {/* Page numbers */}
        <div className="flex">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 xs:px-3 py-1 xs:py-2 text-classic-body border border-tally-300 bg-tally-50 text-tally-500">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-2 xs:px-3 py-1 xs:py-2 text-classic-body border border-tally-300 ${
                    currentPage === page
                      ? 'bg-tally-600 text-white border-tally-600'
                      : 'bg-tally-50 hover:bg-tally-100 text-tally-700'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-classic btn-secondary px-2 xs:px-3 py-1 xs:py-2 text-classic-body disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
