import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#f8fafc",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/catalog" style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}>
          Marketplace
        </Link>
        <Link to="/auctions" style={{ textDecoration: "none", color: "#475569" }}>
          Live Auctions
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user ? (
          <>
            <span style={{ color: "#334155" }}>Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.6rem 1.1rem",
                borderRadius: "999px",
                border: "1px solid #cbd5e1",
                background: "white",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#2563eb" }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#2563eb" }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
