import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const { cartItems, cartTotal, cartCount, clearCart, addToCart, removeFromCart, decreaseQuantity } = useCart();

  const handleConfirmPay = () => {
    clearCart();
    navigate("/escrow");
  };

  const deliveryFee = cartCount > 0 ? 45.00 : 0;
  const escrowFee = cartTotal * 0.015; // 1.5% fee
  const totalToPay = cartTotal + deliveryFee + escrowFee;

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
      
      {/* Sticky Header Container */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "var(--bg-panel)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)" }}>
        {/* Top Header */}
        <header style={{ padding: "1rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <h1 onClick={() => navigate("/catalog")} style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer", letterSpacing: "-0.5px", textTransform: "uppercase" }}>
            TradeHub
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--success)", fontWeight: "700", fontSize: "0.95rem", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "0.5rem 1rem", borderRadius: "999px" }}>
            <span className="material-symbols-outlined text-[20px]">verified_user</span> 
            MoMo Escrow Active
          </div>
        </header>
      </div>

      <main style={{ flexGrow: 1, padding: "3rem", display: "flex", justifyContent: "center" }} onClick={() => {}}>
        <div key="checkout-route" style={{ animation: "fadeRoute 0.4s ease-out", maxWidth: "1300px", width: "100%", display: "flex", gap: "3rem", flexWrap: "wrap" }}>
          
          {/* Left Column */}
          <div style={{ flex: "1 1 700px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <div className="glass-panel premium-card">
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 2rem 0" }}>
                <span style={{ backgroundColor: "var(--brand-blue)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.1rem" }}>1</span>
                Order Summary
              </h2>

              {cartItems.length === 0 ? (
                <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem 0", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  <span className="material-symbols-outlined text-[48px]" style={{ opacity: 0.3, marginBottom: "1rem" }}>shopping_cart</span><br/>
                  <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>Your cart is empty.</span> <br/>
                  <button onClick={() => navigate("/catalog")} style={{ marginTop: "1.5rem", padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>Explore Catalog</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px solid var(--border)", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor="var(--brand-blue)"} onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.3rem 0" }}>{item.name}</h3>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>{item.category} • Sold by <span style={{ color: "var(--brand-blue)" }}>{item.merchant}</span></div>
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", width: "fit-content", backgroundColor: "var(--bg-panel)" }}>
                            <button onClick={() => decreaseQuantity(item.id)} style={{ padding: "0.4rem 0.8rem", border: "none", backgroundColor: "transparent", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>-</button>
                            <span style={{ padding: "0.4rem 1rem", fontSize: "0.95rem", fontWeight: "800", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}>{item.qty}</span>
                            <button onClick={() => addToCart(item)} style={{ padding: "0.4rem 0.8rem", border: "none", backgroundColor: "transparent", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ border: "none", backgroundColor: "transparent", color: "var(--danger)", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", opacity: 0.8 }} onMouseOver={e=>e.currentTarget.style.opacity="1"} onMouseOut={e=>e.currentTarget.style.opacity="0.8"}>
                            <span className="material-symbols-outlined text-[18px]">delete</span> Remove
                          </button>
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
                <span style={{ backgroundColor: "var(--brand-blue)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.1rem" }}>2</span>
                Payment Method
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
                <div onClick={() => setPaymentMethod("momo")} style={{ backgroundColor: paymentMethod === "momo" ? "rgba(245, 158, 11, 0.05)" : "var(--bg-base)", border: paymentMethod === "momo" ? "2px solid var(--brand-gold)" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                  {paymentMethod === "momo" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "10px", right: "10px", color: "var(--brand-gold)", fontSize: "20px" }}>check_circle</span>}
                  <div style={{ width: "48px", height: "48px", backgroundColor: "#f59e0b", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.5rem", fontWeight: "800" }}>M</div>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem" }}>MTN MoMo</span>
                </div>
                
                <div onClick={() => setPaymentMethod("telecel")} style={{ backgroundColor: paymentMethod === "telecel" ? "rgba(239, 68, 68, 0.05)" : "var(--bg-base)", border: paymentMethod === "telecel" ? "2px solid #ef4444" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                  {paymentMethod === "telecel" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "10px", right: "10px", color: "#ef4444", fontSize: "20px" }}>check_circle</span>}
                  <div style={{ width: "48px", height: "48px", backgroundColor: "#ef4444", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.5rem", fontWeight: "800" }}>T</div>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem" }}>Telecel Cash</span>
                </div>

                <div onClick={() => setPaymentMethod("at")} style={{ backgroundColor: paymentMethod === "at" ? "rgba(37, 99, 235, 0.05)" : "var(--bg-base)", border: paymentMethod === "at" ? "2px solid var(--brand-blue)" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                  {paymentMethod === "at" && <span className="material-symbols-outlined" style={{ position: "absolute", top: "10px", right: "10px", color: "var(--brand-blue)", fontSize: "20px" }}>check_circle</span>}
                  <div style={{ width: "48px", height: "48px", backgroundColor: "var(--brand-blue)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.5rem", fontWeight: "800" }}>A</div>
                  <span style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem" }}>AT Money</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.8rem", fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>Mobile Money Number</label>
                <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "var(--bg-base)" }}>
                  <div style={{ padding: "1rem 1.5rem", borderRight: "1px solid var(--border)", fontWeight: "800", color: "var(--text-primary)", backgroundColor: "var(--bg-panel)", display: "flex", alignItems: "center" }}>+233</div>
                  <input type="text" placeholder="XX XXX XXXX" style={{ flexGrow: 1, padding: "1rem 1.5rem", border: "none", outline: "none", fontSize: "1.1rem", backgroundColor: "transparent", color: "var(--text-primary)", fontWeight: "600", letterSpacing: "1px" }} />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Totals) */}
          <div style={{ flex: "1 1 400px" }}>
            <div className="glass-panel premium-card" style={{ position: "sticky", top: "120px", padding: 0 }}>
              
              {/* Premium Hero Illustration */}
              <div style={{ width: "100%", height: "240px", backgroundColor: "#0f172a", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img src="/checkout_illustration.png" alt="Secure Checkout" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.9 }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, var(--bg-panel) 0%, rgba(0,0,0,0) 100%)" }}></div>
                <div style={{ position: "absolute", bottom: "1.5rem", left: "2rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "white", letterSpacing: "0.5px" }}>Secure Checkout</h3>
                  <p style={{ margin: "0.3rem 0 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", fontWeight: "500" }}>Protected by TradeHub Escrow</p>
                </div>
              </div>

              <div style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span>Subtotal ({cartCount} items)</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {cartTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", color: "var(--text-secondary)", fontSize: "1rem", fontWeight: "500" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>Escrow Service Fee <span className="material-symbols-outlined text-[16px]" style={{ color: "var(--brand-gold)" }}>info</span></span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>GH₵ {escrowFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                <div style={{ borderTop: "2px dashed var(--border)", paddingTop: "2rem", marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Total to Pay</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Includes taxes and fees</div>
                  </div>
                  <div style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--brand-blue)", letterSpacing: "-1px" }}>
                    GH₵ {totalToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>

                <button 
                  onClick={handleConfirmPay}
                  disabled={cartItems.length === 0}
                  style={{ 
                    width: "100%", 
                    padding: "1.2rem", 
                    backgroundColor: cartItems.length === 0 ? "var(--border)" : "var(--brand-blue)", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "12px", 
                    fontWeight: "800", 
                    fontSize: "1.1rem", 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    gap: "0.8rem", 
                    cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                    boxShadow: cartItems.length === 0 ? "none" : "0 10px 20px -10px rgba(37,99,235,0.5)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={e=>{if(cartItems.length > 0) e.currentTarget.style.transform="translateY(-2px)"}}
                  onMouseOut={e=>{if(cartItems.length > 0) e.currentTarget.style.transform="translateY(0)"}}
                >
                  <span className="material-symbols-outlined">lock</span> Confirm & Pay Securely
                </button>
                <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "1.5rem", fontWeight: "500", lineHeight: "1.5" }}>
                  By confirming, you agree to our <span style={{ color: "var(--brand-blue)", cursor: "pointer", fontWeight: "700" }}>Merchant Terms</span> & <span style={{ color: "var(--brand-blue)", cursor: "pointer", fontWeight: "700" }}>Escrow Security Protocol</span>.
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
