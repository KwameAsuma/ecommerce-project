import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { resolveImageUrl } from "../utils/imageUtils";

const CATEGORIES = [
  "All Items",
  "Electronics & Tech",
  "Fashion & Apparel",
  "Home & Furniture",
  "Appliances",
  "Wholesale Auctions"
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users"); // "users" | "finances" | "inventory"
  const [userSubTab, setUserSubTab] = useState("vendors"); // "vendors" | "customers"
  const [inventoryCategory, setInventoryCategory] = useState("All Items");
  const [searchTerm, setSearchTerm] = useState("");

  // DB State
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({ userCount: 0, orderCount: 0, totalOrderAmount: 0 });
  const [loading, setLoading] = useState(true);

  // Dedicated Page Views / Modals
  const [selectedVendorStore, setSelectedVendorStore] = useState(null); // Full Page Storefront View
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes, pRes, aRes, sRes] = await Promise.allSettled([
        api.get("/admin/users"),
        api.get("/admin/orders"),
        api.get("/admin/products"),
        api.get("/admin/auctions"),
        api.get("/admin/stats")
      ]);

      if (uRes.status === "fulfilled" && Array.isArray(uRes.value.data)) {
        setUsers(uRes.value.data);
      }
      if (oRes.status === "fulfilled" && Array.isArray(oRes.value.data)) {
        setOrders(oRes.value.data);
      }
      if (pRes.status === "fulfilled" && Array.isArray(pRes.value.data)) {
        setProducts(pRes.value.data);
      }
      if (aRes.status === "fulfilled" && Array.isArray(aRes.value.data)) {
        setAuctions(aRes.value.data);
      }
      if (sRes.status === "fulfilled" && sRes.value.data) {
        setStats(sRes.value.data);
      }
    } catch (err) {
      console.error("Error loading admin records:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Categorize Users based on DB roles
  const vendorUsers = users.filter(u => 
    ["VENDOR", "MERCHANT", "vendor", "merchant"].includes(u.role)
  );
  
  const customerUsers = users.filter(u => 
    !["VENDOR", "MERCHANT", "vendor", "merchant", "ADMIN", "admin"].includes(u.role)
  );

  // Search Filters
  const filteredVendors = vendorUsers.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customerUsers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id?.toString().includes(searchTerm) ||
    o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Combine Native Products & Auctions into Unified Categorized Inventory
  const unifiedInventory = [
    ...products.map(p => {
      const linkedVendor = users.find(u => u.id === p.vendorId) || p.vendor;
      return {
        id: p.id,
        rawId: p.id,
        title: p.title,
        type: "Native Product",
        category: p.category || "Electronics & Tech",
        vendorId: p.vendorId,
        vendorName: linkedVendor?.name || p.vendor?.name || `Vendor #${p.vendorId}`,
        vendorEmail: linkedVendor?.email || p.vendor?.email || "",
        vendorObj: linkedVendor,
        price: parseFloat(p.price || 0),
        stock: `${p.stockCount ?? 1} in stock`,
        imageUrl: p.imageUrl
      };
    }),
    ...auctions.map(a => {
      const linkedImporter = users.find(u => u.id === a.importerId) || a.importer;
      return {
        id: `auc-${a.id}`,
        rawId: a.id,
        title: a.title,
        type: "Live Auction",
        category: "Wholesale Auctions",
        vendorId: a.importerId,
        vendorName: linkedImporter?.name || a.importer?.name || `Importer #${a.importerId}`,
        vendorEmail: linkedImporter?.email || a.importer?.email || "",
        vendorObj: linkedImporter,
        price: parseFloat(a.currentHighestBid || a.basePrice || 0),
        stock: `Auction (${a.status || 'active'})`,
        imageUrl: a.imageUrl
      };
    })
  ].filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (inventoryCategory === "All Items") return true;
    if (inventoryCategory === "Wholesale Auctions") return item.type === "Live Auction";
    return item.category?.toLowerCase() === inventoryCategory.toLowerCase();
  });

  // --- ACTIONS ---
  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}/role`, { role: editingUser.role });
      triggerToast(`User ${editingUser.name} role updated to ${editingUser.role}!`);
      setEditingUser(null);
      fetchAdminData();
    } catch (err) {
      alert("Failed to update user role.");
    }
  };

  const handleToggleSuspendUser = async (targetUser) => {
    const isSuspended = targetUser.role === "SUSPENDED";
    const newRole = isSuspended ? "customer" : "SUSPENDED";
    try {
      await api.put(`/admin/users/${targetUser.id}/role`, { role: newRole });
      triggerToast(`User ${targetUser.name} is now ${isSuspended ? "Activated" : "Suspended"}.`);
      fetchAdminData();
    } catch (err) {
      alert("Could not update user status.");
    }
  };

  const handleOverrideOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      triggerToast(`Order #${orderId} status set to ${newStatus}.`);
      fetchAdminData();
    } catch (err) {
      alert("Failed to update order status.");
    }
  };

  const handleDeleteInventoryItem = async (item) => {
    if (window.confirm(`Are you sure you want to unpublish and delete "${item.title}"?`)) {
      try {
        if (item.type === "Live Auction") {
          await api.delete(`/admin/auctions/${item.rawId}`);
        } else {
          await api.delete(`/admin/products/${item.rawId}`);
        }
        triggerToast(`Item "${item.title}" deleted.`);
        fetchAdminData();
      } catch (err) {
        alert("Failed to delete item.");
      }
    }
  };

  // Helper: get products & auctions for vendor page
  const getVendorUploadedProducts = (vId) => products.filter(p => p.vendorId === vId);
  const getVendorUploadedAuctions = (vId) => auctions.filter(a => a.importerId === vId);
  const getCustomerOrdersList = (cId) => orders.filter(o => o.customerId === cId);

  const openVendorPage = (vendor) => {
    setSelectedVendorStore(vendor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#4343C7] text-white font-black text-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP MERCHANT-THEMED HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Mode */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#4343C7] text-[#D4F613] font-black flex items-center justify-center text-2xl shadow-md">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">BediDwa</h1>
                <span className="bg-[#D4F613] text-slate-950 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-slate-900/10">
                  Root Admin Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold">Relational Database Operations & Escrow Control</p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search vendors, products, orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-[#4343C7] focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-slate-900">{user?.name || "System Admin"}</p>
                <p className="text-[11px] text-slate-500 font-bold">{user?.email || "system_admin@bedidwa.com"}</p>
              </div>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                title="Log Out"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ─── DEDICATED FULL VENDOR STOREFRONT PAGE VIEW ─── */}
      {selectedVendorStore ? (
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8 animate-in fade-in duration-300">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedVendorStore(null)}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-[#4343C7] font-black text-sm px-5 py-3 rounded-2xl border border-slate-200 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>

            <span className="text-xs font-bold text-slate-500">
              Vendor Store ID: <strong className="text-slate-900">#{selectedVendorStore.id}</strong>
            </span>
          </div>

          {/* Large Store Banner Card (Formatted identically to Customer Store Page) */}
          <div 
            className="text-white shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden bg-cover bg-center transition-all border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
            style={{
              backgroundImage: selectedVendorStore.storeBannerUrl
                ? `linear-gradient(to right, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.45) 55%, rgba(15, 23, 42, 0.05) 100%), url(${resolveImageUrl(selectedVendorStore.storeBannerUrl)})`
                : "linear-gradient(to right, #4343C7, #1e3a8a)"
            }}
          >
            {/* Decorative accents */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4F613]/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-6 relative z-10">
              {/* Vendor Avatar Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-[#D4F613] shadow-lg flex items-center justify-center text-3xl font-black font-serif text-[#4343C7] shrink-0 overflow-hidden">
                {selectedVendorStore.avatarUrl ? (
                  <img src={resolveImageUrl(selectedVendorStore.avatarUrl)} alt={selectedVendorStore.name} className="w-full h-full object-cover" />
                ) : (
                  selectedVendorStore.name?.charAt(0).toUpperCase() || "V"
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4F613] text-[#1e3a8a] text-xs font-black tracking-wide shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span>
                    Verified Vendor Store
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/40 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
                    Trust Score: <strong className="text-[#D4F613]">{selectedVendorStore.trustScore || 100}% ★</strong>
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {selectedVendorStore.name}
                </h2>

                <p className="flex flex-wrap items-center gap-3 text-slate-100 text-xs sm:text-sm font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  <span>Email: <strong>{selectedVendorStore.email}</strong></span>
                  <span>•</span>
                  <span>Role: <strong className="uppercase">{selectedVendorStore.role || "VENDOR"}</strong></span>
                </p>
                {selectedVendorStore.storeDescription && (
                  <p className="text-xs text-slate-200 font-medium italic max-w-xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    "{selectedVendorStore.storeDescription}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick Summary Pillar (Borderless gradient backdrop for ultra-visibility) */}
            <div className="flex flex-col items-start md:items-end justify-between gap-4 relative z-10 shrink-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent md:bg-gradient-to-l md:from-black/40 md:via-black/20 md:to-transparent p-5 rounded-3xl">
              <div className="text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#D4F613] block drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  Available Balance
                </span>
                <p className="text-2xl md:text-3xl font-mono font-black text-white mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  GH₵ {parseFloat(selectedVendorStore.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(selectedVendorStore)}
                className="w-full md:w-auto bg-white hover:bg-slate-100 text-[#1e3a8a] font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Vendor Role</span>
              </button>
            </div>
          </div>

          {/* Section 1: Vendor Uploaded Native Products */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4343C7]/10 text-[#4343C7] font-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Native Products Uploaded by Store</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Direct items listed for consumer purchasing.</p>
                </div>
              </div>
              <span className="bg-indigo-50 text-[#4343C7] font-black text-xs px-3.5 py-1.5 rounded-full border border-indigo-100">
                {getVendorUploadedProducts(selectedVendorStore.id).length} Active Listings
              </span>
            </div>

            {getVendorUploadedProducts(selectedVendorStore.id).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getVendorUploadedProducts(selectedVendorStore.id).map(prod => (
                  <div key={prod.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-[#4343C7] transition-all flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-4">
                      {prod.imageUrl ? (
                        <img src={resolveImageUrl(prod.imageUrl)} alt={prod.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">No Image</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-[#4343C7] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {prod.category || "General Product"}
                        </span>
                        <h4 className="font-black text-sm text-slate-900 mt-1 leading-snug">{prod.title}</h4>
                        <p className="text-base font-black text-slate-900 mt-2">
                          GH₵ {parseFloat(prod.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{prod.stockCount ?? 1} units available</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteInventoryItem({ id: prod.id, rawId: prod.id, title: prod.title, type: "Native Product" })}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Unpublish Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inventory</span>
                <p className="text-sm font-bold text-slate-700">No direct native products linked to this vendor ID.</p>
              </div>
            )}
          </div>

          {/* Section 2: Vendor Uploaded Container Auctions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 font-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Wholesale Container Auctions Uploaded</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Pooled import container lots listed for bidding.</p>
                </div>
              </div>
              <span className="bg-rose-50 text-rose-700 font-black text-xs px-3.5 py-1.5 rounded-full border border-rose-100">
                {getVendorUploadedAuctions(selectedVendorStore.id).length} Active Auctions
              </span>
            </div>

            {getVendorUploadedAuctions(selectedVendorStore.id).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getVendorUploadedAuctions(selectedVendorStore.id).map(auc => (
                  <div key={auc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-rose-500 transition-all flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-4">
                      {auc.imageUrl ? (
                        <img src={resolveImageUrl(auc.imageUrl)} alt={auc.title} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">Auction</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {auc.status || "active"} Auction
                        </span>
                        <h4 className="font-black text-sm text-slate-900 mt-2 leading-snug">{auc.title}</h4>
                        <p className="text-base font-black text-rose-600 mt-2">
                          High Bid: GH₵ {parseFloat(auc.currentHighestBid || auc.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Base: GH₵ {parseFloat(auc.basePrice || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteInventoryItem({ id: `auc-${auc.id}`, rawId: auc.id, title: auc.title, type: "Live Auction" })}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Delete Auction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">gavel</span>
                <p className="text-sm font-bold text-slate-700">No active container auctions created by this vendor yet.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        /* ─── STANDARD DASHBOARD MAIN WORKSPACE ─── */
        <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Total DB Users</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{users.length || stats.userCount || 12}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  <span className="text-[#4343C7] font-black">{vendorUsers.length}</span> Vendors • <span className="text-emerald-700 font-black">{customerUsers.length}</span> Buyers
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#4343C7]/10 text-[#4343C7] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Orders</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{orders.length || stats.orderCount || 0}</h3>
                <p className="text-xs text-emerald-700 font-bold mt-1">Live DB Tracking</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Escrow Volume</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  GH₵ {(orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0) || stats.totalOrderAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-[#4343C7] font-bold mt-1">Secured in System</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">account_balance</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Global Listings</span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{products.length + auctions.length}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  <span className="font-bold text-slate-800">{products.length}</span> Products • <span className="font-bold text-rose-600">{auctions.length}</span> Auctions
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4343C7] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
            </div>

          </div>

          {/* PRIMARY NAVIGATION TAB BAR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-xs">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#4343C7] text-white shadow-md shadow-[#4343C7]/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              <span>Relational User Directory ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("finances")}
              className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "finances"
                  ? "bg-[#4343C7] text-white shadow-md shadow-[#4343C7]/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              <span>Global Order & Escrow Matrix ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "inventory"
                  ? "bg-[#4343C7] text-white shadow-md shadow-[#4343C7]/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-lg">inventory_2</span>
              <span>Categorized Inventory Moderation ({unifiedInventory.length})</span>
            </button>
          </div>

          {/* ─── TAB 1: RELATIONAL USER MANAGEMENT ─── */}
          {activeTab === "users" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 md:p-8">
              
              {/* Header & Sub-Tab Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Database User Directory</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Manage real registered accounts, inspect vendor storefronts, and audit customer order histories.
                  </p>
                </div>

                <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 self-start sm:self-auto border border-slate-200">
                  <button
                    onClick={() => setUserSubTab("vendors")}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      userSubTab === "vendors"
                        ? "bg-[#4343C7] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Vendors / Merchants ({vendorUsers.length})
                  </button>
                  <button
                    onClick={() => setUserSubTab("customers")}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      userSubTab === "customers"
                        ? "bg-[#4343C7] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Customers / Buyers ({customerUsers.length})
                  </button>
                </div>
              </div>

              {/* VENDORS TABLE */}
              {userSubTab === "vendors" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4 pl-6">Vendor Entity</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4">Available Balance</th>
                        <th className="p-4">Trust Score</th>
                        <th className="p-4 pr-6 text-right">Dedicated Store Page Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVendors.map((v) => {
                        const vProds = getVendorUploadedProducts(v.id);
                        const vAucs = getVendorUploadedAuctions(v.id);

                        return (
                          <tr key={v.id} className="hover:bg-indigo-50/20 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#4343C7] text-[#D4F613] font-black flex items-center justify-center text-sm shadow-sm shrink-0 overflow-hidden">
                                  {v.avatarUrl ? (
                                    <img src={resolveImageUrl(v.avatarUrl)} alt={v.name} className="w-full h-full object-cover" />
                                  ) : (
                                    v.name?.charAt(0) || "V"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-sm text-slate-900 truncate">{v.name}</p>
                                  <p className="text-xs text-slate-500 font-medium truncate">{v.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-indigo-50 text-[#4343C7] border border-indigo-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                                {v.role}
                              </span>
                            </td>
                            <td className="p-4 font-black text-sm text-slate-900">
                              GH₵ {parseFloat(v.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 font-bold text-xs text-amber-600">
                              {v.trustScore || 100} / 100 ★
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openVendorPage(v)}
                                  className="bg-[#4343C7] text-white hover:bg-[#3333a8] px-4 py-2 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">storefront</span>
                                  <span>View Vendor Storefront ({vProds.length + vAucs.length})</span>
                                </button>
                                <button
                                  onClick={() => setEditingUser(v)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                  Edit Role
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CUSTOMERS TABLE */}
              {userSubTab === "customers" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4 pl-6">Customer Entity</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Wallet Balance</th>
                        <th className="p-4">Trust Score</th>
                        <th className="p-4 pr-6 text-right">Relational Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.map((c) => {
                        const cOrders = getCustomerOrdersList(c.id);

                        return (
                          <tr key={c.id} className="hover:bg-indigo-50/20 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0 overflow-hidden">
                                  {c.avatarUrl ? (
                                    <img src={resolveImageUrl(c.avatarUrl)} alt={c.name} className="w-full h-full object-cover" />
                                  ) : (
                                    c.name?.charAt(0) || "C"
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-sm text-slate-900 truncate">{c.name}</p>
                                  <p className="text-xs text-slate-500 font-medium truncate">{c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                                {c.role || "BUYER"}
                              </span>
                            </td>
                            <td className="p-4 font-black text-sm text-slate-900">
                              GH₵ {parseFloat(c.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 font-bold text-xs text-amber-600">
                              {c.trustScore || 100} / 100 ★
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedCustomerHistory(c)}
                                  className="bg-[#4343C7] text-white hover:bg-[#3333a8] px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-sm">history</span>
                                  <span>Order History ({cOrders.length})</span>
                                </button>
                                <button
                                  onClick={() => setEditingUser(c)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                  Edit Role
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ─── TAB 2: GLOBAL ORDER & ESCROW MATRIX ─── */}
          {activeTab === "finances" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Global Order & Escrow Matrix</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Real-time oversight connecting buyers, vendors, total prices, delivery OTPs, and status override triggers.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer (Buyer)</th>
                      <th className="p-4">Vendor (Seller)</th>
                      <th className="p-4">Placed Timestamp</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Delivery OTP</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Admin Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="p-4 pl-6 font-black text-sm text-[#4343C7]">
                          #{ord.id}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-sm text-slate-900">{ord.customer?.name || `Customer #${ord.customerId}`}</p>
                          <p className="text-xs text-slate-500">{ord.customer?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-sm text-slate-900">{ord.vendor?.name || `Vendor #${ord.vendorId}`}</p>
                          <p className="text-xs text-slate-500">{ord.vendor?.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-xs text-slate-900">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </td>
                        <td className="p-4 font-black text-sm text-slate-900">
                          GH₵ {parseFloat(ord.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-900 text-[#D4F613] font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-slate-700 tracking-widest shadow-xs">
                            {ord.deliveryOtp || "8421"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                            ord.status === "DELIVERED" || ord.status === "RELEASED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ord.status === "REFUNDED"
                              ? "bg-indigo-50 text-[#4343C7] border-indigo-200"
                              : ord.status === "CANCELLED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOverrideOrderStatus(ord.id, "DELIVERED")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                              title="Force release escrow to vendor"
                            >
                              Release
                            </button>
                            <button
                              onClick={() => handleOverrideOrderStatus(ord.id, "REFUNDED")}
                              className="bg-[#4343C7] hover:bg-[#3333a8] text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                              title="Refund customer"
                            >
                              Refund
                            </button>
                            <button
                              onClick={() => handleOverrideOrderStatus(ord.id, "CANCELLED")}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                              title="Cancel order"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── TAB 3: GLOBAL CATEGORIZED INVENTORY & LINKED VENDORS ─── */}
          {activeTab === "inventory" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Categorized Global Inventory & Linked Vendors</h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Filtered by marketplace categories. Each product explicitly displays its linked uploader vendor and direct storefront inspect button.
                  </p>
                </div>
              </div>

              {/* Category Filter Pills (Main Page Filter Architecture) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                      inventoryCategory === cat
                        ? "bg-[#4343C7] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Categorized Products List with Linked Vendor Cards */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-200">
                      <th className="p-4 pl-6">Product / Listing Title</th>
                      <th className="p-4">Type & Category</th>
                      <th className="p-4">Linked Vendor / Uploader</th>
                      <th className="p-4">Price / Bid</th>
                      <th className="p-4">Stock Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unifiedInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img src={resolveImageUrl(item.imageUrl)} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs shrink-0">
                                <span className="material-symbols-outlined text-lg">image</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-sm text-slate-900 truncate">{item.title}</p>
                              <p className="text-[11px] text-slate-500 font-semibold">{item.category}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                            item.type === "Live Auction"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-indigo-50 text-[#4343C7] border-indigo-200"
                          }`}>
                            {item.type}
                          </span>
                        </td>

                        {/* PROMINENT LINKED VENDOR DETAILS & STOREFRONT LINK */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#4343C7] text-[#D4F613] font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                              {item.vendorObj?.avatarUrl ? (
                                <img src={resolveImageUrl(item.vendorObj.avatarUrl)} alt={item.vendorName} className="w-full h-full object-cover" />
                              ) : (
                                item.vendorName?.charAt(0) || "V"
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-slate-900 truncate">{item.vendorName}</p>
                              {item.vendorObj && (
                                <button
                                  onClick={() => openVendorPage(item.vendorObj)}
                                  className="text-[11px] font-bold text-[#4343C7] hover:underline flex items-center gap-0.5 cursor-pointer mt-0.5"
                                >
                                  <span>View Vendor Storefront</span>
                                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-black text-sm text-slate-900">
                          GH₵ {item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-4 font-semibold text-xs text-slate-500">
                          {item.stock}
                        </td>

                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDeleteInventoryItem(item)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                            >
                              Delete Listing
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      )}

      {/* ─── MODAL: CUSTOMER ORDER HISTORY INSPECTION ─── */}
      {selectedCustomerHistory && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCustomerHistory(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl relative border border-slate-200 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#4343C7] text-white p-6 md:p-8 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">{selectedCustomerHistory.name}</h3>
                <p className="text-xs text-indigo-200 font-medium mt-1">{selectedCustomerHistory.email}</p>
              </div>
              <button 
                onClick={() => setSelectedCustomerHistory(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Order Activity Audit</h4>
              
              {getCustomerOrdersList(selectedCustomerHistory.id).length > 0 ? (
                <div className="space-y-3">
                  {getCustomerOrdersList(selectedCustomerHistory.id).map(o => (
                    <div key={o.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900">Order #{o.id} • {o.product?.title || 'Purchased Item'}</p>
                          {o.createdAt && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                              {new Date(o.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Status: <strong className="text-[#4343C7]">{o.status}</strong></p>
                      </div>
                      <span className="font-black text-sm text-slate-900">
                        GH₵ {parseFloat(o.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-semibold italic bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  No order history records found for this customer.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT USER ROLE ─── */}
      {editingUser && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setEditingUser(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xl font-black tracking-tight">Edit User Role</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">{editingUser.name} ({editingUser.email})</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-2">Assign System Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm text-slate-900 outline-none focus:border-[#4343C7]"
                >
                  <option value="customer">CUSTOMER / BUYER</option>
                  <option value="merchant">MERCHANT / VENDOR</option>
                  <option value="admin">ADMIN / ROOT</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 py-3 rounded-xl font-black text-xs text-white bg-[#4343C7] hover:bg-[#3333a8] transition-all cursor-pointer shadow-md"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
