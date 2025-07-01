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
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-slate-50 to-neutral-100 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-accent-100/20"></div>
          </div>
          
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          <main className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
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
