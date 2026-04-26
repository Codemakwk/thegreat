import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';

// Layouts
import { Layout, ProtectedRoute, AdminLayout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/Home';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/Cart';
import { CheckoutPage } from './pages/Checkout';
import { OrderHistory, OrderDetail } from './pages/Orders';
import { ProfilePage } from './pages/Profile';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ResetPassword } from './pages/ForgotPassword';
import { AuthCallbackPage } from './pages/AuthCallback';
import { NotFound } from './pages/NotFound';

// Admin
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminOrders, AdminUsers, AdminProducts, AdminCoupons } from './pages/admin/AdminPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const { isDark } = useThemeStore();

  // Apply theme class on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: isDark ? '#1E293B' : '#fff',
              color: isDark ? '#F1F5F9' : '#0F172A',
              border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#F43F5E', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Layout (separate layout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/coupons" element={<AdminCoupons />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
