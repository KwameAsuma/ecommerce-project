import React from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 2rem 0" }}>
        My Profile
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Column: User Card */}
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", height: "max-content" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "var(--brand-blue)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "3rem", fontWeight: "900", marginBottom: "1.5rem", boxShadow: "0 10px 25px rgba(30, 58, 138, 0.2)" }}>
            {user?.name?.charAt(0) || "K"}
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>
            {user?.name || "Kwame Asuma"}
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
            {user?.email || "kwame.asuma@tradehub.com"}
          </p>
          
          <div style={{ width: "100%", padding: "1rem", backgroundColor: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Account Role</span>
            <span style={{ fontSize: "0.85rem", color: "var(--brand-gold)", fontWeight: "800", textTransform: "uppercase" }}>{user?.role || "Consumer"}</span>
          </div>
        </div>

        {/* Right Column: Details & Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Shipping Info */}
          <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>Shipping Details</h3>
              <button style={{ backgroundColor: "transparent", border: "none", color: "var(--brand-blue)", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Edit</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Full Name</label>
                <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>{user?.name || "Kwame Asuma"}</div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Phone Number</label>
                <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>+233 54 123 4567</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Delivery Address</label>
                <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>14 Independence Avenue<br/>Ridge, Accra<br/>Greater Accra Region</div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Recent Orders</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { id: "ORD-8821", date: "Oct 12, 2026", status: "Delivered", total: 18500, items: "MacBook Pro M2 Refurbished" },
                { id: "ORD-8790", date: "Oct 05, 2026", status: "In Transit", total: 850, items: "Export-Grade Cocoa Beans" }
              ].map(order => (
                <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-base)" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>{order.id}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{order.date} • {order.items}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "800", color: "var(--brand-blue)", marginBottom: "0.2rem" }}>GH₵ {order.total.toLocaleString()}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: order.status === "Delivered" ? "var(--success)" : "var(--brand-gold)", backgroundColor: order.status === "Delivered" ? "rgba(45, 212, 191, 0.1)" : "rgba(251, 191, 36, 0.1)", padding: "0.2rem 0.6rem", borderRadius: "12px", display: "inline-block" }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
              View All Orders
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
