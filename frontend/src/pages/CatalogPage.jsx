import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
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

  const handleBuyNow = (product) => {
    // Isolate the buy now flow
    navigate(`/checkout?buyNow=${product.id}&qty=1`);
  };

  const renderProductCard = (product, index, isCompact = false, forceStyle = null, isTall = false, animate = false) => {
    const styleType = forceStyle !== null ? forceStyle : (index % 3);
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
            <div style={{ position: "absolute", top: "1rem", left: "1rem", backgroundColor: "var(--brand-accent)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800", color: "white" }}>
              Featured
            </div>
          )}
          <div style={{ position: "absolute", top: "1rem", right: "1rem", width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", color: "#52525b", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} onClick={(e) => { e.stopPropagation(); }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>favorite_border</span>
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
            <div style={{ position: "absolute", top: "0.8rem", right: "0.8rem", width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "white", display: "flex", justifyContent: "center", alignItems: "center", color: "#52525b", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} onClick={(e) => { e.stopPropagation(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>favorite_border</span>
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
                <button style={{ padding: "0.5rem", borderRadius: "50%", border: "none", backgroundColor: "var(--brand-accent)", color: "white", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}>
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
          <div style={{ position: "absolute", top: "0.8rem", right: "0.8rem", width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }} onClick={(e) => { e.stopPropagation(); }}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>favorite_border</span>
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
    <div style={{ maxWidth: "1500px", margin: "0 auto", padding: "0" }}>
      
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
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Oops, we do not have the exact item you are looking for at the moment, but here are some related items you might like.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <button onClick={() => resetFilters()} style={{ padding: "0.8rem 1.5rem", backgroundColor: "var(--brand-primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Reset All Filters</button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "4rem" }}>
          
          {/* Row 4+ Moved to First: 5 Compact Cards Per Line */}
          {products.length > 7 && (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.8rem", marginBottom: "1rem" }}>
                {products.slice(7).map((product, index) => renderProductCard(product, index + 7, true, null, false, true))}
             </div>
          )}

          {/* Row 1 Moved to Second: 3 Cards - Made taller, slimmer, and uniform (Style A) */}
          {products.length >= 3 ? (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3rem", padding: "0 3rem", marginTop: "2.5rem", marginBottom: "2rem" }}>
                {products.slice(0, 3).map((product, index) => (
                   <div key={product.id} style={{ transform: index === 1 ? "translateY(-8px)" : "none", transition: "transform 0.3s" }}>
                      {renderProductCard(product, index, false, 0, true, false)}
                   </div>
                ))}
             </div>
          ) : (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.5rem" }}>
                {products.map((product, index) => renderProductCard(product, index, false))}
             </div>
          )}

          {/* Row 2 Moved to Second: 4 Cards - Made taller and more compact */}
          {products.length >= 7 && (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                {products.slice(3, 7).map((product, index) => renderProductCard(product, index + 3, false))}
             </div>
          )}

          {/* Row 3 Moved to Third: Amazon-style Bento Boxes */}
          {allProducts.length >= 16 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem", margin: "1.5rem 0", padding: "1rem 0", backgroundColor: "transparent" }}>
               {renderAmazonBentoBox("Electronics & Tech", allProducts.filter(p => p.category.toLowerCase().includes("electronic") || p.category.toLowerCase().includes("tech") || p.name.toLowerCase().includes("watch")).slice(0, 4), 0)}
               {renderAmazonBentoBox("Home & Kitchen", allProducts.filter(p => p.category.toLowerCase().includes("home") || p.category.toLowerCase().includes("kitchen") || p.name.toLowerCase().includes("wardrobe")).slice(0, 4), 1)}
               {renderAmazonBentoBox("New Arrivals under GHS 500", allProducts.filter(p => p.price < 500).slice(0, 4), 2)}
               {renderAmazonBentoBox("Artisanal & Fashion", allProducts.filter(p => p.category.toLowerCase().includes("art") || p.category.toLowerCase().includes("cloth") || p.category.toLowerCase().includes("basket")).slice(0, 4), 3)}
            </div>
          )}
        </div>
      )}

      {/* Top Promotional Grid (Hero moved to middle, just before World Class Picks) */}
      <div style={{ display: "grid", gridTemplateColumns: "65% 1fr", gap: "1rem", marginBottom: "4rem" }}>
        {/* Main Flash Sale Banner (65%) */}
        <div style={{ borderRadius: "24px", overflow: "hidden", position: "relative", height: "450px", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1000" alt="Flash Sale" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to right, rgba(15, 43, 91, 0.95), rgba(15,43,91,0.2))", display: "flex", flexDirection: "column", justifyContent: "center", padding: "4rem" }}>
            <h2 style={{ color: "white", fontSize: "3.5rem", fontWeight: "900", margin: "0 0 0.5rem 0", textShadow: "0 2px 4px rgba(0,0,0,0.5)", letterSpacing: "-1px" }}>FLASH SALE</h2>
            <p style={{ color: "white", fontSize: "1.3rem", fontWeight: "600", margin: "0 0 2rem 0", maxWidth: "80%" }}>Up to 50% off on all premium exports. Limited time only!</p>
            <button style={{ alignSelf: "flex-start", padding: "1rem 2.5rem", backgroundColor: "var(--brand-accent)", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "1.1rem", cursor: "pointer" }}>Shop Now</button>
          </div>
        </div>

        {/* Secondary Promo (35%) */}
        <div style={{ borderRadius: "24px", overflow: "hidden", position: "relative", height: "450px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600" alt="Active Bids" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3))" }}></div>
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.15)", padding: "1rem", borderRadius: "50%", marginBottom: "1rem", display: "inline-block", backdropFilter: "blur(5px)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--brand-accent)" }}>local_fire_department</span>
            </div>
            <h3 style={{ color: "white", fontSize: "2rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>Active Bids</h3>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem", marginBottom: "2rem", fontWeight: "500", lineHeight: "1.4" }}>Join live auctions for rare bulk exports.</p>
            <button style={{ padding: "0.8rem 2rem", backgroundColor: "transparent", border: "2px solid white", color: "white", borderRadius: "8px", fontWeight: "700", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.backgroundColor="rgba(255,255,255,0.2)"} onMouseOut={e => e.currentTarget.style.backgroundColor="transparent"}>View Auctions</button>
          </div>
        </div>
      </div>

      {/* World-Class Picks Carousel */}
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "2rem", flexDirection: "column" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "900", color: "transparent", backgroundImage: "linear-gradient(45deg, #0f2b5b, #f68b1e, #ef4444)", WebkitBackgroundClip: "text", margin: "0 0 0.5rem 0", textAlign: "center", letterSpacing: "1px" }}>World-Class Picks</h2>
          <div style={{ height: "4px", width: "80px", background: "linear-gradient(90deg, transparent, #f68b1e, transparent)", borderRadius: "2px" }}></div>
        </div>
        
        {/* Carousel Track */}
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1.5rem" }} className="hide-scrollbar">
          {!loading && products.slice(0, 6).map((product, index) => (
             <div key={`carousel-${product.id}`} style={{ minWidth: "280px", width: "280px" }}>
               {renderProductCard(product, index + 1, true)}
             </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CatalogPage;
