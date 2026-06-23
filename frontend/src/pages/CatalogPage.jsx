import { useState, useEffect } from "react";
import api from "../services/api";

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.products);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching catalog:", err);
        setError(
          "Failed to load products. Check your terminal to ensure backend is running.",
        );
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading Native Store...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "2rem", color: "red", textAlign: "center" }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          marginBottom: "2rem",
          borderBottom: "2px solid #eee",
          paddingBottom: "1rem",
        }}
      >
        <h1 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
          The Native Store
        </h1>
        <p style={{ margin: 0, color: "#666" }}>
          Zero-Import Local Goods & Essentials
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {products.length === 0 ? (
          <p>No products available yet. Log in as a vendor to list an item!</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #eaeaea",
                padding: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0", color: "#222" }}>
                {product.title}
              </h3>
              <p style={{ color: "#666", fontSize: "0.9rem", flexGrow: 1 }}>
                {product.description}
              </p>

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #eee",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#1a1a1a",
                  }}
                >
                  GHS {product.price}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "#888",
                  }}
                >
                  <span>Category: {product.category}</span>
                  <span>Stock: {product.stock_count}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
