import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const SETTINGS_KEY = "tradehub_user_preferences";

const defaultPreferences = {
  currency: "GHS",
  language: "English (UK)",
  orderUpdates: true,
  promotions: false,
};

const SettingsPage = () => {
  const navigate = useNavigate();

  const { user, setUser, logout } = useAuth();

  // ── Preferences state (loaded from user context) ──
  const [currency, setCurrency] = useState(user?.currency || "GHS");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.deliveryAddress || "");
  const [orderUpdates, setOrderUpdates] = useState(user?.orderUpdates ?? true);
  const [promotions, setPromotions] = useState(user?.promotions ?? false);
  const [priceDropAlerts, setPriceDropAlerts] = useState(user?.priceDropAlerts ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Password change state ──
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Toast state ──
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const toastTimer = useRef(null);

  // ── Sync with user object on mount ──
  useEffect(() => {
    if (user) {
      setCurrency(user.currency || "GHS");
      setDeliveryAddress(user.deliveryAddress || "");
      if (typeof user.orderUpdates === "boolean") setOrderUpdates(user.orderUpdates);
      if (typeof user.promotions === "boolean") setPromotions(user.promotions);
      if (typeof user.priceDropAlerts === "boolean") setPriceDropAlerts(user.priceDropAlerts);
    }
  }, [user]);

  // ── Persist preferences to backend on change ──
  const savePreferences = async () => {
    setIsSaving(true);
    const prefs = {
      currency,
      deliveryAddress,
      orderUpdates,
      promotions,
      priceDropAlerts,
    };
    try {
      const res = await api.patch("/users/profile", prefs);
      if (res.data.status === "success") {
        setUser(res.data.user);
        showToast("Preferences saved", "success");
      }
    } catch (e) {
      console.error("Failed to save preferences:", e);
      showToast("Failed to save preferences", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toast helper ──
  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleOrderUpdatesToggle = () => {
    setOrderUpdates(!orderUpdates);
  };

  const handlePromotionsToggle = () => {
    setPromotions(!promotions);
  };

  const handlePriceDropToggle = () => {
    setPriceDropAlerts(!priceDropAlerts);
  };

  // ── Password change handler ──
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/auth/password", { currentPassword, newPassword });
      showToast("Password updated successfully!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to change password";
      showToast(msg, "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Delete account handler ──
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await api.delete("/users/profile");
        await logout();
        navigate("/login");
      } catch (err) {
        console.error("Failed to delete account", err);
        showToast("Failed to delete account", "error");
      }
    }
  };

  // ── Shared input style ──
  const inputStyle = {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--bg-base)",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2rem", position: "relative" }}>

      {/* ── Toast notification ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 9999,
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            backgroundColor: toast.type === "success" ? "var(--brand-primary)" : "#ef4444",
            color: "white",
            fontWeight: "700",
            fontSize: "0.9rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <button onClick={() => navigate("/profile")} style={{ background: "transparent", border: "none", color: "var(--brand-primary)", cursor: "pointer", fontWeight: "700", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        &larr; Back to Profile
      </button>
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
                onChange={handleCurrencyChange}
                style={{ ...inputStyle, maxWidth: "300px" }}
              >
                <option value="GHS">Ghana Cedi (GH₵)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>Default Delivery Address</label>
              <textarea 
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your default delivery address..."
                rows="2"
                style={{ ...inputStyle, resize: "none" }}
              />
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
              onClick={handleOrderUpdatesToggle}
              style={{ width: "44px", height: "24px", backgroundColor: orderUpdates ? "var(--brand-primary)" : "var(--border)", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "all 0.3s" }}
            >
              <div style={{ width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: orderUpdates ? "22px" : "2px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
            </div>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Promotions & Offers</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Weekly updates on trending exports</div>
            </div>
            <div 
              onClick={handlePromotionsToggle}
              style={{ width: "44px", height: "24px", backgroundColor: promotions ? "var(--brand-primary)" : "var(--border)", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "all 0.3s" }}
            >
              <div style={{ width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: promotions ? "22px" : "2px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1.5rem" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Price Drop Alerts</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Notify me if items I bid on drop in price</div>
            </div>
            <div 
              onClick={handlePriceDropToggle}
              style={{ width: "44px", height: "24px", backgroundColor: priceDropAlerts ? "var(--brand-primary)" : "var(--border)", borderRadius: "12px", position: "relative", cursor: "pointer", transition: "all 0.3s" }}
            >
              <div style={{ width: "20px", height: "20px", backgroundColor: "white", borderRadius: "50%", position: "absolute", top: "2px", left: priceDropAlerts ? "22px" : "2px", transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}></div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Security</h3>
          
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              style={{ padding: "0.8rem 1.5rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }} 
              onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} 
              onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} style={{ maxWidth: "400px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button 
                    type="submit" 
                    disabled={passwordLoading}
                    style={{ 
                      padding: "0.8rem 1.5rem", 
                      backgroundColor: "var(--brand-primary)", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "8px", 
                      fontWeight: "700", 
                      cursor: passwordLoading ? "not-allowed" : "pointer", 
                      opacity: passwordLoading ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    {passwordLoading ? "Updating…" : "Update Password"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowPasswordForm(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                    style={{ padding: "0.8rem 1.5rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }} 
                    onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} 
                    onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Global Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
          <button 
            onClick={savePreferences}
            disabled={isSaving}
            style={{ 
              padding: "1rem 2.5rem", 
              backgroundColor: "var(--brand-primary)", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "800", 
              fontSize: "1.05rem",
              cursor: isSaving ? "not-allowed" : "pointer", 
              opacity: isSaving ? 0.7 : 1,
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(0, 82, 255, 0.3)"
            }}
          >
            {isSaving ? "Saving Changes..." : "Save Preferences"}
          </button>
        </div>

        {/* Danger Zone / Delete Account */}
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "16px", padding: "2rem", marginTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span className="material-symbols-outlined" style={{ color: "#ef4444" }}>warning</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#ef4444", margin: 0 }}>Danger Zone</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 1.5rem 0", maxWidth: "600px" }}>
            Permanently delete your account and all associated personal preferences and records from TradeHub. This action is irreversible.
          </p>
          <button 
            onClick={handleDeleteAccount}
            type="button"
            style={{ padding: "0.8rem 1.8rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = "#dc2626"}
            onMouseOut={e => e.currentTarget.style.backgroundColor = "#ef4444"}
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
