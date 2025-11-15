import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { daybookApi, authApi, authUtils } from '../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = authUtils.getUser();

  // Close mobile menu and user menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const handleExportCsv = async () => {
    try {
      const blob = await daybookApi.exportToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daybook-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = (path: string) => {
    const baseClass = "block px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 touch-target";
    const activeClass = "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow border border-primary-400/30";
    const inactiveClass = "text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 backdrop-blur-sm";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  const mobileNavLinkClass = (path: string) => {
    const baseClass = "nav-item-responsive block w-full text-left rounded-xl xs:rounded-2xl text-sm xs:text-base font-semibold transition-all duration-300 touch-target";
    const activeClass = "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow";
    const inactiveClass = "text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="glass-card border-0 border-b border-neutral-200/30 w-full">
      <div className="container-wide">
        <div className="flex justify-between items-center h-14 xs:h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 xs:space-x-3 group" onClick={closeMobileMenu}>
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white p-1.5 xs:p-2 sm:p-3 rounded-xl xs:rounded-2xl shadow-glow-lg group-hover:shadow-intense transition-all duration-300 group-hover:scale-105 border border-primary-400/30">
                <svg className="w-4 h-4 xs:w-5 xs:h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="text-lg xs:text-xl sm:text-2xl font-bold font-display gradient-text">Daybook</span>
                <span className="text-xs text-neutral-500 font-medium -mt-1 hidden sm:block">Professional Suite</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={navLinkClass('/')}>Dashboard</Link>
            <Link to="/add" className={navLinkClass('/add')}>Add Entry</Link>
            <Link to="/search" className={navLinkClass('/search')}>Search</Link>
            <Link to="/reports" className={navLinkClass('/reports')}>Reports</Link>
            
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-neutral-300 to-transparent mx-3"></div>
            
            <button 
              onClick={handleExportCsv}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-3 xl:px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-95 flex items-center space-x-2 border border-accent-400/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden xl:inline">Export</span>
            </button>
            
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-2xl text-sm font-semibold text-neutral-700 hover:text-primary-600 hover:bg-primary-50/80 transition-all duration-300"
              >
                <div className="w-7 h-7 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden xl:inline">{user?.email}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-[10001]">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900 truncate" title={user?.email}>{user?.email}</p>
                    {user?.tenant && (
                      <p className="text-xs font-medium text-primary-600 mt-0.5">{user.tenant}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-0.5">Logged in</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-1 xs:space-x-2">
            <button 
              onClick={handleExportCsv}
              className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white p-2 xs:p-2.5 rounded-xl xs:rounded-2xl shadow-glow hover:shadow-glow-lg transition-all duration-300 active:scale-95 touch-target"
              title="Export CSV"
            >
              <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="bg-white/90 backdrop-blur-sm hover:bg-white text-neutral-700 hover:text-neutral-900 p-2 xs:p-2.5 rounded-xl xs:rounded-2xl border border-neutral-300/50 shadow-medium hover:shadow-strong transition-all duration-300 active:scale-95 touch-target"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5 xs:w-6 xs:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/50 shadow-strong rounded-b-2xl xs:rounded-b-3xl z-[10000]">
            <div className="px-3 xs:px-4 py-4 xs:py-6 space-y-2 xs:space-y-3">
              <Link to="/" className={mobileNavLinkClass('/')} onClick={closeMobileMenu}>
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </Link>
              
              <Link to="/add" className={mobileNavLinkClass('/add')} onClick={closeMobileMenu}>
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Entry</span>
                </div>
              </Link>
              
              <Link to="/search" className={mobileNavLinkClass('/search')} onClick={closeMobileMenu}>
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </div>
              </Link>
              
              <Link to="/reports" className={mobileNavLinkClass('/reports')} onClick={closeMobileMenu}>
                <div className="flex items-center space-x-2 xs:space-x-3">
                  <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Reports</span>
                </div>
              </Link>

              <div className="border-t border-neutral-200 my-2"></div>

              <div className="px-2 py-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate" title={user?.email}>{user?.email}</p>
                    {user?.tenant && (
                      <p className="text-xs font-medium text-primary-600">{user.tenant}</p>
                    )}
                    <p className="text-xs text-neutral-500">Logged in</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
