import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({ bids: [], products: [] });
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if unauthenticated once auth loading is done
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch("/api/users/dashboard", {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data");
          }

          const result = await response.json();
          setDashboardData(result.data);
        } catch (err) {
          setError(err.message);
        } finally {
          setDataLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, loading, navigate]);

  if (loading || dataLoading) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "2rem", color: "#0f172a" }}>
        My Dashboard
      </h1>

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Bids Section */}
        <section style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            My Active Bids
          </h2>
          
          {dashboardData.bids.length === 0 ? (
            <p style={{ color: "#64748b" }}>You haven't placed any bids yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {dashboardData.bids.map((bid) => (
                <li key={bid.id} style={{ padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
                    {bid.auction?.title || "Unknown Auction"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#475569" }}>
                    <span>Bid Amount: <strong style={{ color: "#2563eb" }}>${parseFloat(bid.bidAmount).toFixed(2)}</strong></span>
                    <span>{new Date(bid.timestamp).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Products Section */}
        <section style={{ backgroundColor: "#ffffff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            My Listed Products
          </h2>
          
          {dashboardData.products.length === 0 ? (
            <p style={{ color: "#64748b" }}>You haven't listed any products.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {dashboardData.products.map((product) => (
                <li key={product.id} style={{ padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                  <div style={{ fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
                    {product.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#475569" }}>
                    <span>Price: <strong>${parseFloat(product.price).toFixed(2)}</strong></span>
                    <span>Stock: {product.stockCount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;
