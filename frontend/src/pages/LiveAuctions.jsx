import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorMessage from "../components/ErrorMessage";
import { resolveImageUrl } from "../utils/imageUtils";

const LiveAuctions = () => {
  const { id } = useParams();
  const AUCTION_ID = parseInt(id, 10);
  const navigate = useNavigate();
  const { socket, liveBid, error, watchers } = useSocket(AUCTION_ID);
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [currentHighest, setCurrentHighest] = useState(0);
  const [bidInput, setBidInput] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("04:23:02");
  const [selectedTab, setSelectedTab] = useState("description");
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop"
  ];

  const productImages = useMemo(() => {
    if (!auction) return fallbackImages;
    const title = (auction.title || auction.name || "").toLowerCase();
    const rawUrl = (auction.imageUrl || auction.image || "").toLowerCase();
    if (title.includes("rolex") || title.includes("submariner") || rawUrl.includes("rolex") || rawUrl.includes("google.com/url") || rawUrl.includes("m126610lv")) {
      return ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop"];
    }
    if (auction.imageUrl || auction.image) {
      const urls = (auction.imageUrl || auction.image).split(',').map(u => {
        return resolveImageUrl(u.trim());
      }).filter(Boolean);
      return urls.length ? urls : fallbackImages;
    }
    return fallbackImages;
  }, [auction]);

  const fetchAuctionData = async () => {
    try {
      const res = await api.get(`/auctions/${AUCTION_ID}`);
      const loadedAuction = res.data.auction;
      setAuction(loadedAuction);
      
      const baseOrHighest = parseFloat(loadedAuction.currentHighestBid || loadedAuction.current_highest_bid || loadedAuction.basePrice || 0);
      setCurrentHighest(baseOrHighest);
      if (!bidInput) setBidInput((baseOrHighest + 100).toString());

      // Fetch bids leaderboard (pure real user bids)
      const bidRes = await api.get(`/auctions/${AUCTION_ID}/bids`);
      const fetchedBids = bidRes.data.bids || [];
      setBids(fetchedBids);
    } catch (err) {
      console.error("Failed to load auction VIP room", err);
    }
  };

  useEffect(() => {
    fetchAuctionData();
    // eslint-disable-next-line
  }, [AUCTION_ID]);

  useEffect(() => {
    if (!auction?.endTime) return;
    const updateTimer = () => {
      const diff = new Date(auction.endTime) - new Date();
      if (diff <= 0) {
        setTimeRemaining("00:00:00 - CLOSED");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  useEffect(() => {
    if (liveBid) {
      const newBidAmount = parseFloat(liveBid.bid_amount || liveBid.bidAmount);
      setCurrentHighest(newBidAmount);
      setBidInput((newBidAmount + 100).toString());
      api.get(`/auctions/${AUCTION_ID}/bids`).then(res => {
        if (res.data.bids && res.data.bids.length > 0) {
          setBids(res.data.bids);
        }
      });
    }
  }, [liveBid, AUCTION_ID]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");

    if (!user) {
      setBidError("Please log in to submit verified financial bids.");
      return;
    }
    
    const bidAmount = parseFloat(bidInput);
    if (isNaN(bidAmount) || bidAmount <= currentHighest) {
      setBidError(`Your bid must exceed GHS ${currentHighest.toLocaleString()}`);
      return;
    }

    setIsBidding(true);
    try {
      await api.post(`/auctions/${AUCTION_ID}/bids`, {
        userId: user.id,
        bidAmount: bidAmount,
      });

      if (socket) {
        socket.emit("place_bid", {
          auctionId: AUCTION_ID,
          userId: user.id,
          bidAmount: bidAmount,
        });
      }

      setBidInput((bidAmount + 100).toString());
      await fetchAuctionData();
    } catch (err) {
      setBidError(err.response?.data?.error || "Failed to transmit bid. Please retry.");
    } finally {
      setIsBidding(false);
    }
  };

  if (!auction) return <LoadingOverlay message="Loading Auction Engine Event Room..." />;

  const isLive = auction.status === 'active' && new Date(auction.endTime) > new Date();
  const topBidderName = String(bids[0]?.user?.name || bids[0]?.userId || "None (Be first!)");
  const titleStr = String(auction.title || auction.name || "");
  const isTech = titleStr.toLowerCase().includes("macbook") || titleStr.toLowerCase().includes("ipad") || titleStr.toLowerCase().includes("sony");

  const specPillars = [
    { label: "BRAND / MAKER", value: auction.brand || "BediDwa Verified" },
    { label: "CONDITION", value: auction.condition || "Certified Authentic" },
    { label: "STARTING BASE", value: `GH₵ ${parseFloat(auction.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { label: "ESCROW STATUS", value: "100% Fully Protected" }
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "#111827", padding: "0 0 6rem 0", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ width: "100%", maxWidth: "1920px", margin: "0 auto" }}>
        
        {/* Top Breadcrumb Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem" }}>
          <button onClick={() => navigate('/auctions')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#64748b', fontWeight: '700', fontSize: "0.9rem", cursor: 'pointer', padding: 0 }}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back to Auction Engine
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>ID: #AUC-{AUCTION_ID}924</span>
            <span style={{ backgroundColor: "#ecfdf5", color: "#059669", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800", border: "1px solid #a7f3d0" }}>
              🔒 MoMo Escrow Verified
            </span>
          </div>
        </div>

        {/* Realistic Split Architecture */}
        <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: "3rem", alignItems: "start" }} className="max-lg:grid-cols-1">
          
          {/* LEFT COLUMN: REALISTIC HERO, THUMBNAILS & SPECS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2.2rem" }}>
            
            {/* Product Gallery Section */}
            <div>
              {/* Main Photo Container */}
              <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", height: "420px", marginBottom: "1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.04)" }}>
                <img src={productImages[activeThumbIndex] || productImages[0]} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                
                {/* Badges Overlay */}
                <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", display: "flex", justifyContent: "space-between", pointerEvents: "none" }}>
                  <span style={{ backgroundColor: "#1e3a8a", color: "#ffffff", padding: "0.35rem 0.9rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "0.5px" }}>
                    AUCTION LIVE
                  </span>
                  <span style={{ backgroundColor: "#fbbf24", color: "#111827", padding: "0.35rem 0.9rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                    CONDITION: {auction.condition || "LIKE NEW"}
                  </span>
                </div>
              </div>

              {/* Thumbnails Strip (Only show if item genuinely has multiple images) */}
              {productImages.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(productImages.length, 4)}, 1fr)`, gap: "1rem" }}>
                  {productImages.slice(0, 4).map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveThumbIndex(idx)}
                      style={{ 
                        position: "relative", height: "90px", borderRadius: "12px", overflow: "hidden", 
                        border: activeThumbIndex === idx ? "2px solid #4343C7" : "1px solid #e2e8f0", 
                        cursor: "pointer", backgroundColor: "#ffffff", transition: "all 0.2s"
                      }}
                    >
                      <img src={img} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: activeThumbIndex === idx ? 1 : 0.7 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Headline Summary */}
            <div>
              <h1 style={{ fontSize: "2.2rem", fontWeight: "900", color: "#111827", margin: "0 0 0.8rem 0", letterSpacing: "-0.5px", lineHeight: "1.2" }}>
                {auction.title}
              </h1>
              <p style={{ color: "#4b5563", fontSize: "1.05rem", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>
                {auction.description || `Official verified auction listing for ${auction.title}. Fully inspected and certified by BediDwa logistics prior to auction release.`}
              </p>
            </div>

            {/* 4 SPEC PILLARS (Exactly like Screenshot 1) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }} className="max-sm:grid-cols-2">
              {specPillars.map((pillar, idx) => (
                <div key={idx} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <div>
                    <div style={{ color: "#4343C7", marginBottom: "0.6rem" }}>
                      <span className="material-symbols-outlined text-[24px]">
                        {idx === 0 ? "memory" : idx === 1 ? "storage" : idx === 2 ? "battery_charging_full" : "verified"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "0.4rem" }}>{pillar.label}</div>
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#111827", lineHeight: "1.3" }}>{pillar.value}</div>
                </div>
              ))}
            </div>

            {/* REALISTIC TABS SECTION */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "2rem" }}>
              <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", gap: "2.5rem", marginBottom: "2rem", overflowX: "auto" }}>
                {[
                  { id: "description", label: "Product Description" },
                  { id: "shipping", label: "Shipping & Inspection" },
                  { id: "reviews", label: "Merchant Reviews (4.9★)" }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    style={{ 
                      background: "none", border: "none", padding: "0 0 0.8rem 0", fontSize: "0.95rem", 
                      fontWeight: selectedTab === tab.id ? "800" : "600", 
                      color: selectedTab === tab.id ? "#4343C7" : "#64748b", 
                      borderBottom: selectedTab === tab.id ? "2px solid #4343C7" : "2px solid transparent",
                      marginBottom: "-2px", cursor: "pointer", transition: "all 0.2s" 
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.7", fontWeight: "500" }}>
                {selectedTab === "description" && (
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#111827", margin: "0 0 0.8rem 0" }}>Product Specifications & Details</h4>
                    <p style={{ marginBottom: "1.2rem" }}>
                      {auction.description || `Verified listing for ${auction.title}. Every item listed on the BediDwa Auction Engine is physically verified prior to bidding.`}
                    </p>
                    <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", color: "#4b5563" }}>
                      <li><strong>Item Title:</strong> {auction.title}</li>
                      {auction.brand && <li><strong>Brand / Manufacturer:</strong> {auction.brand}</li>}
                      {auction.condition && <li><strong>Item Condition:</strong> {auction.condition}</li>}
                      <li><strong>Starting Base Price:</strong> GH₵ {parseFloat(auction.basePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</li>
                      <li><strong>Escrow Protection:</strong> Funds held securely in Mobile Money Escrow until physical delivery inspection.</li>
                    </ul>
                  </div>
                )}
                {selectedTab === "shipping" && (
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#111827", margin: "0 0 0.8rem 0" }}>Customs Clearance & Logistics</h4>
                    <p>
                      All auction items undergo formal physical verification at our designated regional logistics terminal prior to dispatch. Once your winning bid is finalized, an express courier tracking identifier is assigned within 24 hours. Your payment remains secured in MoMo Escrow until you physically inspect the item at delivery and sign off.
                    </p>
                  </div>
                )}
                {selectedTab === "reviews" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div style={{ padding: "1.2rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontWeight: "800", color: "#111827" }}>Kwame A. (Verified Level 4 Merchant)</span>
                        <span style={{ color: "#eab308", fontWeight: "800" }}>★★★★★ 5.0</span>
                      </div>
                      <p style={{ color: "#4b5563", margin: 0, fontSize: "0.9rem" }}>"Flawless transaction through the Auction Engine. The item arrived sealed in original packaging with official verification documents as promised!"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: THE REALISTIC BIDDING CONSOLE & HISTORY */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "25px" }}>
            
            {/* TERMINAL BOX */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.06)" }}>
              
              {/* Top Indigo Header Banner */}
              <div style={{ backgroundColor: "#1e3a8a", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", fontWeight: "800", fontSize: "0.85rem" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
                  LIVE AUCTION
                </span>
                <span style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "#ffffff", padding: "0.25rem 0.75rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" }}>
                  👁️ {watchers} {watchers === 1 ? "User" : "Users"} Watching
                </span>
              </div>

              {/* Main Console Body */}
              <div style={{ padding: "2rem 1.8rem" }}>
                
                {/* Current Bid Display */}
                <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "0.4rem" }}>
                    CURRENT HIGHEST BID
                  </div>
                  <div style={{ fontSize: "2.8rem", fontWeight: "900", color: "#1d4ed8", lineHeight: "1.1", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "1.5rem", color: "#475569", marginRight: "0.4rem" }}>GHS</span>
                    {currentHighest.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </div>
                  <div style={{ display: "inline-block", padding: "0.3rem 1.2rem", backgroundColor: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: "20px", color: "#065f46", fontSize: "0.8rem", fontWeight: "800" }}>
                    👑 Highest Bidder: {topBidderName}
                  </div>
                </div>

                {/* Ends In & Bids Placed (Side-by-side grey cards) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.8rem" }}>
                  <div style={{ backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "0.2rem" }}>ENDS IN</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#111827", fontFamily: "monospace" }}>{timeRemaining}</div>
                  </div>
                  <div style={{ backgroundColor: "#f1f5f9", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "0.2rem" }}>BIDS PLACED</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: "900", color: "#111827" }}>{bids.length}</div>
                  </div>
                </div>

                {error && <ErrorMessage message={error} />}
                {bidError && <div style={{ marginBottom: "1.5rem" }}><ErrorMessage message={bidError} /></div>}

                {/* Bidding Input Form */}
                {isLive ? (
                  <form onSubmit={handlePlaceBid}>
                    <div style={{ marginBottom: "0.6rem" }}>
                      <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "#4b5563", marginBottom: "0.4rem" }}>Your Bid Amount (GHS)</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "1.2rem", top: "50%", transform: "translateY(-50%)", fontWeight: "800", color: "#64748b", fontSize: "1.05rem" }}>GHS</span>
                        <input
                          type="number"
                          value={bidInput}
                          onChange={(e) => setBidInput(e.target.value)}
                          placeholder={(currentHighest + 100).toString()}
                          step="10"
                          style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 3.8rem", backgroundColor: "#ffffff", border: "2px solid #cbd5e1", borderRadius: "10px", fontSize: "1.25rem", fontWeight: "800", color: "#111827", outline: "none" }}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "1.5rem" }}>
                      Min. Increment: GHS 100. BediDwa fee: GHS 25 (applied on win).
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isBidding}
                      style={{ width: "100%", padding: "1rem", backgroundColor: "#1e3a8a", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "1.05rem", cursor: isBidding ? "not-allowed" : "pointer", transition: "background-color 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.6rem", boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)" }}
                      onMouseOver={e=>{if(!isBidding) e.currentTarget.style.backgroundColor="#172554"}}
                      onMouseOut={e=>{if(!isBidding) e.currentTarget.style.backgroundColor="#1e3a8a"}}
                    >
                      <span className="material-symbols-outlined text-[22px]">gavel</span>
                      <span>{isBidding ? "Submitting Offer..." : "Place Bid"}</span>
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                    <p style={{ margin: 0, fontWeight: "700" }}>This auction pool is concluded.</p>
                  </div>
                )}
              </div>
            </div>

            {/* LIVE BID HISTORY SECTION */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.8rem" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: "900", color: "#111827" }}>Live Bid History</span>
                <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: "800", cursor: "pointer" }}>See All</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "260px", overflowY: "auto" }}>
                {bids.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#64748b", padding: "1.5rem 0", fontWeight: "600", fontSize: "0.9rem" }}>
                    No bids recorded yet. Be the first to place a bid!
                  </div>
                ) : (
                  bids.map((b, i) => (
                    <div key={b.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: i === 0 ? "#eff6ff" : "#f1f5f9", color: i === 0 ? "#1d4ed8" : "#64748b", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", fontSize: "0.8rem", border: i === 0 ? "1px solid #bfdbfe" : "none" }}>
                          {String(b.user?.name || b.userId || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#111827" }}>{String(b.user?.name || b.userId || `Registered User`)}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{b.timestamp ? new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.95rem", fontWeight: "900", color: i === 0 ? "#059669" : "#111827" }}>
                        GHS {parseFloat(b.bidAmount || b.bid_amount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* REASSURANCE WIDGET CARDS (Exactly like Screenshot 1) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1.2rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "16px", display: "flex", gap: "1rem", alignItems: "start" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#059669", flexShrink: 0 }}>verified_user</span>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#065f46", marginBottom: "0.2rem" }}>MoMo Escrow Protected</div>
                  <div style={{ fontSize: "0.78rem", color: "#047857", lineHeight: "1.4", fontWeight: "500" }}>Funds only released to merchant after you confirm receipt.</div>
                </div>
              </div>

              <div style={{ padding: "1.2rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "16px", display: "flex", gap: "1rem", alignItems: "start" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#1d4ed8", flexShrink: 0 }}>verified</span>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#1e3a8a", marginBottom: "0.2rem" }}>BediDwa Guarantee</div>
                  <div style={{ fontSize: "0.78rem", color: "#1e40af", lineHeight: "1.4", fontWeight: "500" }}>100% Money-back if item isn't exactly as described.</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default LiveAuctions;
