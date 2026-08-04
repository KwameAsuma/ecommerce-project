import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const resolveImageUrl = (url) => {
  const defaultPlaceholder = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";
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

const VendorStorePage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null); // null = show Category Grid Boxes, string = selected category
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [productsRes, auctionsRes] = await Promise.all([
          api.get(`/products/vendor/${user.id}`).catch(() => api.get("/products/vendor")).catch(() => ({ data: { products: [] } })),
          api.get(`/auctions/vendor`).catch(() => ({ data: { auctions: [] } })),
        ]);
        
        const pList = productsRes.data?.products || productsRes.data || [];
        const aList = auctionsRes.data?.auctions || auctionsRes.data || [];
        
        setProducts(Array.isArray(pList) ? pList : []);
        setAuctions(Array.isArray(aList) ? aList : []);
      } catch (err) {
        console.error("Failed to fetch store catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [user]);

  // Group products by category + create an Auctions group
  const categoryGroups = useMemo(() => {
    const map = {};
    
    // Process products
    products.forEach(p => {
      const cat = p.category || "General Inventory";
      if (!map[cat]) {
        map[cat] = { name: cat, items: [], type: "product", totalValue: 0 };
      }
      map[cat].items.push({ ...p, _type: "product" });
      map[cat].totalValue += parseFloat(p.price || 0);
    });

    // Process auctions into their own dedicated category grid box
    if (auctions.length > 0) {
      const auctionTotal = auctions.reduce((sum, a) => sum + parseFloat(a.currentHighestBid || a.basePrice || 0), 0);
      map["Live Auctions"] = {
        name: "Live Auctions",
        items: auctions.map(a => ({ ...a, _type: "auction" })),
        type: "auction",
        totalValue: auctionTotal
      };
    }

    return Object.values(map);
  }, [products, auctions]);

  // Filter items when inside a specific group drill-down
  const activeGroupItems = useMemo(() => {
    if (!selectedGroup) return [];
    const group = categoryGroups.find(g => g.name === selectedGroup);
    if (!group) return [];
    
    if (!searchQuery.trim()) return group.items;
    const q = searchQuery.toLowerCase();
    return group.items.filter(item => 
      (item.title || item.name || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  }, [categoryGroups, selectedGroup, searchQuery]);

  const vendorName = user?.storeName || user?.name || "BediDwa System Vendor";
  const vendorAddress = user?.storeAddress || "BediDwa HQ, Accra, Ghana";
  const trustScore = user?.trustScore ?? 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#4343C7] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest text-[#4343C7] uppercase">Loading Store Overview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      
      {/* Top Section: Customer Blue & Yellow Theme Banner */}
      <div 
        className="text-white shadow-md rounded-b-2xl mb-8 px-6 md:px-12 py-10 relative overflow-hidden bg-cover bg-center transition-all"
        style={{
          backgroundImage: user?.storeBannerUrl
            ? `linear-gradient(to right, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.45) 50%, rgba(15, 23, 42, 0.05) 100%), url(${resolveImageUrl(user.storeBannerUrl)})`
            : "linear-gradient(to right, #4343C7, #1e3a8a)"
        }}
      >
        {/* Decorative architectural accents */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#D4F613]/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-[#D4F613] shadow-lg flex items-center justify-center text-3xl font-black font-serif text-[#4343C7] flex-shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={resolveImageUrl(user.avatarUrl)} alt={vendorName} className="w-full h-full object-cover" />
              ) : (
                vendorName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4F613] text-[#1e3a8a] text-xs font-black tracking-wide shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Verified Authority Merchant
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-black/40 text-white text-xs font-bold backdrop-blur-sm border border-white/20">
                  Trust Score: <strong className="text-[#D4F613]">{trustScore}%</strong>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {vendorName}
              </h1>

              <p className="flex items-center gap-1.5 text-slate-100 text-xs sm:text-sm font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                <span className="material-symbols-outlined text-base text-[#D4F613]">location_on</span>
                {vendorAddress}
              </p>
            </div>
          </div>

          {/* Quick Summary Pillar */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3.5 rounded-xl border border-white/20 shadow-inner">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-[#D4F613]">Total Catalog Value</p>
              <p className="text-xl font-mono font-extrabold text-white mt-0.5">
                GH₵ {categoryGroups.reduce((s, g) => s + g.totalValue, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* VIEW 1: CATEGORY GRID BOXES OVERVIEW */}
        {!selectedGroup ? (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 font-serif tracking-tight">
                  Store Categories & Filtering Groups
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a category box below to inspect and filter all items assigned to that department.
                </p>
              </div>

              <div className="text-xs font-bold text-[#4343C7] bg-[#4343C7]/10 px-3.5 py-1.5 rounded-lg">
                {categoryGroups.length} Active Categories &bull; {products.length + auctions.length} Total SKUs
              </div>
            </div>

            {categoryGroups.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3 block">inventory_2</span>
                <p className="text-lg font-bold text-slate-700">No category groups established yet.</p>
                <p className="text-xs text-slate-500 mt-1">Add products to your store to automatically generate category showcases.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryGroups.map((group) => {
                  const sampleItems = group.items.slice(0, 4);
                  const isAuctionGroup = group.type === "auction";

                  return (
                    <div
                      key={group.name}
                      onClick={() => {
                        setSelectedGroup(group.name);
                        setSearchQuery("");
                      }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-[#4343C7] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {/* Intelligent Dynamic Image Mosaic Showcase */}
                        <div className={`grid ${sampleItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 bg-slate-100 rounded-xl p-2 h-48 mb-4 overflow-hidden border border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]`}>
                          {sampleItems.length === 0 && (
                            <div className="bg-slate-200/50 rounded-lg flex items-center justify-center text-slate-400 col-span-2">
                              <span className="material-symbols-outlined text-3xl">image_not_supported</span>
                            </div>
                          )}
                          {sampleItems.map((item, idx) => {
                            const sampleImg = resolveImageUrl(item.imageUrl || item.image);
                            const isThreeItemsFirst = sampleItems.length === 3 && idx === 0;
                            return (
                              <div 
                                key={idx} 
                                className={`bg-white rounded-lg overflow-hidden relative shadow-xs flex items-center justify-center ${isThreeItemsFirst ? 'col-span-2' : ''}`}
                              >
                                {sampleImg ? (
                                  <img
                                    src={sampleImg}
                                    alt={item.name || "item crop"}
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-400 text-2xl">image</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Category Label & Counts */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${isAuctionGroup ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-[#4343C7]/10 text-[#4343C7] font-black"}`}>
                            {group.items.length} {group.items.length === 1 ? "Item" : "Items"}
                          </span>
                          <span className="text-xs font-mono font-black text-slate-600">
                            GH₵ {(group.totalValue / 1000).toFixed(1)}k Value
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-900 font-serif mt-3 group-hover:text-[#4343C7] transition-colors flex items-center justify-between">
                          <span>{group.name}</span>
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-[#4343C7] group-hover:translate-x-1 transition-all">
                            arrow_forward_ios
                          </span>
                        </h3>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Click to filter & manage items</span>
                        <span className="text-[#4343C7] font-extrabold underline group-hover:text-[#1e3a8a]">View Group →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : (
          /* VIEW 2: DRILL-DOWN INTO SELECTED CATEGORY BOX */
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Drill-down Navigation & Search */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#4343C7] hover:bg-[#1e3a8a] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Categories
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 font-serif">{selectedGroup}</h2>
                    <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-bold font-mono">
                      {activeGroupItems.length} listed
                    </span>
                  </div>
                </div>
              </div>

              {/* Group filter search */}
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search within ${selectedGroup}...`}
                  className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4343C7] focus:ring-1 focus:ring-[#4343C7] transition-all"
                />
              </div>
            </div>

            {/* Product Grid inside Category */}
            {activeGroupItems.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-base font-semibold text-slate-600">No items matching "{searchQuery}" inside {selectedGroup}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeGroupItems.map((item) => {
                  const isAuction = item._type === "auction";
                  const title = item.title || item.name || "Untitled Item";
                  const imgUrl = resolveImageUrl(item.imageUrl || item.image);
                  const priceVal = isAuction 
                    ? parseFloat(item.currentHighestBid || item.basePrice || 0) 
                    : parseFloat(item.price || 0);
                  const stockCount = parseInt(item.stockCount || item.stock || 0, 10);

                  return (
                    <div
                      key={`${item._type}-${item.id}`}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="h-52 w-full overflow-hidden relative bg-slate-100 flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 text-[36px]">image</span>
                          )}
                          <div className="absolute top-3 right-3">
                            {isAuction ? (
                              <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] uppercase shadow-md">
                                Live Auction
                              </span>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-md ${stockCount > 5 ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
                                {stockCount} in stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#4343C7] transition-colors line-clamp-1 font-serif">
                            {title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description || "Authentic marketplace item directly verified in repository."}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 mt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isAuction ? "High Bid" : "Unit Price"}
                          </span>
                          <p className="text-lg font-mono font-extrabold text-[#4343C7]">
                            GH₵ {priceVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>

                        <span className="px-3 py-1.5 rounded-lg bg-[#4343C7]/10 text-[#4343C7] font-black text-xs group-hover:bg-[#4343C7] group-hover:text-white transition-colors">
                          View details
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default VendorStorePage;
