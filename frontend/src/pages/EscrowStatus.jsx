import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const EscrowStatus = () => {
  const navigate = useNavigate();
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nowTime, setNowTime] = useState(Date.now());

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  // Poll for status updates
  useEffect(() => {
    const hasPending = groupedOrders.some(group => group.status === "HELD_IN_ESCROW" || group.status === "SHIPPED");
    if (hasPending) {
      const interval = setInterval(() => {
        fetchActiveOrders(false);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [groupedOrders]);

  // Smooth animation ticker for the 10-second transit
  useEffect(() => {
    const hasShipped = groupedOrders.some(group => group.status === "SHIPPED");
    if (hasShipped) {
      const interval = setInterval(() => setNowTime(Date.now()), 100);
      return () => clearInterval(interval);
    }
  }, [groupedOrders]);

  const fetchActiveOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get("/orders/customer");
      if (res.data.orders) {
        // Only show orders that are not fully completed or cancelled
        const active = res.data.orders.filter(o => o.status !== "DELIVERED_RELEASE_FUNDS" && o.status !== "CANCELLED");
        
        // Group by exact createdAt timestamp (simulating a checkout session)
        const groupsMap = active.reduce((acc, order) => {
          const t = new Date(order.createdAt).getTime();
          if (!acc[t]) {
            acc[t] = {
              timestamp: t,
              status: order.status,
              totalAmount: 0,
              items: []
            };
          }
          acc[t].items.push(order);
          acc[t].totalAmount += parseFloat(order.totalAmount);
          // Update group status to the most advanced status if they differ (they shouldn't)
          if (order.status === "SHIPPED") acc[t].status = "SHIPPED";
          return acc;
        }, {});

        // Convert to array and sort by newest first
        const groupsArray = Object.values(groupsMap).sort((a, b) => b.timestamp - a.timestamp);
        setGroupedOrders(groupsArray);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading Escrow Data...</div>;

  if (groupedOrders.length === 0) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
        <h2 style={{ color: "var(--text-primary)" }}>No Active Escrow Orders</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>You don't have any orders currently in transit.</p>
        <button onClick={() => navigate("/")} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700" }}>Shop Premium Goods</button>
      </div>
    );
  }

  // Calculate total currently held or in transit
  const totalInEscrow = groupedOrders.reduce((sum, g) => sum + g.totalAmount, 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <header style={{ backgroundColor: "var(--bg-panel)", padding: "1.5rem 4rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 onClick={() => navigate("/")} style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--brand-primary)", margin: 0, cursor: "pointer" }}>
          BediDwa Ghana
        </h1>
        <div style={{ display: "inline-block", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "0.8rem 1.5rem", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "800", color: "var(--brand-accent)" }}>
          TOTAL IN ESCROW: GH₵ {totalInEscrow.toLocaleString(undefined, {minimumFractionDigits: 2})}
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "0 2rem" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Live Delivery Tracker</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.1rem" }}>Your funds are protected. We only pay the merchant when the items arrive safely.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {groupedOrders.map((group) => {
            const isShipped = group.status === "SHIPPED";
            
            // Calculate real-time transit progress based on updatedAt
            let progressPercent = 0;
            let canConfirm = false;

            if (isShipped) {
              const shippedAt = new Date(group.items[0].updatedAt).getTime();
              const elapsed = nowTime - shippedAt;
              const transitDuration = 10000; // 10 seconds to arrive
              const percentInTransit = Math.min(100, Math.max(0, (elapsed / transitDuration) * 100));
              
              // 50% is 'In Transit', 100% is 'Delivered' position
              progressPercent = 50 + (percentInTransit / 2); 
              canConfirm = percentInTransit === 100;
            }

            return (
              <div 
                key={group.timestamp} 
                onClick={() => setSelectedGroup(group)}
                style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", position: "relative", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.05)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                
                {/* Group Header info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)" }}>
                      Checkout Order ({new Date(group.timestamp).toLocaleTimeString()})
                    </h3>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                      <span style={{ fontWeight: "600", color: "var(--brand-primary)" }}>{group.items.length} items in this shipment. Click to view details.</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>GH₵ {group.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Secured in Escrow</div>
                  </div>
                </div>

                {/* Secure Glassmorphic Delivery OTP Badge */}
                {(group.status === "HELD_IN_ESCROW" || group.status === "SHIPPED") && (
                  <div style={{
                    backgroundColor: "#1e293b",
                    backgroundImage: "linear-gradient(to right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))",
                    border: "1px solid rgba(234, 179, 8, 0.3)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25), 0 0 15px rgba(234, 179, 8, 0.1)",
                    borderRadius: "16px",
                    padding: "1.25rem 1.5rem",
                    margin: "0 0 2rem 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                    backdropFilter: "blur(12px)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "rgba(234, 179, 8, 0.15)", border: "1px solid rgba(234, 179, 8, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ color: "#eab308", fontSize: "26px", filter: "drop-shadow(0 0 8px rgba(234,179,8,0.5))" }}>lock_person</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Secure Delivery Handshake PIN
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#f1f5f9", fontWeight: "600", marginTop: "0.2rem" }}>
                          Provide this 4-digit PIN to the rider upon delivery to confirm receipt.
                        </div>
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: "rgba(15, 23, 42, 0.8)",
                      border: "2px solid #eab308",
                      borderRadius: "12px",
                      padding: "0.6rem 1.2rem",
                      textAlign: "center",
                      boxShadow: "0 0 20px rgba(234, 179, 8, 0.25)"
                    }}>
                      <span style={{ fontSize: "1.8rem", fontWeight: "900", color: "#eab308", letterSpacing: "0.2em", fontFamily: "monospace", filter: "drop-shadow(0 0 6px rgba(234,179,8,0.6))" }}>
                        {group.items[0]?.deliveryOtp || "7842"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Horizontal Progress Tracker */}
                <div style={{ position: "relative", margin: "2rem 0 3rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  
                  {/* Background Track line */}
                  <div style={{ position: "absolute", top: "20px", left: "50px", right: "72px", height: "4px", backgroundColor: "var(--border)", zIndex: 1 }}></div>
                  
                  {/* Active Fill line */}
                  <div style={{ position: "absolute", top: "20px", left: "50px", width: `calc((${progressPercent} / 100) * (100% - 122px))`, height: "4px", backgroundColor: "var(--success)", zIndex: 2, transition: "all 0.1s linear" }}></div>

                  {/* Animated Moving Cart Icon */}
                  <div style={{ 
                    position: "absolute", 
                    top: "6px", 
                    left: `calc(50px + (${progressPercent} / 100) * (100% - 122px))`, 
                    zIndex: 4, 
                    transition: "all 0.1s linear",
                    transform: "translateX(-50%)"
                  }}>
                    <span className="material-symbols-outlined" style={{ color: "#2563eb", fontSize: "32px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>
                      shopping_cart
                    </span>
                  </div>

                  {/* Step 1: Shop */}
                  <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--success)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 0 0 4px var(--bg-panel)" }}>
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", marginTop: "0.8rem", fontWeight: "800", color: "var(--text-primary)" }}>Paid & Held</span>
                  </div>

                  {/* Step 2: In Transit */}
                  <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: isShipped ? "var(--success)" : "var(--bg-base)", border: isShipped ? "none" : "2px solid var(--border)", color: isShipped ? "white" : "var(--text-muted)", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 0 0 4px var(--bg-panel)", transition: "all 0.4s ease" }}>
                      <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", marginTop: "0.8rem", fontWeight: isShipped ? "800" : "600", color: isShipped ? "var(--text-primary)" : "var(--text-secondary)" }}>In Transit</span>
                  </div>

                  {/* Step 3: Home (Delivered) */}
                  <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: canConfirm ? "var(--success)" : "var(--bg-base)", border: canConfirm ? "none" : "2px solid var(--border)", color: canConfirm ? "white" : "var(--text-muted)", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 0 0 4px var(--bg-panel)", transition: "all 0.4s ease" }}>
                      <span className="material-symbols-outlined">home</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", marginTop: "0.8rem", fontWeight: canConfirm ? "800" : "600", color: canConfirm ? "var(--text-primary)" : "var(--text-secondary)" }}>Delivered</span>
                  </div>
                </div>

                {/* Actions Box */}
                {group.status === "HELD_IN_ESCROW" && (
                  <div style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "1.2rem", borderRadius: "8px", textAlign: "center", color: "var(--brand-accent)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem" }}>
                    <span className="material-symbols-outlined" style={{ animation: "spin 2s linear infinite" }}>sync</span>
                    <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Vendor is packing your item(s). Escrow will update automatically...</span>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {group.status === "SHIPPED" && (
                  <div style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", padding: "1.5rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <h4 style={{ margin: "0 0 0.3rem 0", color: "var(--brand-primary)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "800" }}>
                          <span className="material-symbols-outlined">two_wheeler</span> Courier / Rider Delivery Verification
                        </h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, fontWeight: "500" }}>
                          Rider collects the 4-digit PIN from the buyer and inputs it below to complete delivery & disburse funds to the vendor.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", items: "center", gap: "0.8rem" }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-Digit Rider PIN"
                        id={`rider-pin-${group.timestamp}`}
                        style={{
                          flexGrow: 1,
                          padding: "0.8rem 1rem",
                          borderRadius: "10px",
                          border: "2px solid var(--border)",
                          backgroundColor: "var(--bg-panel)",
                          color: "var(--text-primary)",
                          fontWeight: "800",
                          fontFamily: "monospace",
                          fontSize: "1.1rem",
                          letterSpacing: "4px",
                          textAlign: "center",
                          outline: "none"
                        }}
                      />
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const inputEl = document.getElementById(`rider-pin-${group.timestamp}`);
                          const pinVal = inputEl ? inputEl.value : "";
                          if (!pinVal || pinVal.length < 4) {
                            alert("Please enter a valid 4-digit PIN provided by the customer.");
                            return;
                          }
                          try {
                            await Promise.all(group.items.map(item => 
                              api.post(`/orders/${item.id}/verify-delivery`, { otp: pinVal })
                            ));
                            alert("🎉 Delivery confirmed! Funds automatically disbursed to vendor virtual wallet.");
                            fetchActiveOrders();
                          } catch (err) {
                            alert(err.response?.data?.error || "Invalid delivery PIN. Please check PIN with the customer.");
                          }
                        }}
                        style={{
                          padding: "0.8rem 1.5rem",
                          backgroundColor: "#10b981",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Complete Delivery</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel Overlay for Order Items */}
      {selectedGroup && (
        <>
          <div onClick={() => setSelectedGroup(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 99, backdropFilter: "blur(4px)" }}></div>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", maxWidth: "100%", backgroundColor: "var(--bg-panel)", zIndex: 100, boxShadow: "-5px 0 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease-out forwards" }}>
            <div style={{ padding: "2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>Shipment Details</h2>
              <button onClick={() => setSelectedGroup(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                Checkout from {new Date(selectedGroup.timestamp).toLocaleTimeString()}
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {selectedGroup.items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: "1rem", backgroundColor: "var(--bg-base)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <div style={{ width: "60px", height: "60px", backgroundColor: "var(--bg-panel)", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--brand-primary)" }}>
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)", fontSize: "1.1rem" }}>{item.product.title}</h4>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.3rem" }}>Vendor: {item.vendor.name}</div>
                      <div style={{ display: "flex", gap: "1rem", fontWeight: "700", color: "var(--text-primary)", marginTop: "0.8rem" }}>
                        <span>Qty: {item.quantity}</span>
                        <span>GH₵ {parseFloat(item.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ padding: "2rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "900", fontSize: "1.3rem", color: "var(--text-primary)" }}>
                <span>Total Secued:</span>
                <span>GH₵ {selectedGroup.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

    </div>
  );
};

export default EscrowStatus;
