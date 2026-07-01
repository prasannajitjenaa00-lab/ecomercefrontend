import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiShoppingBag, FiPackage, FiUsers, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#d4af37', '#f4e4a6', '#7d5e14', '#a17c16', '#ead170'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setData(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl bg-dark-800" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-80 rounded-2xl bg-dark-800" />)}</div>
    </div>
  );

  const { stats, charts } = data || {};
  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(stats?.revenue?.total || 0), sub: `${formatCurrency(stats?.revenue?.today || 0)} today`, icon: FiDollarSign, color: 'text-gold-400', bg: 'bg-gold-400/10' },
    { label: 'Total Orders', value: stats?.orders?.total || 0, sub: `${stats?.orders?.pending || 0} pending`, icon: FiPackage, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Products', value: stats?.products?.total || 0, sub: `${stats?.products?.lowStock || 0} low stock`, icon: FiShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Customers', value: stats?.customers?.total || 0, sub: `+${stats?.customers?.newThisMonth || 0} this month`, icon: FiUsers, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-white mb-1">Dashboard</h1>
        <p className="font-body text-sm text-stone-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-dark-900 rounded-2xl p-5 border border-dark-800">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} className={card.color} />
              </div>
              <FiTrendingUp size={16} className="text-green-400" />
            </div>
            <p className="font-display text-2xl lg:text-3xl font-bold text-white">{card.value}</p>
            <p className="font-body text-xs text-stone-400 mt-1">{card.label}</p>
            <p className="font-body text-xs text-stone-500 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="font-heading text-lg text-white mb-6">Daily Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.dailyRevenue || []}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="_id" tick={{ fill: '#666', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                formatter={v => [formatCurrency(v), 'Revenue']} labelStyle={{ color: '#d4af37' }} />
              <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} fill="url(#goldGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="font-heading text-lg text-white mb-6">Order Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={charts?.orderStatusBreakdown || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="count" nameKey="_id" paddingAngle={3}>
                {(charts?.orderStatusBreakdown || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {(charts?.orderStatusBreakdown || []).map((item, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="font-body text-xs text-stone-400 capitalize">{item._id} ({item.count})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
        <h2 className="font-heading text-lg text-white mb-6">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={charts?.monthlyRevenue || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="_id" tick={{ fill: '#666', fontSize: 11 }} />
            <YAxis tick={{ fill: '#666', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
              formatter={v => [formatCurrency(v), 'Revenue']} />
            <Bar dataKey="revenue" fill="#d4af37" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products */}
      {charts?.topProducts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-dark-900 rounded-2xl p-6 border border-dark-800">
          <h2 className="font-heading text-lg text-white mb-6">Top Selling Products</h2>
          <div className="space-y-3">
            {charts.topProducts.map((p, i) => (
              <div key={i} className="flex items-center space-x-4">
                <span className="font-body text-sm text-gold-400 w-6 font-bold">#{i+1}</span>
                <div className="flex-1">
                  <p className="font-body text-sm text-white">{p.name || 'Product'}</p>
                  <p className="font-body text-xs text-stone-400">{p.totalSold} sold</p>
                </div>
                <p className="font-body text-sm font-bold text-gold-400">{formatCurrency(p.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Low Stock Alert */}
      {stats?.products?.lowStock > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-5 flex items-center space-x-4">
          <FiAlertCircle size={24} className="text-yellow-400 flex-shrink-0" />
          <div>
            <p className="font-body font-semibold text-yellow-300">{stats.products.lowStock} products are low on stock</p>
            <p className="font-body text-sm text-yellow-500">Review and restock to avoid lost sales</p>
          </div>
        </div>
      )}
    </div>
  );
}
