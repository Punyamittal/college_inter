import React, { useState, useEffect } from 'react';
import { MapPin, Store, UserCheck, ShoppingBag, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

const QuickStatsGrid = () => {
  const [counts, setCounts] = useState({ locations: 0, shops: 0, vendors: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
        const [l, s, v, o] = await Promise.all([
            supabaseAdmin.from('locations').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('shops').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'vendor'),
            supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
        ]);

        setCounts({
            locations: l.count || 0,
            shops: s.count || 0,
            vendors: v.count || 0,
            orders: o.count || 0
        });
        setLoading(false);
    };

    fetchCounts();
  }, []);

  const stats = [
    { label: 'Total Locations', value: counts.locations, icon: MapPin, color: 'var(--chart-1)' },
    { label: 'Live Shops', value: counts.shops, icon: Store, color: 'var(--chart-4)' },
    { label: 'Verified Vendors', value: counts.vendors, icon: UserCheck, color: 'var(--chart-5)' },
    { label: 'Total Orders', value: counts.orders, icon: ShoppingBag, color: 'var(--chart-3)' },
  ]

  if (loading) {
    return (
      <div className="quick-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
            <Loader2 className="animate-spin" size={24} color="#94a3b8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="quick-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card interactive-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            cursor: 'default',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${stat.color}33, ${stat.color}14)`,
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: stat.color,
              boxShadow: `0 8px 24px ${stat.color}22`,
            }}
          >
            <stat.icon size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>{stat.label}</p>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStatsGrid;
