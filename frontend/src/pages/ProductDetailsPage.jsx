import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";
import { useEffect } from "react";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { products, loading } = useCatalog();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      api.get(`/reviews/product/${product.id}`)
        .then(res => {
          setReviews(res.data.reviews || []);
          setAverageRating(res.data.averageRating || 0);
        })
        .catch(err => console.error("Failed to fetch reviews", err));
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart({ ...product, qty: quantity });
  };

  const handleBuyNow = () => {
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
        <button onClick={() => navigate("/catalog")} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <div className="responsive-flex" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
      
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
              ★ {averageRating ? averageRating.toFixed(1) : (product.rating ? product.rating.toFixed(1) : "0.0")} <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "500" }}>({reviews.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div style={{ width: "100%", height: "450px", backgroundColor: "#f1f5f9", borderRadius: "12px", overflow: "hidden", marginBottom: "1rem" }}>
          <img src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* Thumbnails */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "2px solid var(--brand-blue)" }}>
            <img src={product.imageUrl ? `http://localhost:5000${product.imageUrl}` : product.image} alt="Thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: "0.8rem 1.2rem", backgroundColor: "transparent", border: "none", borderRight: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", color: "var(--text-primary)" }}>-</button>
            <div style={{ padding: "0.8rem 1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>{quantity}</div>
            <button onClick={() => setQuantity(quantity + 1)} style={{ padding: "0.8rem 1.2rem", backgroundColor: "transparent", border: "none", borderLeft: "1px solid var(--border)", cursor: "pointer", fontWeight: "bold", color: "var(--text-primary)" }}>+</button>
          </div>
          <button 
            onClick={handleAddToCart}
            style={{ flexGrow: 1, padding: "1.2rem", backgroundColor: "var(--bg-base)", color: "var(--brand-blue)", border: "2px solid var(--brand-blue)", borderRadius: "8px", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.backgroundColor="rgba(37,99,235,0.05)"}
            onMouseOut={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"}
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            style={{ flexGrow: 1, padding: "1.2rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" }}
          >
            Buy Now
          </button>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>Customer Reviews</h3>
            <button 
              onClick={() => setReviewModalOpen(true)}
              style={{ padding: "0.6rem 1.2rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Leave a Review
            </button>
          </div>
          
          {reviews.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {reviews.map(review => (
                <div key={review.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>{review.reviewer?.name || "Anonymous"}</div>
                    <div style={{ color: "var(--brand-gold)", fontSize: "1rem" }}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </div>
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <p style={{ color: "var(--text-primary)", margin: 0 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
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



          <button 
            onClick={() => {
              navigate('/merchants');
            }}
            style={{ width: "100%", padding: "0.8rem", backgroundColor: "transparent", color: "var(--brand-blue)", border: "1px solid var(--brand-blue)", borderRadius: "8px", fontWeight: "700", marginBottom: "2rem", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
          >
            View Vendor Profile
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
