import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AllBidsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };
    fetchBids();
  }, [user]);

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem" }}>
      <button onClick={() => navigate("/profile")} style={{ background: "transparent", border: "none", color: "var(--brand-blue)", cursor: "pointer", fontWeight: "700", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        &larr; Back to Profile
      </button>

      <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 2rem 0" }}>
        All Bids
      </h1>

      <div style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
            <div>Loading your bids...</div>
          ) : bids.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>You haven't placed any bids yet.</div>
          ) : bids.map(bid => (
            <div key={bid.id} className="responsive-flex" style={{ justifyContent: "space-between", alignItems: "center", padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", backgroundColor: "var(--bg-base)" }}>
              <div>
                <div style={{ fontWeight: "800", color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "0.2rem" }}>Auction #{bid.auctionId || bid.auction_id}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{new Date(bid.timestamp).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "900", color: "var(--brand-blue)", fontSize: "1.2rem", marginBottom: "0.4rem" }}>GH₵ {parseFloat(bid.bidAmount || bid.bid_amount).toLocaleString()}</div>
                <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--brand-gold)", backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "0.3rem 0.8rem", borderRadius: "12px", display: "inline-block" }}>
                  Active Bid
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllBidsPage;
