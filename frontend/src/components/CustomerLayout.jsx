import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { resolveImageUrl } from "../utils/imageUtils";
import AddToCartModal from "./AddToCartModal";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { filters, updateFilter, allProducts, smartMatch } = useCatalog();

  if (user && ['merchant', 'MERCHANT', 'vendor', 'VENDOR'].includes(user.role)) {
    return <Navigate to="/merchant" replace />;
  }
  
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery || "");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      return Array.isArray(saved) ? saved.slice(0, 2) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (query) => {
    if (!query || !query.trim()) return;
    const q = query.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== q.toLowerCase());
      const updated = [q, ...filtered].slice(0, 2);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    setLocalSearchQuery(filters.searchQuery || "");
  }, [filters.searchQuery]);

  const getAutocompleteSuggestions = () => {
    if (!localSearchQuery.trim()) {
      return ["Refurbished Electronics", "Shea Butter", "Kente", "Organic Honey"];
    }
    if (!allProducts) return [];
    
    const query = localSearchQuery.toLowerCase().trim();
    
    // Strictly find matching items by smartMatch or direct name check
    const matches = allProducts.filter(p => 
      typeof smartMatch === 'function' ? smartMatch(p, query) : p.name.toLowerCase().includes(query)
    );
    
    const uniqueMatches = [];
    const seen = new Set();
    for (const match of matches) {
      if (!seen.has(match.name)) {
        seen.add(match.name);
        uniqueMatches.push(match.name);
      }
      if (uniqueMatches.length >= 6) break;
    }
    return uniqueMatches;
  };

  const suggestions = getAutocompleteSuggestions();
  const { cartCount, cartItems, setAddedItemModal } = useCart();
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterOpen && !e.target.closest('.filter-popup-container')) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);

  // Force Admin and Merchant accounts to stay inside their dedicated portals
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'merchant' || user.role === 'MERCHANT' || user.role === 'vendor' || user.role === 'VENDOR') {
        navigate('/merchant', { replace: true });
      }
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

  const isActive = (path) => location.pathname === path || (path === "/" && location.pathname.startsWith("/product"));

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
      
      {/* Header Container (Static on Product Details page, Sticky elsewhere) */}
      <div style={{ 
        position: location.pathname.startsWith("/product/") ? "static" : "sticky",
        top: 0,
        zIndex: 50, 
        backgroundColor: "#4343C7",
        boxShadow: scrolled ? "0 10px 30px -10px rgba(0,0,0,0.25)" : "0 4px 20px rgba(67, 67, 199, 0.2)",
        transition: "all 0.3s ease",
        color: "#ffffff"
      }}>
        {/* Top Header */}
        <header className="customer-header" style={{ 
          padding: "0.7rem 1.5%", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.2rem",
          minHeight: "70px"
        }}>
        
        {/* Left: Hamburger & Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          
          {/* Click Toggle Sidebar Menu */}
          <div 
            onClick={() => setNavOpen(!navOpen)}
            style={{ position: "relative", cursor: "pointer", color: "#ffffff", display: "flex", alignItems: "center", transition: "color 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.color="var(--brand-accent)"}
            onMouseOut={e=>e.currentTarget.style.color="#ffffff"}
          >
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </div>

          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <img 
              src="/app_icon.png" 
              alt="BediDwa Logo Icon" 
              style={{ width: "40px", height: "40px", borderRadius: "10px", objectFit: "contain", backgroundColor: "rgba(255,255,255,0.1)", padding: "2px", border: "1.5px solid #D4F613", boxShadow: "0 0 15px rgba(212, 246, 19, 0.45)" }} 
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.35rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.5px", lineHeight: "1" }}>Bedi<span style={{ color: "#D4F613" }}>Dwa</span></span>
            </div>
          </Link>
        </div>

        {/* Dominant Mode Switcher Capsule */}
        <div style={{
          display: "flex",
          backgroundColor: "rgba(0, 0, 0, 0.22)",
          padding: "4px",
          borderRadius: "999px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.18)",
          margin: "0 0.5rem"
        }} className="max-md:order-3 max-md:w-full max-md:justify-center">
          <button 
            onClick={() => navigate("/")}
            style={{ 
              padding: "0.55rem 1.5rem", 
              border: "none", 
              borderRadius: "999px",
              backgroundColor: isActive("/") ? "#D4F613" : "transparent", 
              color: isActive("/") ? "#000000" : "rgba(255,255,255,0.88)", 
              fontWeight: isActive("/") ? "900" : "700", 
              fontSize: "0.92rem", 
              cursor: "pointer", 
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: isActive("/") ? "0 4px 15px rgba(212, 246, 19, 0.35)" : "none",
              letterSpacing: "-0.2px"
            }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive("/") ? "'FILL' 1" : "'FILL' 0", color: isActive("/") ? "#000000" : "rgba(255,255,255,0.85)" }}>storefront</span>
            Native Store
          </button>
          <button 
            onClick={() => navigate("/auctions")}
            style={{ 
              padding: "0.55rem 1.5rem", 
              border: "none", 
              borderRadius: "999px",
              backgroundColor: isActive("/auctions") ? "#D4F613" : "transparent", 
              color: isActive("/auctions") ? "#000000" : "rgba(255,255,255,0.88)", 
              fontWeight: isActive("/auctions") ? "900" : "700", 
              fontSize: "0.92rem", 
              cursor: "pointer", 
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: isActive("/auctions") ? "0 4px 15px rgba(212, 246, 19, 0.35)" : "none",
              letterSpacing: "-0.2px"
            }}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive("/auctions") ? "'FILL' 1" : "'FILL' 0", color: isActive("/auctions") ? "#000000" : "rgba(255,255,255,0.85)" }}>flight_takeoff</span>
            Consolidated Imports
          </button>
        </div>

        {/* Center: Search & Unified Filter */}
        <div className="search-container" style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: "1 1 250px", maxWidth: "480px" }}>
          <div style={{ position: "relative", flexGrow: 1 }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255, 255, 255, 0.8)", fontSize: "20px" }}>search</span>
            <input 
              type="text" 
              placeholder="Search premium goods..." 
              value={localSearchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearchQuery(val);
                if (val === "") {
                  updateFilter("searchQuery", "");
                }
              }}
              onFocus={() => { setIsSearchFocused(true); setFilterOpen(false); }}
              onClick={() => setFilterOpen(false)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilter("searchQuery", localSearchQuery.trim());
                  addRecentSearch(localSearchQuery.trim());
                  setIsSearchFocused(false);
                  if (location.pathname !== "/" && location.pathname !== "/auctions") {
                    navigate("/");
                  }
                }
              }}
              style={{ width: "100%", padding: "0.7rem 2.6rem 0.7rem 2.8rem", borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.25)", backgroundColor: "rgba(255, 255, 255, 0.15)", fontSize: "0.95rem", outline: "none", transition: "all 0.2s", color: "#ffffff" }}
            />
            {localSearchQuery && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocalSearchQuery("");
                  updateFilter("searchQuery", "");
                  setIsSearchFocused(false);
                  if (location.pathname === "/" || location.pathname === "/auctions") {
                    // Stay on current page, refreshed cleanly
                  } else {
                    navigate("/");
                  }
                }}
                style={{
                  position: "absolute",
                  right: "0.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "0.2rem"
                }}
                title="Clear Search"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            )}
            {isSearchFocused && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", marginTop: "0.5rem", backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}>
                {!localSearchQuery.trim() && recentSearches.length > 0 && (
                  <div>
                    <div style={{ padding: "0.6rem 1rem", fontSize: "0.75rem", fontWeight: "800", color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-base)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span className="material-symbols-outlined text-[16px]">history</span> Recent Searches
                    </div>
                    {recentSearches.map((rec, rIdx) => (
                      <div
                        key={`rec-${rIdx}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setLocalSearchQuery(rec);
                          updateFilter("searchQuery", rec);
                          addRecentSearch(rec);
                          setIsSearchFocused(false);
                          if (location.pathname !== "/" && location.pathname !== "/auctions") {
                            navigate("/");
                          }
                        }}
                        style={{ padding: "0.75rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.6rem", borderBottom: "1px solid var(--border)", fontWeight: "700", fontSize: "0.92rem", color: "var(--text-primary)", transition: "background-color 0.15s" }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-base)"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--text-muted)" }}>schedule</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {!localSearchQuery.trim() && <div style={{ padding: "0.7rem 1rem", fontSize: "0.78rem", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.4rem" }}><span className="material-symbols-outlined text-[16px]">trending_up</span> Trending Searches</div>}
                
                {localSearchQuery.trim() && suggestions.length === 0 && (
                  <div style={{ padding: "1.5rem 1rem", color: "var(--text-secondary)", fontSize: "0.95rem", textAlign: "center" }}>
                    Oops, we do not have the item you are looking for at the moment.
                  </div>
                )}
                
                {suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLocalSearchQuery(suggestion);
                      updateFilter("searchQuery", suggestion);
                      addRecentSearch(suggestion);
                      setIsSearchFocused(false);
                      navigate("/");
                    }}
                    style={{ padding: "0.8rem 1rem", display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--text-primary)", fontSize: "0.9rem", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid var(--bg-base)" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-base)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <span className="material-symbols-outlined" style={{ color: "var(--text-muted)", fontSize: "18px" }}>
                      {localSearchQuery.trim() ? "search" : "trending_up"}
                    </span>
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unified Filter Button */}
          <div className="filter-popup-container" style={{ position: "relative" }}>
            <button 
              onClick={() => setFilterOpen(!filterOpen)} 
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.1rem", borderRadius: "999px", border: "none", backgroundColor: "var(--brand-accent)", color: "#000000", fontSize: "0.85rem", cursor: "pointer", fontWeight: "800", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(212, 246, 19, 0.3)" }}
              onMouseOver={e => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseOut={e => e.currentTarget.style.filter = "brightness(1)"}
            >
              Filter <span className="material-symbols-outlined text-[20px]">expand_more</span>
            </button>
            {filterOpen && (
              <div style={{ position: "absolute", top: "120%", right: "0", width: "450px", backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", zIndex: 100, display: "flex", gap: "2rem", textAlign: "left" }}>
                
                {/* Price Options Column */}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>Max Price</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {["All Prices", 500, 1000, 5000, 10000, 20000].map(val => (
                      <button 
                        key={`price-${val}`}
                        onClick={() => { handlePriceSelect(val); setFilterOpen(false); }}
                        style={{ textAlign: "left", padding: "0.5rem 0.8rem", border: "none", background: filters.priceRange === val ? "var(--brand-primary)" : "transparent", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", color: filters.priceRange === val ? "white" : "var(--text-primary)", fontWeight: filters.priceRange === val ? "700" : "500", transition: "all 0.2s" }}
                        onMouseOver={e => { if(filters.priceRange !== val) e.currentTarget.style.backgroundColor = "var(--bg-base)"}}
                        onMouseOut={e => { if(filters.priceRange !== val) e.currentTarget.style.backgroundColor = "transparent"}}
                      >
                        {val === "All Prices" ? "All Prices" : `Up to GH₵ ${val.toLocaleString()}`}
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
                        style={{ textAlign: "left", padding: "0.5rem 0.8rem", border: "none", background: filters.region === r ? "var(--brand-primary)" : "transparent", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer", color: filters.region === r ? "white" : "var(--text-primary)", fontWeight: filters.region === r ? "700" : "500", transition: "all 0.2s" }}
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
        </div>        {/* Right: Icons / Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div 
              className="custom-tooltip-container" 
              style={{ cursor: "pointer", position: "relative", color: "#ffffff", display: "flex", alignItems: "center", transition: "color 0.2s" }} 
              onMouseOver={e=>e.currentTarget.style.color="var(--brand-accent)"} 
              onMouseOut={e=>e.currentTarget.style.color="#ffffff"} 
              onClick={(e) => {
                e.stopPropagation();
                if (cartItems && cartItems.length > 0) {
                  const latestItem = cartItems[cartItems.length - 1];
                  setAddedItemModal({ ...latestItem, isCartView: true });
                } else {
                  setAddedItemModal({ isEmpty: true });
                }
              }}
            >
              <span className="material-symbols-outlined text-[26px]">shopping_cart</span>
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -6, right: -10, backgroundColor: "var(--brand-accent)", color: "#000000", fontSize: "0.72rem", fontWeight: "900", width: "19px", height: "19px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%", boxShadow: "0 2px 6px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
                  {cartCount}
                </span>
              )}
              <span className="custom-tooltip" style={{ pointerEvents: "none" }}>{user ? "View Cart" : "View Cart"}</span>
            </div>
          
          {user ? (
            <>
              <div className="custom-tooltip-container" style={{ cursor: "pointer", color: "#ffffff", display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--brand-accent)"} onMouseOut={e=>e.currentTarget.style.color="#ffffff"} onClick={() => navigate("/profile")}>
                <span className="material-symbols-outlined text-[26px]">account_circle</span>
                <span className="custom-tooltip">User Profile</span>
              </div>
              
              <div className="custom-tooltip-container" style={{ cursor: "pointer", color: "var(--text-error)", display: "flex", alignItems: "center", transition: "opacity 0.2s" }} onMouseOver={e=>e.currentTarget.style.opacity="0.8"} onMouseOut={e=>e.currentTarget.style.opacity="1"} onClick={handleLogout}>
                <span className="material-symbols-outlined text-[24px]">logout</span>
                <span className="custom-tooltip">Log Out</span>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button onClick={() => navigate("/login")} style={{ backgroundColor: "transparent", border: "none", color: "#ffffff", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color="var(--brand-accent)"} onMouseOut={e=>e.currentTarget.style.color="#ffffff"}>Login</button>
              <button onClick={() => navigate("/register")} style={{ backgroundColor: "var(--brand-accent)", color: "#000000", border: "none", padding: "0.5rem 1.2rem", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(212, 246, 19, 0.3)" }} onMouseOver={e=>e.currentTarget.style.filter="brightness(1.1)"} onMouseOut={e=>e.currentTarget.style.filter="brightness(1)"}>Sign Up</button>
            </div>
          )}
          
        </div>
        </header>
      </div>

      {/* Sidebar Drawer - Premium Redesign */}
      {navOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", zIndex: 100, transition: "all 0.3s ease" }} onClick={() => setNavOpen(false)}>
          <div style={{ width: "320px", height: "100%", backgroundColor: "var(--bg-panel)", borderRight: "1px solid var(--border)", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "20px 0 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <Link to="/" onClick={() => setNavOpen(false)} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/app_icon.png" alt="BediDwa Logo" style={{ width: "34px", height: "34px", borderRadius: "8px", objectFit: "contain" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-primary)", margin: 0, cursor: "pointer", letterSpacing: "-0.5px", textTransform: "uppercase" }}>BediDwa</h2>
              </Link>
              <div onClick={() => setNavOpen(false)} style={{ cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "0.5rem", borderRadius: "50%", backgroundColor: "var(--bg-base)" }}>
                <span className="material-symbols-outlined">close</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link to="/" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/") ? "var(--brand-primary)" : "transparent", color: isActive("/") ? "#fff" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/") ? "'FILL' 1" : "'FILL' 0" }}>storefront</span>
                Native Store
              </Link>
              <Link to="/auctions" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/auctions") ? "var(--brand-accent)" : "transparent", color: isActive("/auctions") ? "#000" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/auctions")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/auctions")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/auctions") ? "'FILL' 1" : "'FILL' 0" }}>gavel</span>
                Auctions
              </Link>
              <Link to="/merchants" onClick={() => setNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.2rem", borderRadius: "12px", textDecoration: "none", backgroundColor: isActive("/merchants") ? "var(--brand-primary)" : "transparent", color: isActive("/merchants") ? "#fff" : "var(--text-primary)", fontWeight: "600", transition: "all 0.2s" }} onMouseOver={e=>{if(!isActive("/merchants")) e.currentTarget.style.backgroundColor="var(--bg-base)"}} onMouseOut={e=>{if(!isActive("/merchants")) e.currentTarget.style.backgroundColor="transparent"}}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive("/merchants") ? "'FILL' 1" : "'FILL' 0" }}>verified_user</span>
                Verified Merchants
              </Link>

            </div>

            {user && (
              <div style={{ marginTop: "auto", paddingTop: "2rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", fontSize: "1.2rem", overflow: "hidden" }}>
                  {user.avatarUrl ? (
                    <img src={resolveImageUrl(user.avatarUrl)} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : "U"
                  )}
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
      <main className="main-content" style={{ flexGrow: 1, padding: "1.2rem 1.5%" }} onClick={() => setFilterOpen(false)}>
        <div key={location.pathname} style={{ animation: "fadeRoute 0.4s ease-out" }}>
          <Outlet />
        </div>
      </main>

      {/* Global AddToCartModal mounted for all customer pages */}
      <AddToCartModal />
    </div>
  );
};

export default CustomerLayout;
