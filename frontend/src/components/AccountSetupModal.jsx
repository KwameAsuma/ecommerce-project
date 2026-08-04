import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AccountSetupModal = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isVendor = user?.role === "merchant" || user?.role === "vendor";
  const isOpen = !!(user && user.needsSetup);

  useEffect(() => {
    if (user) {
      const defaultPrefix = user.email ? user.email.split("@")[0] : "";
      if (user.name && user.name !== defaultPrefix && user.name !== "New User") {
        setName(user.name);
      } else {
        setName("");
      }
      if (user.phone && user.phone !== "0000000000") setPhone(user.phone);
      if (user.momoNumber && user.momoNumber !== "0000000000") setMomoNumber(user.momoNumber);
      if (isVendor) {
        if (user.storeAddress) setAddress(user.storeAddress);
      } else {
        if (user.deliveryAddress) setAddress(user.deliveryAddress);
      }
    }
  }, [user, isVendor]);

  if (!isOpen) return null;

  const handlePhoneChange = (val, field) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    if (field === "phone") setPhone(cleaned);
    if (field === "momo") setMomoNumber(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError(isVendor ? "Please enter your Store Name." : "Please enter your Full Name.");
    if (phone.length !== 10) return setError("Please enter a valid 10-digit Phone Number.");
    if (isVendor && momoNumber.length !== 10) return setError("Vendors require a 10-digit MoMo Settlement Number for escrow payouts.");
    if (!address.trim()) return setError(isVendor ? "Please enter your Store / Pickup Address." : "Please enter your Default Delivery Address.");

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone,
        ...(isVendor ? { momoNumber, storeAddress: address.trim() } : { deliveryAddress: address.trim() }),
      };

      const res = await api.patch("/users/profile", payload);
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error("Setup failed:", err);
      setError(err.response?.data?.error || "Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 500,
    outline: "none",
    background: "#fff",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };
  const lbl = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#334155",
    marginBottom: 6,
  };
  const onFocus = (e) => {
    e.currentTarget.style.borderColor = "#0f172a";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.08)";
  };
  const onBlur = (e) => {
    e.currentTarget.style.borderColor = "#cbd5e1";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(15, 23, 42, 0.1)",
        width: "100%",
        maxWidth: 520,
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Decorative gold accent stripe at top */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #0f172a 0%, #eab308 50%, #0f172a 100%)" }} />

        <div style={{ padding: "36px 40px 40px" }}>
          
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span style={{
              display: "inline-block", background: isVendor ? "#fffbeb" : "#eff6ff",
              color: isVendor ? "#b45309" : "#1d4ed8",
              fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12,
              border: `1px solid ${isVendor ? "rgba(245, 158, 11, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
            }}>
              {isVendor ? "Vendor Store Onboarding" : "Customer Account Setup"}
            </span>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
              fontSize: 32, fontWeight: 700, color: "#0f172a",
              margin: "0 0 8px", letterSpacing: "-0.01em",
            }}>
              {isVendor ? "Complete Your Store" : "Complete Your Profile"}
            </h2>
            <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              {isVendor
                ? "Add your brand details and MoMo account to activate secure escrow settlements."
                : "Add your contact information and delivery address for fast, secure checkouts."}
            </p>
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#b91c1c", padding: "12px 16px", borderRadius: 8,
              marginBottom: 20, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            
            {/* Name */}
            <div>
              <label style={lbl}>{isVendor ? "Store / Brand Name" : "Full Name"}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={isVendor ? "e.g. Royal Gold Boutique" : "e.g. Kwame Asuma"}
                style={inp}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            {/* Phone & MoMo */}
            <div style={{ display: "grid", gridTemplateColumns: isVendor ? "1fr 1fr" : "1fr", gap: 16 }}>
              <div>
                <label style={lbl}>Phone Number <span style={{ textTransform: "none", fontWeight: 400, color: "#94a3b8" }}>(10 digits)</span></label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value, "phone")}
                  required
                  placeholder="024XXXXXXX"
                  style={inp}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              {isVendor && (
                <div>
                  <label style={lbl}>MoMo Settlement <span style={{ textTransform: "none", fontWeight: 400, color: "#94a3b8" }}>(Payouts)</span></label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={momoNumber}
                    onChange={(e) => handlePhoneChange(e.target.value, "momo")}
                    required
                    placeholder="024XXXXXXX"
                    style={{ ...inp, borderColor: "rgba(234, 179, 8, 0.6)" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234,179,8,0.2)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.6)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label style={lbl}>{isVendor ? "Store / Pickup Address" : "Default Delivery Address"}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder={isVendor ? "Where you ship from or customers pick up" : "Your preferred residential or business delivery location"}
                style={inp}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 8,
                  fontWeight: 700, fontSize: 15, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  boxShadow: loading ? "none" : "0 8px 20px -4px rgba(15, 23, 42, 0.35)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#0f172a"; }}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
                    Saving Profile...
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Continue</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupModal;
