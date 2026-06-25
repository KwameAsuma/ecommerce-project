import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MerchantLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      
      {/* Light Corporate Sidebar (Merchant) */}
      <aside 
        style={{ 
          width: "250px", 
          backgroundColor: "var(--bg-panel)", 
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer" }} onClick={() => navigate("/merchant")}>
            TradeHub <span style={{ color: "var(--brand-gold)" }}>Pro</span>
          </h1>
        </div>

        <nav style={{ flexGrow: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "0.5rem", paddingLeft: "1rem" }}>OPERATIONS</div>
          <Link to="/merchant" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", backgroundColor: isActive("/merchant") ? "var(--brand-blue)" : "transparent", color: isActive("/merchant") ? "#fff" : "var(--text-secondary)", fontWeight: isActive("/merchant") ? "600" : "500", transition: "all 0.2s" }}>
            <span>📊</span> Dashboard
          </Link>
          <Link to="#" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span>📦</span> Active Listings
          </Link>
          <Link to="#" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span>🚚</span> Order Fulfillment
          </Link>
          <Link to="#" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span>🛡️</span> Escrow Hub
          </Link>
          
          <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginTop: "1.5rem", marginBottom: "0.5rem", paddingLeft: "1rem" }}>BUSINESS</div>
          <Link to="#" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span>📈</span> Analytics
          </Link>
          <Link to="#" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderRadius: "8px", textDecoration: "none", color: "var(--text-secondary)", fontWeight: "500" }}>
            <span>⚙️</span> Store Settings
          </Link>
        </nav>

        {/* Note: ZERO UI BLEED. There is no "Switch to Customer" button here anymore. */}
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Top Navbar */}
        <header style={{ backgroundColor: "var(--bg-panel)", borderBottom: "1px solid var(--border)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
          
          <div style={{ display: "flex", gap: "2rem", color: "var(--text-secondary)", fontWeight: "500", fontSize: "0.9rem" }}>
            <span style={{ cursor: "pointer", color: "var(--brand-blue)", fontWeight: "600", borderBottom: "2px solid var(--brand-blue)" }}>Overview</span>
            <span style={{ cursor: "pointer" }}>Payouts</span>
            <span style={{ cursor: "pointer" }}>Trust Score</span>
          </div>

          {/* Top Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <button style={{ padding: "0.5rem 1.5rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}>
              + New Listing
            </button>
            <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "1.2rem" }}>
              <span style={{ cursor: "pointer", color: "var(--danger)" }} onClick={handleLogout} title="Logout">⏻</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flexGrow: 1, overflowY: "auto", padding: "2rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MerchantLayout;
