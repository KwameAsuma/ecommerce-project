import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        momo_number: momoNumber,
      });
      if (response.data.message) {
        navigate("/login");
      } else {
        setError("Registration failed. Please check your reply.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
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
          maxWidth: "520px",
          width: "100%",
          padding: "2rem",
          borderRadius: "24px",
          background: "white",
          boxShadow: "0 25px 75px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ marginBottom: "0.75rem", color: "#111827" }}>Register</h1>
        <p style={{ marginBottom: "1.5rem", color: "#475569" }}>
          Create a buyer or vendor session and start browsing inventory or bidding live.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", color: "#475569", marginBottom: "0.5rem" }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            minLength={6}
            style={{
              width: "100%",
              padding: "0.85rem 1rem",
              borderRadius: "14px",
              border: "1px solid #d1d5db",
              marginBottom: "1rem",
            }}
          />

          <label style={{ display: "block", color: "#475569", marginBottom: "0.5rem" }}>
            Mobile Money Number
          </label>
          <input
            type="text"
            value={momoNumber}
            onChange={(e) => setMomoNumber(e.target.value)}
            placeholder="Optional"
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
