import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, ArrowUpRight } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { LoadingSpinner, Badge } from '../../components/ui/Shared';
import { formatPrice, formatDate } from '../../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const dashboard: DashboardStats | undefined = data?.data?.data;

  if (isLoading) return <LoadingSpinner />;
  if (!dashboard) return <p>Failed to load dashboard</p>;

  const statCards = [
    { label: 'Monthly Revenue', value: formatPrice(dashboard.stats.monthlyRevenue), icon: DollarSign, color: 'text-success-500 bg-success-500/15' },
    { label: 'Total Orders', value: dashboard.stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-primary-500 bg-primary-500/15' },
    { label: 'Total Users', value: dashboard.stats.totalUsers.toLocaleString(), icon: Users, color: 'text-warning-500 bg-warning-500/15' },
    { label: 'Pending Orders', value: dashboard.stats.pendingOrders.toLocaleString(), icon: Package, color: 'text-danger-500 bg-danger-500/15' },
  ];

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Dashboard</h1>
        <p className="text-surface-500">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {dashboard.revenueChart.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" /> Revenue (30 Days)
            </h2>
            <span className="text-sm text-success-500 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              {formatPrice(dashboard.stats.weeklyRevenue)} this week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboard.revenueChart}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickFormatter={(v) => v.slice(5)} />
              <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px' }}
                labelStyle={{ color: '#94A3B8' }}
                formatter={(value: number) => [formatPrice(value), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {dashboard.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-surface-200 dark:border-surface-700 last:border-0">
                <div>
                  <p className="font-medium text-surface-900 dark:text-white text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-surface-500">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-surface-900 dark:text-white text-sm">{formatPrice(order.total)}</p>
                  <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'PENDING' ? 'warning' : 'info'} className="text-[10px]">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Best Sellers</h2>
          <div className="space-y-3">
            {dashboard.topProducts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 border-b border-surface-200 dark:border-surface-700 last:border-0">
                <span className="text-lg font-bold text-surface-400 w-6">#{idx + 1}</span>
                <img
                  src={item.product?.images?.[0]?.url || 'https://placehold.co/40x40/1e293b/94a3b8?text=No+Image'}
                  alt={item.product?.name}
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{item.product?.name}</p>
                  <p className="text-xs text-surface-500">{formatPrice(item.product?.price || 0)}</p>
                </div>
                <span className="text-sm font-semibold text-primary-500">{item.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
