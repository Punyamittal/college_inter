import React, { useState, useEffect } from 'react';
import { MapPin, Search, Store, Users, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import toast from 'react-hot-toast';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabaseAdmin.from('locations').select(`*, shops (count)`);
    if (error) { toast.error('Failed to sync hubs'); } else {
        setLocations(data || []);
        setFilteredLocations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  useEffect(() => {
    const low = searchTerm.toLowerCase();
    setFilteredLocations(locations.filter(loc => 
        (loc.name || '').toLowerCase().includes(low) || 
        (loc.description || '').toLowerCase().includes(low)
    ));
  }, [searchTerm, locations]);

  if (loading)
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="#a1a1aa" />
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)' }}>Campus Hubs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Geography overview.</p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Filter hubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ width: '100%', paddingLeft: '40px', height: '42px' }}
            />
          </div>
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredLocations.map((loc) => (
            <div key={loc.id} className="card interactive-lift" style={{ padding: '24px', cursor: 'default' }}>
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><MapPin size={28} /></div>
                  <div style={{ flex: 1 }}>
                     <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{loc.name}</h3>
                     <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{loc.description || 'Verified retail segment.'}</p>
                     <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><Store size={14} color="var(--accent)" /> {loc.shops?.[0]?.count || 0} Shops</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><Users size={14} color="var(--success)" /> {loc.is_active ? 'Active' : 'Offline'}</div>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Locations;
