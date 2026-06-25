import { useNavigate } from "react-router-dom";

const EscrowStatus = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <header style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem 4rem", borderBottom: "1px solid var(--border)" }}>
        <h1 onClick={() => navigate("/catalog")} style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-blue)", margin: 0, cursor: "pointer" }}>
          TradeHub Ghana
        </h1>
      </header>

      <div style={{ maxWidth: "1000px", margin: "3rem auto", display: "flex", gap: "2rem", padding: "0 2rem" }}>
        
        {/* Left Column (Payment Confirmed) */}
        <div style={{ flex: 1 }}>
          <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "3rem 2rem", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "3px solid var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--success)", fontSize: "2rem", margin: "0 auto 1.5rem auto" }}>✓</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1rem" }}>Payment Confirmed</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "2rem" }}>
              Your order is successfully placed. The vendor has been notified and will begin preparing your items.
            </p>
            <div style={{ display: "inline-block", backgroundColor: "var(--bg-base)", padding: "0.8rem 1.5rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-blue)" }}>
              Funds held securely in TradeHub Escrow.
            </div>
          </div>
        </div>

        {/* Right Column (Escrow Center Dashboard) */}
        <div style={{ flex: 2 }}>
          <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>Escrow Center Dashboard</h2>
              <span style={{ fontSize: "0.85rem", color: "var(--brand-blue)", fontWeight: "600", cursor: "pointer", border: "1px solid var(--border)", padding: "0.4rem 0.8rem", borderRadius: "6px" }}>View Actions</span>
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Detailed Tracking Timeline</h3>
            
            <div style={{ position: "relative", paddingLeft: "2rem", display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "3rem" }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "2px", backgroundColor: "var(--success)" }}></div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-2rem", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "0.6rem" }}>✓</div>
                <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Placed</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Order received by system</div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-2rem", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "0.6rem" }}>✓</div>
                <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Paid & Held</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Funds in Escrow transaction</div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-2rem", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "0.6rem" }}>✓</div>
                <div style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Shipped</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Package is in transit</div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-2rem", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", border: "2px solid var(--border)" }}></div>
                <div style={{ fontWeight: "700", color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Out for Delivery</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Expected today</div>
              </div>

              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: "-2rem", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "white", border: "2px solid var(--border)" }}></div>
                <div style={{ fontWeight: "700", color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "0.2rem" }}>Delivered</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Verify item upon receipt</div>
              </div>
            </div>

            <div style={{ backgroundColor: "var(--success-bg)", padding: "1.5rem", borderRadius: "8px", textAlign: "center" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--success)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--success)", fontSize: "1.2rem", margin: "0 auto 0.5rem auto" }}>🛡️</div>
              <h4 style={{ margin: "0 0 1rem 0", color: "var(--success)", fontSize: "1rem" }}>Verified</h4>
              <p style={{ fontSize: "0.85rem", color: "#065f46", marginBottom: "1.5rem" }}>The vendor will not be paid until you confirm receipt within 48 hours.</p>
              
              <button 
                onClick={() => { alert("Success! Funds released to merchant."); navigate("/catalog"); }}
                style={{ width: "100%", padding: "1rem", backgroundColor: "var(--brand-blue)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginBottom: "0.8rem" }}
              >
                I Have Received My Items
              </button>
              <button style={{ width: "100%", padding: "1rem", backgroundColor: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
                Report a Problem / Open Dispute
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EscrowStatus;
