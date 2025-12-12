import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

export interface AutocompleteOption {
  id: string | number;
  label: string;
  sublabel?: string;
  searchableFields?: {
    regNo?: string;
    prevRegNo?: string;
    phone?: string;
    city?: string;
    status?: string;
    [key: string]: string | undefined;
  };
}

export type SearchMode = 'all' | 'name' | 'regNo' | 'phone' | 'location';

interface AutocompleteSelectProps {
  options: AutocompleteOption[];
  value: string | number;
  onChange: (value: string | number, option: AutocompleteOption | null) => void;
  placeholder?: string;
  label: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  maxVisibleOptions?: number;
  enableSearchFilters?: boolean;
  searchFilterLabel?: string;
}

/**
 * Autocomplete Select Component with Virtual Scrolling
 * Handles large datasets efficiently with search and keyboard navigation
 * Supports enhanced search filters for searching by different fields
 */
const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  error,
  disabled = false,
  required = false,
  isLoading = false,
  maxVisibleOptions = 10,
  enableSearchFilters = false,
  searchFilterLabel = 'Search by',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update display value when value changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.id === value);
      if (selectedOption) {
        setDisplayValue(selectedOption.label);
      }
    } else {
      setDisplayValue('');
    }
  }, [value, options]);

  // Filter options based on search term and search mode
  const filteredOptions = React.useMemo(() => {
    if (!debouncedSearchTerm.trim()) return options;
    
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    
    return options.filter(option => {
      const searchFields = option.searchableFields || {};
      
      switch (searchMode) {
        case 'name':
          return option.label.toLowerCase().includes(searchLower);
        
        case 'regNo':
          const regNo = searchFields.regNo?.toLowerCase() || '';
          const prevRegNo = searchFields.prevRegNo?.toLowerCase() || '';
          return regNo.includes(searchLower) || prevRegNo.includes(searchLower);
        
        case 'phone':
          const phone = searchFields.phone?.toLowerCase() || '';
          return phone.includes(searchLower);
        
        case 'location':
          const city = searchFields.city?.toLowerCase() || '';
          const district = searchFields.district?.toLowerCase() || '';
          return city.includes(searchLower) || district.includes(searchLower);
        
        case 'all':
        default:
          // Search in label
          if (option.label.toLowerCase().includes(searchLower)) return true;
          // Search in sublabel
          if (option.sublabel && option.sublabel.toLowerCase().includes(searchLower)) return true;
          // Search in all searchable fields
          for (const key of Object.keys(searchFields)) {
            const fieldValue = searchFields[key];
            if (fieldValue && fieldValue.toLowerCase().includes(searchLower)) return true;
          }
          return false;
      }
    });
  }, [options, debouncedSearchTerm, searchMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Restore display value if no selection
        if (!value) {
          setSearchTerm('');
          setDisplayValue('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setDisplayValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    onChange(option.id, option);
    setDisplayValue(option.label);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('', null);
    setDisplayValue('');
    setSearchTerm('');
    setHighlightedIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={label} className="block text-sm font-medium text-dark-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`w-full px-3 py-2 pr-20 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled || isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {isLoading && (
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          
          {value && !disabled && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
            disabled={disabled || isLoading}
          >
            <svg 
              className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Search Filter Buttons - Show when filters are enabled */}
      {enableSearchFilters && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 mr-1 self-center">{searchFilterLabel}:</span>
          {[
            { mode: 'all' as SearchMode, label: 'All' },
            { mode: 'name' as SearchMode, label: 'Name' },
            { mode: 'regNo' as SearchMode, label: 'Reg No' },
            { mode: 'phone' as SearchMode, label: 'Phone' },
            { mode: 'location' as SearchMode, label: 'Location' },
          ].map(({ mode, label: filterLabel }) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setSearchMode(mode);
                setHighlightedIndex(0);
              }}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                searchMode === mode
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
              }`}
            >
              {filterLabel}
            </button>
          ))}
        </div>
      )}

      {/* Dropdown List */}
      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {filteredOptions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b flex justify-between items-center">
                <span>{filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''}</span>
                {enableSearchFilters && searchMode !== 'all' && (
                  <span className="text-primary-600">
                    Filtering by: {searchMode === 'regNo' ? 'Registration No' : searchMode.charAt(0).toUpperCase() + searchMode.slice(1)}
                  </span>
                )}
              </div>
              <ul 
                ref={listRef}
                className="overflow-y-auto"
                style={{ maxHeight: `${maxVisibleOptions * 70}px` }}
              >
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.id}
                    onClick={() => handleOptionClick(option)}
                    className={`px-3 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === highlightedIndex
                        ? 'bg-primary-100 text-primary-900'
                        : 'hover:bg-gray-50'
                    } ${value === option.id ? 'bg-primary-50 font-medium' : ''}`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      {option.sublabel && (
                        <span className="text-xs text-gray-500 mt-0.5">{option.sublabel}</span>
                      )}
                      {/* Show searchable fields as tags when filters are enabled */}
                      {enableSearchFilters && option.searchableFields && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {option.searchableFields.regNo && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              Reg: {option.searchableFields.regNo}
                            </span>
                          )}
                          {option.searchableFields.prevRegNo && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                              Prev: {option.searchableFields.prevRegNo}
                            </span>
                          )}
                          {option.searchableFields.phone && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                              📞 {option.searchableFields.phone}
                            </span>
                          )}
                          {option.searchableFields.city && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700">
                              📍 {option.searchableFields.city}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="px-3 py-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2 text-sm">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                {enableSearchFilters && searchMode !== 'all' 
                  ? `Try searching in "All" or use a different filter`
                  : 'Try a different search term'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
