import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { mockCategories } from "../data/constants";

const CatalogPage = () => {
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const headlines = ["The Global Standard.", "Curated African Excellence.", "Premium Export Quality."];
  const subtexts = [
    "Curated export-quality goods from verified Ghanaian merchants.",
    "Discover handcrafted luxury delivered worldwide.",
    "Ethically sourced, sustainably crafted premium products."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeadlineIdx((prev) => (prev + 1) % headlines.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  const navigate = useNavigate();
  const { products, allProducts, loading, filters, updateFilter, resetFilters } = useCatalog();
  const { addToCart } = useCart();

  const handleBuyNow = (product) => {
    navigate(`/checkout?buyNow=${product.id}&qty=1`);
  };

  const darkNavyGradient = "linear-gradient(135deg, #0b1329 0%, #111c38 100%)";

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: darkNavyGradient, 
      color: "#ffffff",
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      padding: "2rem 1.5rem 5rem 1.5rem"
    }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        
        {/* Hero Banner Section */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "3.5rem 2.5rem",
          marginBottom: "2.5rem",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}>
          <div style={{ 
            display: "inline-block", 
            backgroundColor: "rgba(255, 255, 255, 0.08)", 
            backdropFilter: "blur(8px)", 
            padding: "0.4rem 1rem", 
            borderRadius: "30px", 
            fontSize: "0.8rem", 
            fontWeight: "700", 
            letterSpacing: "0.08em", 
            textTransform: "uppercase", 
            width: "fit-content", 
            border: "1px solid rgba(255, 255, 255, 0.15)", 
            color: "#e2e8f0" 
          }}>
            Premium Selection
          </div>
          <div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", 
              fontWeight: "800", 
              color: "#ffffff", 
              letterSpacing: "-0.02em", 
              margin: "0 0 0.75rem 0",
              opacity: fade ? 1 : 0,
              transition: "opacity 0.4s ease-in-out",
              lineHeight: "1.15"
            }}>
              {headlines[headlineIdx]}
            </h1>
            <p style={{ 
              color: "#94a3b8", 
              fontSize: "1.125rem", 
              margin: 0,
              maxWidth: "600px",
              lineHeight: "1.6",
              opacity: fade ? 1 : 0,
              transition: "opacity 0.4s ease-in-out"
            }}>
              {subtexts[headlineIdx]}
            </p>
          </div>
        </div>

        {/* Dynamic Categories */}
        <div style={{ 
          display: "flex", 
          gap: "0.75rem", 
          overflowX: "auto", 
          paddingBottom: "0.5rem", 
          marginBottom: "1.5rem", 
          scrollbarWidth: "none" 
        }}>
          {mockCategories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button 
                key={cat}
                onClick={() => updateFilter("category", cat)}
                style={{ 
                  padding: "0.65rem 1.4rem", 
                  borderRadius: "100px", 
                  border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.12)", 
                  backgroundColor: isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.05)", 
                  color: isSelected ? "#0b1329" : "#cbd5e1", 
                  fontWeight: "700", 
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "0 0 15px rgba(56, 189, 248, 0.3)" : "none"
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active Filters Bar */}
        {(filters.category !== "All Goods" || filters.region !== "All Regions" || filters.priceRange !== "All Prices" || filters.trustScore > 50) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem", padding: "0.75rem 1rem", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "0.25rem" }}>Filters:</span>
            
            {filters.category !== "All Goods" && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", color: "#ffffff" }}>
                {filters.category} 
                <span onClick={() => updateFilter("category", "All Goods")} style={{ marginLeft: "0.5rem", cursor: "pointer", color: "#38bdf8", fontWeight: "bold" }}>✕</span>
              </span>
            )}
            {filters.region !== "All Regions" && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", color: "#ffffff" }}>
                {filters.region} 
                <span onClick={() => updateFilter("region", "All Regions")} style={{ marginLeft: "0.5rem", cursor: "pointer", color: "#38bdf8", fontWeight: "bold" }}>✕</span>
              </span>
            )}
            {filters.priceRange !== "All Prices" && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", color: "#ffffff" }}>
                Under GH₵ {filters.priceRange.toLocaleString()} 
                <span onClick={() => updateFilter("priceRange", "All Prices")} style={{ marginLeft: "0.5rem", cursor: "pointer", color: "#38bdf8", fontWeight: "bold" }}>✕</span>
              </span>
            )}
            {filters.trustScore > 50 && (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.85rem", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600", color: "#ffffff" }}>
                Score {filters.trustScore}+ 
                <span onClick={() => updateFilter("trustScore", 50)} style={{ marginLeft: "0.5rem", cursor: "pointer", color: "#38bdf8", fontWeight: "bold" }}>✕</span>
              </span>
            )}
          </div>
        )}

        {/* Main Catalog View */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", color: "#94a3b8", fontWeight: "500" }}>Loading premium products...</div>
        ) : products.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "20px", border: "1px dashed rgba(255, 255, 255, 0.15)" }}>
              <h2 style={{ color: "#ffffff", fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                No results found for "{filters.searchQuery || filters.category}"
              </h2>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem", maxWidth: "480px", margin: "0 auto 1.5rem auto", lineHeight: "1.5" }}>
                We couldn't find matches for your current filter selection. Here are some featured items you might like instead.
              </p>
              <button onClick={() => resetFilters()} style={{ padding: "0.75rem 1.75rem", backgroundColor: "#38bdf8", color: "#0b1329", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem" }}>
                Reset All Filters
              </button>
            </div>
            
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>You Might Also Like</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem" }}>
                {(allProducts || []).slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} navigate={navigate} handleBuyNow={handleBuyNow} addToCart={addToCart} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem", marginBottom: "5rem" }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} navigate={navigate} handleBuyNow={handleBuyNow} addToCart={addToCart} />
            ))}
          </div>
        )}

        {/* World-Class Picks Carousel Section */}
        <div style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#ffffff", margin: "0 0 0.25rem 0", letterSpacing: "-0.01em" }}>World-Class Picks</h2>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", margin: 0 }}>Curated selections matching your refined taste.</p>
          </div>
          
          <div style={{ display: "flex", gap: "1.25rem", overflowX: "auto", paddingBottom: "1rem", scrollbarWidth: "none" }}>
            {!loading && products.slice(0, 5).map(product => (
              <div 
                key={`carousel-${product.id}`} 
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ 
                  minWidth: "260px", 
                  backgroundColor: "rgba(255, 255, 255, 0.04)", 
                  border: "1px solid rgba(255, 255, 255, 0.1)", 
                  borderRadius: "16px", 
                  overflow: "hidden", 
                  cursor: "pointer",
                  transition: "transform 0.2s ease, border-color 0.2s ease" 
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <div style={{ height: "180px", backgroundColor: "rgba(0, 0, 0, 0.2)", position: "relative" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", fontWeight: "700", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</h3>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#fbbf24" }}>GH₵ {product.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Extracted Dark-Themed Product Card Component
const ProductCard = ({ product, navigate, handleBuyNow, addToCart }) => {
  return (
    <div 
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.04)", 
        border: "1px solid rgba(255, 255, 255, 0.08)", 
        borderRadius: "16px", 
        overflow: "hidden", 
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease" 
      }} 
      onMouseOver={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.5)";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
      }} 
      onMouseOut={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
      }}
    >
      <div 
        onClick={() => navigate(`/product/${product.id}`)} 
        style={{ height: "220px", backgroundColor: "rgba(0, 0, 0, 0.2)", cursor: "pointer", position: "relative", overflow: "hidden" }}
      >
        <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {product.tags && product.tags.length > 0 && (
          <div style={{ position: "absolute", top: "0.85rem", left: "0.85rem", backgroundColor: "rgba(11, 19, 41, 0.85)", backdropFilter: "blur(6px)", padding: "0.25rem 0.65rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700", color: "#4ade80", display: "flex", alignItems: "center", gap: "0.25rem", border: "1px solid rgba(74, 222, 128, 0.3)" }}>
            <span>✓</span> {product.tags[0]}
          </div>
        )}
      </div>

      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem", gap: "0.5rem" }}>
          <h3 
            onClick={() => navigate(`/product/${product.id}`)} 
            style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#ffffff", cursor: "pointer", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {product.name}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#fbbf24", fontSize: "0.8rem", fontWeight: "700", shrink: 0 }}>
            ★ {product.rating.toFixed(1)}
          </div>
        </div>

        <p style={{ fontSize: "0.825rem", color: "#94a3b8", margin: "0 0 1.25rem 0", lineHeight: "1.5", height: "38px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {product.description}
        </p>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#ffffff" }}>
            GH₵ {product.price.toLocaleString()}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button 
              onClick={() => handleBuyNow(product)} 
              style={{ padding: "0.6rem", backgroundColor: "#38bdf8", color: "#0b1329", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", transition: "opacity 0.15s ease" }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
            >
              Buy Now
            </button>
            <button 
              onClick={() => addToCart(product)} 
              style={{ padding: "0.6rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#ffffff", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)"; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"; }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;