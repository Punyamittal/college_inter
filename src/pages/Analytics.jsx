import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Store, UserCheck, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Rolling N calendar days (local): revenue and order count per day. */
function buildLastNDaysSeries(orders, numDays) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const keys = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    keys.push(`${y}-${m}-${day}`);
  }
  const revenue = Object.fromEntries(keys.map((k) => [k, 0]));
  const orderCount = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const o of orders || []) {
    const t = new Date(o.created_at);
    if (Number.isNaN(t.getTime())) continue;
    const d = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;
    if (!Object.prototype.hasOwnProperty.call(revenue, key)) continue;
    revenue[key] += Number(o.total_amount) || 0;
    orderCount[key] += 1;
  }
  return keys.map((key) => {
    const [yy, mm, dd] = key.split('-').map(Number);
    const labelDate = new Date(yy, mm - 1, dd);
    const name = labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { name, revenue: revenue[key], orders: orderCount[key] };
  });
}

/** Split rows into last 7 days vs the 7 days before that (requires created_at). */
function splitLastTwoWeeks(rows, dateKey = 'created_at') {
  const now = Date.now();
  const currentStart = now - SEVEN_DAYS_MS;
  const previousStart = now - 2 * SEVEN_DAYS_MS;

  const current = [];
  const previous = [];
  for (const row of rows) {
    const t = new Date(row[dateKey]).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= currentStart) current.push(row);
    else if (t >= previousStart) previous.push(row);
  }
  return { current, previous };
}

/**
 * Percent change current vs previous period.
 * Returns { kind: 'pct', value }, { kind: 'from_zero', current }, or { kind: 'flat' } when both zero.
 */
function comparePeriods(currentVal, previousVal) {
  if (previousVal === 0) {
    if (currentVal === 0) return { kind: 'flat' };
    return { kind: 'from_zero', current: currentVal };
  }
  const pct = ((currentVal - previousVal) / previousVal) * 100;
  return { kind: 'pct', value: pct };
}

