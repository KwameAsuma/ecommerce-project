import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, isLoading } = useAuth();
  const { resetFilters } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  // Determine if user arrived via the hidden admin portal URL
  const ADMIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || "/hidden-admin-xyz";
  const isAdminPortal = location.pathname === ADMIN_PATH;

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setFieldErrors(prev => ({
      ...prev,
      email: val && !isValidEmail(val.trim()) ? "Enter a valid email address" : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPassword = password.trim();
    if (!cleanedEmail || !cleanedPassword) return setError("Please enter both email and password.");
    if (!isValidEmail(cleanedEmail)) return setError("Invalid email address.");
    // Read optional redirect target from query string (e.g. ?redirect=/checkout)
    const params = new URLSearchParams(location.search);
    const redirectTo = params.get("redirect") || "/";
    try {
      const data = await login(cleanedEmail, cleanedPassword);
      const role = (data?.user?.role || "CUSTOMER").toUpperCase();
      if (role === "ADMIN") {
        // Admin can ONLY sign in via the hidden portal URL — block them on standard /login
        if (!isAdminPortal) {
          try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch (_) {}
          setError("Invalid email or password.");
          return;
        }
        navigate("/admin", { replace: true });
      } else if (role === "VENDOR" || role === "MERCHANT") {
        navigate("/merchant");
      } else {
        resetFilters();
        // Honour redirect param for seamless guest-to-checkout flow
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid email or password.");
    }
  };

  const PAGE_BG = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background:
      "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(30,58,138,0.09) 0%, transparent 60%), " +
      "radial-gradient(ellipse 50% 40% at 85% 75%, rgba(234,179,8,0.06) 0%, transparent 55%), " +
      "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  };

  const inp = {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "13px 15px",
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
    marginBottom: 8,
  };

  return (
    <div style={PAGE_BG}>
      <AuthNavbar />

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px 80px",
      }}>
        {/* Clean card with elegant round drop shadow, no gradient outline */}
        <div style={{
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 20px 55px -10px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(15, 23, 42, 0.06)",
          width: "100%",
          maxWidth: 460,
          overflow: "hidden",
        }}>
          <div style={{ padding: "44px 40px 40px" }}>
            
            {/* Centered luxury header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
                fontSize: 36, fontWeight: 700, color: "#0f172a",
                margin: "0 0 8px", letterSpacing: "-0.01em",
              }}>Welcome back</h1>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>Sign in to your BediDwa account</p>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#b91c1c", padding: "12px 16px",
                borderRadius: 6, marginBottom: 22,
                fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={lbl}>Email</label>
                <input
                  type="email" value={email} onChange={handleEmailChange} required
                  style={{
                    ...inp,
                    borderColor: fieldErrors.email ? "#ef4444" : "#cbd5e1",
                    color: fieldErrors.email ? "#dc2626" : "#0f172a",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = fieldErrors.email ? "#ef4444" : "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {fieldErrors.email && (
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 6, display: "block" }}>
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", textDecoration: "underline" }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    style={{ ...inp, paddingRight: 46 }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.08)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: showPassword ? "#0f172a" : "#64748b", padding: "6px",
                      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !!fieldErrors.email}
                style={{
                  width: "100%", padding: "15px 0",
                  borderRadius: 6, fontWeight: 700, fontSize: 15,
                  border: "none",
                  cursor: isLoading || fieldErrors.email ? "not-allowed" : "pointer",
                  background: isLoading || fieldErrors.email
                    ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  boxShadow: isLoading || fieldErrors.email ? "none" : "0 8px 20px -4px rgba(15, 23, 42, 0.35)",
                  transition: "all 0.2s ease",
                  marginTop: 4,
                }}
                onMouseEnter={e => { if (!isLoading && !fieldErrors.email) e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={e => { if (!isLoading && !fieldErrors.email) e.currentTarget.style.background = "#0f172a"; }}
                onMouseDown={e => { if (!isLoading) e.currentTarget.style.transform = "scale(0.99)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                    Signing in...
                  </>
                ) : "Log in"}
              </button>
            </form>

            <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>Don't have an account? </span>
              <Link to="/register" style={{ color: "#0f172a", fontWeight: 800, textDecoration: "underline" }}>Sign up</Link>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default LoginPage;
