import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { mockCategories } from "../data/mockDb";

const CatalogPage = () => {
  const navigate = useNavigate();
  const { products, loading, filters, updateFilter } = useCatalog();
  const { addToCart } = useCart();

  const handleBuyNow = (product) => {
    // Add to cart and immediately go to checkout
    addToCart(product);
    navigate("/checkout");
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Top Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 0.5rem 0" }}>
            The Global Standard.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Curated export-quality goods from verified Ghanaian merchants.
          </p>
        </div>

        {/* Dual-Catalog Toggle */}
        <div style={{ display: "flex", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.4rem" }}>
          <button 
            style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontWeight: "700", fontSize: "0.9rem", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", cursor: "default" }}
          >
            Native Store
          </button>
          <button 
            onClick={() => navigate("/auctions")}
            style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseOut={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Consolidated Imports
          </button>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "2rem", scrollbarWidth: "none" }}>
        {mockCategories.map((cat) => (
          <button 
            key={cat}
            onClick={() => updateFilter("category", cat)}
            style={{ 
              padding: "0.6rem 1.2rem", 
              borderRadius: "20px", 
              border: filters.category === cat ? "none" : "1px solid var(--border)", 
              backgroundColor: filters.category === cat ? "var(--text-primary)" : "transparent", 
              color: filters.category === cat ? "white" : "var(--text-secondary)", 
              fontWeight: "600", 
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

        {/* Active Filters Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", marginRight: "0.5rem" }}>Active Filters:</span>
          
          {filters.region !== "All Regions" && (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.8rem", backgroundColor: "rgba(30, 58, 138, 0.05)", border: "1px solid rgba(30, 58, 138, 0.1)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600", color: "var(--brand-blue)" }}>
              {filters.region} <span onClick={() => updateFilter("region", "All Regions")} style={{ marginLeft: "0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>✕</span>
            </span>
          )}
          
          {filters.priceRange < 10000 && (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.8rem", backgroundColor: "rgba(30, 58, 138, 0.05)", border: "1px solid rgba(30, 58, 138, 0.1)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600", color: "var(--brand-blue)" }}>
              Under GH₵ {filters.priceRange} <span onClick={() => updateFilter("priceRange", 10000)} style={{ marginLeft: "0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>✕</span>
            </span>
          )}

          {filters.trustScore > 50 && (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.8rem", backgroundColor: "rgba(30, 58, 138, 0.05)", border: "1px solid rgba(30, 58, 138, 0.1)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600", color: "var(--brand-blue)" }}>
              Score {filters.trustScore}+ <span onClick={() => updateFilter("trustScore", 50)} style={{ marginLeft: "0.5rem", cursor: "pointer", fontSize: "0.8rem" }}>✕</span>
            </span>
          )}
        </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Loading premium products...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h2 style={{ color: "var(--text-primary)" }}>No products found</h2>
          <p>Try adjusting your filters or search query.</p>
          <button onClick={() => updateFilter("category", "All Goods")} style={{ marginTop: "1rem", padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Reset Search</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 24px -10px rgba(0,0,0,0.1)"}} onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"}}>
              <div onClick={() => navigate(`/product/${product.id}`)} style={{ height: "240px", backgroundColor: "#f1f5f9", cursor: "pointer", position: "relative" }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {product.tags && product.tags.length > 0 && (
                  <div style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span>✓</span> {product.tags[0]}
                  </div>
                )}
              </div>
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 onClick={() => navigate(`/product/${product.id}`)} style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", cursor: "pointer" }}>{product.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "var(--brand-gold)", fontSize: "0.85rem", fontWeight: "700" }}>
                    ★ {product.rating.toFixed(1)}
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem 0", lineHeight: "1.5", height: "40px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {product.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", gap: "1rem" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--text-primary)" }}>
                    GH₵ {product.price.toLocaleString()}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexGrow: 1, maxWidth: "120px" }}>
                    <button onClick={() => handleBuyNow(product)} style={{ width: "100%", padding: "0.5rem", backgroundColor: "#000", color: "white", border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", transition: "opacity 0.2s" }} onMouseOver={e=>e.currentTarget.style.opacity="0.8"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>Buy Now</button>
                    <button onClick={() => addToCart(product)} style={{ width: "100%", padding: "0.5rem", backgroundColor: "transparent", border: "1px solid #000", color: "#000", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>{e.currentTarget.style.backgroundColor="#000"; e.currentTarget.style.color="white";}} onMouseOut={e=>{e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color="#000";}}>Add to Cart</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* World-Class Picks Carousel */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.2rem 0" }}>World-Class Picks</h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>Curated selections matching your refined taste.</p>
          </div>
        </div>
        
        {/* Carousel Track */}
        <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "1rem" }} className="hide-scrollbar">
          {!loading && products.slice(0, 4).map(product => (
            <div key={`carousel-${product.id}`} style={{ minWidth: "280px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ height: "180px", backgroundColor: "#f1f5f9" }}>
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "1.2rem" }}>
                <h3 style={{ margin: "0 0 0.3rem 0", fontSize: "1rem", color: "var(--text-primary)" }}>{product.name}</h3>
                <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--brand-blue)", marginTop: "0.5rem" }}>GH₵ {product.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CatalogPage;
