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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      
      {/* Top Nav */}
      <header style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem 4rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
        <h1 onClick={() => navigate("/catalog")} style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer" }}>
          TradeHub Ghana
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--success)", fontWeight: "600", fontSize: "0.9rem" }}>
          <span>🔒</span> MoMo Escrow Protection
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "3rem auto", display: "flex", gap: "2rem", padding: "0 2rem" }}>
        
        {/* Left Column */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.8rem", margin: "0 0 1.5rem 0" }}>
              <span style={{ backgroundColor: "var(--brand-blue)", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1rem" }}>1</span>
              Order Summary
            </h2>

            {cartItems.length === 0 ? (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0" }}>
                Your cart is empty. <br/>
                <button onClick={() => navigate("/catalog")} style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Return to Catalog</button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: idx < cartItems.length - 1 ? "1px solid var(--border)" : "none", marginBottom: idx < cartItems.length - 1 ? "1.5rem" : 0 }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 0.3rem 0" }}>{item.name}</h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.category} / {item.merchant}</div>
                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", width: "fit-content" }}>
                        <button onClick={() => decreaseQuantity(item.id)} style={{ padding: "0.3rem 0.6rem", border: "none", backgroundColor: "var(--bg-panel)", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="var(--bg-panel)"}>-</button>
                        <span style={{ padding: "0.3rem 0.8rem", fontSize: "0.85rem", fontWeight: "700", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}>{item.qty}</span>
                        <button onClick={() => addToCart(item)} style={{ padding: "0.3rem 0.6rem", border: "none", backgroundColor: "var(--bg-panel)", cursor: "pointer", fontWeight: "800", color: "var(--text-primary)", transition: "background-color 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="var(--bg-panel)"}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ border: "none", backgroundColor: "transparent", color: "var(--danger)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>Remove</button>
                    </div>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
                    GH₵ {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.8rem", margin: "0 0 1.5rem 0" }}>
              <span style={{ backgroundColor: "var(--brand-blue)", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1rem" }}>2</span>
              Payment Method
            </h2>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <div onClick={() => setPaymentMethod("momo")} style={{ flex: 1, border: paymentMethod === "momo" ? "2px solid var(--brand-gold)" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: "#f59e0b", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.2rem" }}>M</div>
                <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.9rem" }}>MTN MoMo</span>
              </div>
              
              <div onClick={() => setPaymentMethod("telecel")} style={{ flex: 1, border: paymentMethod === "telecel" ? "2px solid var(--brand-gold)" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: "#ef4444", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.2rem" }}>T</div>
                <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.9rem" }}>Telecel Cash</span>
              </div>

              <div onClick={() => setPaymentMethod("at")} style={{ flex: 1, border: paymentMethod === "at" ? "2px solid var(--brand-gold)" : "1px solid var(--border)", padding: "1.5rem", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ width: "40px", height: "40px", backgroundColor: "var(--brand-blue)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "1.2rem" }}>A</div>
                <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.9rem" }}>AT Money</span>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>Mobile Money Number</label>
              <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "0.8rem 1.2rem", borderRight: "1px solid var(--border)", fontWeight: "700", color: "var(--text-primary)", backgroundColor: "var(--bg-base)" }}>+233</div>
                <input type="text" placeholder="XX XXX XXXX" style={{ flexGrow: 1, padding: "0.8rem", border: "none", outline: "none", fontSize: "1rem" }} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Totals) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
          


          <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Order Total</h2>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              <span>Subtotal ({cartCount} items)</span>
              <span style={{ color: "var(--text-primary)" }}>GH₵ {cartTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              <span>Delivery Fee</span>
              <span style={{ color: "var(--text-primary)" }}>GH₵ {deliveryFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              <span>Escrow Service Fee (1.5%)</span>
              <span style={{ color: "var(--text-primary)" }}>GH₵ {escrowFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>Total to Pay<br/><span style={{fontSize:"0.75rem", color:"var(--text-muted)", fontWeight:"500"}}>Includes taxes</span></div>
              <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--brand-blue)" }}>
                GH₵ {totalToPay.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
            </div>

            <button 
              onClick={handleConfirmPay}
              disabled={cartItems.length === 0}
              style={{ width: "100%", padding: "1.2rem", backgroundColor: cartItems.length === 0 ? "var(--border)" : "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", cursor: cartItems.length === 0 ? "not-allowed" : "pointer" }}
            >
              🔒 Confirm & Pay Securely
            </button>
            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
              By confirming, you agree to our <span style={{ color: "var(--brand-blue)" }}>Merchant Terms</span> & <span style={{ color: "var(--brand-blue)" }}>Escrow Security</span>.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
