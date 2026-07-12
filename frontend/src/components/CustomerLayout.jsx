import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { filters, updateFilter } = useCatalog();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force Admin to stay in Admin Ecosystem
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'ADMIN')) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
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
      <style>{`
        @keyframes fadeRoute {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .custom-tooltip-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .custom-tooltip {
          visibility: hidden;
          opacity: 0;
          background-color: var(--bg-panel);
          color: var(--text-primary);
          text-align: center;
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
          position: absolute;
          z-index: 100;
          top: 130%;
          left: 50%;
          transform: translateX(-50%) translateY(5px);
          white-space: nowrap;
          font-size: 0.75rem;
          font-weight: 700;
          transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
        }
        
        /* Little triangle pointer for the tooltip */
        .custom-tooltip::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent transparent var(--border) transparent;
        }

        .custom-tooltip-container:hover .custom-tooltip {
          visibility: visible;
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      `}</style>
      
      {/* Sticky Header Container */}
      <div style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 50, 
        backgroundColor: "var(--bg-panel)",
        boxShadow: scrolled ? "0 10px 30px -10px rgba(0,0,0,0.15)" : "none",
        transition: "box-shadow 0.3s ease"
      }}>
        {/* Top Header */}
        <header className="customer-header" style={{ 
          padding: "0.5rem 2rem", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
        
        {/* Left: Hamburger & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          
          {/* Click Toggle Sidebar Menu */}
          <div 
            onClick={() => setNavOpen(!navOpen)}
            style={{ position: "relative", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center" }}
          >
            <span className="material-symbols-outlined text-[28px]">menu</span>
          </div>

          <h1 onClick={() => navigate("/catalog")} style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            TradeHub
          </h1>
        </div>

        {/* Center: Search & Unified Filter */}
        <div className="search-container" style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 300px", maxWidth: "600px" }}>
          <div style={{ position: "relative", flexGrow: 1 }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "20px" }}>search</span>
            <input 
              type="text" 
              placeholder="Search premium goods..." 
              value={filters.searchQuery || ""}
              onChange={(e) => updateFilter("searchQuery", e.target.value)}
              style={{ width: "100%", padding: "0.7rem 1rem 0.7rem 2.8rem", borderRadius: "999px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", fontSize: "0.9rem", outline: "none", transition: "all 0.2s", color: "var(--text-primary)" }}
            />
          </div>

          {/* Unified Filter Button */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "999px", border: "1px solid var(--border)", backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}
              onMouseOver={e => e.currentTarget.style.borderColor = "var(--brand-blue)"}
              onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              Filter <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            {filterOpen && (
              <div style={{ position: "absolute", top: "120%", right: "0", width: "450px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", zIndex: 100, display: "flex", gap: "2rem" }}>
                
                {/* Price Options Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Max Price</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {[500, 1000, 5000, 10000, 20000].map(val => (
                      <button 
                        key={`price-${val}`}
                        onClick={() => { handlePriceSelect(val); setFilterOpen(false); }}
                        style={{ textAlign: "left", padding: "0.5rem 0.8rem", border: "none", background: filters.priceRange === val ? "var(--brand-blue)" : "transparent", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", color: filters.priceRange === val ? "white" : "var(--text-primary)", fontWeight: filters.priceRange === val ? "700" : "500", transition: "all 0.2s" }}
                        onMouseOver={e => { if(filters.priceRange !== val) e.currentTarget.style.backgroundColor = "var(--bg-base)"}}
                        onMouseOut={e => { if(filters.priceRange !== val) e.currentTarget.style.backgroundColor = "transparent"}}
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
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Region</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {["All Regions", "Greater Accra", "Ashanti Region", "Northern Region", "Western Region"].map(r => (
                      <button 
                        key={r}
                        onClick={() => { handleRegionSelect(r); setFilterOpen(false); }}
                        style={{ textAlign: "left", padding: "0.5rem 0.8rem", border: "none", background: filters.region === r ? "var(--brand-blue)" : "transparent", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", color: filters.region === r ? "white" : "var(--text-primary)", fontWeight: filters.region === r ? "700" : "500", transition: "all 0.2s" }}
                        onMouseOver={e => { if(filters.region !== r) e.currentTarget.style.backgroundColor = "var(--bg-base)"}}
                        onMouseOut={e => { if(filters.region !== r) e.currentTarget.style.backgroundColor = "transparent"}}
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

        {/* Right: Icons / Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          
          <div className="custom-tooltip-container" style={{ cursor: "pointer", position: "relative", color: "var(--text-secondary)", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--brand-blue)"} onMouseOut={e=>e.currentTarget.style.color="var(--text-secondary)"} onClick={() => navigate("/checkout")}>
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -8, backgroundColor: "var(--brand-gold)", color: "#000", fontSize: "0.7rem", fontWeight: "800", width: "18px", height: "18px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }}>
                {cartCount}
              </span>
            )}
            <span className="custom-tooltip">View Cart</span>
          </div>
          
          {user ? (
            <>
              <div className="custom-tooltip-container" style={{ cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--brand-blue)"} onMouseOut={e=>e.currentTarget.style.color="var(--text-secondary)"} onClick={() => navigate("/profile")}>
                <span className="material-symbols-outlined text-[24px]">account_circle</span>
                <span className="custom-tooltip">User Profile</span>
              </div>
              
              <div className="custom-tooltip-container" style={{ cursor: "pointer", color: "var(--text-error)", display: "flex", alignItems: "center", transition: "opacity 0.2s" }} onMouseOver={e=>e.currentTarget.style.opacity="0.8"} onMouseOut={e=>e.currentTarget.style.opacity="1"} onClick={handleLogout}>
                <span className="material-symbols-outlined text-[24px]">logout</span>
                <span className="custom-tooltip">Log Out</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button onClick={() => navigate("/login")} style={{ backgroundColor: "transparent", border: "none", color: "var(--text-secondary)", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Login</button>
              <button onClick={() => navigate("/register")} style={{ backgroundColor: "var(--brand-blue)", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Sign Up</button>
            </div>
          )}
          
        </div>
        </header>

        {/* Secondary Navigation (Ecosystem Tabs) */}
        <div className="secondary-nav" style={{ padding: "0 2rem", display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <button 
            onClick={() => navigate("/catalog")}
            style={{ 
              padding: "0.3rem 0", 
              border: "none", 
              backgroundColor: "transparent", 
              color: isActive("/catalog") ? "var(--brand-blue)" : "var(--text-secondary)", 
              fontWeight: isActive("/catalog") ? "800" : "600", 
              fontSize: "0.95rem", 
              cursor: "pointer", 
              borderBottom: isActive("/catalog") ? "3px solid var(--brand-blue)" : "3px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive("/catalog") ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
            Native Store
          </button>
          <button 
            onClick={() => navigate("/auctions")}
            style={{ 
              padding: "0.3rem 0", 
              border: "none", 
              backgroundColor: "transparent", 
              color: isActive("/auctions") ? "var(--brand-gold)" : "var(--text-secondary)", 
              fontWeight: isActive("/auctions") ? "800" : "600", 
              fontSize: "0.95rem", 
              cursor: "pointer", 
              borderBottom: isActive("/auctions") ? "3px solid var(--brand-gold)" : "3px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive("/auctions") ? "'FILL' 1" : "'FILL' 0" }}>flight_takeoff</span>
            Consolidated Imports
          </button>
        </div>
      </div>
    </div>

      {/* Sidebar Drawer - Premium Redesign */}
      {navOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", zIndex: 100, transition: "all 0.3s ease" }} onClick={() => setNavOpen(false)}>
          <div style={{ width: "320px", height: "100%", backgroundColor: "var(--bg-panel)", borderRight: "1px solid var(--border)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "20px 0 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, letterSpacing: "-0.5px", textTransform: "uppercase" }}>TradeHub</h2>
              <div onClick={() => setNavOpen(false)} style={{ cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "0.5rem", borderRadius: "50%", backgroundColor: "var(--bg-base)" }}>
                <span className="material-symbols-outlined">close</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link to="/catalog" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/catalog") ? "var(--brand-blue)" : "transparent", color: isActive("/catalog") ? "#fff" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/catalog")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/catalog")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/catalog") ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
                Native Store
              </Link>
              <Link to="/auctions" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/auctions") ? "var(--brand-gold)" : "transparent", color: isActive("/auctions") ? "#000" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/auctions")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/auctions")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/auctions") ? "'FILL' 1" : "'FILL' 0" }}>gavel</span>
                Auctions
              </Link>
              <Link to="/merchants" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/merchants") ? "var(--brand-blue)" : "transparent", color: isActive("/merchants") ? "#fff" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/merchants")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/merchants")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/merchants") ? "'FILL' 1" : "'FILL' 0" }}>verified_user</span>
                Verified Merchants
              </Link>
              <Link to="/escrow" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/escrow") ? "var(--brand-blue)" : "transparent", color: isActive("/escrow") ? "#fff" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/escrow")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/escrow")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/escrow") ? "'FILL' 1" : "'FILL' 0" }}>shield</span>
                Escrow Center
              </Link>
            </div>

            {user && (
              <div style={{ marginTop: "auto", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--brand-blue)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", fontSize: "1.2rem" }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem", textTransform: "capitalize" }}>{user.name}</p>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "capitalize" }}>{user.role}</p>
                </div>
                <button onClick={handleLogout} className="material-symbols-outlined" style={{ marginLeft: "auto", cursor: "pointer", color: "var(--danger)", border: "none", backgroundColor: "transparent" }} title="Sign Out">logout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Full-Width Content Area */}
      <main className="main-content" style={{ flexGrow: 1, padding: "1.5rem 2rem" }} onClick={() => setFilterOpen(false)}>
        <div key={location.pathname} style={{ animation: "fadeRoute 0.4s ease-out" }}>
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default CustomerLayout;
