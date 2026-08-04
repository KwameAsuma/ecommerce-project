import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const resolveImageUrl = (url) => {
  if (!url) return null;
  const firstUrl = typeof url === "string" ? url.split(",")[0].trim() : url;
  return firstUrl; // Gracefully handle both absolute Unsplash images and relative Ngrok/Multer uploads
};

const MerchantLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPinned, setIsPinned] = useState(true); // Default pinned for clean layout stability
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get("/orders/vendor").then(res => {
        setOrders(res.data?.orders || []);
      }).catch(err => console.error("Failed to fetch merchant orders for search:", err));
    }
  }, [user]);

  const getOrderSuggestions = () => {
    if (!localSearchQuery.trim()) {
      return orders.slice(0, 3);
    }
    const query = localSearchQuery.toLowerCase();
    
    let matches = orders.filter(o => 
      o.id.toString().startsWith(query) || 
      (o.product && o.product.name && o.product.name.toLowerCase().startsWith(query)) ||
      (o.customer && o.customer.name && o.customer.name.toLowerCase().startsWith(query))
    );
    
    if (matches.length === 0) {
      matches = orders.filter(o => 
        o.id.toString().includes(query) || 
        (o.product && o.product.name && o.product.name.toLowerCase().includes(query)) ||
        (o.customer && o.customer.name && o.customer.name.toLowerCase().includes(query))
      );
    }
    return matches.slice(0, 5);
  };
  const suggestions = getOrderSuggestions();

  const hoverTimeoutRef = useRef(null);
  const isExpanded = isPinned || isHovered;

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out from the Merchant Platform?")) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-slate-50 text-slate-800 font-sans h-screen overflow-hidden flex selection:bg-[#4343C7] selection:text-white">
      
      {/* ─── Side Navbar (Apple Liquid Glass & Catalog Blue) ─── */}
      <aside 
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col h-full ${isExpanded ? 'w-[270px]' : 'w-[84px]'} bg-white border-r border-slate-200 p-4 flex-shrink-0 z-30 transition-all duration-300 shadow-[2px_0_20px_rgb(0,0,0,0.02)]`}
      >
        {/* ─── Top Brand Anchor (BediDwa Logo & Portal Header) ─── */}
        <div className="h-16 flex items-center px-2 mb-4 border-b border-slate-100">
          <Link 
            to="/merchant/finances"
            onClick={() => setIsPinned(true)}
            className={`flex items-center gap-3 cursor-pointer group w-full no-underline ${!isExpanded && 'justify-center'}`}
            title="Go to Merchant Dashboard Home"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-[#4343C7] to-[#5151df] rounded-xl flex items-center justify-center p-1.5 flex-shrink-0 shadow-lg shadow-[#4343C7]/25 border border-white/30 group-hover:scale-105 transition-all duration-300">
              <img 
                src="/app_icon.png" 
                alt="BediDwa" 
                className="w-full h-full object-contain pointer-events-none filter drop-shadow-sm"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-extrabold text-lg text-[#4343C7] tracking-tight leading-none flex items-baseline group-hover:text-[#3131a8] transition-colors">
                  Bedi<span className="text-[#D4F613] drop-shadow-sm">Dwa</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-1 group-hover:text-slate-500 transition-colors">
                  Merchant Suite
                </span>
              </div>
            )}
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          {[
            { path: "/merchant/finances", label: "Finances & Hub", icon: "bar_chart" },
            { path: "/merchant/inventory", label: "Inventory Directory", icon: "inventory_2" },
            { path: "/merchant/store", label: "My Storefront", icon: "storefront" },
            { path: "/merchant/auctions", label: "Live Auctions", icon: "gavel" },
            { path: "/merchant/escrow", label: "Escrow Payouts", icon: "payments" },
          ].map(link => {
            const active = isActive(link.path) || (link.path === "/merchant/finances" && location.pathname === "/merchant");
            return (
              <Link 
                key={link.path}
                to={link.path} 
                onMouseEnter={handleMouseEnter}
                onClick={() => setIsPinned(true)}
                className={`flex items-center ${isExpanded ? 'gap-3.5 px-5' : 'justify-center'} py-3.5 rounded-2xl text-[15px] transition-all whitespace-nowrap overflow-hidden duration-200 ${
                  active 
                    ? 'bg-[#4343C7] text-white font-black shadow-md shadow-[#4343C7]/25' 
                    : 'text-slate-700 font-bold hover:bg-[#4343C7]/10 hover:text-[#4343C7]'
                }`} 
                title={!isExpanded ? link.label : undefined}
              >
                <span className={`material-symbols-outlined text-[22px] ${active ? 'text-[#D4F613]' : ''}`}>{link.icon}</span>
                {isExpanded && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* Add New Product */}
        <button 
          onMouseEnter={handleMouseEnter}
          onClick={() => {
            setIsPinned(true);
            navigate("/merchant/products/new");
          }} 
          className={`mt-4 w-full bg-[#4343C7] hover:bg-[#3232a8] text-white py-4 px-5 rounded-2xl text-[14px] font-black uppercase tracking-wider flex items-center justify-center ${isExpanded ? 'gap-2.5' : ''} shadow-xl shadow-[#4343C7]/35 border border-[#D4F613]/60 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap overflow-hidden cursor-pointer group`} 
          title={!isExpanded ? "Add New Product" : undefined}
        >
          <span className="material-symbols-outlined text-[24px] font-black text-[#D4F613] group-hover:rotate-90 transition-transform duration-300">add_circle</span>
          {isExpanded && <span>Add New Product</span>}
        </button>
        
        <div className="mt-4 pt-4 border-t border-slate-100 overflow-hidden">
          <button 
            onMouseEnter={handleMouseEnter}
            onClick={handleLogout} 
            className={`w-full flex items-center ${isExpanded ? 'gap-3 px-5' : 'justify-center'} py-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl text-[14px] font-bold transition-all whitespace-nowrap overflow-hidden cursor-pointer`} 
            title={!isExpanded ? "Sign Out" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── Right Column: Navbar + Scrollable Content ─── */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        
        {/* ─── Top Navbar (Apple Liquid Glass Finish) ─── */}
        <header className="bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 w-full flex-shrink-0 flex justify-between items-center px-6 md:px-8 z-40 shadow-[0_2px_15px_rgb(0,0,0,0.02)]" style={{ height: "72px" }}>
        <div className="flex items-center gap-4">
          {/* Apple Liquid Glass Storefront Capsule */}
          <div 
            onClick={() => navigate("/merchant/store")}
            className="flex items-center gap-3 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/80 rounded-full pl-2 pr-4 py-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 cursor-pointer group"
            title="View Your Public Storefront"
          >
            <div className="w-7 h-7 rounded-full bg-[#4343C7] text-[#D4F613] font-black text-xs flex items-center justify-center overflow-hidden border border-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              {user?.avatarUrl ? (
                <img src={resolveImageUrl(user.avatarUrl)} alt="Store" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "S"
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-xs sm:text-sm text-slate-800 tracking-tight truncate max-w-[150px] sm:max-w-[220px] group-hover:text-[#4343C7] transition-colors">
                {user?.name || "Verified Storefront"}
              </span>
              <span className="w-[1px] h-3.5 bg-slate-300 hidden sm:block"></span>
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Seller
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Spotlight Quick Search */}
          <div className="hidden md:flex items-center bg-slate-100/90 border border-slate-200/80 rounded-full px-4 py-2 w-72 focus-within:w-96 focus-within:border-[#4343C7]/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4343C7]/10 focus-within:shadow-md transition-all duration-300 relative shadow-2xs">
            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
            <input 
              className="bg-transparent border-none focus:ring-0 text-xs text-slate-800 w-full ml-2 placeholder:text-slate-400 outline-none font-semibold" 
              placeholder="Search store orders or clients..." 
              type="text" 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {isSearchFocused && (
              <div className="absolute top-[120%] left-0 w-full bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {!localSearchQuery.trim() && <div className="px-4 py-2.5 text-[10px] font-black text-[#4343C7] uppercase tracking-wider border-b border-slate-100 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">history</span> Recent Orders</div>}
                
                {localSearchQuery.trim() && suggestions.length === 0 && (
                  <div className="px-4 py-6 text-xs text-slate-500 text-center font-medium">
                    No orders matching that code in repository.
                  </div>
                )}

                {suggestions.map((order, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setLocalSearchQuery("");
                      setIsSearchFocused(false);
                      navigate("/merchant");
                    }}
                    className="px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100/80 last:border-b-0"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      {localSearchQuery.trim() ? "search" : "history"}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-slate-900">Order #{order.id}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                        {order.product?.name || "Product"} • {order.customer?.name || "Customer"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            
            {/* Notifications Toggle */}
            <button 
              onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
              className="relative material-symbols-outlined text-slate-600 hover:text-[#4343C7] hover:bg-slate-100/80 transition-all p-2 rounded-full cursor-pointer w-10 h-10 flex items-center justify-center" 
              title="Notifications"
            >
              notifications
              <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute top-14 right-12 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Notifications</span>
                  <button className="text-[#4343C7] text-[11px] hover:underline font-bold">Mark all read</button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <div className="px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 border-l-[#4343C7]">
                    <p className="text-xs font-extrabold text-slate-900">New escrow verification</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Your catalog inventory matches have been verified by BediDwa authority.</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate("/merchant/support")} 
              className="material-symbols-outlined text-slate-600 hover:text-[#4343C7] hover:bg-slate-100/80 transition-all p-2 rounded-full cursor-pointer w-10 h-10 flex items-center justify-center" 
              title="Merchant Support & Help Desk"
            >
              help
            </button>
            
            {/* Profile Toggle Avatar */}
            <div 
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4343C7] to-[#2b2b96] flex items-center justify-center overflow-hidden border-2 border-white ring-2 ring-slate-200 hover:ring-[#4343C7] cursor-pointer hover:scale-105 transition-all shadow-md ml-1"
            >
              {user?.avatarUrl ? (
                <img className="w-full h-full object-cover pointer-events-none" alt="Profile" src={resolveImageUrl(user.avatarUrl)} />
              ) : (
                <span className="font-black text-xs text-[#D4F613] font-serif">{user?.name ? user.name.charAt(0).toUpperCase() : "M"}</span>
              )}
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-14 right-0 w-60 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                  <p className="font-black text-sm text-slate-900 truncate">{user?.name || "BediDwa Vendor"}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">{user?.email || "seller@bedidwa.com"}</p>
                </div>
                <div className="py-2">
                  <button onClick={() => { setIsProfileOpen(false); navigate("/merchant/profile"); }} className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer">
                    <span className="material-symbols-outlined text-base text-[#4343C7]">person</span> My Personal Profile
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); navigate("/merchant/settings"); }} className="w-full text-left px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer">
                    <span className="material-symbols-outlined text-base text-[#4343C7]">manage_accounts</span> Store Configuration
                  </button>
                  <div className="h-px bg-slate-100 my-1.5" />
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3 cursor-pointer">
                    <span className="material-symbols-outlined text-base">logout</span> Sign Out of Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </header>

        {/* ─── Main Content Area ─── */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden relative p-6 lg:p-8"
          onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(false); }}
        >
          <Outlet />
        </main>
      </div>

      {/* ─── Mobile Nav Bar ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 h-16 flex items-center justify-around px-4 z-50 shadow-lg">
        <Link to="/merchant" className={`flex flex-col items-center gap-1 ${isActive('/merchant') ? 'text-[#4343C7]' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/merchant/inventory" className={`flex flex-col items-center gap-1 ${isActive('/merchant/inventory') ? 'text-[#4343C7]' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">inventory_2</span>
          <span className="text-[10px] font-bold">Items</span>
        </Link>
        <button onClick={() => navigate("/merchant/products/new")} className="flex flex-col items-center gap-1 text-white">
          <div className="w-11 h-11 bg-[#4343C7] rounded-full flex items-center justify-center -mt-6 shadow-lg border-2 border-[#D4F613]">
            <span className="material-symbols-outlined text-xl text-[#D4F613]">add</span>
          </div>
          <span className="text-[10px] font-bold text-[#4343C7]">Sell</span>
        </button>
        <Link to="/merchant/store" className={`flex flex-col items-center gap-1 ${isActive('/merchant/store') ? 'text-[#4343C7]' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">storefront</span>
          <span className="text-[10px] font-bold">Store</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-500 hover:text-rose-600">
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="text-[10px] font-bold">Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default MerchantLayout;
