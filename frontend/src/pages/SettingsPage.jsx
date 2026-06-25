import React, { useState } from "react";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("GHS");

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 2rem 0" }}>
        Settings
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Account Settings */}
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Account Preferences</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>Display Currency</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: "100%", maxWidth: "300px", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.95rem" }}
              >
                <option value="GHS">Ghana Cedi (GH₵)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>Language</label>
              <select 
                style={{ width: "100%", maxWidth: "300px", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.95rem" }}
              >
                <option>English (UK)</option>
                <option>French (FR)</option>
                <option>Twi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Notifications</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Order Updates</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Receive emails about your order status</div>
            </div>
            <div 
              onClick={() => setNotifications(!notifications)}
              style={{ width: "44px", height: "24px", backgroundColor: notifications ? "var(--brand-blue)" : "var(--border)", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "all 0.3s" }}
            >
              <div style={{ width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: notifications ? "22px" : "2px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Promotions & Offers</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Weekly updates on trending exports</div>
            </div>
            <div 
              style={{ width: "44px", height: "24px", backgroundColor: "var(--border)", borderRadius: "12px", position: "relative", cursor: "pointer" }}
            >
              <div style={{ width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: "2px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Security</h3>
          <button style={{ padding: "0.8rem 1.5rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
            Change Password
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
