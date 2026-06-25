import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      const role = data?.user?.role || "customer";
      navigate(role === "merchant" ? "/merchant" : "/catalog");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0 }}>TradeHub Ghana</h1>
      </div>
      
      <div className="auth-card">
        <h2 style={{ textAlign: "center", margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>SIGN IN</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>Enter as user credentials</p>
        
        {error && <div style={{ color: "var(--danger)", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
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
          
          <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
            <Link to="#" style={{ fontSize: "0.85rem", color: "var(--brand-blue)", textDecoration: "none" }}>Reset password?</Link>
          </div>
          
          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/register" style={{ fontSize: "0.9rem", color: "var(--brand-blue)", textDecoration: "none" }}>Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
