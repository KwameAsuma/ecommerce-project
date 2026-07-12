import { useState, useEffect } from "react";
import api from "../../services/api";

const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ importerId: "", title: "", basePrice: "", endTime: "" });

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const res = await api.get("/admin/auctions");
      setAuctions(res.data);
    } catch (err) {
      console.error("Failed to fetch auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ importerId: "", title: "", basePrice: "", endTime: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/auctions", {
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      });
      alert("Auction created on behalf of importer.");
      closeModal();
      fetchAuctions();
    } catch (err) {
      alert("Failed to save auction. Ensure importer ID is correct.");
      console.error(err);
    }
  };

  const handleForceClose = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to FORCE CLOSE this auction immediately?")) return;
    try {
      await api.put(`/admin/auctions/${id}/close`);
      fetchAuctions();
    } catch (err) {
      alert("Failed to close auction.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Force cancel and delete this auction? All bids will be wiped.")) return;
    try {
      await api.delete(`/admin/auctions/${id}`);
      fetchAuctions();
    } catch (err) {
      alert("Failed to delete auction.");
    }
  };

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading auctions...</div>;

  return (
    <div style={{ animation: 'fadeRoute 0.4s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>Auction Pools</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>God mode enabled. Manage and override demand pools.</p>
        </div>
        <button onClick={openCreateModal} style={{ backgroundColor: 'var(--brand-gold)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#d97706'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--brand-gold)'}>
          <span className="material-symbols-outlined">add_circle</span> Inject Auction
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID / Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Title</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Importer</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Pricing</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Ends</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border)", transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-base)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>#{a.id}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: a.status === 'active' ? 'var(--success)' : 'var(--danger)', textTransform: 'uppercase' }}>{a.status}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: "700", color: 'var(--text-primary)' }}>{a.title}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{a.importer?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {a.importerId}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--brand-gold)' }}>Top: GH₵ {parseFloat(a.currentHighestBid || a.basePrice).toFixed(2)}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base: GH₵ {parseFloat(a.basePrice).toFixed(2)}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {new Date(a.endTime).toLocaleString()}
                </td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                  {a.status === 'active' && (
                    <button onClick={() => handleForceClose(a.id)} style={{ background: 'var(--brand-blue)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Close Now</button>
                  )}
                  <button onClick={() => handleDelete(a.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Wipe</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {auctions.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>No auctions exist in the ecosystem.</div>}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: `1px solid var(--brand-gold)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--brand-gold)', fontWeight: '900', fontSize: '1.5rem' }}>Inject Demand Pool</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Importer ID (Target User)</label>
                <input type="number" required value={formData.importerId} onChange={e=>setFormData({...formData, importerId: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Title</label>
                <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Base Price (GH₵)</label>
                <input type="number" step="0.01" required value={formData.basePrice} onChange={e=>setFormData({...formData, basePrice: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>End Time</label>
                <input type="datetime-local" required value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              
              <button type="submit" style={{ marginTop: '1rem', width: '100%', backgroundColor: 'var(--brand-gold)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                Create Auction Pool
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAuctions;
