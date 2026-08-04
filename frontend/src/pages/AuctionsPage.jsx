import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../components/LoadingOverlay";
import ErrorMessage from "../components/ErrorMessage";
import { resolveImageUrl } from "../utils/imageUtils";

const AuctionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tickerTime, setTickerTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Carousel & Live Ticker States
  const [heroIndex, setHeroIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [liveTickerMsg, setLiveTickerMsg] = useState("🇬🇭 K. Mensah just placed a bid of GH₵ 26,500");

  const fallbackImages = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop", // MacBook Pro
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop", // Watch
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop", // Wardrobe
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop", // Camera
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"  // Gold Ring
  ];

  const getImageUrl = (auction) => {
    if (!auction) return fallbackImages[0];
    const title = (auction.title || auction.name || "").toLowerCase();
    const rawUrl = (auction.imageUrl || auction.image || "").toLowerCase();
    if (title.includes("rolex") || title.includes("submariner") || rawUrl.includes("rolex") || rawUrl.includes("google.com/url") || rawUrl.includes("m126610lv")) {
      return "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop";
    }
    if (auction.imageUrl || auction.image) {
      const url = (auction.imageUrl || auction.image).split(',')[0].trim();
      return resolveImageUrl(url);
    }
    const id = auction.id || 0;
    return fallbackImages[id % fallbackImages.length];
  };

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await api.get('/auctions');
        const fetchedAuctions = res.data.auctions || res.data;
        setAuctions(Array.isArray(fetchedAuctions) ? fetchedAuctions : []);
      } catch (err) {
        setError("Failed to load live auction data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recent Bidders Notification Ticker (Using real user bids)
  useEffect(() => {
    if (auctions.length === 0) return;
    const realBids = [];
    auctions.forEach(a => {
      if (a.bids && a.bids.length > 0) {
        a.bids.forEach(b => {
          const bidderName = b.user?.name || "Verified Bidder";
          const isMe = user?.id === b.user?.id ? " (You)" : "";
          realBids.push(`🇬🇭 ${bidderName}${isMe} placed a bid of GH₵ ${parseFloat(b.bidAmount || 0).toLocaleString()} on ${a.title}`);
        });
      }
    });
    if (realBids.length === 0) {
      if (user?.name) {
        setLiveTickerMsg(`🇬🇭 Welcome, ${user.name}! Be the first to place a verified bid on active lots.`);
      } else {
        setLiveTickerMsg(`🇬🇭 No recent bids recorded yet. Be the first to place a verified bid!`);
      }
      return;
    }
    setLiveTickerMsg(realBids[0]);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % realBids.length;
      setLiveTickerMsg(realBids[idx]);
    }, 6000);
    return () => clearInterval(interval);
  }, [auctions, user]);

  const scrollToAllLots = () => {
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
    const el = document.getElementById("all-auction-lots");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredAuctions = useMemo(() => {
    return auctions.filter(item => {
      const price = parseFloat(item.currentHighestBid || item.basePrice || 0);
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      if (selectedCategory !== "All") {
        const title = (item.title || item.name || "").toLowerCase();
        if (selectedCategory === "High Value Tech" && !title.includes("macbook") && !title.includes("sony") && !title.includes("ipad") && !title.includes("camera") && !title.includes("server")) return false;
        if (selectedCategory === "Heritage & Gold" && !title.includes("rolex") && !title.includes("djembe") && !title.includes("ashanti") && !title.includes("ring")) return false;
        if (selectedCategory === "Furniture & Equipment" && !title.includes("wardrobe") && !title.includes("espresso") && !title.includes("wood") && !title.includes("rack") && !title.includes("tires")) return false;
      }
      return true;
    });
  }, [auctions, minPrice, maxPrice, selectedCategory]);

  // Prepare Spotlight Carousel Lots
  const carouselAuctions = useMemo(() => {
    if (auctions.length === 0) return [];
    // Prioritize high value tech and luxury heritage items for the carousel
    const spotlights = [...auctions].sort((a, b) => parseFloat(b.currentHighestBid || b.basePrice) - parseFloat(a.currentHighestBid || a.basePrice)).slice(0, 4);
    return spotlights;
  }, [auctions]);

  useEffect(() => {
    if (isCarouselPaused || carouselAuctions.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % carouselAuctions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPaused, carouselAuctions.length]);

  if (loading) return <LoadingOverlay message="Connecting to BediDwa Auction Engine..." />;
  if (error) return <ErrorMessage message={error} />;

  const heroAuction = carouselAuctions[heroIndex % (carouselAuctions.length || 1)] || auctions[0];
  const closingSoon = [...auctions].sort((a, b) => new Date(a.endTime) - new Date(b.endTime)).slice(0, 3);
  const highValue = [...auctions].sort((a, b) => parseFloat(b.currentHighestBid || b.basePrice) - parseFloat(a.currentHighestBid || a.basePrice));
  const spotlightLarge = highValue[0] || null;
  const spotlightSide = highValue.slice(1, 3);

  const formatTimeLeft = (endTimeStr) => {
    const diff = new Date(endTimeStr) - new Date();
    if (diff <= 0) return "CLOSED";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)", color: "#111827", padding: "0 0 5rem 0", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0.3; transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: "1920px", margin: "0 auto" }}>

        {/* INTERACTIVE ACTIVE SHOWCASE CAROUSEL BANNER */}
        {heroAuction && (
          <div 
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            style={{ 
              position: "relative", 
              borderRadius: "20px", 
              overflow: "hidden", 
              border: "1px solid rgba(255, 255, 255, 0.18)", 
              backgroundColor: "#0f172a", 
              marginBottom: "2rem", 
              display: "flex", 
              minHeight: "330px", 
              boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.2)" 
            }}
          >
            {/* Background Image with Smooth Fade & Zoom */}
            <img 
              key={heroAuction.id || heroIndex}
              src={getImageUrl(heroAuction)} 
              alt={heroAuction.title} 
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "brightness(0.9)", animation: "fadeInOut 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }} 
            />
            
            {/* Luxury Multi-Layer Mesh Gradient Overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(90deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.88) 48%, rgba(15, 23, 42, 0.25) 75%, rgba(15, 23, 42, 0.65) 100%)" }}></div>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, transparent 60%, rgba(15, 23, 42, 0.75) 100%)" }}></div>

            {/* Top Right Floating Real-Time Market Toast */}
            <div style={{ position: "absolute", top: "1.2rem", right: "1.5rem", zIndex: 10, display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(12px)", padding: "0.4rem 0.9rem", borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.18)", color: "#ffffff", fontSize: "0.78rem", fontWeight: "700", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }} className="hidden md:flex">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34d399", animation: "pulse 1.5s infinite" }}></span>
              <span style={{ transition: "all 0.3s ease" }}>{liveTickerMsg}</span>
            </div>

            {/* Main Content Area */}
            <div style={{ position: "relative", zIndex: 5, padding: "2.2rem 2.5rem", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "580px", flexGrow: 1 }}>
              
              {/* Status Pill & Lot Identifier */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#dc2626", color: "#ffffff", padding: "0.3rem 0.7rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "800" }}>
                  <span style={{ width: "5px", height: "5px", backgroundColor: "#ffffff", borderRadius: "50%", animation: "pulse 1s infinite" }}></span> LIVE SPOTLIGHT
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#ffffff", padding: "0.3rem 0.7rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "700", border: "1px solid rgba(255,255,255,0.2)" }}>
                  🏆 LOT #{heroAuction.id || "401"}
                </div>
              </div>

              <h1 key={`title-${heroAuction.id}`} style={{ fontSize: "2.15rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.15", margin: "0 0 0.5rem 0", letterSpacing: "-0.8px", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {heroAuction.title}
              </h1>
              <p style={{ color: "#cbd5e1", fontSize: "0.92rem", lineHeight: "1.45", margin: "0 0 1.4rem 0", fontWeight: "500", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {heroAuction.description || "Pristine inspection grade, verified merchant inventory. Authentic verified trading lot."}
              </p>

              {/* CLEAN TRADING CONSOLE (Without artificial neon glows) */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "1.6rem", 
                backgroundColor: "rgba(255, 255, 255, 0.08)", 
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)", 
                border: "1px solid rgba(255, 255, 255, 0.2)", 
                padding: "0.85rem 1.6rem", 
                borderRadius: "14px", 
                width: "fit-content", 
                marginBottom: "1.4rem", 
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" 
              }}>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "0.15rem" }}>CURRENT BID</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#fbbf24" }}>
                    GH₵ {parseFloat(heroAuction.currentHighestBid || heroAuction.basePrice || 0).toLocaleString()}
                  </div>
                </div>
                <div style={{ width: "1px", height: "36px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}></div>
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "0.15rem" }}>TIME LEFT IN POOL</div>
                  <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#ffffff", fontFamily: "monospace" }}>
                    {formatTimeLeft(heroAuction.endTime)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", flexWrap: "wrap", zIndex: 6 }}>
                <button 
                  onClick={() => navigate(`/auctions/${heroAuction.id}`)}
                  style={{ padding: "0.7rem 1.6rem", backgroundColor: "#fbbf24", color: "#111827", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = "#fbbf24"; }}
                >
                  <span style={{ fontSize: "1.05rem" }}>⚡</span> Place Bid
                </button>
              </div>
            </div>

            {/* INTERACTIVE SHOWCASE PREVIEW DOCK (Bottom-Right Selector) */}
            <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", zIndex: 10, display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "400px" }} className="hidden xl:flex">
              {carouselAuctions.map((item, idx) => {
                const isCurrent = idx === (heroIndex % (carouselAuctions.length || 1));
                return (
                  <div 
                    key={item.id || idx}
                    onClick={() => { setHeroIndex(idx); setIsCarouselPaused(true); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.45rem 0.75rem",
                      backgroundColor: isCurrent ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.55)",
                      backdropFilter: "blur(16px)",
                      borderRadius: "10px",
                      border: isCurrent ? "1.5px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.15)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      width: "185px"
                    }}
                    onMouseOver={e => { if(!isCurrent) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.14)"; }}
                    onMouseOut={e => { if(!isCurrent) e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.55)"; }}
                  >
                    <img src={getImageUrl(item)} alt={item.title} style={{ width: "34px", height: "34px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255,255,255,0.2)" }} />
                    <div style={{ overflow: "hidden", textAlign: "left" }}>
                      <div style={{ color: isCurrent ? "#fbbf24" : "#ffffff", fontSize: "0.75rem", fontWeight: "800", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </div>
                      <div style={{ color: "#e2e8f0", fontSize: "0.7rem", fontWeight: "700" }}>
                        GH₵ {parseFloat(item.currentHighestBid || item.basePrice || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* MAIN 2-COLUMN WORKSPACE */}
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "2.5rem", alignItems: "start" }} className="max-md:grid-cols-1">
          
          {/* LEFT SIDEBAR: FILTERS & CATEGORIES */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", position: "sticky", top: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: "1.15rem", fontWeight: "900", color: "#111827" }}>Filters</span>
              <button onClick={() => { setSelectedCategory("All"); setMinPrice(""); setMaxPrice(""); }} style={{ background: "none", border: "none", color: "#4343C7", fontSize: "0.82rem", fontWeight: "700", cursor: "pointer", padding: 0 }}>Clear All</button>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                <span>Categories</span>
                <span className="material-symbols-outlined text-[18px]">expand_less</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  { name: "All", label: "All Verified Lots", count: auctions.length },
                  { name: "High Value Tech", label: "High Value Tech", count: 4 },
                  { name: "Heritage & Gold", label: "Heritage & Gold", count: 2 },
                  { name: "Furniture & Equipment", label: "Industrial & Decor", count: 2 },
                ].map(cat => (
                  <label key={cat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: "0.9rem", color: selectedCategory === cat.name ? "#111827" : "#4b5563", fontWeight: selectedCategory === cat.name ? "800" : "500" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCategory === cat.name} 
                        onChange={() => setSelectedCategory(selectedCategory === cat.name ? "All" : cat.name)}
                        style={{ accentColor: "#4343C7", width: "16px", height: "16px" }} 
                      />
                      <span>{cat.label}</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>({cat.count})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range (GHS) */}
            <div style={{ marginBottom: "2rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", marginBottom: "1rem" }}>Price Range (GHS)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1rem" }}>
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)} 
                  style={{ width: "100%", padding: "0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#111827", fontSize: "0.85rem", outline: "none" }}
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)} 
                  style={{ width: "100%", padding: "0.6rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", color: "#111827", fontSize: "0.85rem", outline: "none" }}
                />
              </div>
              <button 
                style={{ width: "100%", padding: "0.65rem", backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", transition: "background-color 0.2s" }}
                onMouseOver={e=>e.currentTarget.style.backgroundColor="#e2e8f0"}
                onMouseOut={e=>e.currentTarget.style.backgroundColor="#f1f5f9"}
              >
                Apply
              </button>
            </div>

            {/* Secure Auctions Reassurance Widget */}
            <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#111827", fontWeight: "800", marginBottom: "0.4rem" }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: "#059669" }}>security</span> Secure Auctions
              </div>
              <p style={{ margin: 0, color: "#64748b", lineHeight: "1.5", fontWeight: "500" }}>All high-value items are held in MoMo Escrow until buyer physical verification.</p>
            </div>
          </div>

          {/* RIGHT MAIN FEED */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            
            {/* SECTION 1: CLOSING SOON (Exactly like Screenshot 2) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.35rem", fontWeight: "900", color: "#111827" }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: "#dc2626" }}>timer</span>
                  <span>Closing Soon</span>
                </div>
                <button onClick={scrollToAllLots} style={{ background: "none", border: "none", color: "#4343C7", fontWeight: "800", cursor: "pointer", fontSize: "0.95rem", textDecoration: "underline" }}>View All</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
                {closingSoon.map((item) => (
                  <div 
                    key={`close-${item.id}`} 
                    onClick={() => navigate(`/auctions/${item.id}`)}
                    style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
                    onMouseOver={e=>{e.currentTarget.style.borderColor="#4343C7"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,0.08)";}}
                    onMouseOut={e=>{e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.03)";}}
                  >
                    <div style={{ position: "relative", height: "180px", backgroundColor: "#f1f5f9" }}>
                      <img src={getImageUrl(item)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      
                      {/* Red Timer Pill */}
                      <div style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "#dc2626", color: "#ffffff", padding: "0.25rem 0.65rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        🕒 {formatTimeLeft(item.endTime)}
                      </div>
                      

                    </div>

                    <div style={{ padding: "1.2rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#111827", margin: "0 0 0.4rem 0", lineClamp: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{item.title}</h3>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", marginBottom: "1.2rem" }}>
                          ID: #AUC-{item.id}291 • {item.bids?.length || 0} Bids
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>Current Bid</div>
                        <div style={{ fontSize: "1.35rem", fontWeight: "900", color: "#111827", marginBottom: "1.2rem" }}>
                          GH₵ {parseFloat(item.currentHighestBid || item.basePrice || 0).toLocaleString()}
                        </div>
                        <button style={{ width: "100%", padding: "0.65rem", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>
                          View Auction
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: HIGH VALUE TECH (Asymmetric Layout like Screenshot 2) */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.35rem", fontWeight: "900", color: "#111827", marginBottom: "1.2rem" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#4343C7" }}>devices</span>
                <span>High Value Tech</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }} className="max-lg:grid-cols-1">
                
                {/* LARGE FEATURED SPOTLIGHT CARD */}
                {spotlightLarge && (
                  <div 
                    onClick={() => navigate(`/auctions/${spotlightLarge.id}`)}
                    style={{ position: "relative", borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0", backgroundColor: "#111827", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "440px", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.06)" }}
                  >
                    <img src={getImageUrl(spotlightLarge)} alt={spotlightLarge.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(17,24,39,0.4) 45%, rgba(17,24,39,0.95) 85%)" }}></div>



                    {/* Bottom Content */}
                    <div style={{ position: "relative", zIndex: 5, padding: "2rem" }}>
                      <h2 style={{ fontSize: "1.8rem", fontWeight: "900", color: "#ffffff", margin: "0 0 0.5rem 0", lineHeight: "1.2" }}>{spotlightLarge.title}</h2>
                      <p style={{ color: "#cbd5e1", fontSize: "0.9rem", margin: "0 0 1.5rem 0", maxWidth: "460px", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {spotlightLarge.description || "Professional tier import item, fully verified under physical customs inspection."}
                      </p>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", fontSize: "0.8rem", color: "#cbd5e1", fontWeight: "700" }}>
                          <span>🕒 {formatTimeLeft(spotlightLarge.endTime)}</span>
                          <span>👥 {spotlightLarge.bids?.length || 0} Bids</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.7rem", color: "#e2e8f0", fontWeight: "700", textTransform: "uppercase" }}>Current Bid</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#fbbf24" }}>GH₵ {parseFloat(spotlightLarge.currentHighestBid || spotlightLarge.basePrice || 0).toLocaleString()}</div>
                          </div>
                          <button style={{ padding: "0.7rem 1.4rem", backgroundColor: "#1d4ed8", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>
                            View Auction
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TWO STACKED WHITE CARDS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {spotlightSide.map(sideItem => (
                    <div 
                      key={`side-${sideItem.id}`} 
                      onClick={() => navigate(`/auctions/${sideItem.id}`)}
                      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.3rem", display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", transition: "border-color 0.2s" }}
                      onMouseOver={e=>e.currentTarget.style.borderColor="#4343C7"}
                      onMouseOut={e=>e.currentTarget.style.borderColor="#e2e8f0"}
                    >
                      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                        <img src={getImageUrl(sideItem)} alt={sideItem.title} style={{ width: "130px", height: "95px", borderRadius: "10px", objectFit: "cover", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", flexShrink: 0 }} />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#111827", margin: "0 0 0.5rem 0", lineHeight: "1.3", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{sideItem.title}</h4>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div>
                              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", display: "block" }}>Current Bid</span>
                              <span style={{ fontSize: "1.25rem", fontWeight: "900", color: "#111827" }}>GH₵ {parseFloat(sideItem.currentHighestBid || sideItem.basePrice || 0).toLocaleString()}</span>
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", backgroundColor: "#f1f5f9", padding: "0.25rem 0.6rem", borderRadius: "6px" }}>
                              🕒 {formatTimeLeft(sideItem.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* SECTION 3: ALL VERIFIED AUCTION LOTS */}
            <div id="all-auction-lots">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "1.35rem", fontWeight: "900", color: "#111827", marginBottom: "1.2rem", borderTop: "1px solid #e2e8f0", paddingTop: "2.5rem" }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: "#059669" }}>inventory_2</span>
                <span>All Verified Auction Lots ({filteredAuctions.length})</span>
              </div>

              {filteredAuctions.length === 0 ? (
                <div style={{ padding: "4rem", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
                  <p style={{ margin: 0, fontWeight: "700" }}>No auction items matched your category filter.</p>
                  <button onClick={() => { setSelectedCategory("All"); setMinPrice(""); setMaxPrice(""); }} style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", backgroundColor: "#4343C7", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>Reset Filters</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }} className="max-xl:grid-cols-2 max-sm:grid-cols-1">
                  {filteredAuctions.map((item) => (
                    <div 
                      key={`grid-${item.id}`} 
                      onClick={() => navigate(`/auctions/${item.id}`)}
                      style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
                      onMouseOver={e=>{e.currentTarget.style.borderColor="#4343C7"; e.currentTarget.style.transform="translateY(-3px)";}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.transform="translateY(0)";}}
                    >
                      <div style={{ position: "relative", height: "190px", backgroundColor: "#f1f5f9" }}>
                        <img src={getImageUrl(item)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "#ffffff", color: "#4343C7", padding: "0.25rem 0.65rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "800", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                          {item.brand || "BediDwa Verified"}
                        </div>
                        <div style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(17,24,39,0.85)", color: "#ffffff", padding: "0.25rem 0.65rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>
                          Ends {formatTimeLeft(item.endTime)}
                        </div>
                      </div>

                      <div style={{ padding: "1.3rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                        <div>
                          <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#111827", margin: "0 0 0.4rem 0", lineClamp: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{item.title}</h3>
                          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 1.2rem 0", lineClamp: 2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: "1.4" }}>
                            {item.description || "Verified collector item with full customs clearance."}
                          </p>
                        </div>

                        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", display: "block" }}>Current Bid</span>
                            <span style={{ fontSize: "1.25rem", fontWeight: "900", color: "#111827" }}>GH₵ {parseFloat(item.currentHighestBid || item.basePrice || 0).toLocaleString()}</span>
                          </div>
                          <button style={{ padding: "0.6rem 1.2rem", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", transition: "background-color 0.2s" }}>
                            View Auction
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

export default AuctionsPage;
