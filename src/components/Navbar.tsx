import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/add', label: 'Add Entry', icon: '➕' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <nav className="menubar-classic">
      {/* Title Bar */}
      <div className="title-bar-classic">
        <div className="flex items-center">
          <span className="text-tally-800 font-bold text-lg mr-2">📚</span>
          <div>
            <div className="text-classic-title font-bold text-tally-800">Daybook Pro</div>
            <div className="text-classic-caption text-tally-600">Financial Management System</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-classic-caption text-tally-600">v1.0.0</div>
        </div>
      </div>

      {/* Desktop Menu Bar */}
      <div className="hidden md:flex items-center justify-between bg-tally-200 border-b-2 border-tally-400 px-4 py-1">
        <div className="flex items-center space-x-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menubar-item-classic ${
                isActivePath(item.path) ? 'menubar-item-active' : ''
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="text-classic-caption text-tally-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-tally-200 border-b-2 border-tally-400 px-4 py-2">
        <div className="flex items-center">
          <span className="text-tally-800 font-bold text-lg mr-2">📚</span>
          <div className="text-classic-subtitle font-bold text-tally-800">Daybook Pro</div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn-classic btn-secondary p-1"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-tally-100 border-b-2 border-tally-300">
          <div className="px-2 py-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 text-classic-body ${
                  isActivePath(item.path)
                    ? 'bg-tally-600 text-white'
                    : 'text-tally-700 hover:bg-tally-200'
                } transition-colors`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
