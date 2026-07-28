import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorMessage from "../components/ErrorMessage";

const ChevronLeftIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const AuctionsPage = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", // Watch (id 0 or 5)
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop", // Camera
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", // Shoes
    "https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?q=80&w=800&auto=format&fit=crop"  // iPhone (replaced wolf)
  ];

  const getImageUrl = (auction) => {
    if (auction.imageUrl) return `http://localhost:5000${auction.imageUrl}`;
    const id = auction.id || 0;
    return fallbackImages[id % fallbackImages.length];
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const clientWidth = carouselRef.current.clientWidth;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get('/auctions');
        const fetchedAuctions = res.data.auctions || res.data;
        setAuctions(Array.isArray(fetchedAuctions) ? fetchedAuctions : []);
      } catch (err) {
        setError("Failed to load active auctions.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      scrollRight();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <LoadingOverlay message="Loading Auctions..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Top Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 0.5rem 0" }}>
            Live Auctions.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Place your bids on high-value, consolidated imports.
          </p>
        </div>

      </div>

      {auctions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "6rem 2rem", backgroundColor: "var(--bg-panel)", borderRadius: "16px", border: "1px solid var(--border)", marginBottom: "4rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--text-muted)", marginBottom: "1rem" }}>inventory_2</span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}>No live auctions at the moment.</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>Check back later for high-value consolidated imports.</p>
        </div>
      ) : (
        <>
          {/* Featured / Most Active Auctions (Top 3 Carousel) */}
          <div style={{ position: "relative", marginBottom: "4rem", borderRadius: "16px", overflow: "hidden", backgroundColor: "var(--bg-panel)" }}>
            
            {/* Left Arrow Overlay */}
            <button 
              onClick={scrollLeft} 
              style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", width: "50px", height: "50px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "white", zIndex: 10, transition: "all 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.backgroundColor="rgba(0, 0, 0, 0.8)"}
              onMouseOut={e=>e.currentTarget.style.backgroundColor="rgba(0, 0, 0, 0.4)"}
            >
              <ChevronLeftIcon />
            </button>

            {/* Carousel Track */}
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              style={{ 
                display: "flex", 
                overflowX: "auto", 
                scrollSnapType: "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                height: "500px",
                scrollBehavior: "smooth"
              }}
            >
              {auctions.slice(0, 4).map((auction, index) => (
                <div key={`hot-${auction.id}`} style={{ minWidth: "100%", width: "100%", position: "relative", scrollSnapAlign: "start", flexShrink: 0, cursor: "pointer" }} onClick={() => navigate(`/auctions/${auction.id}`)}>
                  {/* Background Image */}
                  <img src={getImageUrl(auction)} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  
                  {/* Gradient Overlay for Text Readability */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)" }}></div>
                  
                  {/* Content Overlay (Bottom Left) */}
                  <div style={{ position: "absolute", bottom: "40px", left: "40px", right: "200px", color: "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                      <span style={{ backgroundColor: "var(--brand-blue)", color: "white", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span> LIVE AUCTION
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: "600", opacity: 0.8 }}>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                    </div>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0 0 0.5rem 0", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{auction.title}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.95rem", opacity: 0.9 }}>
                      <span>General</span>
                      <span>|</span>
                      <span>Global</span>
                      <span>|</span>
                      <span style={{ color: "var(--brand-gold)", fontWeight: "800" }}>Current Bid: GH₵ {parseFloat(auction.currentHighestBid || auction.basePrice || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow Overlay */}
            <button 
              onClick={scrollRight} 
              style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", width: "50px", height: "50px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "white", zIndex: 10, transition: "all 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.backgroundColor="rgba(0, 0, 0, 0.8)"}
              onMouseOut={e=>e.currentTarget.style.backgroundColor="rgba(0, 0, 0, 0.4)"}
            >
              <ChevronRightIcon />
            </button>

            {/* Pagination Dots (Bottom Right) */}
            <div style={{ position: "absolute", bottom: "30px", right: "40px", display: "flex", gap: "0.4rem", zIndex: 10 }}>
              {auctions.slice(0, 4).map((_, i) => (
                <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: i === activeIndex ? "white" : "rgba(255,255,255,0.3)", transition: "background-color 0.3s" }}></div>
              ))}
            </div>
          </div>

          {/* Grid of Other Auctions (10 items) */}
          <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>All Active Auctions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
            {auctions.slice(4).map((auction) => (
              <div key={`auction-${auction.id}`} style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ position: "relative", height: "180px" }}>
                  <img src={getImageUrl(auction)} alt={auction.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "var(--text-primary)", color: "var(--bg-base)", padding: "0.3rem 0.6rem", borderRadius: "16px", fontSize: "0.65rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <span style={{ width: "4px", height: "4px", backgroundColor: "var(--bg-base)", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span> LIVE
                  </div>
                </div>
                <div style={{ padding: "1.2rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 1rem 0" }}>{auction.title}</h3>
                  <div style={{ marginTop: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Current Bid</span>
                      <span style={{ fontWeight: "800", color: "var(--brand-gold)" }}>GH₵ {parseFloat(auction.currentHighestBid || auction.basePrice || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "1rem" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Ends</span>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <button style={{ width: "100%", padding: "0.6rem", backgroundColor: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"} onClick={() => navigate(`/auctions/${auction.id}`)}>
                      View Auction
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
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

export default AuctionsPage;
