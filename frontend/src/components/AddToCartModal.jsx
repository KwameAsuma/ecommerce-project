import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";

const AddToCartModal = () => {
  const { addedItemModal, setAddedItemModal, addToCart, cartTotal, cartCount } = useCart();
  const { allProducts } = useCatalog();
  const navigate = useNavigate();

  if (!addedItemModal) return null;

  const handleClose = () => setAddedItemModal(null);

  const handleCheckout = () => {
    setAddedItemModal(null);
    navigate("/checkout");
  };

  const handleGoToCart = () => {
    setAddedItemModal(null);
    navigate("/checkout");
  };

  const imgSource = addedItemModal.imageUrl ? (addedItemModal.imageUrl.startsWith('http') ? addedItemModal.imageUrl : `http://localhost:5000${addedItemModal.imageUrl}`) : addedItemModal.image;

  // Filter recommendations: items matching category or region first, then fallback to others, excluding current
  const sameCategory = allProducts ? allProducts.filter(p => p.id !== addedItemModal.id && p.category === addedItemModal.category) : [];
  const otherItems = allProducts ? allProducts.filter(p => p.id !== addedItemModal.id && p.category !== addedItemModal.category) : [];
  const recommendations = [...sameCategory, ...otherItems].slice(0, 6);

  return (
    <div 
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1.5rem"
      }}
      onClick={handleClose}
    >
      <div 
        className="amazon-add-modal"
        style={{
          backgroundColor: "#ffffff",
          color: "#0f1111",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1100px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          animation: "fadeInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes fadeInModal {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .amazon-btn-primary:hover {
            background-color: #f7ca00 !important;
          }
          .amazon-btn-secondary:hover {
            background-color: #f7fafa !important;
            border-color: #d5d9d9 !important;
          }
          .rec-card:hover .rec-title {
            color: #c7511f !important;
          }
        `}</style>

        {/* Close Button Header */}
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem 1.5rem 0 1.5rem" }}>
          <button 
            onClick={handleClose}
            style={{ background: "none", border: "none", color: "#565959", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.4rem", borderRadius: "50%", transition: "background-color 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.backgroundColor="#f2f2f2"}
            onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </button>
        </div>

        {/* Top Section: Item Added & Cart Subtotal Panel (Amazon Style) */}
        <div style={{ padding: "0 2.5rem 2rem 2.5rem", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eaeded" }}>
          
          {/* Left Area: Product Thumbnail & Confirmation Checkmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: "1 1 350px" }}>
            <div style={{ width: "110px", height: "110px", flexShrink: 0, borderRadius: "8px", border: "1px solid #e7e7e7", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src={imgSource} alt={addedItemModal.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#067d62", fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.4rem" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#067d62", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold" }}>
                  ✓
                </div>
                <span>Added to cart</span>
              </div>
              <div style={{ fontSize: "0.92rem", color: "#565959", fontWeight: "600", marginTop: "0.3rem" }}>
                Size: {addedItemModal.addedQty || 1} Unit{(addedItemModal.addedQty || 1) > 1 ? 's' : ''} (Pack of 1)
              </div>
              <div style={{ fontSize: "0.85rem", color: "#007185", fontWeight: "700", marginTop: "0.2rem" }}>
                {addedItemModal.region ? `Verified ${addedItemModal.region} Origin` : "Ghana TradeHub Fulfilled"}
              </div>
            </div>
          </div>

          {/* Right Area: Cart Action Box */}
          <div style={{ flex: "1 1 320px", maxWidth: "400px", backgroundColor: "#fcfcfd", border: "1px solid #d5d9d9", borderRadius: "12px", padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.8rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f1111" }}>
                Cart Subtotal:
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: "900", color: "#b12704" }}>
                GH₵ {Number(cartTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button 
              onClick={handleCheckout}
              className="amazon-btn-primary"
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ffd814",
                border: "1px solid #fcd200",
                borderRadius: "25px",
                color: "#0f1111",
                fontWeight: "800",
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(213,217,217,0.5)",
                transition: "all 0.15s",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              Proceed to checkout ({cartCount} item{cartCount !== 1 ? "s" : ""})
            </button>

            <button 
              onClick={handleGoToCart}
              className="amazon-btn-secondary"
              style={{
                width: "100%",
                padding: "0.7rem 1.5rem",
                backgroundColor: "#ffffff",
                border: "1px solid #d5d9d9",
                borderRadius: "25px",
                color: "#0f1111",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(213,217,217,0.3)",
                transition: "all 0.15s",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              Go to Cart
            </button>

            <div style={{ fontSize: "0.75rem", color: "#565959", textAlign: "center", marginTop: "0.3rem" }}>
              Protected under <strong style={{ color: "#007185" }}>TradeHub Momo Escrow</strong> & Verified Buyer Assurance
            </div>
          </div>

        </div>

        {/* Bottom Section: Amazon-style Recommendations Carousel / Grid */}
        {recommendations.length > 0 && (
          <div style={{ padding: "2rem 2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.2rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "800", color: "#0f1111" }}>
                  Based on what you added
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#565959" }}>Sponsored ℹ</span>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#565959", fontWeight: "600" }}>
                Showing {recommendations.length} recommended items
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1.5rem" }}>
              {recommendations.map((rec) => {
                const recImg = rec.imageUrl ? (rec.imageUrl.startsWith('http') ? rec.imageUrl : `http://localhost:5000${rec.imageUrl}`) : rec.image;
                const mockStock = Math.floor(Math.abs(Math.sin(Number(rec.id) || 1)) * 25) + 3;
                const mockReviewCount = Math.floor(Math.abs(Math.cos(Number(rec.id) || 1)) * 40000) + 1200;
                const itemPrice = Number(rec.price) || 0;
                const listPrice = (itemPrice * 1.18).toFixed(2);

                return (
                  <div 
                    key={rec.id}
                    className="rec-card"
                    style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid transparent", padding: "0.5rem", borderRadius: "8px", transition: "border-color 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#eaeded"}
                    onMouseOut={e => e.currentTarget.style.borderColor = "transparent"}
                  >
                    {/* Upper Clickable Area -> Navigates to product details */}
                    <div 
                      onClick={() => {
                        setAddedItemModal(null);
                        navigate(`/product/${rec.id}`);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Product Image */}
                      <div style={{ width: "100%", height: "160px", backgroundColor: "#f8f9fa", borderRadius: "8px", overflow: "hidden", marginBottom: "0.8rem", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={recImg} alt={rec.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "5px" }} />
                      </div>

                      {/* Urgency Stock Alert */}
                      <div style={{ color: "#b12704", fontSize: "0.78rem", fontWeight: "700", marginBottom: "0.3rem" }}>
                        Only {mockStock} left in stock - order soon.
                      </div>

                      {/* Title Link */}
                      <div className="rec-title" style={{ color: "#007185", fontWeight: "600", fontSize: "0.92rem", lineHeight: "1.35", marginBottom: "0.4rem", height: "2.7rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", transition: "color 0.15s" }}>
                        {rec.name}
                      </div>

                      {/* Stars and Review Count */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                        <span style={{ color: "#de7921", fontSize: "0.95rem", fontWeight: "bold", letterSpacing: "-1px" }}>★★★★★</span>
                        <span style={{ color: "#007185", fontSize: "0.82rem", fontWeight: "700" }}>{mockReviewCount.toLocaleString()}</span>
                      </div>

                      {/* Price Details */}
                      <div style={{ marginBottom: "0.8rem" }}>
                        <span style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0f1111", marginRight: "0.4rem" }}>
                          GH₵ {itemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div style={{ fontSize: "0.78rem", color: "#565959" }}>
                          List Price: <span style={{ textDecoration: "line-through" }}>GH₵ {listPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amazon Pill Add to Cart Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(rec, 1);
                      }}
                      className="amazon-btn-primary"
                      style={{
                        width: "100%",
                        padding: "0.45rem 1rem",
                        backgroundColor: "#ffd814",
                        border: "1px solid #fcd200",
                        borderRadius: "20px",
                        color: "#0f1111",
                        fontWeight: "800",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        transition: "background-color 0.15s",
                        marginTop: "auto"
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddToCartModal;
