import React, { useState, useEffect } from 'react';
import { Search, Mail, Loader2, UserCheck } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('role', 'vendor');
    if (data) {
        setVendors(data);
        setFilteredVendors(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredVendors(vendors.filter(v => 
        (v.full_name || '').toLowerCase().includes(low) || 
        (v.email || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, vendors]);

  if (loading)
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#a1a1aa" />
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Authorized Vendors</h1>
        <p style={{ color: 'var(--text-muted)' }}>Campus partner directory.</p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Filter vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '40px', height: '42px' }}
            />
          </div>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="card interactive-lift" style={{ padding: '24px', cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'color-mix(in srgb, var(--chart-1) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--chart-1)', fontWeight: 'bold' }}>{vendor.full_name?.[0] || 'V'}</div>
                <div><h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)' }}>{vendor.full_name}</h3><p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vendor.id.slice(0, 16)}...</p></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-main)' }}><Mail size={14} color="var(--text-muted)" />{vendor.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-main)' }}><UserCheck size={14} color="var(--text-muted)" />Role: Verified Partner</div>
              </div>
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span className={`status-badge ${vendor.is_active ? 'status-active' : 'status-inactive'}`}>{vendor.is_active ? 'Authorized' : 'Suspended'}</span>
              </div>
            </div>
          ))}
          {filteredVendors.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', width: '100%' }}>No vendors discovered.</p>}
        </div>
      </div>
    </div>
  );
};

export default Vendors;
