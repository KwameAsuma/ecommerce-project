import React, { useState, useEffect } from "react";
import api from "../services/api";

const MerchantEscrow = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchVendorOrders();
    const interval = setInterval(() => {
      fetchVendorOrders(false); // fetch without setting loading to true
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchVendorOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get("/orders/vendor");
      if (res.data.orders) {
        const groupsMap = res.data.orders.reduce((acc, order) => {
          const t = new Date(order.createdAt).getTime();
          if (!acc[t]) {
            acc[t] = { 
              timestamp: t, 
              status: order.status, 
              totalAmount: 0, 
              items: [], 
              ids: [],
              customer: order.customer,
              deliveryAddress: order.deliveryAddress
            };
          }
          acc[t].items.push(order);
          acc[t].ids.push(order.id);
          acc[t].totalAmount += parseFloat(order.totalAmount);
          if (order.status === "SHIPPED") acc[t].status = "SHIPPED";
          if (order.status === "DELIVERED_RELEASE_FUNDS") acc[t].status = "DELIVERED_RELEASE_FUNDS";
          return acc;
        }, {});
        const groupsArray = Object.values(groupsMap).sort((a, b) => b.timestamp - a.timestamp);
        setOrders(groupsArray);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch escrow orders");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalInEscrow = orders
    .filter(o => o.status === "HELD_IN_ESCROW" || o.status === "SHIPPED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalReleased = orders
    .filter(o => o.status === "DELIVERED_RELEASE_FUNDS")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-primary)" }}>Loading Escrow Dashboard...</div>;

  return (
    <div style={{ padding: "0 3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ marginTop: "0.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--text-primary)", marginBottom: "0.2rem", marginTop: 0 }}>Escrow Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", margin: 0 }}>Track your locked funds, monitor delivery verifications, and manage shipments.</p>
        </div>

        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", minWidth: "350px", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Total in Escrow</div>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--brand-accent)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>lock</span>
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px" }}>GH₵ {totalInEscrow.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem", fontWeight: "500", margin: 0 }}>Locked until buyer confirms delivery</p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginTop: "0.5rem", marginBottom: "0.75rem" }}>Recent Orders</h2>

      {error && <div style={{ color: "var(--danger)", padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--bg-panel)", border: "1px dashed var(--border)", borderRadius: "16px", color: "var(--text-secondary)" }}>
          <span className="material-symbols-outlined text-[48px]" style={{ opacity: 0.5, marginBottom: "1rem" }}>inbox</span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 0.5rem 0" }}>No Orders Yet</h3>
          <p>When customers buy your products, they will appear here.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg-base)" }}>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Order Info</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Customer</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(group => {
                const minId = Math.min(...group.ids);
                return (
                <tr key={group.timestamp} onClick={() => setSelectedGroup(group)} style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }} className="hover:bg-surface-container-low transition-colors">
                  <td style={{ padding: "1.2rem 1.5rem" }}>
                    <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1rem", marginBottom: "0.2rem" }}>Checkout Order #{minId}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{group.items.length} items • {new Date(group.timestamp).toLocaleDateString()}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.4rem", display: "flex", gap: "0.4rem" }}>
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span> {group.deliveryAddress}
                    </div>
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem" }}>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{group.customer.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{group.customer.email}</div>
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem" }}>
                    <div style={{ fontWeight: "800", color: "var(--text-primary)" }}>GH₵ {group.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem" }}>
                    {group.status === "HELD_IN_ESCROW" && (
                      <span style={{ padding: "0.4rem 0.8rem", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "var(--brand-accent)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <span className="material-symbols-outlined text-[14px]">lock</span> PROCESSING (FUNDS LOCKED)
                      </span>
                    )}
                    {group.status === "SHIPPED" && (
                      <span style={{ padding: "0.4rem 0.8rem", backgroundColor: "rgba(37, 99, 235, 0.1)", color: "var(--brand-primary)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span> IN TRANSIT
                      </span>
                    )}
                    {group.status === "DELIVERED_RELEASE_FUNDS" && (
                      <span style={{ padding: "0.4rem 0.8rem", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> FUNDS RECEIVED
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1.2rem 1.5rem", textAlign: "right" }}>
                    {group.status === "HELD_IN_ESCROW" && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Auto-Dispatching...</div>
                    )}
                    {group.status === "SHIPPED" && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Awaiting Buyer Confirmation</div>
                    )}
                    {group.status === "DELIVERED_RELEASE_FUNDS" && (
                      <div style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: "700" }}>Funds Received</div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* Side Panel Overlay for Order Items */}
      {selectedGroup && (
        <>
          <div onClick={() => setSelectedGroup(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 99, backdropFilter: "blur(4px)" }}></div>
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "400px", maxWidth: "100%", backgroundColor: "var(--bg-panel)", zIndex: 100, boxShadow: "-5px 0 25px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", animation: "slideIn 0.3s ease-out forwards" }}>
            <div style={{ padding: "2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)" }}>Order Details</h2>
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
                <span>Total Expected:</span>
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

export default MerchantEscrow;
