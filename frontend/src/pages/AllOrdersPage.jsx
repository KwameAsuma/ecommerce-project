import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ReviewModal from "../components/ReviewModal";

const AllOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/orders/customer`);
        if (res.data.orders) {
          const groupsMap = res.data.orders.reduce((acc, order) => {
            const t = new Date(order.createdAt).getTime();
            if (!acc[t]) {
              acc[t] = { timestamp: t, status: order.status, totalAmount: 0, items: [], ids: [] };
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
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleConfirmDelivery = async (group) => {
    try {
      await Promise.all(group.items.map(order => 
        api.patch(`/orders/${order.id}/status`, { status: "DELIVERED_RELEASE_FUNDS" })
      ));
      setOrders(orders.map(o => o.timestamp === group.timestamp ? { ...o, status: "DELIVERED_RELEASE_FUNDS" } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to confirm delivery");
    }
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem" }}>
      <button onClick={() => navigate("/profile")} style={{ background: "transparent", border: "none", color: "var(--brand-primary)", cursor: "pointer", fontWeight: "700", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        &larr; Back to Profile
      </button>

      <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 2rem 0" }}>
        All Orders
      </h1>

      <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div>Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>You haven't placed any orders yet.</div>
          ) : orders.map(group => {
            const minId = Math.min(...group.ids);
            return (
            <div key={group.timestamp} className="responsive-flex" style={{ alignItems: "center", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-base)" }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "0.2rem" }}>Order #{minId}</div>
                {group.items.map(item => (
                  <div key={item.id} style={{ fontWeight: "600", color: "var(--text-secondary)", marginBottom: "0.2rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span>{item.quantity}x {item.product.title} <span style={{fontSize: "0.8rem", color: "var(--text-muted)"}}>| Sold by {item.vendor.name}</span></span>
                    {group.status === "DELIVERED_RELEASE_FUNDS" && (
                      <button 
                        onClick={() => {
                          setSelectedReviewItem(item);
                          setReviewModalOpen(true);
                        }}
                        style={{ padding: "0.3rem 0.6rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.8rem" }}>{new Date(group.timestamp).toLocaleDateString()} • {group.items.length} item(s)</div>
                
                {group.status === "SHIPPED" && (
                  <button 
                    onClick={() => handleConfirmDelivery(group)}
                    style={{ marginTop: "1rem", padding: "0.6rem 1rem", backgroundColor: "var(--success)", color: "white", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span> Confirm Delivery
                  </button>
                )}
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontWeight: "900", color: "var(--text-primary)", fontSize: "1.2rem", marginBottom: "0.5rem" }}>GH₵ {group.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                
                {group.status === "HELD_IN_ESCROW" && (
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-accent)", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "12px", display: "inline-block" }}>
                    Pending Shipment
                  </div>
                )}
                {group.status === "SHIPPED" && (
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-primary)", backgroundColor: "rgba(37, 99, 235, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "12px", display: "inline-block" }}>
                    Shipped
                  </div>
                )}
                {group.status === "DELIVERED_RELEASE_FUNDS" && (
                  <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--success)", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "12px", display: "inline-block" }}>
                    Delivered
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>
      </div>

      <ReviewModal 
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedReviewItem(null);
        }}
        merchantId={selectedReviewItem?.vendorId}
        productId={selectedReviewItem?.productId}
        onSubmit={(review) => {
          alert("Review submitted successfully!");
        }}
      />
    </div>
  );
};

export default AllOrdersPage;
