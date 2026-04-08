import React, { useState, useEffect } from 'react';
import { Store, Search, Star, MapPin, Loader2, X, Package, DollarSign, Tag } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopStats, setShopStats] = useState({ item_count: 0, order_count: 0 });
  const [catalogItems, setCatalogItems] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const sData = await supabaseAdmin.from('shops').select('*, locations(name), profiles:owner_id(full_name)');
    if (sData.data) {
        setShops(sData.data);
        setFilteredShops(sData.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredShops(shops.filter(s => 
        (s.name || '').toLowerCase().includes(low) || 
        (s.locations?.name || '').toLowerCase().includes(low) ||
        (s.profiles?.full_name || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, shops]);

  const handleOpenDetail = async (shop) => {
    setSelectedShop(shop);
    setIsDetailOpen(true);
    setLoadingCatalog(true);
    const [itemCountRes, orderCountRes, catalogRes] = await Promise.all([
        supabaseAdmin.from('menu_items').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
        supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
        supabaseAdmin.from('menu_items').select('*, categories(name)').eq('shop_id', shop.id).limit(20)
    ]);
    setShopStats({ item_count: itemCountRes.count || 0, order_count: orderCountRes.count || 0 });
    setCatalogItems(catalogRes.data || []);
    setLoadingCatalog(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {isDetailOpen && selectedShop && (
        <div
          className="glass-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '0', overflow: 'hidden', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
             <button type="button" onClick={() => setIsDetailOpen(false)} className="icon-btn-tilt" style={{ position: 'absolute', right: '20px', top: '20px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(15,23,42,0.5)', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10, color: '#e2e8f0' }}>
                <X size={20} color="var(--primary)" />
             </button>
             
             <div style={{ flexShrink: 0, background: 'var(--gradient-accent)', padding: '40px', color: '#fff' }}>
                <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{selectedShop.name}</h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', opacity: 0.9 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} />{selectedShop.locations?.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} fill="#d4d4d8" color="#d4d4d8" />4.8 Rating</span>
                </div>
             </div>
             
             <div style={{ overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                   <div className="glass-plate" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <Package size={20} color="#d4d4d8" />
                      <div><p style={{ fontSize: '18px', fontWeight: '800' }}>{shopStats.item_count}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Catalog Items</p></div>
                   </div>
                   <div className="glass-plate" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <DollarSign size={20} color="#a3a3a3" />
                      <div><p style={{ fontSize: '18px', fontWeight: '800' }}>{shopStats.order_count}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Orders</p></div>
                   </div>
                </div>

                <div>
                   <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 'bold' }}>Current Catalog Preview</h4>
                   {loadingCatalog ? <Loader2 className="animate-spin" size={24} /> : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                         {catalogItems.map(item => (
                            <div key={item.id} className="glass-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={16} color="#d4d4d8" /></div>
                                  <div>
                                     <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                                     <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.categories?.name || 'General'}</p>
                                  </div>
                               </div>
                               <div style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{item.price}</div>
                            </div>
                         ))}
                         {catalogItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No catalog found.</p>}
                      </div>
                   )}
                </div>

                <div style={{ marginTop: '12px' }}>
                   <button onClick={() => setIsDetailOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Campus Shops ({filteredShops.length})</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time retail metrics.</p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '40px', height: '42px' }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>NAME</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>HUB</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>PARTNER</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop.id} onClick={() => handleOpenDetail(shop)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <td style={{ padding: '20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Store size={20} color="var(--accent)" /><span style={{ fontWeight: '600' }}>{shop.name}</span></div></td>
                  <td style={{ padding: '20px' }}>{shop.locations?.name || '---'}</td>
                  <td style={{ padding: '20px' }}>{shop.profiles?.full_name || 'Unassigned'}</td>
                  <td style={{ padding: '20px' }}><span className={`status-badge ${shop.is_active ? 'status-active' : 'status-inactive'}`}>{shop.is_active ? 'Online' : 'Offline'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Shops;
