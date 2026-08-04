import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCatalog } from "../context/CatalogContext";
import { resolveImageUrl } from "../utils/imageUtils";

const VerifiedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb" style={{ verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const MerchantProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allProducts } = useCatalog();
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProductImage = (product) => {
    const title = (product.title || product.name || "").toLowerCase();
    const rawUrl = (product.imageUrl || product.image || "").toLowerCase();
    if (title.includes("rolex") || title.includes("submariner") || rawUrl.includes("rolex") || rawUrl.includes("google.com/url") || rawUrl.includes("m126610lv")) {
      return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop";
    }
    if (product.imageUrl || product.image) {
      const url = (product.imageUrl || product.image).split(',')[0].trim();
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      return `http://localhost:5001${url}`;
    }
    const fallbacks = [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"
    ];
    return fallbacks[(product.id || 0) % fallbacks.length];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/merchant/${id}`);
        setMerchant(res.data);
      } catch (err) {
        console.error("Failed to fetch merchant profile:", err);
        setError("Could not load merchant profile. They may have been removed or deactivated.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-primary)" }}>Loading Storefront...</div>;
  }

  if (error || !merchant) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-primary)" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Store Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{error}</p>
        <button 
          onClick={() => navigate("/merchants")}
          style={{ padding: "0.8rem 2rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Back to Verified Merchants
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeRoute 0.4s ease-out" }}>
      {/* Store Banner */}
      <div style={{ width: "100%", height: "220px", backgroundColor: "var(--brand-primary)", borderRadius: "16px", marginBottom: "4rem", position: "relative", backgroundImage: merchant.storeBannerUrl ? `linear-gradient(90deg, rgba(15,23,42,0.8) 0%, rgba(15,23,42,0.4) 40%, rgba(15,23,42,0) 100%), url(${resolveImageUrl(merchant.storeBannerUrl)})` : "linear-gradient(45deg, var(--brand-primary), var(--brand-blue-dark, #1e3a8a))", backgroundSize: "cover", backgroundPosition: "center" }}>
        
        {/* Profile Image & Name (Overlapping) */}
        <div style={{ position: "absolute", bottom: "-40px", left: "2rem", display: "flex", alignItems: "flex-end", gap: "1.5rem" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "16px", backgroundColor: "var(--bg-base)", border: "4px solid var(--bg-base)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "3rem", fontWeight: "bold", color: "var(--brand-primary)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden" }}>
            {merchant.avatarUrl ? <img src={resolveImageUrl(merchant.avatarUrl)} alt={merchant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : merchant.name.charAt(0)}
          </div>
          <div style={{ paddingBottom: "0.5rem" }}>
            <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.9)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {merchant.name} <VerifiedIcon />
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", textShadow: "0 1px 4px rgba(0,0,0,0.9)", margin: "0.2rem 0 0 0", fontWeight: "700" }}>
              Official Verified Storefront
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem", padding: "0 2rem" }}>
        <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--brand-accent)" }}>star</span>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)" }}>{merchant.averageRating.toFixed(1)}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Trust Rating</div>
          </div>
        </div>
        <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--success, #10b981)" }}>verified</span>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)" }}>{merchant.salesCount}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Verified Sales</div>
          </div>
        </div>
        <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--brand-primary)" }}>inventory_2</span>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--text-primary)" }}>{merchant.productCount}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Active Products</div>
          </div>
        </div>
        <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "var(--text-muted)" }}>calendar_month</span>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--text-primary)" }}>{new Date(merchant.createdAt).getFullYear()}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Joined BediDwa</div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div style={{ padding: "0 2rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Store Inventory</h2>
        
        {(() => {
          const displayProducts = (merchant.products && merchant.products.length > 0) ? merchant.products : (allProducts || []).filter(p => Number(p.vendorId || p.merchantId) === Number(id) || Number(p.vendor?.id) === Number(id));
          return displayProducts.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
            {displayProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)"; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ height: "200px", width: "100%", backgroundColor: "var(--border)", position: "relative" }}>
                  <img src={getProductImage(product)} alt={product.title || product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {product.stockCount !== undefined && product.stockCount <= 5 && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "var(--brand-red, #ef4444)", color: "white", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                      Only {product.stockCount} left
                    </div>
                  )}
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
                    {product.category || "General"}
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 0.5rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.title || product.name}
                  </h3>
                  <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--text-primary)", marginTop: "1rem" }}>
                    GH₵ {parseFloat(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "4rem", textAlign: "center", backgroundColor: "var(--bg-panel)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }}>inventory_2</span>
            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>No Products Available</h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>This merchant currently has no active listings.</p>
          </div>
        );
        })()}
      </div>

    </div>
  );
};

export default MerchantProfilePage;
