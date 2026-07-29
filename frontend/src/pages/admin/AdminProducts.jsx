import { useState, useEffect } from "react";
import api from "../../services/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [formData, setFormData] = useState({ id: null, vendorId: "", title: "", description: "", price: "", stockCount: "", category: "" });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/admin/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({ id: null, vendorId: "", title: "", description: "", price: "", stockCount: "", category: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setModalMode("edit");
    setFormData({ id: p.id, vendorId: p.vendorId, title: p.title, description: p.description || "", price: p.price, stockCount: p.stockCount, category: p.category || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "create") {
        await api.post("/admin/products", formData);
        alert("Product created on behalf of merchant.");
      } else {
        await api.put(`/admin/products/${formData.id}`, formData);
        alert("Product updated.");
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      alert("Failed to save product. Ensure vendor ID is correct.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Force delete this product? This will break associated orders if not careful.")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>Loading products...</div>;

  return (
    <div style={{ animation: 'fadeRoute 0.4s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-1px' }}>Product Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>God mode enabled. Manage all native store listings.</p>
        </div>
        <button onClick={openCreateModal} style={{ backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#172554'} onMouseOut={e=>e.currentTarget.style.backgroundColor='var(--brand-primary)'}>
          <span className="material-symbols-outlined">add_circle</span> Inject Product
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Title</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Vendor</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Stock</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-base)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>#{p.id}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: "700", color: 'var(--text-primary)' }}>{p.title}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.vendor?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {p.vendorId}</div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '700', color: 'var(--success)' }}>GH₵ {p.price}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>{p.stockCount}</td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(p)} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Wipe</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>No products exist in the ecosystem.</div>}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: `1px solid var(--brand-primary)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--brand-primary)', fontWeight: '900', fontSize: '1.5rem' }}>{modalMode === 'create' ? 'Inject Product' : 'Force Edit Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalMode === "create" && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Vendor ID (Target Merchant)</label>
                  <input type="number" required value={formData.vendorId} onChange={e=>setFormData({...formData, vendorId: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Title</label>
                <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Category</label>
                <input type="text" required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Price (GH₵)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Stock Count</label>
                  <input type="number" required value={formData.stockCount} onChange={e=>setFormData({...formData, stockCount: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Description</label>
                <textarea rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              
              <button type="submit" style={{ marginTop: '1rem', width: '100%', backgroundColor: 'var(--text-primary)', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
                {modalMode === 'create' ? 'Inject into Database' : 'Overwrite Data'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
