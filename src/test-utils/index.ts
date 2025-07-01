// Test utilities and setup for Daybook frontend
import React, { ReactElement } from 'react';
import { render, RenderResult, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DaybookEntry, SummaryData, UserSettings } from '../types/daybook';

// Mock data for testing
export const mockDaybookEntry: DaybookEntry = {
  _id: 'test-1',
  date: '2025-06-30',
  particulars: 'Test Entry',
  voucherNumber: 'V001',
  debit: 100.00,
  credit: 0,
  createdAt: '2025-06-30T08:00:00.000Z',
  updatedAt: '2025-06-30T08:00:00.000Z',
};

export const mockSummaryData: SummaryData = {
  today: { debit: 100, credit: 200 },
  week: { debit: 500, credit: 800 },
  month: { debit: 2000, credit: 3000 },
};

export const mockUserSettings: UserSettings = {
  companyName: 'Test Company',
  companyAddress: '123 Test St',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  itemsPerPage: 10,
  autoBackup: true,
  notifications: true,
};

// Custom render function with router
export const renderWithRouter = (ui: ReactElement): RenderResult => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(BrowserRouter, null, children);
  };
  
  return render(ui, { wrapper: Wrapper });
};

// Mock API responses
export const mockApiResponses = {
  getAllEntries: jest.fn().mockResolvedValue([mockDaybookEntry]),
  getEntry: jest.fn().mockResolvedValue(mockDaybookEntry),
  createEntry: jest.fn().mockResolvedValue(mockDaybookEntry),
  updateEntry: jest.fn().mockResolvedValue(mockDaybookEntry),
  deleteEntry: jest.fn().mockResolvedValue(undefined),
  getSummary: jest.fn().mockResolvedValue(mockSummaryData),
  searchEntries: jest.fn().mockResolvedValue([mockDaybookEntry]),
  exportToCsv: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'text/csv' })),
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup for tests
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  
  // Mock window.URL for file downloads
  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: jest.fn(() => 'mock-url'),
      revokeObjectURL: jest.fn(),
    },
    writable: true,
  });
  
  // Mock document.createElement for downloads
  const mockLink = {
    click: jest.fn(),
    href: '',
    download: '',
  };
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'a') {
      return mockLink as any;
    }
    return document.createElement(tagName);
  });
});

// Cleanup after tests
afterEach(() => {
  jest.restoreAllMocks();
});

// Custom matchers for testing
export const customMatchers = {
  toHaveValidCurrency: (received: string) => {
    const currencyRegex = /^\$\d+\.\d{2}$/;
    const pass = currencyRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid currency format`,
      pass,
    };
  },
  
  toHaveValidDate: (received: string) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const pass = dateRegex.test(received) && !isNaN(Date.parse(received));
    return {
      message: () => `expected ${received} to be a valid date format`,
      pass,
    };
  },
};

// Mock React Router hooks
export const mockNavigate = jest.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  useParams: () => ({ id: 'test-1' }),
}));

// Export commonly used testing utilities
export {
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent,
};
