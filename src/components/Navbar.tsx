import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout, refreshUserData } = useUser();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/peers', label: 'Peers' },
    { path: '/projects', label: 'Projects' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/messages', label: 'Messages' },
    { path: '/profile', label: 'Profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`${theme.bg.secondary} shadow-lg border-b ${theme.border.primary} transition-colors duration-300 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90 sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">42</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition-opacity duration-200"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${theme.text.primary} transition-colors duration-300`}>base42</h1>
                <p className={`text-xs ${theme.text.tertiary} transition-colors duration-300`}>Student Hub</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    isActive(path)
                      ? `bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md`
                      : `${theme.text.secondary} ${theme.bg.hover} hover:text-blue-600 dark:hover:text-blue-400`
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${theme.bg.hover} ${theme.text.secondary} hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${theme.bg.hover} ${theme.text.secondary} transition-colors duration-200`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${theme.bg.hover} ${theme.text.secondary} transition-all duration-200 transform hover:scale-105`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-600">
                  <span className="text-white font-medium text-sm">{currentUser?.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <span className="hidden sm:block font-medium">{currentUser?.name.split(' ')[0]}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 ${theme.bg.card} rounded-xl shadow-xl border ${theme.border.primary} py-2 z-50 transform transition-all duration-200`}>
                  <div className={`px-4 py-3 border-b ${theme.border.primary}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{currentUser?.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <div className={`font-medium ${theme.text.primary}`}>{currentUser?.name}</div>
                        <div className={`text-xs ${theme.text.tertiary}`}>{currentUser?.campus} • Level {currentUser?.level}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      refreshUserData();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm ${theme.bg.hover} flex items-center space-x-3 transition-all duration-200 ${theme.text.primary}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync from 42 API
                  </button>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm ${theme.bg.hover} flex items-center space-x-3 transition-all duration-200 text-red-600 dark:text-red-400`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden border-t ${theme.border.primary} ${theme.bg.secondary}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(path)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : `${theme.text.secondary} ${theme.bg.hover}`
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;