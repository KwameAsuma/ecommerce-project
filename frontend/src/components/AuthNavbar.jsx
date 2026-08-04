import React from "react";
import { Link, useLocation } from "react-router-dom";

const AuthNavbar = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div style={{
      width: "100%", padding: "24px 4vw 0",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <nav style={{
        maxWidth: 1340, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 38px",
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        borderRadius: 9999,
        boxShadow: "0 14px 40px -5px rgba(15, 23, 42, 0.08), 0 4px 14px -2px rgba(15, 23, 42, 0.03)",
        pointerEvents: "auto",
        transition: "all 0.3s ease",
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <img src="/app_icon.png" alt="BediDwa Logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "contain", boxShadow: "0 4px 10px rgba(15, 23, 42, 0.15)" }} />
          <span style={{ color: "#0f172a", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}>BediDwa</span>
        </Link>

        {/* Nav links */}
        <div className="auth-nav-links" style={{ display: "flex", alignItems: "center", gap: 38 }}>
          {[
            { label: "Shop", to: "/" },
            { label: "Vendors", to: "/merchants" },
            { label: "Auctions", to: "/auctions" },
          ].map(({ label, to }) => (
            <Link
              key={label} to={to}
              style={{ color: "#475569", fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
              onMouseLeave={e => e.currentTarget.style.color = "#475569"}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isLogin ? (
            <>
              <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>New here?</span>
              <Link to="/register" style={{
                background: "#eab308", color: "#0f172a",
                fontSize: 14, fontWeight: 800,
                padding: "11px 26px", borderRadius: 9999,
                textDecoration: "none", lineHeight: 1,
                boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#0f172a"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#eab308"; e.currentTarget.style.color = "#0f172a"; }}
              >Sign up</Link>
            </>
          ) : (
            <>
              <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>Have an account?</span>
              <Link to="/login" style={{
                background: "#0f172a", color: "#fff",
                fontSize: 14, fontWeight: 700,
                padding: "11px 26px", borderRadius: 9999,
                textDecoration: "none", lineHeight: 1,
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.18)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
              >Log in</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AuthNavbar;
