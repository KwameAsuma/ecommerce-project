import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorMessage from "../components/ErrorMessage";

const LiveAuctions = () => {
  const { id } = useParams();
  const AUCTION_ID = parseInt(id, 10);
  const navigate = useNavigate();
  const { socket, liveBid, error } = useSocket(AUCTION_ID);

  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [currentHighest, setCurrentHighest] = useState(0);
  const [bidInput, setBidInput] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState("");

  const fallbackImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", // Watch
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop", // Camera
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", // Shoes
    "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=800&auto=format&fit=crop"  // iPhone
  ];

  const getImageUrl = (auction) => {
    if (!auction) return fallbackImages[0];
    if (auction.imageUrl) return `http://localhost:5001${auction.imageUrl}`;
    const aid = auction.id || 0;
    return fallbackImages[aid % fallbackImages.length];
  };

  const fetchAuctionData = async () => {
    try {
      const res = await api.get(`/auctions/${AUCTION_ID}`);
      setAuction(res.data.auction);
      setCurrentHighest(parseFloat(res.data.auction.currentHighestBid || res.data.auction.current_highest_bid || res.data.auction.basePrice));
      
      // Also fetch bids leaderboard
      const bidRes = await api.get(`/auctions/${AUCTION_ID}/bids`);
      setBids(bidRes.data.bids || []);
    } catch (err) {
      console.error("Failed to load auction", err);
    }
  };

  useEffect(() => {
    fetchAuctionData();
    // eslint-disable-next-line
  }, [AUCTION_ID]);

  // Automatically update the UI when the WebSocket hears a new bid
  useEffect(() => {
    if (liveBid) {
      setCurrentHighest(parseFloat(liveBid.bid_amount || liveBid.bidAmount));
      // Refresh the leaderboard to get the new bid details
      api.get(`/auctions/${AUCTION_ID}/bids`).then(res => setBids(res.data.bids || []));
    }
  }, [liveBid, AUCTION_ID]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");

    if (!user) {
      setBidError("You must be logged in to place a bid.");
      return;
    }
    
    const bidAmount = parseFloat(bidInput);
    if (bidAmount <= currentHighest) {
      setBidError(`Your bid must be higher than GH₵ ${currentHighest.toFixed(2)}`);
      return;
    }

    setIsBidding(true);

    try {
      // Send through HTTP as primary, socket as secondary broadcast
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

      setBidInput("");
      fetchAuctionData(); // Refresh UI immediately
    } catch (err) {
      setBidError(err.response?.data?.error || "Failed to place bid. Please try again.");
    } finally {
      setIsBidding(false);
    }
  };

  if (!auction) return <LoadingOverlay message="Connecting to Live Demand Pool..." />;

  const isLive = auction.status === 'active' && new Date(auction.endTime) > new Date();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", animation: 'fadeRoute 0.4s ease-out' }}>
      
      <button onClick={() => navigate('/auctions')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>
        <span className="material-symbols-outlined">arrow_back</span> Back to Auctions
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "2rem", alignItems: "start" }}>
        
        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            
            {/* Header Section */}
            <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: isLive ? 'linear-gradient(90deg, var(--brand-gold), var(--danger))' : 'var(--text-muted)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                    {isLive ? (
                      <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                        LIVE AUCTION
                      </span>
                    ) : (
                      <span style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-secondary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
                        AUCTION CLOSED
                      </span>
                    )}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Ends: {new Date(auction.endTime).toLocaleString()}
                    </span>
                  </div>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-1px' }}>{auction.title}</h1>
                </div>
              </div>

              {/* Hero Image & Price Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', backgroundColor: 'var(--bg-base)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                {/* Image Placeholder */}
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <img src={getImageUrl(auction)} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                {/* Price Details */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>Current Highest Bid</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--brand-gold)', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>GH₵</span>
                      {currentHighest.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', margin: '0 0 0.3rem 0', textTransform: 'uppercase' }}>Base Price</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>GH₵ {parseFloat(auction.basePrice || auction.base_price).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', margin: '0 0 0.3rem 0', textTransform: 'uppercase' }}>Total Bids</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{bids.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bidding Section */}
            {isLive ? (
              <div style={{ padding: '2.5rem', backgroundColor: 'var(--bg-panel)' }}>
                {error && <ErrorMessage message={error} />}
                {bidError && <ErrorMessage message={bidError} />}
                
                {user ? (
                  <form onSubmit={handlePlaceBid}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flexGrow: 1 }}>
                        <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: 'var(--text-secondary)', fontSize: '1.2rem', pointerEvents: 'none' }}>GH₵</span>
                        <input
                          type="number"
                          value={bidInput}
                          onChange={(e) => setBidInput(e.target.value)}
                          placeholder={(currentHighest + 10).toFixed(2)}
                          min={currentHighest + 1}
                          step="0.01"
                          style={{
                            width: '100%', padding: '1.2rem 1.2rem 1.2rem 4.5rem', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)',
                            borderRadius: '12px', border: '2px solid var(--border)', outline: 'none', transition: 'border-color 0.2s', backgroundColor: 'var(--bg-base)'
                          }}
                          onFocus={e=>e.target.style.borderColor='var(--brand-gold)'}
                          onBlur={e=>e.target.style.borderColor='var(--border)'}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isBidding}
                        style={{
                          padding: '0 2.5rem', height: '65px', fontSize: '1.2rem', backgroundColor: 'var(--brand-gold)', color: 'white',
                          border: 'none', borderRadius: '12px', cursor: isBidding ? 'not-allowed' : 'pointer', fontWeight: '900', transition: 'all 0.2s', opacity: isBidding ? 0.7 : 1, boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                        }}
                        onMouseOver={e=>{if(!isBidding) e.currentTarget.style.backgroundColor='#d97706'}}
                        onMouseOut={e=>{if(!isBidding) e.currentTarget.style.backgroundColor='var(--brand-gold)'}}
                      >
                        {isBidding ? "Placing..." : "Place Bid"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)', marginBottom: '1rem' }}>lock</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Authentication Required</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>You must be securely logged in to participate in the demand pool.</p>
                    <button onClick={() => navigate('/login')} style={{ backgroundColor: 'var(--text-primary)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Login to Bid</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2.5rem', backgroundColor: 'var(--bg-base)', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '1rem' }}>gavel</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>Auction Concluded</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>This demand pool is no longer accepting bids.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Leaderboard */}
        <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '600px' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-base)' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined text-primary">leaderboard</span>
              Bid Leaderboard
            </h3>
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
            {bids.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {bids.map((bid, idx) => (
                  <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: idx === 0 ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-base)', border: `1px solid ${idx === 0 ? 'var(--brand-gold)' : 'var(--border)'}`, borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: idx === 0 ? 'var(--brand-gold)' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--bg-panel)', color: idx < 3 ? 'white' : 'var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '0.9rem', border: idx >= 3 ? '1px solid var(--border)' : 'none' }}>
                        {idx + 1}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{bid.user?.name || `Bidder #${bid.userId || bid.user_id}`}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(bid.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: '800', color: idx === 0 ? 'var(--brand-gold)' : 'var(--text-primary)' }}>
                      GH₵ {parseFloat(bid.bidAmount || bid.bid_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: 0 }}>No bids placed yet.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Be the first to bid!</p>
              </div>
            )}
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
