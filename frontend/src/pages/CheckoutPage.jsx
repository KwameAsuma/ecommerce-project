import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const buyNowId = searchParams.get("buyNow");
  const buyNowQty = parseInt(searchParams.get("qty")) || 1;

  const { products } = useCatalog();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [deliveryAddress, setDeliveryAddress] = useState(() => localStorage.getItem("defaultDeliveryAddress") || "124 Independence Avenue, Ridge, Accra");
  const [orderComments, setOrderComments] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const { cartItems, cartTotal, cartCount, clearCart, addToCart, removeFromCart, decreaseQuantity } = useCart();

  useEffect(() => {
    if (user?.deliveryAddress) {
      setDeliveryAddress(user.deliveryAddress);
      localStorage.setItem("defaultDeliveryAddress", user.deliveryAddress);
    }
  }, [user]);

  // Determine which items to checkout (Buy Now vs Cart)
  const checkoutItems = useMemo(() => {
    if (buyNowId && products.length > 0) {
      const product = products.find((p) => p.id === buyNowId);
      if (product) {
        return [{ ...product, qty: buyNowQty }];
      }
    }
    return cartItems;
  }, [buyNowId, buyNowQty, products, cartItems]);

  const checkoutCount = useMemo(() => checkoutItems.reduce((sum, item) => sum + item.qty, 0), [checkoutItems]);
  const checkoutTotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0), [checkoutItems]);

  const handleConfirmPay = async () => {
    if (!deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }
    if (momoNumber.length < 9) {
      setError("Please enter a valid Mobile Money number.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      // Create the order via API using checkoutItems
      const fullAddress = orderComments.trim() ? `${deliveryAddress} | Comments: ${orderComments}` : deliveryAddress;
      await api.post("/orders", { cartItems: checkoutItems, deliveryAddress: fullAddress, paymentMethod });
      
      // Only clear cart if this was a cart checkout
      if (!buyNowId) {
        clearCart();
      }
      navigate("/escrow");
    } catch (err) {
      setError(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deliveryFee = checkoutCount > 0 ? 45.00 : 0;
  const escrowFee = checkoutTotal * 0.015; // 1.5% fee
  const totalToPay = checkoutTotal + deliveryFee + escrowFee;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <style>{`
        @keyframes fadeRoute {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .premium-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
        }
        .glass-panel {
          background-color: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
      `}</style>
      
      {/* Sticky Header Container (Removed to use CustomerLayout) */}

      <main className="padding-responsive" style={{ flexGrow: 1, display: "flex", justifyContent: "center" }} onClick={() => {}}>
        <div key="checkout-route" className="responsive-flex" style={{ animation: "fadeRoute 0.4s ease-out", maxWidth: "1300px", width: "100%" }}>
          
          {/* Left Column */}
          <div style={{ flex: "1 1 700px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <div className="glass-panel premium-card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 2rem 0" }}>
                <span style={{ backgroundColor: "var(--brand-primary)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.1rem" }}>1</span>
                Order Summary
              </h2>

              {checkoutItems.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  <span className="material-symbols-outlined text-[48px]" style={{ opacity: 0.3, marginBottom: "1rem" }}>shopping_cart</span><br/>
                  <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>Nothing to checkout.</span> <br/>
                  <button onClick={() => navigate("/")} style={{ marginTop: "1.5rem", padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Explore Catalog</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="var(--brand-primary)"} onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.3rem 0" }}>{item.name}</h3>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>{item.category} • Sold by <span style={{ color: "var(--brand-primary)" }}>{item.merchant}</span></div>
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          {buyNowId ? (
                            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                              Quantity: {item.qty}
                            </div>
                          ) : (
                            <>
                              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", width: "fit-content", backgroundColor: "var(--bg-panel)" }}>
                                <button onClick={() => decreaseQuantity(item.id)} style={{ padding: "0.4rem 0.8rem", border: "none", backgroundColor: "transparent", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>-</button>
                                <span style={{ padding: "0.4rem 1rem", fontSize: "0.95rem", fontWeight: "800", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}>{item.qty}</span>
                                <button onClick={() => addToCart(item)} style={{ padding: "0.4rem 0.8rem", border: "none", backgroundColor: "transparent", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>+</button>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} style={{ border: "none", backgroundColor: "transparent", color: "var(--danger)", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", opacity: 0.8 }} onMouseOver={e=>e.currentTarget.style.opacity="1"} onMouseOut={e=>e.currentTarget.style.opacity="0.8"}>
                                <span className="material-symbols-outlined text-[18px]">delete</span> Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--text-primary)", textAlign: "right", alignSelf: "flex-start" }}>
                        GH₵ {(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel premium-card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 2rem 0" }}>
                <span style={{ backgroundColor: "var(--brand-primary)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.1rem" }}>2</span>
                Delivery Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>Delivery Address</label>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("defaultDeliveryAddress", deliveryAddress);
                        if (user?.id) {
                          api.patch("/users/profile", { deliveryAddress }).then(() => alert("Saved! This is now your default address across your profile and orders.")).catch(() => alert("Default address saved locally!"));
                        } else {
                          alert("Default delivery address saved!");
                        }
                      }}
                      style={{ background: "none", border: "none", color: "var(--brand-primary)", fontWeight: "800", fontSize: "0.82rem", cursor: "pointer", textDecoration: "underline", display: "flex", alignItems: "center", gap: "0.2rem" }}
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span> Save as Default for Profile
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ghana Post GPS, Coordinates, or precise location..."
                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>Comments / Special Instructions</label>
                  <textarea 
                    value={orderComments}
                    onChange={(e) => setOrderComments(e.target.value)}
                    placeholder="Any special instructions for the driver..."
                    style={{ width: "100%", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none", minHeight: "60px", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel premium-card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 2rem 0" }}>
                <span style={{ backgroundColor: "var(--brand-primary)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.1rem" }}>3</span>
                Payment Method
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                {/* MTN MoMo */}
                <div onClick={() => setPaymentMethod("momo")} style={{ backgroundColor: paymentMethod === "momo" ? "rgba(245, 158, 11, 0.08)" : "var(--bg-base)", border: paymentMethod === "momo" ? "2px solid #eab308" : "1px solid var(--border)", padding: "1.5rem 1rem", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s", position: "relative", boxShadow: paymentMethod === "momo" ? "0 10px 25px -5px rgba(245, 158, 11, 0.2)" : "none" }}>
                  {paymentMethod === "momo" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "12px", right: "12px", color: "#eab308", fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  
                  {/* Authentic MoMo Brand Badge */}
                  <div style={{ width: 76, height: 76, backgroundColor: "#ffcc00", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6, boxShadow: "0 4px 10px rgba(0,0,0,0.15)", border: "2px solid #ffffff" }}>
                    <div style={{ background: "#003366", width: 42, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3, position: "relative", overflow: "hidden", borderBottom: "4px solid #ffcc00" }}>
                      <div style={{ width: 16, height: 16, border: "3px solid #ffcc00", borderRadius: "50%", transform: "rotate(-25deg)", position: "absolute", left: 8, top: 6 }}></div>
                      <div style={{ width: 18, height: 28, background: "#ffcc00", borderRadius: "20px 0 0 0", position: "absolute", right: -4, top: 4, transform: "rotate(15deg)" }}></div>
                    </div>
                    <div style={{ color: "#003366", fontWeight: 900, fontSize: 16, letterSpacing: "-0.5px", lineHeight: 1 }}>MoMo</div>
                    <div style={{ color: "#003366", fontWeight: 700, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.2px" }}>from MTN</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1.05rem" }}>MTN MoMo</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "600" }}>Instant Escrow Deposit</div>
                  </div>
                </div>
                
                {/* Telecel Cash */}
                <div onClick={() => setPaymentMethod("telecel")} style={{ backgroundColor: paymentMethod === "telecel" ? "rgba(239, 68, 68, 0.08)" : "var(--bg-base)", border: paymentMethod === "telecel" ? "2px solid #ef4444" : "1px solid var(--border)", padding: "1.5rem 1rem", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s", position: "relative", boxShadow: paymentMethod === "telecel" ? "0 10px 25px -5px rgba(239, 68, 68, 0.2)" : "none" }}>
                  {paymentMethod === "telecel" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "12px", right: "12px", color: "#ef4444", fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  
                  {/* Authentic Telecel Cash Badge */}
                  <div style={{ width: 76, height: 76, backgroundColor: "#e11d48", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6, boxShadow: "0 4px 10px rgba(0,0,0,0.15)", border: "2px solid #ffffff" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", border: "4px solid #ffffff", borderTopColor: "transparent", transform: "rotate(45deg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
                      <div style={{ width: 16, height: 16, background: "#ffffff", borderRadius: "50%" }}></div>
                    </div>
                    <div style={{ color: "#ffffff", fontWeight: 900, fontSize: 14, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1 }}>telecel</div>
                    <div style={{ color: "#ffffff", fontWeight: 700, fontSize: 9, letterSpacing: "1px", textTransform: "uppercase" }}>cash</div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1.05rem" }}>Telecel Cash</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "600" }}>Instant Escrow Deposit</div>
                  </div>
                </div>

                {/* AirtelTigo Money (AT Money) */}
                <div onClick={() => setPaymentMethod("at")} style={{ backgroundColor: paymentMethod === "at" ? "rgba(37, 99, 235, 0.08)" : "var(--bg-base)", border: paymentMethod === "at" ? "2px solid #2563eb" : "1px solid var(--border)", padding: "1.5rem 1rem", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", cursor: "pointer", transition: "all 0.2s", position: "relative", boxShadow: paymentMethod === "at" ? "0 10px 25px -5px rgba(37, 99, 235, 0.2)" : "none" }}>
                  {paymentMethod === "at" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "12px", right: "12px", color: "#2563eb", fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                  
                  {/* Authentic AirtelTigo Money Badge */}
                  <div style={{ width: 76, height: 76, backgroundColor: "#ffffff", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6, boxShadow: "0 4px 10px rgba(0,0,0,0.1)", border: "2px solid #cbd5e1", overflow: "hidden", position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", fontWeight: 900, fontSize: 17, letterSpacing: "-0.5px" }}>
                      <span style={{ color: "#dc2626" }}>airtel</span>
                      <span style={{ color: "#1e3a8a" }}>tigo</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <span style={{ color: "#1e3a8a", fontWeight: 900, fontSize: 15, letterSpacing: "-0.5px" }}>Money</span>
                      <div style={{ width: 14, height: 8, borderBottom: "3px solid #1e3a8a", borderRadius: "50%" }}></div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1.05rem" }}>AT Money</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "600" }}>Instant Escrow Deposit</div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>Mobile Money Number</label>
                <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "var(--bg-base)" }}>
                  <div style={{ padding: "1rem 1.5rem", borderRight: "1px solid var(--border)", fontWeight: "800", color: "var(--text-primary)", backgroundColor: "var(--bg-panel)", display: "flex", alignItems: "center" }}>+233</div>
                  <input 
                    type="text" 
                    placeholder="XX XXX XXXX" 
                    value={momoNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // Only allow digits
                      if (val.length <= 10) setMomoNumber(val);
                    }}
                    style={{ flexGrow: 1, padding: "1rem 1.5rem", border: "none", outline: "none", fontSize: "1.1rem", backgroundColor: "transparent", color: "var(--text-primary)", fontWeight: "600", letterSpacing: "1px" }} 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Totals) */}
          <div style={{ flex: "1 1 400px" }}>
            <div className="glass-panel premium-card" style={{ position: "sticky", top: "120px", padding: 0 }}>
              
              <div style={{ padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.15)", background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #4338ca 100%)", color: "#ffffff", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", boxShadow: "0 4px 15px rgba(30, 58, 138, 0.25)" }}>
                <h3 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.5px" }}>Order Summary</h3>
                <p style={{ margin: "0.4rem 0 0 0", color: "rgba(255, 255, 255, 0.88)", fontSize: "0.88rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: "#4ade80" }}>verified_user</span> 
                  Protected by BediDwa Escrow
                </p>
              </div>

              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span>Subtotal ({checkoutCount} items)</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {checkoutTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>Escrow Service Fee <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--brand-accent)" }}>info</span></span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {escrowFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                <div style={{ borderTop: "2px dashed var(--border)", paddingTop: "2rem", marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Total to Pay</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Includes taxes and fees</div>
                  </div>
                  <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--brand-primary)", letterSpacing: "-1px" }}>
                    GH₵ {totalToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>

                {error && <div style={{ color: "var(--danger)", fontSize: "0.9rem", fontWeight: "600", marginBottom: "1rem", textAlign: "center", padding: "0.5rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>{error}</div>}

                <button 
                  onClick={handleConfirmPay}
                  disabled={checkoutItems.length === 0 || isProcessing}
                  style={{ 
                    width: "100%", 
                    padding: "1.2rem", 
                    backgroundColor: (checkoutItems.length === 0 || isProcessing) ? "var(--border)" : "var(--brand-primary)", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "12px", 
                    fontWeight: "800", 
                    fontSize: "1.1rem", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    gap: "0.8rem", 
                    cursor: (checkoutItems.length === 0 || isProcessing) ? "not-allowed" : "pointer",
                    boxShadow: (checkoutItems.length === 0 || isProcessing) ? "none" : "0 10px 20px -10px rgba(37,99,235,0.5)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={e=>{if(checkoutItems.length > 0 && !isProcessing) e.currentTarget.style.transform="translateY(-2px)"}}
                  onMouseOut={e=>{if(checkoutItems.length > 0 && !isProcessing) e.currentTarget.style.transform="translateY(0)"}}
                >
                  {isProcessing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>sync</span> Processing...
                    </div>
                  ) : (
                    <><span className="material-symbols-outlined">lock</span> Confirm & Pay Securely</>
                  )}
                </button>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1.5rem", fontWeight: "500", lineHeight: "1.5" }}>
                  By confirming, you agree to our <span style={{ color: "var(--brand-primary)", cursor: "pointer", fontWeight: "700" }}>Merchant Terms</span> & <span style={{ color: "var(--brand-primary)", cursor: "pointer", fontWeight: "700" }}>Escrow Security Protocol</span>.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
