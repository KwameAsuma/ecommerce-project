import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthNavbar from "../components/AuthNavbar";
import AuthFooter from "../components/AuthFooter";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  const showToast = (msg, isSuccess = false, duration = 30000) => {
    setToastMessage({ msg, isSuccess });
    if (duration > 0) {
      setTimeout(() => {
        setToastMessage(prev => prev && prev.msg === msg ? null : prev);
      }, duration);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");

    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      if (res.data?.mock_email_content) {
        showToast(`📩 Notification: ${res.data.mock_email_content}`, true, 60000);
      } else {
        showToast("If an account exists with that email, a reset code has been sent.", true, 10000);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) return setError("Please enter the 6-digit OTP code.");
    if (!newPassword || newPassword.length < 6) return setError("New password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      showToast("🎉 Password reset successfully! Redirecting to login...", true, 5000);
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Verify your code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const PAGE_BG = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background:
      "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(30,58,138,0.12) 0%, transparent 60%), " +
      "radial-gradient(ellipse 50% 40% at 85% 75%, rgba(234,179,8,0.08) 0%, transparent 55%), " +
      "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
  };

  const inp = {
    width: "100%",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "13px 16px",
    fontSize: 14,
    color: "#f8fafc",
    fontWeight: 500,
    outline: "none",
    background: "#1e293b",
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
    color: "#94a3b8",
    marginBottom: 8,
  };

  return (
    <div style={PAGE_BG}>
      <AuthNavbar />

      {/* Dev UI Mock Email Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 999999,
          background: "rgba(15, 23, 42, 0.95)",
          border: "2px solid #eab308",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(234, 179, 8, 0.2)",
          borderRadius: 14, padding: "16px 20px", maxWidth: 400,
          color: "#fff", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "flex-start", gap: 14,
          animation: "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            background: "#fffbeb", color: "#b45309",
            width: 40, height: 40, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            fontWeight: 800, fontSize: 18
          }}>
            📩
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              DEV MOCK EMAIL TOAST
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", lineHeight: 1.5, wordBreak: "break-word" }}>
              {toastMessage.msg.replace("📩 Notification: ", "")}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, fontSize: 18, fontWeight: "bold" }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px 80px",
      }}>
        {/* Dark Matte Slate Grey Card */}
        <div style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 20,
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)",
          width: "100%",
          maxWidth: 480,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Subtle gold decorative top bar */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #0f172a 0%, #eab308 50%, #0f172a 100%)" }} />

          <div style={{ padding: "40px 42px" }}>
            
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{
                display: "inline-block", background: "rgba(234, 179, 8, 0.1)",
                color: "#eab308", fontSize: 11, fontWeight: 800, padding: "5px 12px", borderRadius: 999,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14,
                border: "1px solid rgba(234, 179, 8, 0.25)",
              }}>
                {step === 1 ? "Account Recovery" : "Security Verification"}
              </span>
              <h1 style={{
                fontFamily: "'Playfair Display', 'Didot', 'Bodoni MT', 'Cinzel', 'Georgia', serif",
                fontSize: 32, fontWeight: 700, color: "#f8fafc",
                margin: "0 0 10px", letterSpacing: "-0.01em",
              }}>
                {step === 1 ? "Reset Password" : "Enter Reset Code"}
              </h1>
              <p style={{ fontSize: 13.5, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                {step === 1
                  ? "Enter the email address associated with your account to receive an OTP verification code."
                  : `We sent a simulation code to ${email}. Check your top-right Dev Toast notification!`}
              </p>
            </div>

            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5", padding: "12px 16px", borderRadius: 8,
                marginBottom: 24, fontSize: 13, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#ef4444" }}>error</span>
                {error}
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: Enter Email Form */
              <form onSubmit={handleStep1Submit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div>
                  <label style={lbl}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    style={inp}
                    onFocus={e => { e.currentTarget.style.borderColor = "#eab308"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.15)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%", padding: "15px 0", borderRadius: 8,
                    fontWeight: 700, fontSize: 15, border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    background: isLoading ? "#475569" : "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                    color: "#0f172a",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    fontFamily: "inherit", letterSpacing: "-0.01em",
                    boxShadow: isLoading ? "none" : "0 8px 20px -4px rgba(234, 179, 8, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isLoading ? "Sending Code..." : "Send Verification OTP"}
                </button>
              </form>
            ) : (
              /* STEP 2: Enter OTP and New Password */
              <form onSubmit={handleStep2Submit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={lbl}>6-Digit OTP Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    placeholder="123456"
                    style={{ ...inp, fontSize: 18, letterSpacing: "0.2em", textAlign: "center", fontWeight: 800, borderColor: "#eab308" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#eab308"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.2)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#eab308"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <div>
                  <label style={lbl}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      style={{ ...inp, paddingRight: 46 }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#eab308"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.15)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: showPassword ? "#eab308" : "#94a3b8", padding: "6px",
                        display: "flex", alignItems: "center", zIndex: 10,
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={lbl}>Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    style={inp}
                    onFocus={e => { e.currentTarget.style.borderColor = "#eab308"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(234, 179, 8, 0.15)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 12 }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%", padding: "15px 0", borderRadius: 8,
                      fontWeight: 700, fontSize: 15, border: "none",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      background: isLoading ? "#475569" : "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                      color: "#0f172a",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      fontFamily: "inherit", letterSpacing: "-0.01em",
                      boxShadow: isLoading ? "none" : "0 8px 20px -4px rgba(234, 179, 8, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isLoading ? "Resetting Password..." : "Set New Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtp(""); setError(""); }}
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 8,
                      fontWeight: 600, fontSize: 13.5, border: "1px solid #334155",
                      background: "transparent", color: "#cbd5e1", cursor: "pointer",
                    }}
                  >
                    Use a different email address
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #1e293b", textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
              Remember your password?{" "}
              <Link to="/login" style={{ color: "#eab308", fontWeight: 700, textDecoration: "none", marginLeft: 4 }}>
                Back to Sign in
              </Link>
            </div>

          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default ForgotPasswordPage;
