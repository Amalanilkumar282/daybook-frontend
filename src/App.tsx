import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import EditEntry from './pages/EditEntry';
import ViewEntry from './pages/ViewEntry';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  console.log('App component rendered');
  
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-tally-50 flex flex-col">
          {/* Classic Windows-style application layout */}
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          
          {/* Main content area with classic styling - Full width utilization */}
          <main className="flex-1 container-wide-classic py-4">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddEntry />} />
                <Route path="/edit/:id" element={<EditEntry />} />
                <Route path="/view/:id" element={<ViewEntry />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>
          
          {/* Classic status bar */}
          <div className="statusbar-classic">
            Ready | Professional Daybook System v2.0
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
