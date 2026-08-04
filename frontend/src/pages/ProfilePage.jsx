import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [bids, setBids] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    deliveryAddress: user?.deliveryAddress || ""
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        deliveryAddress: user.deliveryAddress || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchBids = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/auctions/user/${user.id}/bids`);
        const allBids = res.data.bids || res.data || [];
        const uniqueBidsMap = new Map();
        allBids.forEach(bid => {
          const aId = bid.auctionId || bid.auction_id;
          if (!uniqueBidsMap.has(aId)) {
            uniqueBidsMap.set(aId, bid);
          } else {
            const existing = uniqueBidsMap.get(aId);
            if (new Date(bid.timestamp) > new Date(existing.timestamp)) {
              uniqueBidsMap.set(aId, bid);
            }
          }
        });
        setBids(Array.from(uniqueBidsMap.values()).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } catch (err) {
        console.error("Failed to load bids", err);
      } finally {
        setLoadingBids(false);
      }
    };
    
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
        setLoadingOrders(false);
      }
    };
    
    const fetchWallet = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/finances/${user.id}`);
        setWalletBalance(res.data.balances.availableBalance || 0);
      } catch (err) {
        console.error("Failed to load wallet", err);
      }
    };

    fetchBids();
    fetchOrders();
    fetchWallet();
  }, [user]);

  const handleConfirmDelivery = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "DELIVERED_RELEASE_FUNDS" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "DELIVERED_RELEASE_FUNDS" } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to confirm delivery");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = res.data.imageUrl;
      
      await api.patch("/users/profile", { avatarUrl: imageUrl });
      window.location.reload();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
  };

  const handleSavePreferences = async () => {
    try {
      if (editForm.deliveryAddress) {
        localStorage.setItem("defaultDeliveryAddress", editForm.deliveryAddress);
      }
      await api.patch("/users/profile", editForm);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save preferences.");
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) return;
    setIsDepositing(true);
    try {
      const res = await api.post(`/finances/${user.id}/deposit`, { amount: Number(depositAmount) });
      setWalletBalance(res.data.availableBalance);
      setIsDepositModalOpen(false);
      setDepositAmount("");
      alert("Deposit successful!");
    } catch (err) {
      console.error("Deposit failed", err);
      alert("Failed to deposit funds.");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 2rem 0" }}>
        My Profile
      </h1>

      <div className="responsive-flex">
        {/* Left Column: User Card */}
        <div style={{ flex: "1 1 300px", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", height: "max-content" }}>
          
          <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "1.5rem" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "var(--brand-primary)", color: "white", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "3rem", fontWeight: "900", boxShadow: "0 10px 25px rgba(30, 58, 138, 0.2)", overflow: "hidden" }}>
              {user?.avatarUrl ? (
                <img src={`http://localhost:5001${user.avatarUrl}`} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name?.charAt(0) || "K"
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--text-primary)", color: "white", border: "2px solid var(--bg-panel)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}
              title="Upload new avatar"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>photo_camera</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />
          </div>
          
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>
            {user?.name || "Kwame Asuma"}
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
            {user?.email || "kwame.asuma@tradehub.com"}
          </p>
          
          <div style={{ width: "100%", padding: "1rem", backgroundColor: "var(--bg-base)", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Account Role</span>
            <span style={{ fontSize: "0.85rem", color: "var(--brand-primary)", fontWeight: "800", textTransform: "uppercase" }}>{user?.role || "Consumer"}</span>
          </div>

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "1rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </button>
            <button onClick={() => navigate("/profile/orders")} style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "1rem", backgroundColor: "transparent", color: "var(--text-primary)", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
              <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)" }}>shopping_bag</span>
              My Orders
            </button>
            <button onClick={() => navigate("/profile/bids")} style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "1rem", backgroundColor: "transparent", color: "var(--text-primary)", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
              <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)" }}>gavel</span>
              My Bids
            </button>
            <button onClick={() => navigate("/settings")} style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "1rem", backgroundColor: "transparent", color: "var(--text-primary)", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
              <span className="material-symbols-outlined" style={{ color: "var(--text-secondary)" }}>settings</span>
              Settings
            </button>
            <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "0.5rem 0" }}></div>
            <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "1rem", backgroundColor: "transparent", color: "var(--danger)", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
              <span className="material-symbols-outlined" style={{ color: "var(--danger)" }}>logout</span>
              Log Out
            </button>
          </div>
        </div>

        {/* Right Column: Details & Activity */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Shipping Info */}
          <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>Shipping Details</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} style={{ backgroundColor: "transparent", border: "none", color: "var(--brand-primary)", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Edit</button>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setIsEditing(false)} style={{ backgroundColor: "transparent", border: "none", color: "var(--text-secondary)", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Cancel</button>
                  <button onClick={handleSavePreferences} style={{ backgroundColor: "var(--brand-primary)", border: "none", color: "white", padding: "0.4rem 1rem", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}>Save</button>
                </div>
              )}
            </div>
            
            {!isEditing ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Full Name</label>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>{user?.name || "Not set"}</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Email Address</label>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>{user?.email || "Not set"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Delivery Address</label>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "500" }}>{user?.deliveryAddress || localStorage.getItem("defaultDeliveryAddress") || "No delivery address saved. Click Edit to add one."}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Full Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.95rem" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Email Address</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.95rem" }} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.4rem" }}>Delivery Address</label>
                  <textarea value={editForm.deliveryAddress} onChange={(e) => setEditForm({...editForm, deliveryAddress: e.target.value})} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontSize: "0.95rem", minHeight: "80px", resize: "vertical" }} placeholder="Enter your full delivery address" />
                </div>
              </div>
            )}
          </div>

          {/* Bids and Orders Side-by-Side */}
          <div className="responsive-grid">
            
            {/* Recent Bids */}
            <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Recent Bids</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loadingBids ? (
                  <div>Loading your bids...</div>
                ) : bids.length === 0 ? (
                  <div style={{ color: "var(--text-muted)" }}>You haven't placed any bids yet.</div>
                ) : bids.slice(0, 2).map(bid => (
                  <div key={bid.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-base)" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Auction #{bid.auctionId || bid.auction_id}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{new Date(bid.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "800", color: "var(--brand-primary)", marginBottom: "0.2rem" }}>GH₵ {parseFloat(bid.bidAmount || bid.bid_amount).toLocaleString()}</div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--brand-accent)", backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "0.2rem 0.6rem", borderRadius: "12px", display: "inline-block" }}>
                        Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate("/profile/bids")}
                style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} 
                onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} 
                onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
              >
                View All Bids
              </button>
            </div>

            {/* Recent Orders */}
            <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>Recent Orders</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loadingOrders ? (
                  <div>Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div style={{ color: "var(--text-muted)" }}>You haven't placed any orders yet.</div>
                ) : orders.slice(0, 2).map(group => {
                  const minId = Math.min(...group.ids);
                  return (
                  <div key={group.timestamp} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-base)" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.2rem" }}>Order #{minId}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{group.items.length} item(s)</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "800", color: "var(--brand-primary)", marginBottom: "0.2rem" }}>GH₵ {group.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: group.status === "DELIVERED_RELEASE_FUNDS" ? "var(--success)" : "var(--brand-primary)", backgroundColor: "var(--bg-base)", padding: "0.2rem 0.6rem", borderRadius: "12px", display: "inline-block" }}>
                        {group.status === "HELD_IN_ESCROW" ? "Pending" : group.status === "SHIPPED" ? "Shipped" : "Delivered"}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
              <button 
                onClick={() => navigate("/profile/orders")}
                style={{ width: "100%", marginTop: "1.5rem", padding: "0.8rem", backgroundColor: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} 
                onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} 
                onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}
              >
                View All Orders
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
