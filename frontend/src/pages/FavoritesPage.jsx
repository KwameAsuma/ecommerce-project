import React from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

const FavoritesPage = () => {
  const { favorites, toggleFavorite, favoritesCount } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "80vh", backgroundColor: "var(--bg-base)", padding: "3rem 2%", maxWidth: "1600px", margin: "0 auto", color: "var(--text-primary)" }}>
      
      {/* Top Breadcrumb Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "700", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span> Home
        </button>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>Saved Favorites</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", margin: 0, letterSpacing: "-0.5px" }}>
            Your Favorites <span style={{ color: "#ef4444" }}>❤️</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginTop: "0.5rem", fontWeight: "500" }}>
            Quickly access and manage all the high-value authentic African goods and tech products you've bookmarked.
          </p>
        </div>
        <div style={{ padding: "0.6rem 1.2rem", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "20px", fontWeight: "800", fontSize: "1rem", color: "var(--brand-primary)" }}>
          {favoritesCount} {favoritesCount === 1 ? "Item Saved" : "Items Saved"}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", backgroundColor: "var(--bg-panel)", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "72px", color: "#fca5a5", marginBottom: "1.5rem" }}>favorite_border</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.8rem" }}>
            Your favorites collection is empty
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 2rem auto", fontSize: "1rem", lineHeight: "1.6" }}>
            Explore our vast native marketplace and tap the heart icon on any item card to bookmark products for rapid checkout and future monitoring!
          </p>
          <button 
            onClick={() => navigate("/")}
            style={{ padding: "1rem 2rem", backgroundColor: "#1e3a8a", color: "#ffffff", border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 15px rgba(30, 58, 138, 0.25)" }}
            onMouseOver={e=>e.currentTarget.style.backgroundColor="#172554"}
            onMouseOut={e=>e.currentTarget.style.backgroundColor="#1e3a8a"}
          >
            Explore Native Store
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
          {favorites.map((product) => (
            <div 
              key={product.id} 
              style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "20px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 15px 30px -10px rgba(0,0,0,0.12)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 15px rgba(0,0,0,0.04)"}}
            >
              <div 
                onClick={() => navigate(`/product/${product.id}`)} 
                style={{ height: "220px", cursor: "pointer", position: "relative", overflow: "hidden", backgroundColor: "#000000" }}
              >
                <img src={product.image || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseOver={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} />
                
                <span style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "rgba(0,0,0,0.65)", color: "#ffffff", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "800", backdropFilter: "blur(4px)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {product.category || "Authentic Item"}
                </span>

                {/* Remove Favorite Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product);
                  }}
                  title="Remove from Favorites"
                  style={{ position: "absolute", top: "0.8rem", right: "0.8rem", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#ffffff", border: "1px solid #fee2e2", display: "flex", justifyContent: "center", alignItems: "center", color: "#ef4444", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", transition: "all 0.15s" }}
                  onMouseOver={e=>e.currentTarget.style.transform="scale(1.1)"}
                  onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>favorite</span>
                </button>
              </div>

              <div style={{ padding: "1.4rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <div>
                  <h3 onClick={() => navigate(`/product/${product.id}`)} style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", fontWeight: "800", color: "var(--text-primary)", cursor: "pointer", lineHeight: "1.3" }}>
                    {product.name}
                  </h3>
                  <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--brand-primary)", marginBottom: "1.2rem" }}>
                    GHS {parseFloat(product.price || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                    }}
                    style={{ padding: "0.7rem", borderRadius: "10px", border: "2px solid #1e3a8a", backgroundColor: "transparent", color: "#1e3a8a", fontWeight: "800", fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.3rem" }}
                    onMouseOver={e=>{e.currentTarget.style.backgroundColor="#f1f5f9"}}
                    onMouseOut={e=>{e.currentTarget.style.backgroundColor="transparent"}}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                    Add to Cart
                  </button>
                  <button
                    onClick={() => navigate(`/checkout?buyNow=${product.id}&qty=1`)}
                    style={{ padding: "0.7rem", borderRadius: "10px", border: "none", backgroundColor: "#1e3a8a", color: "#ffffff", fontWeight: "800", fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 3px 10px rgba(30, 58, 138, 0.2)" }}
                    onMouseOver={e=>{e.currentTarget.style.backgroundColor="#172554"}}
                    onMouseOut={e=>{e.currentTarget.style.backgroundColor="#1e3a8a"}}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
