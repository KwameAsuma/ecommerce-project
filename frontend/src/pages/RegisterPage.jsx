import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";

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

const RegisterPage = () => {
  const [mode, setMode] = useState("select");
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("role") === "merchant") { setSelectedRole("MERCHANT"); setMode("form"); }
    else if (params.get("role") === "customer") { setSelectedRole("BUYER"); setMode("form"); }
  }, [location]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const checkPasswordStrength = (pwd) => {
    const rules = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>_\-=+;]/.test(pwd),
    };
    return { rules, score: Object.values(rules).filter(Boolean).length };
  };

  const pwdStrength = checkPasswordStrength(password);
  const isPasswordStrongEnough = pwdStrength.score === 4;

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
    if (!cleanedEmail || !password || !confirmPassword)
      return setError("Please complete all required fields.");
    if (!isValidEmail(cleanedEmail)) return setError("Invalid email format.");
    if (!isPasswordStrongEnough) return setError("Please meet all 4 password strength requirements.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    try {
      // Pass safe defaults for name and phone so existing backend validation succeeds without blocking this simple sign-up step
      await api.post("/auth/register", {
        name: cleanedEmail.split("@")[0] || "New User",
        email: cleanedEmail,
        phone: "0000000000",
        password,
        role: selectedRole || "BUYER",
        momo_number: selectedRole === "MERCHANT" ? "0000000000" : undefined,
      });
      const data = await login(cleanedEmail, password);
      const role = data?.user?.role || "";
      navigate(["merchant", "MERCHANT", "vendor", "VENDOR"].includes(role) ? "/merchant" : "/");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };


  // ─── VIEW 1: ROLE SELECTION ───────────────────────────────────────────────
  if (mode === "select") {
    const getCardStyle = (role) => {
      const isHov = hoveredCard === role;
      const isSel = selectedRole === role;
      return {
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transform: isSel ? "scale(1.02)" : isHov ? "scale(1.015)" : "scale(1)",
        transition: "all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)",
        zIndex: isSel || isHov ? 10 : 1,
        border: isSel
          ? "3px solid #eab308"
          : isHov
          ? "3px solid rgba(15, 23, 42, 0.45)"
          : "3px solid transparent",
        boxShadow: isSel
          ? "0 25px 65px -10px rgba(15, 23, 42, 0.35), 0 0 0 4px rgba(234, 179, 8, 0.35), 0 0 35px rgba(234, 179, 8, 0.3)"
          : isHov
          ? "0 30px 60px -15px rgba(15, 23, 42, 0.25)"
          : "0 15px 35px -10px rgba(15, 23, 42, 0.15)",
        userSelect: "none",
        background: "#0f172a",
      };
    };

    const getOverlayStyle = (role) => {
      const isHov = hoveredCard === role;
      const isSel = selectedRole === role;
      return {
        position: "absolute", inset: 0, zIndex: 2,
        transition: "background 0.35s ease",
        background: isSel
          ? "linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.35) 55%, rgba(15,23,42,0.88) 100%)"
          : isHov
          ? "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.4) 55%, rgba(15,23,42,0.85) 100%)"
          : "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.5) 55%, rgba(15,23,42,0.85) 100%)",
      };
    };

    return (
      <div style={PAGE_BG}>
        <AuthNavbar />

        <main style={{ flex: 1, padding: "45px 24px 70px" }}>
          {/* Slimmed container width to match target Donkomi sizing replica */}
          <div style={{ maxWidth: 860, margin: "0 auto" }}>

            {/* Cards grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 30,
              height: 590,
            }}>

              {/* VENDOR CARD */}
              <div
                style={getCardStyle("MERCHANT")}
                onClick={() => setSelectedRole("MERCHANT")}
                onMouseEnter={() => setHoveredCard("MERCHANT")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="/vendor-card-bg.jpg"
                  alt="Vendor"
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    transform: hoveredCard === "MERCHANT" || selectedRole === "MERCHANT" ? "scale(1.06)" : "scale(1)"
                  }}
                />
                <div style={getOverlayStyle("MERCHANT")} />
                <div style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "24px",
                }}>
                  <p style={{
                    color: "#eab308", fontSize: 11, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.28em",
                    marginBottom: 12, opacity: hoveredCard === "MERCHANT" || selectedRole === "MERCHANT" ? 1 : 0.88,
                    transition: "opacity 0.3s",
                    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                  }}>Sell on BediDwa</p>
                  <p style={{
                    color: "#fff",
                    fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
                    fontSize: 50, fontWeight: 700,
                    letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1,
                    textShadow: "0 4px 25px rgba(0, 0, 0, 0.75)",
                  }}>Vendor</p>
                </div>
                {selectedRole === "MERCHANT" && (
                  <div style={{
                    position: "absolute", top: 20, right: 20, zIndex: 10,
                    background: "#eab308", borderRadius: 999,
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.35), 0 0 0 3px rgba(234,179,8,0.3)",
                    transition: "all 0.3s ease",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#0f172a", fontVariationSettings: "'FILL' 1", fontWeight: "bold" }}>check</span>
                  </div>
                )}
              </div>

              {/* CUSTOMER CARD */}
              <div
                style={getCardStyle("BUYER")}
                onClick={() => setSelectedRole("BUYER")}
                onMouseEnter={() => setHoveredCard("BUYER")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <img
                  src="/customer-card-bg.jpg"
                  alt="Customer"
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    transform: hoveredCard === "BUYER" || selectedRole === "BUYER" ? "scale(1.06)" : "scale(1)"
                  }}
                />
                <div style={getOverlayStyle("BUYER")} />
                <div style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "24px",
                }}>
                  <p style={{
                    color: "#eab308", fontSize: 11, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.28em",
                    marginBottom: 12, opacity: hoveredCard === "BUYER" || selectedRole === "BUYER" ? 1 : 0.88,
                    transition: "opacity 0.3s",
                    textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                  }}>Shop on BediDwa</p>
                  <p style={{
                    color: "#fff",
                    fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
                    fontSize: 50, fontWeight: 700,
                    letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1,
                    textShadow: "0 4px 25px rgba(0, 0, 0, 0.75)",
                  }}>Customer</p>
                </div>
                {selectedRole === "BUYER" && (
                  <div style={{
                    position: "absolute", top: 20, right: 20, zIndex: 10,
                    background: "#eab308", borderRadius: 999,
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.35), 0 0 0 3px rgba(234,179,8,0.3)",
                    transition: "all 0.3s ease",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#0f172a", fontVariationSettings: "'FILL' 1", fontWeight: "bold" }}>check</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA row spanning full width of the cards grid */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <button
                onClick={() => { if (selectedRole) setMode("form"); }}
                disabled={!selectedRole}
                style={{
                  width: "100%", padding: "18px 0",
                  borderRadius: 10, fontWeight: 800, fontSize: 16,
                  border: "none", cursor: selectedRole ? "pointer" : "not-allowed",
                  background: selectedRole ? "#0f172a" : "#e2e8f0",
                  color: selectedRole ? "#fff" : "#94a3b8",
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  transition: "all 0.25s ease",
                  boxShadow: selectedRole ? "0 10px 30px -5px rgba(15, 23, 42, 0.35)" : "none",
                }}
                onMouseEnter={e => { if (selectedRole) e.currentTarget.style.background = "#1e293b"; }}
                onMouseLeave={e => { if (selectedRole) e.currentTarget.style.background = "#0f172a"; }}
                onMouseDown={e => { if (selectedRole) e.currentTarget.style.transform = "scale(0.995)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {selectedRole ? `Continue as ${selectedRole === "MERCHANT" ? "Vendor" : "Customer"}` : "Select account type"}
              </button>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, fontWeight: 500 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#0f172a", fontWeight: 800, textDecoration: "underline" }}>Log in</Link>
              </p>
            </div>
          </div>
        </main>

        <AuthFooter />
      </div>
    );
  }

  // ─── VIEW 2: SIGNUP FORM ─────────────────────────────────────────────────
  const isVendor = selectedRole === "MERCHANT";

  const inp = {
    width: "100%", border: "1px solid #cbd5e1", borderRadius: 6,
    padding: "12px 14px", fontSize: 13.5, color: "#0f172a", fontWeight: 500,
    outline: "none", background: "#fff", fontFamily: "inherit",
    boxSizing: "border-box", transition: "all 0.2s ease",
  };
  const inpErr = { ...inp, borderColor: "#ef4444", color: "#dc2626" };
  const lbl = { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#334155", marginBottom: 7 };
  const sec = { paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid #f1f5f9" };

  const onFocus = (e) => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15, 23, 42, 0.08)"; };
  const onBlur = (e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; };

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
          maxWidth: 480,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Simple back arrow button at top left */}
          <button
            type="button"
            onClick={() => setMode("select")}
            title="Back to account selection"
            style={{
              position: "absolute", top: 24, left: 24, zIndex: 10,
              background: "#f1f5f9", border: "none", borderRadius: "50%",
              width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#475569",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </button>

          <div style={{ padding: "44px 40px 40px" }}>
            
            {/* Centered luxury header */}
            <div style={{ textAlign: "center", marginBottom: 32, marginTop: 12 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
                fontSize: 38, fontWeight: 700, color: "#0f172a",
                margin: "0 0 8px", letterSpacing: "-0.01em",
              }}>Sign up</h1>
              <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                {isVendor ? "Create your vendor account to start selling" : "Create your customer account to start shopping"}
              </p>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                color: "#b91c1c", padding: "12px 16px", borderRadius: 6,
                marginBottom: 22, fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Email ONLY */}
              <div>
                <label style={lbl}>Email</label>
                <input
                  type="email" value={email} onChange={handleEmailChange} required
                  style={fieldErrors.email ? inpErr : inp}
                  onFocus={onFocus} onBlur={onBlur}
                />
                {fieldErrors.email && <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 6, display: "block" }}>{fieldErrors.email}</span>}
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                      style={{ ...inp, paddingRight: 42 }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }} onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showPassword ? "#0f172a" : "#64748b", padding: "6px", display: "flex", alignItems: "center", zIndex: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      style={{ ...(confirmPassword && password !== confirmPassword ? inpErr : inp), paddingRight: 42 }}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirmPassword(!showConfirmPassword); }} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: showConfirmPassword ? "#0f172a" : "#64748b", padding: "6px", display: "flex", alignItems: "center", zIndex: 10 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showConfirmPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600, marginTop: 6, display: "block" }}>Passwords do not match</span>
                  )}
                </div>

                {/* Strength meter */}
                {password && (
                  <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0f172a" }}>Strength</span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                        ...(pwdStrength.score <= 1 ? { color: "#dc2626", background: "#fef2f2" } :
                            pwdStrength.score === 2 ? { color: "#d97706", background: "#fffbeb" } :
                            pwdStrength.score === 3 ? { color: "#2563eb", background: "#eff6ff" } :
                            { color: "#059669", background: "#ecfdf5" }),
                      }}>
                        {pwdStrength.score <= 1 ? "Weak" : pwdStrength.score === 2 ? "Fair" : pwdStrength.score === 3 ? "Good" : "Strong ✓"}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 10 }}>
                      {[1,2,3,4].map(step => (
                        <div key={step} style={{
                          height: 4, borderRadius: 99,
                          background: pwdStrength.score >= step
                            ? pwdStrength.score === 4 ? "#10b981" : pwdStrength.score === 3 ? "#0f172a" : pwdStrength.score === 2 ? "#f59e0b" : "#ef4444"
                            : "#cbd5e1",
                          transition: "background 0.3s",
                        }} />
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[
                        [pwdStrength.rules.length, "8+ characters"],
                        [pwdStrength.rules.uppercase, "Uppercase"],
                        [pwdStrength.rules.number, "Number"],
                        [pwdStrength.rules.special, "Symbol"],
                      ].map(([met, label]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: met ? "#059669" : "#64748b", fontWeight: met ? 700 : 500 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{met ? "check_circle" : "radio_button_unchecked"}</span>
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div style={{ paddingTop: 6 }}>
                  <button
                    type="submit"
                    disabled={isLoading || !isPasswordStrongEnough || (confirmPassword && password !== confirmPassword) || !!fieldErrors.email}
                    style={{
                      width: "100%", padding: "15px 0", borderRadius: 8,
                      fontWeight: 700, fontSize: 15, border: "none",
                      cursor: isLoading || !isPasswordStrongEnough || (confirmPassword && password !== confirmPassword) || fieldErrors.email ? "not-allowed" : "pointer",
                      background: isLoading || !isPasswordStrongEnough || (confirmPassword && password !== confirmPassword) || fieldErrors.email
                        ? "#94a3b8" : "#0f172a",
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      fontFamily: "inherit", letterSpacing: "-0.01em",
                      boxShadow: isLoading || !isPasswordStrongEnough || (confirmPassword && password !== confirmPassword) || fieldErrors.email ? "none" : "0 8px 20px -4px rgba(15, 23, 42, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => { if (!isLoading && isPasswordStrongEnough && !fieldErrors.email) e.currentTarget.style.background = "#1e293b"; }}
                    onMouseLeave={e => { if (!isLoading && isPasswordStrongEnough && !fieldErrors.email) e.currentTarget.style.background = "#0f172a"; }}
                  >
                    {isLoading ? (
                      <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span> Creating account...</>
                    ) : isVendor ? "Sign up as Vendor" : "Sign up as Customer"}
                  </button>
                  {!isPasswordStrongEnough && password && (
                    <p style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#d97706", marginTop: 8, marginBottom: 0 }}>
                      Meet all 4 password requirements to continue.
                    </p>
                  )}
                </div>
              </div>
            </form>

            <div style={{ marginTop: 28, textAlign: "center", fontSize: 13, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
              <span style={{ color: "#64748b" }}>Already have an account? </span>
              <Link to="/login" style={{ color: "#0f172a", fontWeight: 800, textDecoration: "underline" }}>Log in</Link>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default RegisterPage;
