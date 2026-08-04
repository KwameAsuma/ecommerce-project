import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showAddedPopup, setShowAddedPopup] = useState(false);
  const { user } = useAuth();

  const { products, loading } = useCatalog();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);

  const similarProducts = products
    .filter(p => p.id !== product?.id && (p.category === product?.category || p.region === product?.region))
    .slice(0, 4);
  const recommendedDisplay = similarProducts.length > 0 ? similarProducts : products.filter(p => p.id !== product?.id).slice(0, 4);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      api.get(`/reviews/product/${product.id}`)
        .then(res => {
          setReviews(res.data.reviews || []);
          setAverageRating(Number(res.data.averageRating || 0));
        })
        .catch(err => console.error("Failed to fetch reviews", err));
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart({ ...product, qty: quantity }, quantity);
    setShowAddedPopup(true);
    setTimeout(() => setShowAddedPopup(false), 3500);
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout?buyNow=${product.id}&qty=${quantity}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-primary)" }}>
        <h2>Loading Product Details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-primary)" }}>
        <h2>Product Not Found</h2>
        <button onClick={() => navigate("/")} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginTop: "1rem", fontWeight: "700" }}>Back to Catalog</button>
      </div>
    );
  }

  const isRolex = ((product.name || product.title || "").toLowerCase().includes("rolex") || (product.name || product.title || "").toLowerCase().includes("submariner") || (product.imageUrl || product.image || "").toLowerCase().includes("rolex") || (product.imageUrl || product.image || "").toLowerCase().includes("google.com/url"));
  const imgSource = isRolex ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop" : (product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`) : product.image);

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "1.5rem 1rem 3rem 1rem" }}>
      
      {/* Breadcrumb - Compact */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.2rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ cursor: "pointer", color: "var(--brand-primary)" }} onClick={() => navigate("/")}>Home</span> &gt; 
        <span>{product.category}</span> &gt; 
        <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
      </div>

      {/* Compact Main Product Card (Side-by-Side) */}
      <div className="glass-panel premium-card" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", padding: "1.8rem", marginBottom: "2.5rem", borderRadius: "16px" }}>
        
        {/* Left Column: Image Gallery & Top-Aligned Merchant Info */}
        <div style={{ flex: "1 1 380px", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ width: "100%", height: "350px", borderRadius: "12px", overflow: "hidden", backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <img src={imgSource} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Vendor Profile Compact Widget Top Aligned with Image */}
          <div style={{ backgroundColor: "var(--bg-base)", padding: "1.2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.3rem", fontWeight: "900", boxShadow: "0 2px 8px rgba(37,99,235,0.3)" }}>
                {product.merchant ? String(product.merchant).charAt(0).toUpperCase() : "M"}
              </div>
              <div>
                <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: "800" }}>{product.merchant}</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#10b981", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <span className="material-symbols-outlined text-[14px]">verified</span> TradeHub Verified Seller
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.45", margin: "0 0 1rem 0" }}>
              Direct fulfillment from {product.region || "Ghana"}. Protected under TradeHub Momo Escrow protocols.
            </p>
            <button 
              onClick={() => navigate('/merchants')}
              style={{ width: "100%", padding: "0.65rem", backgroundColor: "var(--bg-panel)", color: "var(--brand-primary)", border: "1px solid var(--border)", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.4rem" }}
              onMouseOver={e=>e.currentTarget.style.borderColor="var(--brand-primary)"}
              onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span> View Seller Storefront
            </button>
          </div>
        </div>

        {/* Right Column: Key details and Actions */}
        <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: "800", padding: "0.25rem 0.7rem", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--brand-primary)", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {product.region || "Verified Local Store"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--brand-accent)", fontSize: "1rem", fontWeight: "800" }}>
                ★ {Number(averageRating || product.rating || 0).toFixed(1)}
                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600" }}>({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--text-primary)", margin: "0 0 0.8rem 0", lineHeight: "1.25" }}>
              {product.name}
            </h1>

            <div style={{ fontSize: "1.7rem", fontWeight: "900", color: "var(--brand-primary)", marginBottom: "1rem" }}>
              GH₵ {(Number(product.price) || 0).toLocaleString()}
            </div>

            <p style={{ color: "var(--text-secondary)", lineHeight: "1.55", fontSize: "0.93rem", marginBottom: "1.5rem", margin: "0 0 1.5rem 0", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {product.description}
            </p>
          </div>

          {/* Compact Actions Box */}
          <div style={{ backgroundColor: "var(--bg-base)", padding: "1.2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", backgroundColor: "var(--bg-panel)", height: "46px" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: "0 1rem", height: "100%", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "1.1rem", color: "var(--text-primary)" }}>-</button>
                <div style={{ padding: "0 0.8rem", fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem" }}>{quantity}</div>
                <button onClick={() => setQuantity(quantity + 1)} style={{ padding: "0 1rem", height: "100%", backgroundColor: "transparent", border: "none", cursor: "pointer", fontWeight: "900", fontSize: "1.1rem", color: "var(--text-primary)" }}>+</button>
              </div>

              <button 
                onClick={handleAddToCart}
                style={{ flexGrow: 1, height: "46px", padding: "0 1.2rem", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--brand-primary)", border: "2px solid var(--brand-primary)", borderRadius: "10px", fontWeight: "800", fontSize: "1rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                onMouseOver={e=>e.currentTarget.style.backgroundColor="rgba(37,99,235,0.18)"}
                onMouseOut={e=>e.currentTarget.style.backgroundColor="rgba(37, 99, 235, 0.1)"}
              >
                <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                Add to Cart
              </button>

              <button 
                onClick={handleBuyNow}
                style={{ flexGrow: 1, height: "46px", padding: "0 1.2rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "1rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)", transition: "all 0.2s" }}
                onMouseOver={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}
              >
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                Buy Now
              </button>
            </div>

            {/* Small Popup Notification Under Button */}
            {showAddedPopup && (
              <div style={{
                marginTop: "0.9rem",
                padding: "0.65rem 1.1rem",
                backgroundColor: "#067d62",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: "800",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 12px rgba(6, 125, 98, 0.25)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Successfully added to your cart!</span>
                </div>
                <span onClick={() => navigate("/checkout")} style={{ textDecoration: "underline", cursor: "pointer", fontWeight: "900", fontSize: "0.85rem", marginLeft: "1rem" }}>View Cart &gt;</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div style={{ width: "100%", marginBottom: "3rem" }}>
        <div className="glass-panel premium-card" style={{ padding: "1.8rem", borderRadius: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                Customer Reviews & Ratings
              </h3>
              <button 
                onClick={() => setReviewModalOpen(true)}
                style={{ padding: "0.5rem 1rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={e=>e.currentTarget.style.opacity="0.9"}
                onMouseOut={e=>e.currentTarget.style.opacity="1"}
              >
                + Leave a Review
              </button>
            </div>
            
            {reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-secondary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "36px", opacity: 0.5, display: "block", marginBottom: "0.5rem" }}>rate_review</span>
                No reviews recorded yet. Be the first to share your experience with this item!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.5rem" }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "0.95rem" }}>{review.reviewer?.name || "Verified Buyer"}</div>
                      <div style={{ color: "var(--brand-accent)", fontSize: "0.9rem", fontWeight: "bold" }}>
                        {(() => {
                          const r = Math.max(0, Math.min(5, Math.floor(Number(review.rating) || 0)));
                          return "★".repeat(r) + "☆".repeat(5 - r);
                        })()}
                      </div>
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.4rem" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem", lineHeight: "1.4" }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      {/* Recommended Products - Compact Grid */}
      {recommendedDisplay && recommendedDisplay.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="material-symbols-outlined text-[24px]" style={{ color: "var(--brand-primary)" }}>recommend</span>
            Frequently Bought Together & Similar Items
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.2rem" }}>
            {recommendedDisplay.map((rec) => {
              const recImg = rec.imageUrl ? (rec.imageUrl.startsWith('http') ? rec.imageUrl : `http://localhost:5000${rec.imageUrl}`) : rec.image;
              return (
                <div 
                  key={rec.id}
                  onClick={() => {
                    navigate(`/product/${rec.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="glass-panel"
                  style={{ 
                    border: "1px solid var(--border)", 
                    borderRadius: "12px", 
                    overflow: "hidden", 
                    backgroundColor: "var(--bg-panel)", 
                    cursor: "pointer", 
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative"
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 20px -5px rgba(0,0,0,0.1)"; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ height: "160px", width: "100%", backgroundColor: "var(--bg-base)", overflow: "hidden", position: "relative" }}>
                    <img src={recImg} alt={rec.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--brand-primary)", fontWeight: "800", textTransform: "uppercase", marginBottom: "0.2rem" }}>{rec.category}</div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: "1.3", marginBottom: "0.6rem" }}>{rec.name}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: "900", color: "var(--text-primary)" }}>
                        GH₵ {rec.price ? rec.price.toLocaleString() : "0"}
                      </span>
                      <span style={{ color: "var(--brand-primary)", fontWeight: "700", fontSize: "0.8rem", display: "flex", alignItems: "center" }}>
                        View <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ReviewModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        merchantId={product.vendorId}
        productId={product.id}
        onSubmit={(newReview) => {
          setReviews([newReview, ...reviews]);
          alert("Review submitted successfully!");
        }}
      />
    </div>
  );
};

export default ProductDetailsPage;
