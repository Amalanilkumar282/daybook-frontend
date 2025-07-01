# 📚 Daybook Frontend Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Component Structure](#component-structure)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Styling & UI](#styling--ui)
- [Testing](#testing)
- [Development Workflow](#development-workflow)
- [Backend Integration](#backend-integration)

## Overview

This is a complete React frontend for a Daybook (Accounting Ledger) system built with TypeScript and Tailwind CSS. The application provides a comprehensive interface for managing financial entries, generating reports, and handling accounting operations.

### Key Features
- **Entry Management**: Full CRUD operations for daybook entries
- **Advanced Search**: Filter by date, amount, and text
- **Reports**: Trial Balance, Profit & Loss, Cash Flow
- **Export**: CSV and JSON export functionality
- **Settings**: Company settings and user preferences
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: Theme switching support

## Architecture

### Technology Stack
- **Frontend**: React 19.x with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **State**: React Hooks (no external state management)
- **Build Tool**: Create React App
- **Testing**: Jest + React Testing Library

### Folder Structure
```
src/
├── components/           # Reusable UI components
│   ├── ConfirmModal.tsx     # Confirmation dialogs
│   ├── DaybookForm.tsx      # Entry creation/editing form
│   ├── DaybookTable.tsx     # Data table component
│   ├── Navbar.tsx           # Navigation component
│   ├── Reports.tsx          # Reports generation
│   ├── Search.tsx           # Search interface
│   ├── Settings.tsx         # Settings panel
│   └── SummaryCards.tsx     # Dashboard summary cards
├── pages/                # Page-level components
│   ├── AddEntry.tsx         # Add new entry page
│   ├── Dashboard.tsx        # Main dashboard
│   ├── EditEntry.tsx        # Edit entry page
│   ├── NotFound.tsx         # 404 error page
│   ├── ReportsPage.tsx      # Reports section
│   ├── SearchPage.tsx       # Advanced search
│   ├── SettingsPage.tsx     # Application settings
│   └── ViewEntry.tsx        # View entry details
├── services/             # API services and data layer
│   └── api.ts              # All API calls and dummy data
├── types/                # TypeScript type definitions
│   └── daybook.ts          # Complete type definitions
├── utils/                # Utility functions
│   └── index.ts            # Helper functions
├── constants/            # Application constants
│   └── index.ts            # Configuration and constants
└── [React app files]
```

## Component Structure

### Pages
- **Dashboard**: Main landing page with summary statistics
- **AddEntry/EditEntry**: Forms for creating and modifying entries
- **SearchPage**: Advanced search with filters
- **ReportsPage**: Generate and view financial reports
- **SettingsPage**: Application and company settings
- **ViewEntry**: Detailed view of individual entries

### Components
- **DaybookForm**: Reusable form for entry data
- **DaybookTable**: Data table with sorting and selection
- **SummaryCards**: Dashboard statistics display
- **Search**: Search input with filters
- **Reports**: Report generation interface
- **Settings**: Settings management panel
- **ConfirmModal**: Confirmation dialogs
- **Navbar**: Navigation and app header

## API Integration

### Current Implementation
The frontend currently uses dummy data defined in `src/services/api.ts`. All API calls are simulated with realistic delays and responses.

### API Structure
```typescript
// Main daybook operations
export const daybookApi = {
  getAllEntries: () => Promise<DaybookEntry[]>
  getEntry: (id: string) => Promise<DaybookEntry>
  createEntry: (data: DaybookFormData) => Promise<DaybookEntry>
  updateEntry: (id: string, data: DaybookFormData) => Promise<DaybookEntry>
  deleteEntry: (id: string) => Promise<void>
  getSummary: () => Promise<SummaryData>
  searchEntries: (query: string, filters?: SearchFilters) => Promise<DaybookEntry[]>
  exportToCsv: () => Promise<Blob>
  // ... more methods
}

// Additional APIs
export const reportsApi = { /* report generation */ }
export const settingsApi = { /* settings management */ }
export const accountCategoriesApi = { /* category management */ }
```

### Backend Integration
To integrate with a real backend:

1. **Update Environment**: Set `REACT_APP_DUMMY_MODE=false` in `.env`
2. **Configure Base URL**: Set `REACT_APP_API_BASE_URL` to your backend URL
3. **Uncomment Real API**: In `api.ts`, uncomment the axios configuration
4. **Replace Functions**: Replace dummy functions with real API calls
5. **Handle Authentication**: Uncomment auth interceptors if needed

## State Management

The application uses React's built-in state management:

- **Local State**: `useState` for component-specific state
- **Effects**: `useEffect` for side effects and data fetching
- **Context**: Could be added for global state if needed
- **Custom Hooks**: For reusable state logic

### Data Flow
1. Components call API functions from `services/api.ts`
2. API functions return promises with data or errors
3. Components handle loading states and error conditions
4. UI updates based on data changes

## Styling & UI

### Tailwind CSS
The application uses Tailwind CSS for styling:
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable utility classes
- **Theme Support**: Light/dark theme variables
- **Custom Components**: Styled form elements and cards

### Design System
- **Colors**: Primary blue, success green, error red
- **Typography**: System fonts with proper hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle shadows for depth
- **Borders**: Rounded corners and subtle borders

### Key UI Patterns
- **Cards**: Content containers with shadows
- **Tables**: Responsive data tables with sorting
- **Forms**: Consistent form styling with validation
- **Modals**: Overlay dialogs for confirmations
- **Loading States**: Skeleton screens and spinners

## Testing

### Testing Setup
- **Framework**: Jest + React Testing Library
- **Coverage**: Configured to track component coverage
- **Types**: TypeScript support in tests

### Testing Strategy
- **Unit Tests**: Component behavior and utilities
- **Integration Tests**: Component interactions
- **Snapshot Tests**: UI consistency
- **API Tests**: Mock API responses

### Running Tests
```bash
npm test                # Run tests in watch mode
npm run test:coverage   # Run with coverage report
```

## Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Development Scripts
```bash
npm run dev           # Start development server
npm run build         # Production build
npm run test          # Run tests
npm run lint          # Check code style
npm run lint:fix      # Fix linting issues
npm run type-check    # TypeScript type checking
npm run preview       # Preview production build
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (can be added)
- **Git Hooks**: Pre-commit validation (can be added)

## Backend Integration

### Required Endpoints
See `BACKEND_INTEGRATION.md` for complete endpoint specifications.

### Data Models
All TypeScript interfaces are defined in `src/types/daybook.ts`:
- `DaybookEntry`: Main entry structure
- `SummaryData`: Dashboard statistics
- `UserSettings`: Application settings
- `ReportTemplate`: Report configurations
- And more...

### Authentication
Optional JWT authentication support is included but commented out. Uncomment in `api.ts` when needed.

### Error Handling
The frontend includes comprehensive error handling:
- Network errors
- Validation errors
- Server errors
- User-friendly error messages

### Loading States
All API operations include loading states:
- Button loading indicators
- Page-level loading screens
- Skeleton UI for data loading

## Configuration

### Environment Variables
See `.env.example` for all available configuration options:
- API settings
- Feature flags
- UI preferences
- Development settings

### Constants
Application constants are centralized in `src/constants/index.ts`:
- API configuration
- Validation rules
- UI settings
- Theme colors
- Error messages

### Utilities
Common utilities are available in `src/utils/index.ts`:
- Date formatting
- Currency formatting
- Validation helpers
- Array utilities
- File operations

## Deployment

### Build Process
1. Run `npm run build` to create production build
2. Static files are generated in the `build/` directory
3. Deploy to any static hosting service

### Environment Configuration
- Set appropriate environment variables for production
- Configure API base URL for your backend
- Enable/disable features as needed

### Performance Considerations
- Code splitting with React.lazy (can be added)
- Image optimization
- Bundle size monitoring
- Caching strategies

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use semantic commit messages
3. Add tests for new features
4. Update documentation as needed
5. Follow existing code patterns

### Code Style
- Use TypeScript interfaces for all data structures
- Follow React hooks patterns
- Use functional components
- Implement proper error boundaries
- Add loading states for async operations

---

This documentation provides a comprehensive overview of the Daybook frontend. For specific implementation details, refer to the individual component files and the backend integration guide.
