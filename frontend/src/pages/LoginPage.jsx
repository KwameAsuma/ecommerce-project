import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login(email, password);
      if (response.status === "success") {
        navigate("/catalog");
      } else {
        setError(response.error || "Login failed. Check credentials.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "2rem",
          borderRadius: "24px",
          background: "white",
          boxShadow: "0 25px 75px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ marginBottom: "0.75rem", color: "#111827" }}>Login</h1>
        <p style={{ marginBottom: "1.5rem", color: "#475569" }}>
          Access your account to place bids and view the private auction experience.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", color: "#475569", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "14px",
              border: "1px solid #d1d5db",
              marginBottom: "1rem",
            }}
          />

          <label style={{ display: "block", color: "#475569", marginBottom: "0.5rem" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "14px",
              border: "1px solid #d1d5db",
              marginBottom: "1rem",
            }}
          />

          {error && (
            <div style={{ color: "#b91c1c", marginBottom: "1rem" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.95rem 1rem",
              borderRadius: "14px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
