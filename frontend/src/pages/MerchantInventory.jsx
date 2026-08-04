import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const resolveImageUrl = (url) => {
  const defaultPlaceholder = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80";
  if (!url) return defaultPlaceholder;
  const cleanUrl = typeof url === "string" ? url.split(",")[0].trim() : url;
  if (!cleanUrl) return defaultPlaceholder;

  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("blob:")) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith("/uploads/")) {
    let baseUrl = "";
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    } else if (api.defaults.baseURL && api.defaults.baseURL !== "/api" && api.defaults.baseURL !== "api") {
      baseUrl = api.defaults.baseURL.replace(/\/api\/?$/, "");
    } else if (typeof window !== "undefined" && (window.location.port === "3000" || window.location.port === "5173") && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      baseUrl = `http://${window.location.hostname}:5001`;
    }
    return `${baseUrl}${cleanUrl}`;
  }

  return cleanUrl;
};

const MerchantInventory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/products/vendor/${user.id}`).catch(() => api.get("/products/vendor"));
      const items = res.data?.products || res.data || [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error("Failed to fetch merchant inventory:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Error deleting product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.title || p.name || "").toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + (parseInt(p.stockCount || p.stock || 0, 10)), 0);
    const totalValue = products.reduce((acc, p) => acc + ((parseFloat(p.price || 0)) * (parseInt(p.stockCount || p.stock || 1, 10))), 0);
    return { totalItems, totalStock, totalValue };
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#4343C7] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest text-[#4343C7] uppercase">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Quick Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-serif">
              Inventory Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Supervise catalog listings, adjust pricing, and track real-time stock counts across your departments.
            </p>
          </div>

          {/* KPI Summary Cards with customer blue & yellow accents */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
              <p className="text-[11px] font-bold text-[#4343C7] uppercase tracking-wider">SKUs</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalItems}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
              <p className="text-[11px] font-bold text-[#4343C7] uppercase tracking-wider">Total Stock</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalStock.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-[#4343C7] to-[#1e3a8a] text-white border border-[#4343C7] rounded-xl p-3 text-center shadow-sm">
              <p className="text-[11px] font-black text-[#D4F613] uppercase tracking-wider">Est. Value</p>
              <p className="text-xl font-mono font-black text-white mt-0.5">GH₵ {(stats.totalValue / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        {/* Search Bar & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name or category..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4343C7] focus:ring-1 focus:ring-[#4343C7] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                CLEAR
              </button>
            )}
          </div>

          <button
            onClick={() => navigate("/merchant/products/new")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4343C7] hover:bg-[#1e3a8a] text-white font-black text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl font-black text-[#D4F613]">add_circle</span>
            Add New Product
          </button>
        </div>

        {/* Clean Theme Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-md bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#4343C7] text-white font-bold text-xs uppercase tracking-wider border-b border-[#4343C7]">
                <th className="p-4 w-16 text-center">Thumb</th>
                <th className="p-4">Product Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Count</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-500 font-medium">
                    {searchQuery ? (
                      <div>
                        <p className="text-base font-semibold">No items match your search "{searchQuery}"</p>
                        <button onClick={() => setSearchQuery("")} className="mt-2 text-xs text-[#4343C7] underline font-bold">Clear Search</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="material-symbols-outlined text-5xl text-slate-400 block">inventory</span>
                        <p className="text-lg font-bold text-slate-700">Your inventory directory is empty.</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">Click 'Add New Product' above to list items in your store repository.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const title = item.title || item.name || "Untitled Item";
                  const stock = parseInt(item.stockCount || item.stock || 0, 10);
                  const price = parseFloat(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  const imgUrl = resolveImageUrl(item.imageUrl || item.image);
                  const isHealthy = stock >= 10;
                  const isLow = stock > 0 && stock < 10;

                  return (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      {/* Thumbnail */}
                      <td className="p-4 text-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 mx-auto shadow-xs flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">image</span>
                          )}
                        </div>
                      </td>

                      {/* Title & ID */}
                      <td className="p-4 font-extrabold text-slate-900 max-w-xs truncate group-hover:text-[#4343C7] transition-colors font-serif text-[15px]">
                        {title}
                        <div className="text-[13px] font-sans font-semibold text-slate-500 mt-0.5">SKU ID: #{item.id}</div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-slate-600">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold text-[#4343C7] border border-slate-200">
                          {item.category || "General Marketplace"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-mono font-extrabold text-slate-900 text-base whitespace-nowrap">
                        GH₵ {price}
                      </td>

                      {/* Stock Count */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? "bg-emerald-500" : isLow ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
                          <span className="font-bold text-slate-800">{stock} units</span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            ({isHealthy ? "Healthy" : isLow ? "Low" : "Out"})
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black tracking-wide uppercase">
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/merchant/products/${item.id}/edit`)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-[#4343C7] hover:text-white text-slate-600 transition-all shadow-xs border border-slate-200 flex items-center justify-center"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, title)}
                            disabled={deletingId === item.id}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 transition-all shadow-xs border border-slate-200 flex items-center justify-center disabled:opacity-50"
                            title="Delete Product"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {deletingId === item.id ? "hourglass_empty" : "delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-1 px-2">
          <p>Showing <span className="font-bold text-slate-700">{filteredProducts.length}</span> of <span className="font-bold text-slate-700">{products.length}</span> inventory items.</p>
          <p className="mt-1 sm:mt-0">All changes reflect synchronously across consumer catalog routes.</p>
        </div>

      </div>
    </div>
  );
};

export default MerchantInventory;
