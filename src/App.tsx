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
        <div className="layout-responsive bg-gradient-to-br from-neutral-50 via-slate-50 to-neutral-100 relative overflow-x-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-accent-100/20"></div>
            <div className="absolute top-0 left-0 w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 bg-primary-200/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 xs:w-80 xs:h-80 sm:w-96 sm:h-96 bg-accent-200/10 rounded-full blur-3xl"></div>
          </div>
          
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          <main className="content-responsive relative z-10 animate-fade-in">
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
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
