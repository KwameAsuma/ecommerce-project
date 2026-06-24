import { useState, useEffect } from "react";
import useSocket from "../hooks/useSocket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorMessage from "../components/ErrorMessage";

const LiveAuctions = () => {
  const AUCTION_ID = 1; // Hardcoded for testing the MacBook auction
  const { socket, liveBid, error } = useSocket(AUCTION_ID);

  // <-- Pull the real logged-in user from the security hub
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [currentHighest, setCurrentHighest] = useState(0);
  const [bidInput, setBidInput] = useState("");

  // 1. Fetch the initial auction data on load
  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const res = await api.get(`/auctions/${AUCTION_ID}`);
        setAuction(res.data.auction);
        setCurrentHighest(parseFloat(res.data.auction.current_highest_bid));
      } catch (err) {
        console.error("Failed to load auction", err);
      }
    };
    fetchAuctionData();
  }, []);

  // 2. Automatically update the UI when the WebSocket hears a new bid
  useEffect(() => {
    if (liveBid) {
      setCurrentHighest(parseFloat(liveBid.bid_amount));
    }
  }, [liveBid]);

  // 3. Send a new bid through the WebSocket
  const handlePlaceBid = (e) => {
    e.preventDefault();

    // Safety check: Don't send if no socket, no input, or user isn't logged in
    if (!socket || !bidInput || !user) return;

    socket.emit("place_bid", {
      auctionId: AUCTION_ID,
      userId: user.id, // <-- DYNAMIC ID: Jane Doe is eliminated!
      bidAmount: parseFloat(bidInput),
    });

    setBidInput(""); // Clear the input field
  };

  if (!auction) return <LoadingOverlay message="Connecting to Live Auction..." />;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          padding: "2rem",
          backgroundColor: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ margin: 0, color: "#111" }}>{auction.title}</h1>
          <span
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontWeight: "bold",
              animation: "pulse 2s infinite",
            }}
          >
            🔴 LIVE
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#64748b",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              letterSpacing: "1px",
            }}
          >
            Current Highest Bid
          </p>
          <h2
            style={{ fontSize: "3rem", margin: "0.5rem 0", color: "#0f172a" }}
          >
            GHS {currentHighest.toFixed(2)}
          </h2>
          <p style={{ margin: 0, color: "#94a3b8" }}>
            Base Price: GHS {parseFloat(auction.base_price).toFixed(2)}
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* If the user is logged in, show the form. If not, tell them to log in! */}
        {user ? (
          <form
            onSubmit={handlePlaceBid}
            style={{ display: "flex", gap: "1rem" }}
          >
            <input
              type="number"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              placeholder="Enter your bid amount..."
              min={currentHighest + 1}
              step="0.01"
              style={{
                flexGrow: 1,
                padding: "1rem",
                fontSize: "1.2rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
              required
            />
            <button
              type="submit"
              style={{
                padding: "0 2rem",
                fontSize: "1.2rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Place Bid
            </button>
          </form>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "#f1f5f9",
              borderRadius: "8px",
              color: "#475569",
            }}
          >
            Please log in to place a live bid.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAuctions;
