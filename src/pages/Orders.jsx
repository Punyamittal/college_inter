import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setError(null);
      let { data, error: qErr } = await supabaseAdmin
        .from('orders')
        .select(
          `
          *,
          shops (name),
          student:profiles!student_id (full_name)
        `
        )
        .order('created_at', { ascending: false });

      if (qErr) {
        const minimal = await supabaseAdmin
          .from('orders')
          .select('*, shops (name)')
          .order('created_at', { ascending: false });
        if (minimal.error) {
          console.error('[Orders]', qErr.message);
          setError(minimal.error.message);
          setOrders([]);
        } else {
          setError(
            'Customer names unavailable (check orders → profiles FK). Showing shop and amounts only.'
          );
          setOrders(minimal.data || []);
        }
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const idShort = (order.id || '').toString().toLowerCase();
      const shop = (order.shops?.name || '').toLowerCase();
      const customer = (order.student?.full_name || '').toLowerCase();
      const status = (order.status || '').toLowerCase();
      return idShort.includes(q) || shop.includes(q) || customer.includes(q) || status.includes(q);
    });
  }, [orders, searchTerm]);

  if (loading)
    return (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#a1a1aa" />
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Order history ({orders.length})</h1>
        <p style={{ color: 'var(--text-muted)' }}>All campus transactions, newest first.</p>
      </div>

      {error && (
        <div
          className="glass-plate-alert"
          style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-main)' }}
          role="alert"
        >
          Could not load orders: {error}. Check the service key and that <code>orders.student_id</code> links to{' '}
          <code>profiles</code>.
        </div>
      )}

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by Order ID, Shop, Customer, or status..."
                className="glass-input"
                style={{ width: '100%', paddingLeft: '40px', height: '42px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shop</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px', fontFamily: 'monospace', fontSize: '13px' }}>
                    #{String(order.id ?? '').slice(0, 8)}
                  </td>
                  <td style={{ padding: '20px', fontWeight: '600' }}>{order.shops?.name || 'TBD'}</td>
                  <td style={{ padding: '20px' }}>{order.student?.full_name || 'Anonymous'}</td>
                  <td style={{ padding: '20px', fontWeight: '700' }}>₹{order.total_amount || 0}</td>
                  <td style={{ padding: '20px' }}>
                     <span className={`status-badge status-${order.status?.toLowerCase() || 'pending'}`}>
                        {order.status || 'Received'}
                     </span>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {orders.length === 0
                      ? 'No orders in the database yet.'
                      : 'No orders match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
