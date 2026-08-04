import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { mockCategories } from "../data/constants";

const CatalogPage = () => {
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const headlines = ["The Global Standard.", "Curated African Excellence.", "Premium Export Quality."];
  const subtexts = [
    "Curated export-quality goods from verified Ghanaian merchants.",
    "Discover handcrafted luxury delivered worldwide.",
    "Ethically sourced, sustainably crafted premium products."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setHeadlineIdx((prev) => (prev + 1) % headlines.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for Scroll Animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          entry.target.style.opacity = 1;
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.style.opacity = 0; // Hide initially
      observer.observe(el);
    });
    return () => observer.disconnect();
  });

  const navigate = useNavigate();
  const { products, allProducts, loading, filters, updateFilter, resetFilters } = useCatalog();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [favIds, setFavIds] = useState(new Set());
  const [addedToasts, setAddedToasts] = useState([]);

  const handleFavAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setFavIds(prev => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    const toastId = Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const newToast = { id: toastId, name: product.name };
    setAddedToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setAddedToasts(prev => prev.filter(t => t.id !== toastId));
    }, 4000);
  };

  const isFiltered = useMemo(() => {
    return (
      (filters.category && filters.category !== "All Goods") ||
      (filters.searchQuery && filters.searchQuery.trim() !== "") ||
      (filters.priceRange && filters.priceRange !== "All Prices") ||
      (filters.region && filters.region !== "All Regions") ||
      (filters.trustScore && filters.trustScore !== 0)
    );
  }, [filters]);

  // Immersive 7-Product Carousel States
  const [spotlightIdx, setSpotlightIdx] = useState(28);
  const isInitialAlign = useRef(true);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const isProgrammatic = useRef(false);
  const isManualScroll = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const carouselProducts = useMemo(() => {
    const list = (allProducts && allProducts.length >= 7) ? allProducts : (products && products.length ? products : []);
    const sorted = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    return sorted.slice(0, 7);
  }, [allProducts, products]);

  const infiniteProducts = useMemo(() => {
    if (carouselProducts.length === 0) return [];
    return Array(9).fill(carouselProducts).flat();
  }, [carouselProducts]);

  // Continuous auto-advance timer (keeps sliding even on hover!)
  useEffect(() => {
    if (loading || infiniteProducts.length === 0) return;
    const timer = setInterval(() => {
      setSpotlightIdx((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [loading, infiniteProducts.length]);

  // Instant scroll on initial render to eliminate blank left spaces, then smooth transitions
  useEffect(() => {
    if (isManualScroll.current) return;
    const container = trackRef.current;
    const card = cardRefs.current[spotlightIdx];
    if (container && card && infiniteProducts.length > 0) {
      isProgrammatic.current = true;
      const containerWidth = container.offsetWidth;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const scrollToLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      
      const behavior = isInitialAlign.current ? 'instant' : 'smooth';
      container.scrollTo({ left: scrollToLeft, behavior });
      
      setTimeout(() => {
        isProgrammatic.current = false;
      }, 600);

      if (isInitialAlign.current) {
        isInitialAlign.current = false;
      }
    }
  }, [spotlightIdx, infiniteProducts.length]);

  // Seamless boundary reset (prevents running out of items or rewinding in reverse)
  useEffect(() => {
    const baseLen = carouselProducts.length;
    if (baseLen === 0) return;
    if (spotlightIdx >= baseLen * 7 || spotlightIdx <= baseLen * 2) {
      const resetTimer = setTimeout(() => {
        const normalizedIdx = (spotlightIdx % baseLen + baseLen) % baseLen;
        const targetIdx = (baseLen * 4) + normalizedIdx; // Center loop (index 28..34)
        const container = trackRef.current;
        const card = cardRefs.current[targetIdx];
        if (container && card) {
          isProgrammatic.current = true;
          const containerWidth = container.offsetWidth;
          const cardLeft = card.offsetLeft;
          const cardWidth = card.offsetWidth;
          const scrollToLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
          container.scrollTo({ left: scrollToLeft, behavior: 'instant' });
          setSpotlightIdx(targetIdx);
          setTimeout(() => { isProgrammatic.current = false; }, 100);
        }
      }, 750);
      return () => clearTimeout(resetTimer);
    }
  }, [spotlightIdx, carouselProducts.length]);

  const handleTrackScroll = (e) => {
    if (isProgrammatic.current || isInitialAlign.current) return;
    
    isManualScroll.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 300);

    const container = e.currentTarget;
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    let closestIdx = spotlightIdx;
    let minDiff = Infinity;
    cardRefs.current.forEach((card, idx) => {
      if (card) {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const diff = Math.abs(containerCenter - cardCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      }
    });
    if (closestIdx !== spotlightIdx && minDiff < 200) {
      setSpotlightIdx(closestIdx);
    }
  };

  const currentProdIdx = (spotlightIdx % (carouselProducts.length || 1) + (carouselProducts.length || 1)) % (carouselProducts.length || 1);
  const activeProduct = infiniteProducts[spotlightIdx] || carouselProducts[0];

  const handleBuyNow = (product) => {
    // Isolate the buy now flow
    navigate(`/checkout?buyNow=${product.id}&qty=1`);
  };

  const renderProductCard = (product, index, isCompact = false, forceStyle = null, isTall = false, animate = false) => {
    const styleType = forceStyle !== null ? forceStyle : 0;
    const cardHeight = isCompact ? "260px" : (isTall ? "420px" : "340px"); // Taller if isTall
    const imgHeight = isCompact ? "140px" : (isTall ? "240px" : "180px"); // Taller if isTall
    const delayClass = animate ? `reveal-delay-${(index % 4) + 1}` : "";
    
    if (styleType === 0) {
      // Style A: Full Image with Bottom Gradient
      return (
        <div 
          key={product.id} 
          onClick={() => navigate(`/product/${product.id}`)}
          className={`${animate ? 'animate-on-scroll' : ''} ${delayClass}`.trim()}
          style={{ 
            height: cardHeight,
            backgroundColor: "var(--bg-panel)", 
            borderRadius: "16px", 
            overflow: "hidden", 
            position: "relative",
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s" 
          }} 
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 15px 30px -10px rgba(0,0,0,0.15)"}} 
          onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"}}
        >
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {!isCompact && (
            <div style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "#065f46", border: "1px solid rgba(255,255,255,0.25)", padding: "0.35rem 0.9rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800", color: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
              Featured
            </div>
          )}
          <div style={{ position: "absolute", top: "1rem", right: "1rem", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", color: favIds.has(product.id) ? "#ef4444" : "#94a3b8", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.15s, color 0.15s" }} title="Favorite & Add to Cart" onMouseOver={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} onClick={(e) => handleFavAddToCart(e, product)}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: favIds.has(product.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </div>
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", padding: isCompact ? "1.5rem 1rem 1rem 1rem" : "3rem 1.2rem 1.2rem 1.2rem", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ maxWidth: isCompact ? "100%" : "75%" }}>
              <h3 style={{ color: "white", fontSize: isCompact ? "1rem" : "1.1rem", fontWeight: "700", margin: "0 0 0.3rem 0", letterSpacing: "-0.01em", textShadow: "0 2px 4px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h3>
              <div style={{ color: "white", fontSize: isCompact ? "0.9rem" : "1rem", fontWeight: "900", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>GHS {product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            {!isCompact && (
              <div style={{ width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", color: "#171717", flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>north_east</span>
              </div>
            )}
          </div>
        </div>
      );
    } else if (styleType === 1) {
      // Style B: Classic White Card
      return (
        <div 
          key={product.id} 
          className={`${animate ? 'animate-on-scroll' : ''} ${delayClass}`.trim()}
          style={{ backgroundColor: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }} 
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 24px -10px rgba(0,0,0,0.1)"}} 
          onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"}}
        >
          <div onClick={() => navigate(`/product/${product.id}`)} style={{ height: imgHeight, cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseOver={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} />
            {product.tags && product.tags.length > 0 && !isCompact && (
              <div style={{ position: "absolute", top: "0.8rem", left: "0.8rem", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <span>✓</span> {product.tags[0]}
              </div>
            )}
            <div style={{ position: "absolute", top: "0.8rem", right: "0.8rem", width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", color: favIds.has(product.id) ? "#ef4444" : "#94a3b8", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", cursor: "pointer", transition: "transform 0.15s, color 0.15s" }} title="Favorite & Add to Cart" onMouseOver={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} onClick={(e) => handleFavAddToCart(e, product)}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: favIds.has(product.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </div>
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
              <h3 onClick={() => navigate(`/product/${product.id}`)} style={{ margin: 0, fontSize: isCompact ? "0.95rem" : "1.05rem", fontWeight: "800", color: "var(--text-primary)", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{product.name}</h3>
            </div>
            {!isCompact && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem 0", lineHeight: "1.4", height: "38px", overflow: "hidden", textOverflow: "ellipsis" }}>
                {product.description}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: isCompact ? "0.5rem" : "0" }}>
              <div style={{ fontSize: isCompact ? "1rem" : "1.2rem", fontWeight: "800", color: "var(--brand-primary)" }}>
                GH₵ {product.price.toLocaleString()}
              </div>
              {!isCompact && (
                <button style={{ padding: "0.5rem", borderRadius: "50%", border: "none", backgroundColor: "var(--brand-accent)", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={(e) => { e.stopPropagation(); handleFavAddToCart(e, product); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>shopping_cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Style C: Zoom Effect Card
      return (
        <div 
          key={product.id} 
          onClick={() => navigate(`/product/${product.id}`)}
          className={`${animate ? 'animate-on-scroll' : ''} ${delayClass} style-c-card`.trim()}
          style={{ 
            height: cardHeight,
            backgroundColor: "#000", 
            borderRadius: "16px", 
            overflow: "hidden", 
            position: "relative",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
          }}
        >
          <style>{`
            .style-c-card img { transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); opacity: 0.9; }
            .style-c-card:hover img { transform: scale(1.1); opacity: 0.7; }
            .style-c-card .content-layer { transform: translateY(20px); transition: transform 0.4s ease; }
            .style-c-card:hover .content-layer { transform: translateY(0); }
          `}</style>
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}></div>
          <div style={{ position: "absolute", top: "0.8rem", right: "0.8rem", width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", color: favIds.has(product.id) ? "#ef4444" : "#94a3b8", cursor: "pointer", transition: "transform 0.15s, color 0.15s" }} title="Favorite & Add to Cart" onMouseOver={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} onClick={(e) => handleFavAddToCart(e, product)}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: favIds.has(product.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
          </div>
          <div className="content-layer" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", padding: isCompact ? "1rem" : "1.5rem 1.2rem", display: "flex", flexDirection: "column" }}>
            {!isCompact && (
              <span style={{ color: "var(--brand-accent)", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.3rem" }}>{product.category}</span>
            )}
            <h3 style={{ color: "white", fontSize: isCompact ? "1rem" : "1.1rem", fontWeight: "700", margin: "0 0 0.5rem 0", lineHeight: "1.2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem" }}>
              <div style={{ color: "white", fontSize: isCompact ? "0.9rem" : "1rem", fontWeight: "900" }}>GHS {product.price.toLocaleString()}</div>
              {!isCompact && (
                <div style={{ color: "white", display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.85rem", fontWeight: "600" }}>
                  Explore <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderAmazonBentoBox = (title, bentoProducts, index) => {
    return (
      <div style={{ backgroundColor: "white", padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem", borderRadius: "0px", height: "420px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "800", color: "#0f1111", letterSpacing: "-0.5px" }}>{title}</h3>
        
        {/* 2x2 Grid of small images */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "0.8rem", flexGrow: 1 }}>
           {bentoProducts.map((p, i) => (
             <div key={i} onClick={() => navigate(`/product/${p.id}`)} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", cursor: "pointer" }}>
                <div style={{ backgroundColor: "#f8f9fa", width: "100%", height: "110px", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                  <img src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={p.name} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#0f1111", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.category}
                </span>
             </div>
           ))}
        </div>
        
        <a href="#" style={{ color: "#007185", fontSize: "0.85rem", textDecoration: "none", fontWeight: "600", marginTop: "auto" }} onMouseOver={e => e.target.style.color="#c45500"} onMouseOut={e => e.target.style.color="#007185"}>
          Shop now
        </a>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", maxWidth: "1920px", margin: "0 auto", padding: "0" }}>
      
      {/* Dynamic Categories (Active Filters Bar Removed) */}
      <div className="animate-on-scroll" style={{ display: "flex", gap: "0.8rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "1rem", scrollbarWidth: "none" }}>
        {mockCategories.map((cat) => (
          <button 
            key={cat}
            onClick={() => updateFilter("category", cat)}
            style={{ 
              padding: "0.5rem 1rem", 
              borderRadius: "20px", 
              border: filters.category === cat ? "none" : "1px solid var(--border)", 
              backgroundColor: filters.category === cat ? "var(--text-primary)" : "white", 
              color: filters.category === cat ? "white" : "var(--text-secondary)", 
              fontWeight: "600", 
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Products Grid (Instant View - Complex Grid) */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Loading premium products...</div>
      ) : products.length === 0 ? (
        <div className="animate-on-scroll" style={{ display: "flex", flexDirection: "column", gap: "2rem", marginBottom: "4rem" }}>
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--border)" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", marginBottom: "1rem" }}>
              No results found for "{filters.searchQuery || filters.category}"
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Oops, we do not have items matching your search or filter criteria at the moment.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button onClick={() => resetFilters()} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Reset All Filters</button>
            </div>
          </div>
        </div>
      ) : isFiltered ? (
        <div style={{ marginBottom: "6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
              {filters.searchQuery ? `Search results for "${filters.searchQuery}"` : `${filters.category}`} <span style={{ fontSize: "1.1rem", color: "var(--text-secondary)", fontWeight: "600" }}>({products.length} {products.length === 1 ? 'item' : 'items'})</span>
            </h2>
            <button onClick={() => resetFilters()} style={{ padding: "0.55rem 1.2rem", backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.88rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.4rem" }} onMouseOver={e=>{e.currentTarget.style.borderColor="var(--brand-primary)"; e.currentTarget.style.color="var(--brand-primary)"}} onMouseOut={e=>{e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-primary)"}}>
              Reset Filters ✕
            </button>
          </div>
          <div className="grid-4-col">
            {products.map((product, index) => renderProductCard(product, index, false))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "4rem" }}>
          
          {/* Row 4+ Moved to First: 5 Compact Cards Per Line */}
          {products.length > 7 && (
             <div className="grid-5-col" style={{ marginBottom: "1rem" }}>
                {products.slice(7).map((product, index) => renderProductCard(product, index + 7, true, null, false, true))}
             </div>
          )}

          {/* Row 1 Moved to Second: 3 Cards - Made taller, slimmer, and uniform (Style A) */}
          {products.length >= 3 ? (
             <div className="grid-3-col padding-x-responsive" style={{ marginTop: "2.5rem", marginBottom: "2rem" }}>
                {products.slice(0, 3).map((product, index) => (
                   <div key={product.id} style={{ transform: index === 1 ? "translateY(-8px)" : "none", transition: "transform 0.3s" }}>
                      {renderProductCard(product, index, false, 0, true, false)}
                   </div>
                ))}
             </div>
          ) : (
             <div className="grid-4-col">
                {products.map((product, index) => renderProductCard(product, index, false))}
             </div>
          )}

          {/* Row 2 Moved to Second: 4 Cards - Made taller and more compact */}
          {products.length >= 7 && (
             <div className="grid-4-col" style={{ marginBottom: "1rem" }}>
                {products.slice(3, 7).map((product, index) => renderProductCard(product, index + 3, false))}
             </div>
          )}

          {/* Row 3 Moved to Third: Amazon-style Bento Boxes */}
          {allProducts.length >= 16 && (
             <div className="grid-bento" style={{ margin: "1.5rem 0", padding: "1rem 0", backgroundColor: "transparent" }}>
                {renderAmazonBentoBox("Electronics & Tech", allProducts.filter(p => p.category.toLowerCase().includes("electronic") || p.category.toLowerCase().includes("tech") || p.name.toLowerCase().includes("watch")).slice(0, 4), 0)}
                {renderAmazonBentoBox("Home & Kitchen", allProducts.filter(p => p.category.toLowerCase().includes("home") || p.category.toLowerCase().includes("kitchen") || p.name.toLowerCase().includes("wardrobe")).slice(0, 4), 1)}
                {renderAmazonBentoBox("New Arrivals under GHS 500", allProducts.filter(p => p.price < 500).slice(0, 4), 2)}
                {renderAmazonBentoBox("Artisanal & Fashion", allProducts.filter(p => p.category.toLowerCase().includes("art") || p.category.toLowerCase().includes("cloth") || p.category.toLowerCase().includes("basket")).slice(0, 4), 3)}
             </div>
          )}
        </div>
      )}
            {/* Continuous Seamless Lower Page Gradient Wrapping Both Carousels Edge-to-Edge */}
      {!isFiltered && (
      <div 
        style={{ 
          width: "100vw", 
          marginLeft: "calc(50% - 50vw)", 
          marginRight: "calc(50% - 50vw)", 
          marginTop: "1.5rem",
          background: "linear-gradient(180deg, var(--bg-base) 0%, rgba(67, 67, 199, 0.04) 25%, rgba(67, 67, 199, 0.1) 65%, rgba(67, 67, 199, 0.18) 100%)", 
          position: "relative",
          overflow: "hidden",
          paddingTop: "1.5rem",
          paddingBottom: "6rem"
        }}
      >
        <style>{`
          .spotlight-track::-webkit-scrollbar { display: none; }
          .spotlight-track { -ms-overflow-style: none; scrollbar-width: none; }
          
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 25px rgba(212, 246, 19, 0.25), 0 20px 50px -10px rgba(0,0,0,0.6); }
            50% { box-shadow: 0 0 40px rgba(212, 246, 19, 0.45), 0 25px 60px -10px rgba(0,0,0,0.8); }
          }
          .spotlight-card-active {
            animation: pulseGlow 4s infinite ease-in-out;
            z-index: 20;
          }
          .spotlight-card-inactive:hover {
            opacity: 0.95 !important;
            filter: grayscale(0%) brightness(0.95) !important;
            border-color: rgba(212, 246, 19, 0.45) !important;
            box-shadow: 0 10px 30px -5px rgba(67, 67, 199, 0.4) !important;
          }
          .spotlight-dot {
            height: 6px;
            border-radius: 4px;
            background: rgba(67, 67, 199, 0.25);
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            cursor: pointer;
          }
          .spotlight-dot.active {
            width: 36px;
            background: var(--brand-accent);
            box-shadow: 0 0 12px rgba(212, 246, 19, 0.6);
          }
          .spotlight-dot:not(.active) {
            width: 12px;
          }
          .spotlight-dot:not(.active):hover {
            background: rgba(67, 67, 199, 0.6);
            width: 18px;
          }
        `}</style>

        {/* Ambient Dynamic Background Image Blur (Ultra-subtle, preserving page gradient) */}
        {activeProduct && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "700px",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0
          }}>
            <img 
              src={activeProduct.image} 
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(65px) brightness(0.95)",
                opacity: 0.18,
                transform: "scale(1.3)",
                transition: "all 1s cubic-bezier(0.2, 0.8, 0.2, 1)"
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 30%, var(--bg-base) 100%)", opacity: 0.5 }}></div>
          </div>
        )}

        {/* Minimalist Professional Section Indicator (No giant headings or AI capsules) */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "1500px", margin: "0 auto", padding: "0 5%", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#D4F613", boxShadow: "0 0 8px #D4F613" }}></span>
          <span style={{ fontSize: "0.82rem", fontWeight: "800", letterSpacing: "2px", textTransform: "uppercase", color: "var(--brand-primary)" }}>
            Live Auctions & Flash Deals
          </span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(67, 67, 199, 0.3) 0%, transparent 100%)", marginLeft: "8px" }}></div>
        </div>

        {/* Carousel Slider Track (Seamless Infinite & Graduated 3D Coverflow) */}
        <div 
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="spotlight-track"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1.6rem", 
            overflowX: "auto", 
            padding: "1.5rem calc(50vw - 180px)", 
            position: "relative", 
            zIndex: 5
          }}
        >
          {infiniteProducts.map((product, index) => {
            const dist = Math.abs(index - spotlightIdx);
            const isActive = dist === 0;
            const isDirectNeighbor = dist === 1;
            const isSecondNeighbor = dist === 2;
            const prodRealIdx = (index % (carouselProducts.length || 1) + (carouselProducts.length || 1)) % (carouselProducts.length || 1);
            const isFlashSale = prodRealIdx % 2 === 0;
            const discountPercent = 35 + ((prodRealIdx * 5) % 20);
            const originalPrice = Math.round(product.price * (1 + discountPercent / 100));
            const bidsCount = 12 + (prodRealIdx * 4) % 19;

            // Graduated 3D Depth of Field using GPU scale transitions (Zero DOM width reflows!)
            let opacity = 1;
            let scale = 1.05;
            let filter = "grayscale(0%) brightness(1) drop-shadow(0 15px 30px rgba(0,0,0,0.6))";
            let zIndex = 20;
            let borderColor = "var(--brand-accent)";

            if (isDirectNeighbor) {
              opacity = 0.9;
              scale = 0.94;
              filter = "grayscale(5%) brightness(0.88)";
              zIndex = 15;
              borderColor = "rgba(255, 255, 255, 0.25)";
            } else if (isSecondNeighbor) {
              opacity = 0.7;
              scale = 0.85;
              filter = "grayscale(20%) brightness(0.75)";
              zIndex = 10;
              borderColor = "rgba(255, 255, 255, 0.15)";
            } else if (dist >= 3) {
              opacity = 0.4;
              scale = 0.76;
              filter = "grayscale(40%) brightness(0.55)";
              zIndex = 5;
              borderColor = "rgba(255, 255, 255, 0.08)";
            }

            return (
              <div
                key={`${product.id || 'p'}-${index}`}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={() => setSpotlightIdx(index)}
                className={isActive ? "spotlight-card-active" : "spotlight-card-inactive"}
                style={{
                  minWidth: "clamp(290px, 75vw, 360px)",
                  width: "clamp(290px, 75vw, 360px)",
                  height: "500px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease, filter 0.5s ease, border-color 0.4s ease, box-shadow 0.4s ease",
                  backgroundColor: "#090d16",
                  flexShrink: 0,
                  opacity: opacity,
                  transform: `scale(${scale}) translateZ(0)`,
                  filter: filter,
                  zIndex: zIndex,
                  border: isActive ? "2px solid var(--brand-accent)" : `1px solid ${borderColor}`
                }}
              >
                {/* Product Image */}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    transition: "transform 0.7s ease",
                    transform: isActive ? "scale(1.06)" : "scale(1)" 
                  }} 
                />

                {/* Top Overlay Gradient */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}></div>

                {/* Top Badges */}
                <div style={{ position: "absolute", top: "1.2rem", left: "1.2rem", right: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    padding: "0.4rem 0.9rem", 
                    borderRadius: "20px", 
                    fontSize: "0.75rem", 
                    fontWeight: "800", 
                    color: isFlashSale ? "#000000" : "#ffffff", 
                    backgroundColor: isFlashSale ? "var(--brand-accent)" : "#4343C7",
                    backdropFilter: "blur(6px)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    {isFlashSale ? "⚡ FLASH DEAL" : "🔥 ACTIVE AUCTION"}
                  </span>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", color: favIds.has(product.id) ? "#ef4444" : "#94a3b8", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "transform 0.15s, color 0.15s" }} title="Favorite & Add to Cart" onMouseOver={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} onClick={(e) => handleFavAddToCart(e, product)}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: favIds.has(product.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div style={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  width: "100%", 
                  padding: isActive ? "2rem 1.8rem" : "1.5rem 1.4rem", 
                  background: isActive 
                    ? "linear-gradient(to top, rgba(2, 6, 17, 0.98) 0%, rgba(2, 6, 17, 0.9) 70%, transparent 100%)"
                    : "linear-gradient(to top, rgba(2, 6, 17, 0.95) 0%, rgba(2, 6, 17, 0.8) 65%, transparent 100%)",
                  transition: "all 0.4s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{ color: "var(--brand-accent)", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {product.category}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
                    <span style={{ color: "#a1a1aa", fontSize: "0.75rem", fontWeight: "600" }}>
                      {isFlashSale ? `Ends in 03h 45m` : `${bidsCount} Active Bidders`}
                    </span>
                  </div>

                  <h3 style={{ color: "white", fontSize: isActive ? "1.5rem" : "1.2rem", fontWeight: "800", margin: "0 0 0.6rem 0", lineHeight: "1.2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {product.name}
                  </h3>

                  {isActive ? (
                    <p style={{ color: "#d4d4d8", fontSize: "0.9rem", margin: "0 0 1.2rem 0", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                      {product.description || "Premium certified bulk export quality with verified origin and seamless global freight delivery."}
                    </p>
                  ) : (
                    <div style={{ height: "0.5rem" }}></div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "0.3rem" }}>
                    <div>
                      {isFlashSale && isActive && (
                        <div style={{ fontSize: "0.8rem", color: "#9ca3af", textDecoration: "line-through", fontWeight: "600" }}>
                          GHS {originalPrice.toLocaleString()} ({discountPercent}% OFF)
                        </div>
                      )}
                      {!isFlashSale && isActive && (
                        <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                          Current High Bid
                        </div>
                      )}
                      <div style={{ color: "white", fontSize: isActive ? "1.5rem" : "1.2rem", fontWeight: "900", fontVariantNumeric: "tabular-nums" }}>
                        GHS {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {isActive && (
                      <div style={{ display: "flex", gap: "0.6rem" }}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (isFlashSale) {
                              addToCart(product, 1);
                              navigate('/checkout');
                            } else {
                              navigate('/auctions');
                            }
                          }}
                          style={{ 
                            padding: "0.7rem 1.4rem", 
                            borderRadius: "12px", 
                            border: "none", 
                            backgroundColor: isFlashSale ? "var(--brand-accent)" : "#4343C7", 
                            color: isFlashSale ? "#000000" : "#ffffff", 
                            fontWeight: "800", 
                            fontSize: "0.95rem", 
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            boxShadow: isFlashSale ? "0 4px 15px rgba(212, 246, 19, 0.3)" : "0 4px 15px rgba(67, 67, 199, 0.4)",
                            transition: "transform 0.2s"
                          }}
                          onMouseOver={e=>e.currentTarget.style.transform="scale(1.04)"}
                          onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isFlashSale ? "bolt" : "gavel"}
                          </span>
                          {isFlashSale ? "Buy Deal" : "Place Bid"}
                        </button>

                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/product/${product.id}`); 
                          }}
                          style={{ 
                            padding: "0.7rem 1rem", 
                            borderRadius: "12px", 
                            border: "1px solid rgba(255,255,255,0.2)", 
                            backgroundColor: "rgba(255,255,255,0.08)", 
                            color: "white", 
                            fontWeight: "700", 
                            fontSize: "0.95rem", 
                            cursor: "pointer",
                            transition: "background 0.2s"
                          }}
                          onMouseOver={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.18)"}
                          onMouseOut={e=>e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)"}
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Interactive Indicator Dots */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "2rem", marginBottom: "4rem", position: "relative", zIndex: 10 }}>
          {carouselProducts.map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`spotlight-dot ${dotIdx === currentProdIdx ? 'active' : ''}`}
              onClick={() => {
                const currentLoopBase = Math.floor(spotlightIdx / (carouselProducts.length || 1)) * (carouselProducts.length || 1);
                setSpotlightIdx(currentLoopBase + dotIdx);
              }}
              title={`Jump to item ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* World-Class Picks Carousel - Ultra Luxury Minimalist Upgrade */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2.5rem", flexDirection: "column" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(67, 67, 199, 0.15)", border: "1px solid rgba(67, 67, 199, 0.35)", padding: "0.35rem 1.2rem", borderRadius: "999px", color: "var(--brand-primary)", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1", color: "var(--brand-primary)" }}>military_tech</span>
              Curated Global Excellence
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.3rem, 4.5vw, 3.5rem)", fontWeight: "900", color: "var(--text-primary)", margin: "0 0 0.8rem 0", textAlign: "center", letterSpacing: "-0.5px" }}>World-Class Picks</h2>
            <div style={{ height: "4px", width: "80px", background: "var(--brand-accent)", borderRadius: "2px", boxShadow: "0 0 10px rgba(212, 246, 19, 0.6)" }}></div>
          </div>
          
          {/* World-Class Responsive Grid Showcase */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", padding: "0.5rem 5% 2rem 5%", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
            {!loading && products.slice(0, 12).map((product, index) => (
               <div 
                 key={`grid-item-${product.id}`} 
                 onClick={() => navigate(`/product/${product.id}`)}
                 className="world-class-card"
                 style={{ 
                   width: "100%", 
                   height: "430px",
                   backgroundColor: "#090d16",
                   borderRadius: "24px",
                   overflow: "hidden",
                   position: "relative",
                   cursor: "pointer",
                   border: "1px solid rgba(255, 255, 255, 0.15)",
                   boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.25)",
                   transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                   display: "flex",
                   flexDirection: "column"
                 }}
                 onMouseOver={e => {
                   e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                   e.currentTarget.style.borderColor = "var(--brand-accent)";
                   e.currentTarget.style.boxShadow = "0 18px 40px -5px rgba(212, 246, 19, 0.2), 0 0 25px rgba(67, 67, 199, 0.3)";
                   const img = e.currentTarget.querySelector('img');
                   if(img) img.style.transform = "scale(1.08)";
                 }}
                 onMouseOut={e => {
                   e.currentTarget.style.transform = "translateY(0) scale(1)";
                   e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                   e.currentTarget.style.boxShadow = "0 10px 30px -5px rgba(0, 0, 0, 0.25)";
                   const img = e.currentTarget.querySelector('img');
                   if(img) img.style.transform = "scale(1)";
                 }}
               >
                 {/* Product Image Layer */}
                 <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: "#111827" }}>
                   <img 
                     src={product.image} 
                     alt={product.name} 
                     style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88, transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)" }} 
                   />
                   <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(3, 7, 18, 0.98) 0%, rgba(3, 7, 18, 0.8) 45%, rgba(3, 7, 18, 0.15) 75%, rgba(3, 7, 18, 0.4) 100%)" }}></div>
                 </div>

                 {/* Top Floating Badges */}
                 <div style={{ position: "relative", zIndex: 10, padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ backgroundColor: "var(--brand-accent)", color: "#000000", padding: "0.3rem 0.8rem", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 4px 12px rgba(212, 246, 19, 0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                     <span className="material-symbols-outlined text-[14px]">bolt</span>
                     {index % 2 === 0 ? "TOP RATED EXPORT" : "HOT WORLD PICK"}
                   </div>
                   <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", justifyContent: "center", alignItems: "center", color: "white", transition: "all 0.2s" }} onClick={(e) => { e.stopPropagation(); }}>
                     <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>favorite_border</span>
                   </div>
                 </div>

                 {/* Bottom Content Area (Minimalist & Sleek - Removed action row & cart button) */}
                 <div style={{ position: "relative", zIndex: 10, marginTop: "auto", padding: "1.5rem 1.4rem", display: "flex", flexDirection: "column" }}>
                   {/* Star Rating Badge */}
                   <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.5rem" }}>
                     <span style={{ color: "#f59e0b", fontSize: "0.8rem", fontWeight: "900" }}>★★★★★</span>
                     <span style={{ color: "#cbd5e1", fontSize: "0.75rem", fontWeight: "700" }}>4.9</span>
                     <span style={{ color: "var(--success)", fontSize: "0.75rem", fontWeight: "800", backgroundColor: "rgba(34, 197, 94, 0.15)", padding: "0.15rem 0.5rem", borderRadius: "8px", marginLeft: "4px" }}>✓ Verified Pick</span>
                   </div>

                   <span style={{ color: "var(--brand-accent)", fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "0.3rem" }}>{product.category}</span>
                   <h3 style={{ color: "white", fontSize: "1.25rem", fontWeight: "800", margin: "0 0 0.5rem 0", lineHeight: "1.3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>{product.name}</h3>
                   
                   <div style={{ color: "var(--brand-accent)", fontSize: "1.35rem", fontWeight: "900", fontVariantNumeric: "tabular-nums" }}>
                     GH₵ {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </div>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <div style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        maxHeight: "80vh",
        overflow: "visible",
        pointerEvents: "none"
      }}>
        {addedToasts.map(toast => (
          <div key={toast.id} style={{
            backgroundColor: "#067d62",
            color: "#ffffff",
            padding: "0.85rem 1.3rem",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "1.2rem",
            border: "1px solid rgba(255,255,255,0.15)",
            pointerEvents: "auto",
            animation: "popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <div>
                <div style={{ fontWeight: "900", fontSize: "0.9rem" }}>Added to Cart!</div>
                <div style={{ fontSize: "0.8rem", opacity: 0.9, maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.name}</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              style={{ backgroundColor: "white", color: "#067d62", border: "none", padding: "0.4rem 0.85rem", borderRadius: "8px", fontWeight: "900", fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
            >
              View Cart &gt;
            </button>
            <span
              onClick={() => setAddedToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="material-symbols-outlined"
              style={{ cursor: "pointer", fontSize: "18px", opacity: 0.8 }}
            >
              close
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CatalogPage;
