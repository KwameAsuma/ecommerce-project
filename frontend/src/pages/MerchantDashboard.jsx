const MerchantDashboard = () => {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>Merchant Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Key performance networks</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
        
        {/* Left Stats Grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Active Listings</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>4,0133</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Open Orders</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>0,000</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Funds in Escrow</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>93,5100</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Funds Released</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>93,4900</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Trust Score</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--success)" }}>98/100</div>
          </div>
          <div style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Views</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>--</div>
          </div>
        </div>

        {/* Right Real-time Panel */}
        <div style={{ flex: 1, backgroundColor: "var(--bg-panel)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Real-time</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "2rem" }}>And view analytics</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>Total Sales</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--brand-blue)" }}>$500</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--success)", fontWeight: "800", fontSize: "1.5rem" }}>59</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>New order</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>New Orders</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--brand-blue)" }}>280</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--success)", fontWeight: "800", fontSize: "1.5rem" }}>53</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>New order</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>Trust Score</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Shows the true score on new orders</div>
            </div>
            <div style={{ color: "var(--brand-gold)", fontWeight: "800", fontSize: "1.5rem" }}>▲</div>
          </div>

        </div>

      </div>

      <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1.5rem" }}>Merchant Escrow Hub</h3>
      
      <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "1.2rem 1.5rem", backgroundColor: "var(--bg-panel-hover)", borderBottom: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}>
          <div>Status</div>
          <div>Balances</div>
          <div style={{ textAlign: "right" }}>Amount</div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "1.5rem", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>Awaiting Delivery<br/><span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "400" }}>Hold in Escrow processing</span></div>
          <div><span style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>Pending</span></div>
          <div style={{ fontWeight: "700", color: "var(--text-primary)", textAlign: "right" }}>GH₵ 120.00</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "1.5rem", alignItems: "center" }}>
          <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>Released Funds<br/><span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "400" }}>Available to withdraw</span></div>
          <div><span style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>Complete</span></div>
          <div style={{ fontWeight: "700", color: "var(--text-primary)", textAlign: "right" }}>GH₵ 10.00</div>
        </div>

      </div>

    </div>
  );
};

export default MerchantDashboard;
