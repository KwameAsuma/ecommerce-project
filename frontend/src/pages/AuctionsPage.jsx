import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockProducts } from "../data/mockDb";

const ChevronLeftIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const AuctionsPage = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350, behavior: 'smooth' });
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
    const timer = setInterval(() => {
      scrollRight();
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Dual-Catalog Toggle */}
        <div style={{ display: "flex", backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.4rem" }}>
          <button 
            onClick={() => navigate("/catalog")}
            style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseOut={e => e.currentTarget.style.color = "var(--text-secondary)"}
          >
            Native Store
          </button>
          <button 
            style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontWeight: "700", fontSize: "0.9rem", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", cursor: "default" }}
          >
            Consolidated Imports
          </button>
        </div>
      </div>

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
          style={{ 
            display: "flex", 
            overflowX: "auto", 
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            height: "500px"
          }}
        >
          {mockProducts.slice(0, 4).map((product, index) => (
            <div key={`hot-${product.id}`} style={{ minWidth: "100%", width: "100%", position: "relative", scrollSnapAlign: "start", flexShrink: 0, cursor: "pointer" }} onClick={() => navigate(`/product/${product.id}`)}>
              {/* Background Image */}
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              
              {/* Gradient Overlay for Text Readability */}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)" }}></div>
              
              {/* Content Overlay (Bottom Left) */}
              <div style={{ position: "absolute", bottom: "40px", left: "40px", right: "200px", color: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                  <span style={{ backgroundColor: "var(--brand-blue)", color: "white", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span> LIVE AUCTION
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", opacity: 0.8 }}>Ends in 00h 15m 42s</span>
                </div>
                <h2 style={{ fontSize: "2.5rem", fontWeight: "900", margin: "0 0 0.5rem 0", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{product.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.95rem", opacity: 0.9 }}>
                  <span>{product.category}</span>
                  <span>|</span>
                  <span>{product.region}</span>
                  <span>|</span>
                  <span style={{ color: "var(--brand-gold)", fontWeight: "800" }}>Current Bid: GH₵ {(product.price * 1.5).toLocaleString()}</span>
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
          {[0, 1, 2, 3].map((_, i) => (
            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: i === 0 ? "white" : "rgba(255,255,255,0.3)" }}></div>
          ))}
        </div>
      </div>

      {/* Grid of Other Auctions (10 items) */}
      <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 1.5rem 0" }}>All Active Auctions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
        {mockProducts.slice(3, 13).map((product) => (
          <div key={`auction-${product.id}`} style={{ backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform 0.2s" }} onMouseOver={e=>e.currentTarget.style.transform="translateY(-4px)"} onMouseOut={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ position: "relative", height: "180px" }}>
              <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "8px", right: "8px", backgroundColor: "var(--text-primary)", color: "var(--bg-base)", padding: "0.3rem 0.6rem", borderRadius: "16px", fontSize: "0.65rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: "4px", height: "4px", backgroundColor: "var(--bg-base)", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span> LIVE
              </div>
            </div>
            <div style={{ padding: "1.2rem", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", margin: "0 0 1rem 0" }}>{product.name}</h3>
              <div style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Current Bid</span>
                  <span style={{ fontWeight: "800", color: "var(--brand-gold)" }}>GH₵ {(product.price * 1.1).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Ends In</span>
                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>04h 22m</span>
                </div>
                <button style={{ width: "100%", padding: "0.6rem", backgroundColor: "transparent", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }} onMouseOver={e=>e.currentTarget.style.backgroundColor="var(--bg-base)"} onMouseOut={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  View Auction
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
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
