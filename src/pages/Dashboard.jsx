import React, { useState, useEffect } from 'react';
import QuickStatsGrid from '../components/dashboard/QuickStatsGrid';
import SystemHealthCard from '../components/dashboard/SystemHealthCard';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabaseAdmin } from '../lib/supabaseAdmin';

/** Rolling last 7 calendar days (local), revenue per day — fills zeros so the chart always renders. */
function buildLast7DaysRevenue(orders) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    keys.push(`${y}-${m}-${day}`);
  }
  const totals = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const o of orders || []) {
    const t = new Date(o.created_at);
    if (Number.isNaN(t.getTime())) continue;
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    if (Object.prototype.hasOwnProperty.call(totals, key)) {
      totals[key] += Number(o.total_amount) || 0;
    }
  }
  return keys.map((key) => {
    const [yy, mm, dd] = key.split('-').map(Number);
    const labelDate = new Date(yy, mm - 1, dd);
    const name = labelDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { name, revenue: totals[key] };
  });
}

const Dashboard = () => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [revenueData, setRevenueData] = useState(() => buildLast7DaysRevenue([]));
  const [stats, setStats] = useState({ ordersToday: 0, revenueToday: 0, activeShops: new Set() });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);

    const fetchStats = async () => {
      const [ordersRes, shopsRes, logsRes] = await Promise.all([
        supabaseAdmin.from('orders').select('total_amount, status, created_at'),
        supabaseAdmin.from('shops').select('id, is_active'),
        supabaseAdmin.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(6),
      ]);

      if (ordersRes.error) console.error('[Dashboard] orders:', ordersRes.error.message);
      if (shopsRes.error) console.error('[Dashboard] shops:', shopsRes.error.message);
      if (logsRes.error) console.error('[Dashboard] admin_logs:', logsRes.error.message);

      const orders = ordersRes.data ?? [];
      const shops = shopsRes.data ?? [];

      if (logsRes.data) setActivityFeed(logsRes.data);

      const activeShops = new Set(shops.filter((s) => s.is_active).map((s) => s.id));

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);

      const ordersToday = orders.filter((o) => {
        const t = new Date(o.created_at);
        return !Number.isNaN(t.getTime()) && t >= startOfToday && t < endOfToday;
      }).length;

      const revenueToday = orders
        .filter((o) => {
          const t = new Date(o.created_at);
          return !Number.isNaN(t.getTime()) && t >= startOfToday && t < endOfToday;
        })
        .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

      setStats({ ordersToday, revenueToday, activeShops });
      setRevenueData(buildLast7DaysRevenue(orders));
    };

    fetchStats();

    const channel = supabaseAdmin
      .channel('admin-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_logs' }, (payload) => {
        setActivityFeed((prev) => [payload.new, ...prev].slice(0, 6));
      })
      .subscribe();

    return () => {
      window.removeEventListener('resize', handleResize);
      supabaseAdmin.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', color: 'var(--primary)' }}>System Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Campus administrative intelligence.</p>
        </div>
      </div>

      <QuickStatsGrid />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
        <SystemHealthCard stats={stats} />
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Campus Revenue</h3>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.25)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(15, 23, 42, 0.92)',
                    backdropFilter: 'blur(12px)',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-2)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '24px' }}>
        <RecentActivityFeed activities={activityFeed} />
        <div className="card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>Engagement Statistics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cross-platform analytics will be available in the version 2 release.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
