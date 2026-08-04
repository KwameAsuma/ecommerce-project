import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const resolveImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80";
  const firstUrl = typeof url === "string" ? url.split(",")[0].trim() : url;
  return firstUrl;
};

const MerchantPersonalProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    storeDescription: user?.storeDescription || "",
    phone: user?.phone || "",
    momoNumber: user?.momoNumber || "",
    storeAddress: user?.storeAddress || "",
    supportEmail: user?.supportEmail || ""
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        storeDescription: user.storeDescription || "",
        phone: user.phone || "",
        momoNumber: user.momoNumber || "",
        storeAddress: user.storeAddress || "",
        supportEmail: user.supportEmail || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders/vendor").catch(() => ({ data: { orders: [] } })),
          api.get(`/products/vendor/${user.id}`).catch(() => api.get("/products/vendor")).catch(() => ({ data: { products: [] } }))
        ]);
        setOrders(ordersRes.data?.orders || []);
        setProducts(productsRes.data?.products || productsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch vendor statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch("/users/profile", editForm);
      if (res.data.status === "success" || res.data.user) {
        if (setUser && res.data.user) setUser(res.data.user);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save vendor profile", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + parseFloat(o.amount || 0), 0);
  const completedOrders = orders.filter(o => o.status === "delivered" || o.status === "released").length;

  const inp = "w-full border border-slate-200 rounded-2xl px-4 py-3.5 text-base focus:border-[#4343C7] focus:ring-2 focus:ring-[#4343C7]/20 outline-none transition-all text-slate-900 font-bold bg-slate-50/50 hover:bg-white";
  const lbl = "block text-[13px] font-black uppercase tracking-wider text-slate-500 mb-2";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#4343C7] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-black uppercase tracking-widest text-[#4343C7]">Synchronizing Profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">

      {/* ─── Apple-Inspired Liquid Glass Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-[#4343C7] text-white p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(67,67,199,0.35)] border border-white/20">
        {/* Soft floating liquid reflection orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#D4F613]/25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Glass Avatar Showcase */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/40 shadow-2xl flex items-center justify-center text-3xl font-black text-white flex-shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={resolveImageUrl(user.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "V"
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">{user?.name || "Vendor Store"}</h1>
                <span className="bg-[#D4F613] text-[#1e3a8a] px-3.5 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1 shadow-md">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span> Verified Merchant Partner
                </span>
              </div>
              <p className="text-slate-100 text-base max-w-xl font-medium leading-relaxed text-balance">
                {user?.storeDescription || "Verified merchant partner on BediDwa with full MoMo escrow protection and automated global fulfillment."}
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-1.5 text-sm text-white/90 font-semibold">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#D4F613]">mail</span>
                  {user?.email || "vendor@bedidwa.com"}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#D4F613]">call</span>
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/merchant/store`)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/95 hover:bg-white text-[#4343C7] hover:text-[#1e3a8a] rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 flex-shrink-0 w-full sm:w-auto cursor-pointer border border-white"
          >
            <span className="material-symbols-outlined text-lg text-[#D4F613]">storefront</span>
            View My Storefront
          </button>
        </div>
      </div>

      {/* ─── Success notification toast ─── */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          Profile settings and settlement numbers updated successfully.
        </div>
      )}

      {/* ─── Liquid Glass Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Active Inventory", value: products.length || 0, icon: "inventory_2", sub: "Live store SKUs", color: "#4343C7" },
          { label: "Total Orders", value: orders.length || 0, icon: "shopping_bag", sub: `${completedOrders} successfully fulfilled`, color: "#4343C7" },
          { label: "Gross Revenue", value: `GH₵ ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: "payments", sub: "100% Escrow secured", color: "#4343C7", highlight: true },
          { label: "Account Status", value: "Active & Good", icon: "verified", sub: "Full merchant authority", color: "#10B981" },
        ].map(stat => (
          <div 
            key={stat.label} 
            className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(67,67,199,0.1)] hover:border-[#4343C7]/30 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-[#4343C7]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg" style={{ color: stat.color }}>{stat.icon}</span>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight mb-1">{stat.value}</div>
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Apple-Inspired Account & Settlement Container ─── */}
      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-[0_10px_40px_rgb(0,0,0,0.05)] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-serif">Account Identity & Settlement HQ</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Configure your storefront branding, public headquarters, and Mobile Money payout accounts.</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4343C7]/10 hover:bg-[#4343C7] text-[#4343C7] hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-base">edit</span> Edit Credentials
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 px-4 py-2 rounded-xl cursor-pointer"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={lbl}>Store / Vendor Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={inp} required />
                </div>
                <div>
                  <label className={lbl}>MoMo Settlement Number</label>
                  <input type="text" value={editForm.momoNumber} onChange={e => setEditForm({...editForm, momoNumber: e.target.value})} className={inp} placeholder="e.g., 0240000001 (MTN / Telecel)" />
                </div>
                <div>
                  <label className={lbl}>Business Contact Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className={inp} placeholder="e.g., 0240000001" />
                </div>
                <div>
                  <label className={lbl}>Customer Support Email</label>
                  <input type="email" value={editForm.supportEmail} onChange={e => setEditForm({...editForm, supportEmail: e.target.value})} className={inp} placeholder="support@yourstore.com" />
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>Physical Headquarters & Location Address</label>
                  <input type="text" value={editForm.storeAddress} onChange={e => setEditForm({...editForm, storeAddress: e.target.value})} className={inp} placeholder="Accra High Street, Greater Accra, Ghana" />
                </div>
                <div className="md:col-span-2">
                  <label className={lbl}>Store Bio & Customer Promise</label>
                  <textarea rows="3" value={editForm.storeDescription} onChange={e => setEditForm({...editForm, storeDescription: e.target.value})} className={`${inp} resize-none`} placeholder="Tell buyers about your craftsmanship, quality guarantees, and heritage..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 rounded-xl bg-[#4343C7] hover:bg-[#1e3a8a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#4343C7]/30 transition-all cursor-pointer"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { label: "Store Name", value: user?.name, icon: "storefront" },
                { label: "Registered MoMo Number", value: user?.momoNumber || "0240000001", icon: "account_balance_wallet", highlight: true },
                { label: "Primary Contact Phone", value: user?.phone || "0240000001", icon: "call" },
                { label: "Customer Support Email", value: user?.supportEmail || user?.email || "vendor@bedidwa.com", icon: "alternate_email" },
                { label: "Physical Headquarters Address", value: user?.storeAddress || "BediDwa HQ, Accra High Street, Ghana", icon: "location_on", span: true },
                { label: "Store Bio & Description", value: user?.storeDescription || "Verified merchant partner on BediDwa with full MoMo escrow protection and automated global fulfillment.", icon: "menu_book", span: true },
              ].map(field => (
                <div key={field.label} className={field.span ? "md:col-span-2 bg-slate-50/50 p-5 rounded-2xl border border-slate-100" : ""}>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">{field.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4343C7]/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-base text-[#4343C7]">{field.icon}</span>
                    </div>
                    <span className={`text-base font-bold ${field.highlight ? "font-mono text-[#4343C7] font-black text-lg" : "text-slate-900"}`}>{field.value || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MerchantPersonalProfilePage;
