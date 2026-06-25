import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("role") === "merchant") {
      setRole("MERCHANT");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, password, role });
      const data = await login(email, password);
      const userRole = data?.user?.role || "customer";
      navigate(userRole === "merchant" ? "/merchant" : "/catalog");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0 }}>TradeHub Ghana</h1>
      </div>

      <div className="auth-card">
        <h2 style={{ textAlign: "center", margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>SIGN UP</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Create your account</p>
        
        {error && <div style={{ color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email / Phone</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.85rem" }}>I am registering as a:</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", border: role === "BUYER" ? "2px solid var(--brand-blue)" : "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="BUYER" 
                  checked={role === "BUYER"} 
                  onChange={() => setRole("BUYER")} 
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: "600", color: role === "BUYER" ? "var(--brand-blue)" : "var(--text-primary)" }}>Customer</span>
              </label>
              
              <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem", border: role === "MERCHANT" ? "2px solid var(--brand-gold)" : "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="MERCHANT" 
                  checked={role === "MERCHANT"} 
                  onChange={() => setRole("MERCHANT")} 
                  style={{ margin: 0 }}
                />
                <span style={{ fontWeight: "600", color: role === "MERCHANT" ? "var(--brand-gold)" : "var(--text-primary)" }}>Merchant</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="btn-gold" style={{ marginTop: "1rem" }}>
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/login" style={{ fontSize: "0.9rem", color: "var(--brand-blue)", textDecoration: "none" }}>Already have an account? Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
