import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

// --- Custom Hook for Scroll Animations ---
const useScrollFade = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll(".fade-in-hidden");
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [activeCategorySlide, setActiveCategorySlide] = useState(0);

  useScrollFade();

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const isDark = theme === "dark";
  
  // Premium Color Palette
  const bgMain = isDark ? "#050505" : "#fafafa";
  const bgSec = isDark ? "#121212" : "#ffffff";
  const textMain = isDark ? "#ededed" : "#171717";
  const textSec = isDark ? "#a1a1aa" : "#52525b";
  const borderCol = isDark ? "#27272a" : "#e4e4e7";
  const primaryBrand = isDark ? "#f59e0b" : "#2563eb"; // Gold/Amber in dark, Blue in light
  const primaryBrandHover = isDark ? "#d97706" : "#1d4ed8";
  const secondaryBrand = isDark ? "#3f3f46" : "#f4f4f5";

  const categories = [
    {
      title: "Global Tech",
      img: "/tech_category.png",
      tagColor: isDark ? "rgba(37,99,235,0.8)" : "rgba(37,99,235,0.9)",
    },
    {
      title: "Local Fabric",
      img: "/fabric_category.png",
      tagColor: isDark ? "rgba(180,83,9,0.8)" : "rgba(180,83,9,0.9)",
    },
    {
      title: "Premium Foods",
      img: "/food_category.png",
      tagColor: isDark ? "rgba(6,78,59,0.8)" : "rgba(6,78,59,0.9)",
    },
    {
      title: "Artisan Crafts",
      img: "/fabric_category.png", // Placeholder image, replace when available
      tagColor: isDark ? "rgba(217,119,6,0.8)" : "rgba(217,119,6,0.9)",
    },
    {
      title: "Beauty & Health",
      img: "/food_category.png", // Placeholder image, replace when available
      tagColor: isDark ? "rgba(192,38,211,0.8)" : "rgba(192,38,211,0.9)",
    },
    {
      title: "Home Essentials",
      img: "/tech_category.png", // Placeholder image, replace when available
      tagColor: isDark ? "rgba(71,85,105,0.8)" : "rgba(71,85,105,0.9)",
    }
  ];

  // Auto-advance category carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategorySlide((prev) => (prev + 1) % categories.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: textMain, width: "100%", minHeight: "100vh", overflowX: "hidden", backgroundColor: bgMain, transition: "background-color 0.4s ease, color 0.4s ease" }}>
      
      {/* Inline styles for animations */}
      <style>{`
        .fade-in-hidden {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .premium-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .premium-card:hover {
          transform: translateY(-5px);
          box-shadow: ${isDark ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 20px 40px -10px rgba(0,0,0,0.08)'};
        }
        .glass-tag {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>

      <NavBar theme={theme} toggleTheme={toggleTheme} />

      {/* --- HERO SECTION (Static) --- */}
      <section style={{ position: "relative", backgroundColor: bgMain, padding: "6rem 2rem", display: "flex", justifyContent: "center", overflow: "hidden" }}>
        {/* Background Decorative Blur */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: "40vw", height: "40vw", background: isDark ? "radial-gradient(circle, rgba(245,158,11,0.05) 0%, rgba(0,0,0,0) 70%)" : "radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 70%)", zIndex: 0, borderRadius: "50%" }}></div>

        <div style={{ maxWidth: "1200px", width: "100%", display: "flex", alignItems: "center", gap: "4rem", flexWrap: "wrap", zIndex: 1, position: "relative" }}>
          
          <div className="fade-in-hidden" style={{ flex: "1 1 400px" }}>
            <div className="glass-tag" style={{ display: "inline-block", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(37,99,235,0.1)", color: primaryBrand, padding: "0.5rem 1.2rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "1.5rem", border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "rgba(37,99,235,0.2)"}` }}>
              ✓ Escrow Protected Platform
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "800", color: textMain, lineHeight: "1.1", marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
              The Future of <br />
              <span style={{ color: primaryBrand }}>Ghanaian Commerce</span>
            </h1>
            <p style={{ fontSize: "1.15rem", color: textSec, lineHeight: "1.6", marginBottom: "2.5rem", maxWidth: "90%" }}>
              Experience seamless trade across borders. Access high-quality local goods at fixed prices in our <strong>Native Store</strong>, or leverage community buying power for global imports through <strong>Demand Pooling</strong>.
            </p>
            
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <button 
                onClick={() => navigate("/login")}
                style={{ backgroundColor: primaryBrand, color: "#fff", padding: "1rem 2.5rem", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer", transition: "background-color 0.2s", fontSize: "1rem" }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = primaryBrandHover}
                onMouseOut={e => e.currentTarget.style.backgroundColor = primaryBrand}>
                Join the Hub →
              </button>
              <button 
                onClick={() => navigate("/login")}
                style={{ backgroundColor: "transparent", color: textMain, padding: "1rem 2.5rem", borderRadius: "8px", fontWeight: "600", border: `1px solid ${borderCol}`, cursor: "pointer", transition: "all 0.2s", fontSize: "1rem" }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = secondaryBrand; e.currentTarget.style.borderColor = "transparent"; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = borderCol; }}>
                Explore Native Store 🛍️
              </button>
            </div>
          </div>

          <div className="fade-in-hidden" style={{ flex: "1 1 300px", display: "flex", justifyContent: "center", position: "relative" }}>
            <img 
              src="/hero_business.png" 
              alt="Businessman working" 
              style={{ width: "100%", maxWidth: "380px", borderRadius: "24px", boxShadow: isDark ? "0 25px 50px -12px rgba(0,0,0,0.8)" : "0 25px 50px -12px rgba(0,0,0,0.15)" }} 
            />
          </div>

        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section style={{ backgroundColor: bgSec, padding: "8rem 2rem", borderTop: `1px solid ${borderCol}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div className="fade-in-hidden">
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: "800", color: textMain, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>Built for Reliability</h2>
            <p style={{ color: textSec, marginBottom: "5rem", fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto 5rem auto", lineHeight: "1.6" }}>Professional retail mechanics combined with local market understanding. Experience a new standard of commerce.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", textAlign: "left" }}>
            
            {/* Cards */}
            <div className="fade-in-hidden premium-card" style={{ backgroundColor: bgMain, padding: "3rem 2.5rem", borderRadius: "20px", border: `1px solid ${borderCol}` }}>
              <div style={{ backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(37,99,235,0.1)", width: "56px", height: "56px", borderRadius: "14px", display: "flex", justifyContent: "center", alignItems: "center", color: primaryBrand, marginBottom: "2rem", fontSize: "1.5rem" }}>🛍️</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1rem", color: textMain, letterSpacing: "-0.01em" }}>Native Store</h3>
              <p style={{ color: textSec, lineHeight: "1.7" }}>Shop fixed-price, high-quality local goods directly from verified artisans and merchants without the hassle.</p>
            </div>

            <div className="fade-in-hidden premium-card" style={{ backgroundColor: bgMain, padding: "3rem 2.5rem", borderRadius: "20px", border: `1px solid ${borderCol}`, transitionDelay: "100ms" }}>
              <div style={{ backgroundColor: isDark ? "rgba(234,88,12,0.1)" : "rgba(234,88,12,0.1)", width: "56px", height: "56px", borderRadius: "14px", display: "flex", justifyContent: "center", alignItems: "center", color: "#ea580c", marginBottom: "2rem", fontSize: "1.5rem" }}>👥</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1rem", color: textMain, letterSpacing: "-0.01em" }}>Demand Pooling</h3>
              <p style={{ color: textSec, lineHeight: "1.7" }}>Join collective buying pools for global tech and imports. Lower costs and secure logistics managed by us.</p>
            </div>

            <div className="fade-in-hidden premium-card" style={{ backgroundColor: bgMain, padding: "3rem 2.5rem", borderRadius: "20px", border: `1px solid ${borderCol}`, transitionDelay: "200ms" }}>
              <div style={{ backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.1)", width: "56px", height: "56px", borderRadius: "14px", display: "flex", justifyContent: "center", alignItems: "center", color: "#10b981", marginBottom: "2rem", fontSize: "1.5rem" }}>🛡️</div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "1rem", color: textMain, letterSpacing: "-0.01em" }}>Escrow Security</h3>
              <p style={{ color: textSec, lineHeight: "1.7" }}>Every transaction is protected. Funds are held securely until delivery is confirmed by both parties.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- CATEGORIES CAROUSEL SECTION --- */}
      <section style={{ backgroundColor: bgMain, padding: "8rem 2rem", borderTop: `1px solid ${borderCol}`, overflow: "hidden" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="fade-in-hidden" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: "800", color: textMain, marginBottom: "1rem", letterSpacing: "-0.02em" }}>A Diverse Marketplace</h2>
              <p style={{ color: textSec, fontSize: "1.15rem", maxWidth: "600px", lineHeight: "1.6" }}>Explore categories that connect you directly to the best local and imported goods.</p>
            </div>
            <button onClick={() => navigate("/login")} style={{ padding: "0.8rem 2rem", borderRadius: "8px", border: `1px solid ${borderCol}`, backgroundColor: bgSec, color: textMain, fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = primaryBrand} onMouseOut={e => e.currentTarget.style.borderColor = borderCol}>
              View Full Catalog
            </button>
          </div>

          {/* Carousel Container */}
          <div className="fade-in-hidden" style={{ position: "relative", width: "100%", maxWidth: "1050px", margin: "0 auto" }}>
            <div style={{ overflow: "hidden", borderRadius: "24px", border: `1px solid ${borderCol}` }}>
              <div className="carousel-track" style={{ transform: `translateX(-${activeCategorySlide * 100}%)` }}>
                {categories.map((category, idx) => (
                  <div key={idx} style={{ flex: "0 0 100%", position: "relative", height: "450px", cursor: "pointer" }} onClick={() => navigate("/login")}>
                    <img 
                      src={category.img} 
                      alt={category.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    <div style={{ position: "absolute", bottom: "0", left: "0", width: "100%", padding: "3rem 2rem", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", pointerEvents: "none" }}>
                      <span className="glass-tag" style={{ color: "white", fontWeight: "700", fontSize: "1.2rem", backgroundColor: category.tagColor, padding: "0.6rem 1.5rem", borderRadius: "999px", letterSpacing: "0.5px" }}>
                        {category.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
              {categories.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveCategorySlide(idx)}
                  style={{ width: idx === activeCategorySlide ? "32px" : "10px", height: "10px", borderRadius: "5px", backgroundColor: idx === activeCategorySlide ? primaryBrand : borderCol, cursor: "pointer", transition: "all 0.3s ease" }}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ backgroundColor: bgSec, padding: "6rem 2rem 3rem 2rem", borderTop: `1px solid ${borderCol}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: textMain, fontSize: "1.5rem", fontWeight: "800", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", letterSpacing: "-0.02em" }}>
            <img src="/app_icon.png" alt="Logo" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
            TradeHub Ghana
          </h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", color: textSec, fontWeight: "500", fontSize: "0.95rem", marginBottom: "3rem", flexWrap: "wrap" }}>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color=primaryBrand} onMouseOut={e=>e.currentTarget.style.color=textSec}>Trust & Safety</span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color=primaryBrand} onMouseOut={e=>e.currentTarget.style.color=textSec}>Escrow Terms</span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color=primaryBrand} onMouseOut={e=>e.currentTarget.style.color=textSec}>Merchant Verification</span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e=>e.currentTarget.style.color=primaryBrand} onMouseOut={e=>e.currentTarget.style.color=textSec}>Contact Support</span>
          </div>
          <div style={{ color: isDark ? "#52525b" : "#a1a1aa", fontSize: "0.85rem", borderTop: `1px solid ${borderCol}`, paddingTop: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            © {new Date().getFullYear()} TradeHub Ghana. MoMo Escrow Protected & Verified Merchants Only.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