function DeltaBadge({ comparison, fromZeroLabel = 'New' }) {
  if (!comparison || comparison.kind === 'flat') {
    return (
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Minus size={14} />
        vs prior 7d
      </span>
    );
  }

  if (comparison.kind === 'from_zero') {
    return (
      <span style={{ fontSize: '12px', color: '#d4d4d8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TrendingUp size={14} />
        {fromZeroLabel}
      </span>
    );
  }

  const { value } = comparison;
  const up = value > 0;
  const down = value < 0;
  const color = down ? '#a1a1aa' : up ? '#f5f5f5' : 'var(--text-muted)';
  const Icon = down ? TrendingDown : up ? TrendingUp : Minus;
  const text = `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <span style={{ fontSize: '12px', color, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }} title="Compared to the previous 7 days">
      <Icon size={14} />
      {text}
    </span>
  );
}

const Analytics = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    shopsTotal: 0,
    shopsActive: 0,
    vendors: 0,
    revenueCompare: null,
    ordersCompare: null,
    shopsEngagedCompare: null,
    vendorsNewCompare: null,
  });
  const [trendSeries, setTrendSeries] = useState(() => buildLastNDaysSeries([], 14));
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setFetchError(null);
      const since14d = new Date(Date.now() - 2 * SEVEN_DAYS_MS).toISOString();

      try {
        const [ordersRes, shopsRes, vendorHead, vendorsRecentRes] = await Promise.all([
          supabaseAdmin.from('orders').select('total_amount, created_at, shop_id'),
          supabaseAdmin.from('shops').select('id, is_active'),
          supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'vendor'),
          supabaseAdmin.from('profiles').select('created_at').eq('role', 'vendor').gte('created_at', since14d),
        ]);

        const errs = [ordersRes.error, shopsRes.error, vendorHead.error, vendorsRecentRes.error].filter(Boolean);
        if (errs.length) {
          const msg = errs.map((e) => e.message).join(' · ');
          setFetchError(msg);
          errs.forEach((e) => console.error('[Analytics]', e.message));
        }

        const orderRows = ordersRes.data ?? [];
        setTrendSeries(buildLastNDaysSeries(orderRows, 14));

        const revenueAll = orderRows.reduce((a, o) => a + (Number(o.total_amount) || 0), 0);
        const ordersAll = orderRows.length;

        const recentOrders = orderRows.filter((o) => {
          const t = new Date(o.created_at).getTime();
          return !Number.isNaN(t) && t >= Date.now() - 2 * SEVEN_DAYS_MS;
        });
        const { current: ordersCurr, previous: ordersPrev } = splitLastTwoWeeks(recentOrders);

        const revenueCurr = ordersCurr.reduce((a, o) => a + (Number(o.total_amount) || 0), 0);
        const revenuePrev = ordersPrev.reduce((a, o) => a + (Number(o.total_amount) || 0), 0);

        const shopsWithOrders = (rows) => {
          const ids = new Set();
          for (const o of rows) {
            if (o.shop_id) ids.add(o.shop_id);
          }
          return ids.size;
        };

        const engagedCurr = shopsWithOrders(ordersCurr);
        const engagedPrev = shopsWithOrders(ordersPrev);

        const shopList = shopsRes.data ?? [];
        const shopsTotal = shopList.length;
        const shopsActive = shopList.filter((s) => s.is_active).length;

        const vendorRecent = vendorsRecentRes.data ?? [];
        const { current: vendCurr, previous: vendPrev } = splitLastTwoWeeks(vendorRecent);
        const newVendorsCurr = vendCurr.length;
        const newVendorsPrev = vendPrev.length;

        setStats({
          revenue: revenueAll,
          orders: ordersAll,
          shopsTotal,
          shopsActive,
          vendors: vendorHead.count ?? 0,
          revenueCompare: comparePeriods(revenueCurr, revenuePrev),
          ordersCompare: comparePeriods(ordersCurr.length, ordersPrev.length),
          shopsEngagedCompare: comparePeriods(engagedCurr, engagedPrev),
          vendorsNewCompare: comparePeriods(newVendorsCurr, newVendorsPrev),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#a1a1aa" />
      </div>
    );
  }

  const activePct = stats.shopsTotal > 0 ? Math.round((stats.shopsActive / stats.shopsTotal) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Business Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Aggregate insights across campus operations. Trend badges compare the <strong>last 7 days</strong> to the{' '}
          <strong>prior 7 days</strong>.
        </p>
      </div>

      {fetchError && (
        <div
          className="glass-plate-alert"
          style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-main)' }}
          role="alert"
        >
          Some analytics queries failed: {fetchError}. Confirm <code>VITE_SUPABASE_SERVICE_KEY</code> and table access.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="analytics-metric-grid">
        <div className="card interactive-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'color-mix(in srgb, var(--chart-1) 18%, transparent)',
                color: 'var(--chart-1)',
              }}
            >
              <DollarSign size={20} />
            </div>
            <DeltaBadge comparison={stats.revenueCompare} />
          </div>
          <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>₹{stats.revenue.toLocaleString()}</p>
        </div>

        <div className="card interactive-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'color-mix(in srgb, var(--chart-4) 18%, transparent)',
                color: 'var(--chart-4)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <DeltaBadge comparison={stats.ordersCompare} />
          </div>
          <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Orders</h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.orders}</p>
        </div>

        <div className="card interactive-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'color-mix(in srgb, var(--chart-5) 18%, transparent)',
                color: 'var(--chart-5)',
              }}
            >
              <Store size={20} />
            </div>
            <DeltaBadge comparison={stats.shopsEngagedCompare} fromZeroLabel="New outlets" />
          </div>
          <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Shops ({stats.shopsActive} live · {activePct}% of {stats.shopsTotal})
          </h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.shopsTotal}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Trend: distinct outlets with orders, 7d vs 7d</p>
        </div>

        <div className="card interactive-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'color-mix(in srgb, var(--chart-6) 18%, transparent)',
                color: 'var(--chart-6)',
              }}
            >
              <UserCheck size={20} />
            </div>
            <DeltaBadge comparison={stats.vendorsNewCompare} fromZeroLabel="New signups" />
          </div>
          <h3 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Onboarded Vendors (total)</h3>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stats.vendors}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Trend: new vendor profiles, 7d vs 7d</p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '24px',
        }}
      >
        <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Revenue (last 14 days)</h3>
          <div style={{ flex: 1, minHeight: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(15, 23, 42, 0.92)',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#analyticsRevenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>Orders per day (last 14 days)</h3>
          <div style={{ flex: 1, minHeight: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(15, 23, 42, 0.92)',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar dataKey="orders" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
