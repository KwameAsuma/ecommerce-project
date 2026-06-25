import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";

// Minimalist Icons (Lucide SVG raw strings)
const MenuIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const CartIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const UserIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const SettingsIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const PowerIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>;
const ChevronDownIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

const CustomerLayout = () => {
  const { logout } = useAuth();
  const { filters, updateFilter } = useCatalog();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path || (path === "/catalog" && location.pathname.startsWith("/product"));

  const handlePriceSelect = (range) => {
    updateFilter("priceRange", range);
  };

  const handleRegionSelect = (region) => {
    updateFilter("region", region);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      
      {/* Top Header */}
      <header style={{ 
        backgroundColor: "var(--bg-panel)", 
        padding: "1rem 3rem", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        borderBottom: "1px solid var(--border)",
        position: "sticky", 
        top: 0, 
        zIndex: 50 
      }}>
        
        {/* Left: Hamburger & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          
          {/* Click Toggle Sidebar Menu */}
          <div 
            onClick={() => setNavOpen(!navOpen)}
            style={{ position: "relative", cursor: "pointer", color: "var(--text-primary)" }}
          >
            <MenuIcon />
          </div>

          <h1 onClick={() => navigate("/catalog")} style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            TradeHub
          </h1>
        </div>

        {/* Center: Search & Unified Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", width: "350px" }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={filters.searchQuery || ""}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "20px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", fontSize: "0.85rem", outline: "none", transition: "all 0.2s", color: "var(--text-primary)" }}
            />
          </div>

          {/* Unified Filter Button */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.4rem 0.8rem", borderRadius: "16px", border: "1px solid var(--border)", backgroundColor: "var(--bg-panel)", color: "var(--text-secondary)", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600" }}
            >
              Filter <ChevronDownIcon />
            </button>
            {filterOpen && (
              <div style={{ position: "absolute", top: "120%", right: "0", width: "400px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1.2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 100, display: "flex", gap: "2rem" }}>
                
                {/* Price Options Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Max Price</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {[500, 1000, 5000, 10000, 20000].map(val => (
                      <button 
                        key={`price-${val}`}
                        onClick={() => { handlePriceSelect(val); setFilterOpen(false); }}
                        style={{ textAlign: "left", padding: "0.4rem 0.6rem", border: "none", background: filters.priceRange === val ? "var(--bg-base)" : "transparent", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", color: filters.priceRange === val ? "var(--brand-blue)" : "var(--text-primary)", fontWeight: filters.priceRange === val ? "700" : "500", transition: "all 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-base)"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = filters.priceRange === val ? "var(--bg-base)" : "transparent"}
                      >
                        Up to GH₵ {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: "1px", backgroundColor: "var(--border)" }}></div>

                {/* Region Options Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Region</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {["All Regions", "Greater Accra", "Ashanti Region", "Northern Region", "Western Region"].map(r => (
                      <button 
                        key={r}
                        onClick={() => { handleRegionSelect(r); setFilterOpen(false); }}
                        style={{ textAlign: "left", padding: "0.4rem 0.6rem", border: "none", background: filters.region === r ? "var(--bg-base)" : "transparent", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer", color: filters.region === r ? "var(--brand-blue)" : "var(--text-primary)", fontWeight: filters.region === r ? "700" : "500", transition: "all 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-base)"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = filters.region === r ? "var(--bg-base)" : "transparent"}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right: Minimalist Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ cursor: "pointer", position: "relative", color: "var(--text-secondary)" }} onClick={() => navigate("/checkout")}>
            <CartIcon />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, backgroundColor: "var(--text-primary)", color: "var(--bg-base)", fontSize: "0.6rem", fontWeight: "bold", width: "16px", height: "16px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }}>
                {cartCount}
              </span>
            )}
          </div>
          <div style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => navigate("/profile")}>
            <UserIcon />
          </div>
          <div style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={() => navigate("/settings")}>
            <SettingsIcon />
          </div>
          <div style={{ cursor: "pointer", color: "var(--text-secondary)" }} onClick={handleLogout}>
            <PowerIcon />
          </div>
        </div>
      </header>

      {/* Sidebar Drawer */}
      {navOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100 }} onClick={() => setNavOpen(false)}>
          <div style={{ width: "280px", height: "100%", backgroundColor: "var(--bg-panel)", borderRight: "1px solid var(--border)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase" }}>TradeHub</h2>
              <div onClick={() => setNavOpen(false)} style={{ cursor: "pointer", color: "var(--text-primary)" }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
            </div>
            
            <Link to="/catalog" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "1rem", borderRadius: "8px", textDecoration: "none", backgroundColor: isActive("/catalog") ? "var(--bg-base)" : "transparent", color: isActive("/catalog") ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isActive("/catalog") ? "700" : "500", transition: "all 0.2s" }}>Native Store</Link>
            <Link to="/auctions" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "1rem", borderRadius: "8px", textDecoration: "none", backgroundColor: isActive("/auctions") ? "var(--bg-base)" : "transparent", color: isActive("/auctions") ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isActive("/auctions") ? "700" : "500", transition: "all 0.2s" }}>Auctions</Link>
            <Link to="/merchants" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "1rem", borderRadius: "8px", textDecoration: "none", backgroundColor: isActive("/merchants") ? "var(--bg-base)" : "transparent", color: isActive("/merchants") ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isActive("/merchants") ? "700" : "500", transition: "all 0.2s" }}>Verified Merchants</Link>
            <Link to="/escrow" onClick={() => setNavOpen(false)} style={{ display: "block", padding: "1rem", borderRadius: "8px", textDecoration: "none", backgroundColor: isActive("/escrow") ? "var(--bg-base)" : "transparent", color: isActive("/escrow") ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isActive("/escrow") ? "700" : "500", transition: "all 0.2s" }}>Escrow Center</Link>
          </div>
        </div>
      )}

      {/* Main Full-Width Content Area */}
      <main style={{ flexGrow: 1, padding: "3rem" }} onClick={() => setFilterOpen(false)}>
        <Outlet />
      </main>
      
    </div>
  );
};

export default CustomerLayout;
