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
import DebugAuth from './pages/DebugAuth';
import NotFound from './pages/NotFound';
import { authUtils } from './services/api';
import './App.css';

function App() {
  console.log('App component rendered');
  const [isAuthenticated, setIsAuthenticated] = React.useState(authUtils.isAuthenticated());
  
  // Update authentication state on route changes
  React.useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authUtils.isAuthenticated());
    };
    
    // Check auth status whenever the component updates
    checkAuth();
    
    // Also listen for storage events (for logout in other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
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
          
          {/* Navbar - Always visible for authenticated users */}
          {isAuthenticated && (
            <ErrorBoundary>
              <div className="sticky top-0 z-[9999] w-full">
                <Navbar />
              </div>
            </ErrorBoundary>
          )}
          
          <main className="content-responsive relative z-[1] animate-fade-in">
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
                <Route path="/debug-auth" element={
                  <ProtectedRoute>
                    <DebugAuth />
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
