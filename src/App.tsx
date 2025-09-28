import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import EditEntry from './pages/EditEntry';
import ViewEntry from './pages/ViewEntry';
import SearchPage from './pages/SearchPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import { authUtils } from './services/api';
import './App.css';

function App() {
  console.log('App component rendered');
  const isAuthenticated = authUtils.isAuthenticated();
  
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
          
          {isAuthenticated && (
            <ErrorBoundary>
              <Navbar />
            </ErrorBoundary>
          )}
          <main className="content-responsive relative z-10 animate-fade-in">
            <ErrorBoundary>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/add" element={
                  <ProtectedRoute>
                    <AddEntry />
                  </ProtectedRoute>
                } />
                <Route path="/edit/:id" element={
                  <ProtectedRoute>
                    <EditEntry />
                  </ProtectedRoute>
                } />
                <Route path="/view/:id" element={
                  <ProtectedRoute>
                    <ViewEntry />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
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
