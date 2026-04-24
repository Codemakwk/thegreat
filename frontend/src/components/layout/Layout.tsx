import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Tag,
  ArrowLeft,
} from 'lucide-react';

/* ─── Main Layout ──────────────────────────────────────────────── */

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

/* ─── Protected Route ──────────────────────────────────────────── */

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/* ─── Admin Layout ─────────────────────────────────────────────── */

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: ShoppingBag, label: 'Products' },
  { to: '/admin/orders', icon: Package, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Store</span>
            </Link>
            <div className="h-6 w-px bg-surface-300 dark:bg-surface-700" />
            <h1 className="text-lg font-bold text-surface-900 dark:text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.firstName?.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 h-[calc(100vh-64px)] sticky top-16 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4">
          <nav className="space-y-1">
            {adminLinks.map((link) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }
                  `}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
