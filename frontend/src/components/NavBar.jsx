import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = ({ theme, toggleTheme }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#ffffff";
  const text = isDark ? "#f8fafc" : "#1e293b";
  const hoverBg = isDark ? "#1e293b" : "#f1f5f9";
  const dropdownBg = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const primaryBrand = isDark ? "#f59e0b" : "#2563eb";
  const primaryBrandHover = isDark ? "#d97706" : "#1d4ed8";

  const handleMouseEnter = (menu) => setActiveDropdown(menu);
  const handleMouseLeave = () => setActiveDropdown(null);

  return (
    <nav
      className="nav-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: bg,
        color: text,
        borderBottom: `1px solid ${borderColor}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all 0.3s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: isDark ? "#f8fafc" : "#1e3a8a", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/app_icon.png" alt="BediDwa Logo" style={{ width: "32px", height: "32px", borderRadius: "6px" }} />
          BediDwa
        </Link>
      </div>

      {/* Center Links with Dropdowns */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem", fontSize: "0.95rem", fontWeight: 500, position: "relative" }}>
        
        {/* Native Store Dropdown */}
        <div 
          onMouseEnter={() => handleMouseEnter('native')}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", padding: "1rem 0", cursor: "pointer", color: text }}
        >
          Native Store ▾
          {activeDropdown === 'native' && (
            <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: dropdownBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", minWidth: "200px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Link to="/" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text, borderBottom: `1px solid ${borderColor}` }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Latest Arrivals</Link>
              <Link to="/" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text, borderBottom: `1px solid ${borderColor}` }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Local Fabrics & Kente</Link>
              <Link to="/" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Premium Foods</Link>
            </div>
          )}
        </div>

        {/* Auction Engine Dropdown */}
        <div 
          onMouseEnter={() => handleMouseEnter('auction')}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", padding: "1rem 0", cursor: "pointer", color: text }}
        >
          Auction Engine ▾
          {activeDropdown === 'auction' && (
            <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: dropdownBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", minWidth: "200px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Link to="/auctions" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text, borderBottom: `1px solid ${borderColor}` }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Live Auctions</Link>
              <Link to="/auctions" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text, borderBottom: `1px solid ${borderColor}` }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Upcoming Tech Pools</Link>
              <Link to="/auctions" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Past Results</Link>
            </div>
          )}
        </div>

        {/* Verified Merchants Dropdown */}
        <div 
          onMouseEnter={() => handleMouseEnter('merchants')}
          onMouseLeave={handleMouseLeave}
          style={{ position: "relative", padding: "1rem 0", cursor: "pointer", color: text }}
        >
          Verified Merchants ▾
          {activeDropdown === 'merchants' && (
            <div style={{ position: "absolute", top: "100%", left: 0, backgroundColor: dropdownBg, border: `1px solid ${borderColor}`, borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", minWidth: "200px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Link to="/merchants" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text, borderBottom: `1px solid ${borderColor}` }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Top Sellers</Link>
              <Link to="/register?role=merchant" style={{ padding: "0.8rem 1rem", textDecoration: "none", color: text }} onMouseOver={(e) => e.target.style.backgroundColor = hoverBg} onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}>Become a Merchant</Link>
            </div>
          )}
        </div>

        <Link to="#" style={{ textDecoration: "none", color: text }}>Help</Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/login" style={{ padding: "0.5rem 1.2rem", borderRadius: "6px", border: `1px solid ${borderColor}`, color: text, fontWeight: "600", textDecoration: "none", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor=primaryBrand} onMouseOut={e=>e.currentTarget.style.borderColor=borderColor}>Login</Link>
          <Link to="/register" style={{ padding: "0.6rem 1.2rem", borderRadius: "6px", backgroundColor: primaryBrand, color: "#fff", fontWeight: "600", textDecoration: "none", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor=primaryBrandHover} onMouseOut={e=>e.currentTarget.style.backgroundColor=primaryBrand}>Sign Up</Link>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem", borderRadius: "50%", color: text, opacity: 0.7, transition: "opacity 0.2s" }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "0.7"}
          title="Toggle Dark/Light Mode"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
