import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Moon, Sun, Menu, X, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-200/50 dark:border-surface-800/50 bg-white/80 dark:bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:shadow-primary-600/50 transition-shadow">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-surface-900 dark:text-white hidden sm:block">
              The<span className="gradient-text">Great</span>
            </span>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.firstName?.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-surface-700 dark:text-surface-300">
                    {user?.firstName}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200 dark:border-surface-700 py-2 z-50 animate-slide-down">
                      <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                        <Package className="w-4 h-4" /> Orders
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-surface-200 dark:border-surface-700" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search + Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-surface-200 dark:border-surface-800 animate-slide-down">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm"
                />
              </div>
            </form>
            <nav className="space-y-1">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
                All Products
              </Link>
              <Link to="/products?featured=true" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800">
                Featured
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
