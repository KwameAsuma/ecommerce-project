import React from "react";
import { Link } from "react-router-dom";

const footerCols = [
  {
    title: "Shop",
    links: [
      { label: "All Categories", to: "/" },
      { label: "All Products", to: "/" },
      { label: "Featured Products", to: "/" },
      { label: "New Arrivals", to: "/" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", to: "/" },
      { label: "How It Works", to: "/" },
      { label: "Become a Vendor", to: "/register?role=merchant" },
      { label: "Our Story", to: "/" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/" },
      { label: "Contact Us", to: "/" },
      { label: "FAQ", to: "/" },
      { label: "Track Order", to: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", to: "/" },
      { label: "Privacy Policy", to: "/" },
      { label: "Cookies Policy", to: "/" },
    ],
  },
];

const AuthFooter = () => (
  <footer style={{
    background: "#050913",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "60px 5vw 36px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }}>
    <div style={{ width: "100%" }}>
      <div
        className="auth-footer-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "260px repeat(4, 1fr)",
          gap: "0 5vw",
          flexWrap: "wrap",
        }}>

        {/* Brand column */}
        <div>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 14 }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(145deg, #1e293b, #0f172a)",
              border: "1px solid rgba(234,179,8,0.45)",
              borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#eab308", fontWeight: 900, fontSize: 13,
            }}>T</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>BediDwa</span>
          </Link>
          <p style={{
            color: "rgba(255,255,255,0.3)", fontSize: 11.5,
            lineHeight: 1.75, margin: "0 0 16px", maxWidth: 190,
          }}>
            Ghana's premier escrow marketplace connecting buyers with verified vendors.
          </p>
          <a
            href="mailto:support@bedidwa.com"
            style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            support@bedidwa.com
          </a>
        </div>

        {/* Link columns */}
        {footerCols.map(col => (
          <div key={col.title}>
            <h4 style={{
              color: "rgba(255,255,255,0.75)",
              fontWeight: 700, fontSize: 10.5,
              textTransform: "uppercase", letterSpacing: "0.12em",
              margin: "0 0 16px",
            }}>
              {col.title}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    style={{ color: "rgba(255,255,255,0.33)", fontSize: 12, textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.33)"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: 44, paddingTop: 20,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
          © {new Date().getFullYear()} BediDwa. All rights reserved.
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
          Made with care in Ghana 🇬🇭
        </span>
      </div>
    </div>
  </footer>
);

export default AuthFooter;
