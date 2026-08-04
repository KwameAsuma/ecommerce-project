import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { resolveImageUrl } from "../utils/imageUtils";

const ChevronLeftIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRightIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const VerifiedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563eb" style={{ verticalAlign: "middle", display: "inline-block", flexShrink: 0 }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const VerifiedMerchantsPage = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const res = await api.get("/users/merchants");
        setMerchants(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch merchants:", err);
        setError("Failed to load merchants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-primary)" }}>Loading Merchants...</div>;
  }

  if (error) {
    return <div style={{ textAlign: "center", padding: "4rem", color: "var(--brand-red, #ef4444)" }}>{error}</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-1px", margin: "0 0 0.5rem 0" }}>
            Verified Merchants.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0 }}>
            Discover top-tier sellers with verified origin documentation.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={scrollLeft} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "var(--bg-panel)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronLeftIcon />
          </button>
          <button onClick={scrollRight} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid var(--border)", backgroundColor: "var(--bg-panel)", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", color: "var(--text-primary)" }}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {merchants.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-secondary)" }}>
          No verified merchants found yet.
        </div>
      ) : (
        <div 
          ref={carouselRef}
          style={{ 
            display: "flex", 
            gap: "2rem", 
            overflowX: "auto", 
            paddingBottom: "2rem", 
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {merchants.map((merchant) => (
            <div key={`merchant-${merchant.id}`} style={{ minWidth: "350px", width: "350px", backgroundColor: "var(--bg-panel)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              
              {/* Store Card Banner Header (Tall & Unblocked) */}
              <div 
                style={{ 
                  height: "150px", 
                  width: "100%", 
                  backgroundImage: merchant.storeBannerUrl 
                    ? `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.25) 100%), url(${resolveImageUrl(merchant.storeBannerUrl)})`
                    : "linear-gradient(135deg, var(--brand-primary), #1e3a8a)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative"
                }} 
              >
                {/* Overlapping Avatar Circle */}
                <div style={{ position: "absolute", bottom: "-26px", left: "1.5rem", width: "60px", height: "60px", borderRadius: "16px", backgroundColor: "var(--bg-base)", border: "3px solid var(--bg-panel)", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.15)", zIndex: 10 }}>
                  {merchant.avatarUrl ? (
                    <img src={resolveImageUrl(merchant.avatarUrl)} alt={merchant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", backgroundColor:"var(--brand-primary)", display:"flex", justifyContent:"center", alignItems:"center", color:"white", fontSize:"1.4rem", fontWeight:"bold" }}>
                      {merchant.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body Content */}
              <div style={{ padding: "2rem 1.5rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                
                {/* Merchant Name & Join Date */}
                <div style={{ marginBottom: "1.2rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 0.2rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {merchant.name} <VerifiedIcon />
                  </h3>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: "600" }}>
                    Joined {new Date(merchant.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1, backgroundColor: "var(--bg-base)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--brand-accent)" }}>★ {merchant.averageRating ? merchant.averageRating.toFixed(1) : (merchant.trustScore / 20).toFixed(1)}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "0.2rem" }}>Avg Rating</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: "var(--bg-base)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{merchant.productCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "0.2rem" }}>Products</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: "var(--bg-base)", padding: "1rem", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)" }}>{merchant.salesCount}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "600", marginTop: "0.2rem" }}>Sales</div>
                  </div>
                </div>

                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Verified merchant with {merchant.productCount} listed {merchant.productCount === 1 ? 'product' : 'products'} and {merchant.salesCount} completed {merchant.salesCount === 1 ? 'sale' : 'sales'}. All exports are certified and quality tested.
                </p>

                <div style={{ marginBottom: "1.5rem", flexGrow: 1 }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.5rem" }}>Recent Reviews</h4>
                  {merchant.recentReviews && merchant.recentReviews.length > 0 ? (
                    merchant.recentReviews.map(r => (
                      <div key={r.id} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem", borderLeft: "2px solid var(--border)", paddingLeft: "0.5rem" }}>
                        <div style={{color: "var(--brand-accent)"}}>{"★".repeat(r.rating)}</div>
                        "{r.comment}" - {r.reviewer?.name}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No reviews yet.</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", width: "100%", marginTop: "auto" }}>
                  <button 
                    onClick={() => navigate(`/merchant-profile/${merchant.id}`)}
                    style={{ flex: 1, padding: "0.8rem", backgroundColor: "var(--brand-[#4343C7], #4343C7)", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem", transition: "all 0.2s" }}
                  >
                    View Storefront
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default VerifiedMerchantsPage;
