import React, { useState, useEffect } from 'react';
import { Package, Store, Loader2, X } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const CategoriesGrid = ({ onDetail }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryMeta = {
    'Full Meals': { emoji: '🍱', color: '#f4f4f5' },
    'Snacks': { emoji: '🍟', color: '#e4e4e7' },
    'Beverages': { emoji: '☕', color: '#d4d4d8' },
    'Desserts': { emoji: '🍰', color: '#e5e5e5' },
    'Healthy': { emoji: '🥗', color: '#f4f4f5' },
    'Fast Food': { emoji: '🍔', color: '#d4d4d8' },
    'Sandwiches': { emoji: '🥪', color: '#e4e4e7' },
    'Chaat Items': { emoji: '🥘', color: '#f4f4f5' },
    'Pasta Menu': { emoji: '🍝', color: '#e5e5e5' },
    'Italian Specials': { emoji: '🍕', color: '#d4d4d8' },
    'Fries': { emoji: '🍟', color: '#e4e4e7' },
    'Shawarma': { emoji: '🌯', color: '#f4f4f5' },
    'Egg Items': { emoji: '🥚', color: '#e5e5e5' },
    'Maggi': { emoji: '🍜', color: '#d4d4d8' },
    'Rolls': { emoji: '🌯', color: '#e4e4e7' },
    'Burgers': { emoji: '🍔', color: '#f4f4f5' },
    'Omelette': { emoji: '🍳', color: '#e5e5e5' },
    'Juices': { emoji: '🥤', color: '#d4d4d8' },
    'Milkshakes': { emoji: '🥤', color: '#e4e4e7' },
    'Lassi': { emoji: '🥛', color: '#f4f4f5' },
    'Cold Drinks': { emoji: '🧊', color: '#e5e5e5' },
    'Plates': { emoji: '🍽️', color: '#d4d4d8' },
  };

  const fetchRealData = async () => {
    setLoading(true);
    const { data: cats } = await supabaseAdmin.from('categories').select('*');
    const { data: items } = await supabaseAdmin.from('menu_items').select('category_id, shop_id');
    
    if (cats && items) {
        setCategories(cats.map(c => {
            const categoryItems = items.filter(i => i.category_id === c.id);
            const uniqueShops = new Set(categoryItems.map(i => i.shop_id));
            const meta = categoryMeta[c.name] || { emoji: '🍴', color: '#e4e4e7' };
            return {
                id: c.id,
                name: c.name,
                shopsCount: uniqueShops.size,
                itemsCount: categoryItems.length,
                emoji: meta.emoji,
                color: meta.color
            };
        }).sort((a, b) => b.itemsCount - a.itemsCount));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  if (loading)
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#a1a1aa" />
      </div>
    );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
      {categories.map((cat) => (
        <div key={cat.id} className="card clickable" onClick={() => onDetail(cat)} style={{ 
          display: 'flex', flexDirection: 'column', 
          justifyContent: 'space-between', borderTop: `4px solid ${cat.color}`,
          cursor: 'pointer'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '32px', width: '64px', height: '64px', backgroundColor: cat.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cat.emoji}</div>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--primary)' }}>{cat.name}</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}><Store size={14} /><span>{cat.shopsCount} Shops</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}><Package size={14} /><span>{cat.itemsCount} Items</span></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Categories = () => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [catItems, setCatItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleOpenDetail = async (cat) => {
    setSelectedCat(cat);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    const { data } = await supabaseAdmin
        .from('menu_items')
        .select(`
            id, name, price,
            shops (name)
        `)
        .eq('category_id', cat.id);
    setCatItems(data || []);
    setLoadingDetail(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {isDetailOpen && selectedCat && (
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
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '0', overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
             <button type="button" onClick={() => setIsDetailOpen(false)} className="icon-btn-tilt" style={{ position: 'absolute', right: '16px', top: '16px', border: '1px solid rgba(15,23,42,0.15)', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 10 }}><X size={20} color="#475569" /></button>
             
             <div style={{ padding: '32px', backgroundColor: selectedCat.color, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px', width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>{selectedCat.emoji}</div>
                    <div>
                        <h2 style={{ fontSize: '20px', color: '#0f172a' }}>{selectedCat.name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Segment Analysis & Global Catalog</p>
                    </div>
                </div>
             </div>

             <div style={{ padding: '24px', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 'bold' }}>Globally Tracked Items</h4>
                {loadingDetail ? <Loader2 className="animate-spin" size={24} /> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {catItems.map(item => (
                        <div key={item.id} className="glass-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '10px' }}>
                           <div>
                              <p style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sold at: {item.shops?.name}</p>
                           </div>
                           <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '13px' }}>₹{item.price}</div>
                        </div>
                     ))}
                     {catItems.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No items discovered.</p>}
                  </div>
                )}
             </div>

             <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Variations: <strong>{selectedCat.itemsCount}</strong></span>
                <button onClick={() => setIsDetailOpen(false)} className="btn btn-primary" style={{ padding: '8px 20px' }}>Close</button>
             </div>
          </div>
        </div>
      )}

      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Food Classification System</h1>
        <p style={{ color: 'var(--text-muted)' }}>Global food taxonomies.</p>
      </div>

      <CategoriesGrid onDetail={handleOpenDetail} />
    </div>
  );
};

export default Categories;
