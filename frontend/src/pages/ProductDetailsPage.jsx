import { useParams, useNavigate } from "react-router-dom";
import { mockProducts } from "../data/mockDb";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-primary)" }}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate("/catalog")} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "3rem", paddingBottom: "4rem", flexWrap: "wrap" }}>
      
      {/* Left Column: Product Details */}
      <div style={{ flex: 2, minWidth: "300px" }}>
        
        {/* Breadcrumb */}
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: "500" }}>
          Home &gt; {product.category.includes("Electronics") ? "Imports" : "Native Store"} &gt; {product.category} &gt; <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
        </div>

        {/* Product Info (Top) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--brand-gold)", fontSize: "1.1rem" }}>
              ★ {product.rating.toFixed(1)} <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "500" }}>({product.reviews} ratings)</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", fontSize: "1.2rem", color: "var(--text-secondary)" }}>
            <span style={{ cursor: "pointer" }}>♡</span>
            <span style={{ cursor: "pointer" }}>🔗</span>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{ width: "100%", height: "450px", backgroundColor: "#f1f5f9", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Thumbnails */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "2px solid var(--brand-blue)" }}>
            <img src={product.image} alt="Thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#000", marginBottom: "2rem" }}>
          GH₵ {product.price.toLocaleString()}
        </div>

        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Description</h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem", marginBottom: "2rem" }}>
            {product.description}
          </p>
        </div>

        {/* Quantity & Buy Button */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "var(--bg-panel)" }}>
            <button style={{ padding: "0.8rem 1.2rem", backgroundColor: "transparent", border: "none", borderRight: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", color: "var(--text-primary)" }}>-</button>
            <div style={{ padding: "0.8rem 1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>1</div>
            <button style={{ padding: "0.8rem 1.2rem", backgroundColor: "transparent", border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", color: "var(--text-primary)" }}>+</button>
          </div>
          <button 
            onClick={() => navigate("/checkout")}
            style={{ flexGrow: 1, padding: "1.2rem", backgroundColor: "#000", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)", minWidth: "250px" }}
          >
            Buy Now
          </button>
        </div>

      </div>

      {/* Right Column: Seller Profile Page */}
      <div style={{ flex: 1, minWidth: "300px" }}>
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", position: "sticky", top: "100px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "var(--brand-blue)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
              {product.merchant.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.2rem", color: "var(--text-primary)" }}>{product.merchant}</h3>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Verified Merchant</div>
            </div>
          </div>



          <button style={{ width: "100%", padding: "0.8rem", backgroundColor: "transparent", color: "var(--brand-blue)", border: "1px solid var(--brand-blue)", borderRadius: "8px", fontWeight: "700", marginBottom: "2rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
            Ask a Question
          </button>

          <h4 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Contact Info</h4>
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong>Location</strong><br/>
            {product.region}, Ghana<br/><br/>
            <strong>Response Time</strong><br/>
            Usually replies within 1 hour
          </div>

        </div>
      </div>

    </div>
  );
};

export default ProductDetailsPage;
