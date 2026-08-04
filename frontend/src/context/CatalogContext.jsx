import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    priceRange: "All Prices", // Max price
    region: "All Regions",
    trustScore: 0,
    category: "All Goods",
    searchQuery: ""
  });

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await api.get('/products');
        const liveProducts = res.data.products || res.data || [];
        
        // Map database products to the rich structure expected by the frontend
        const formatted = liveProducts.map(p => ({
          id: String(p.id), // ensure string for router matching if needed
          name: p.title,
          category: p.category || "Uncategorized",
          price: parseFloat(p.price),
          region: "Greater Accra",
          trustScore: p.vendor?.trustScore || 85,
          rating: p.rating || 4.8,
          reviews: p._count?.reviews || p.reviews?.length || 0,
          merchant: p.vendor?.name || "Verified Merchant",
          vendorId: p.vendor?.id || p.vendorId || p.vendor_id,
          image: (((p.title || p.name || "").toLowerCase().includes("rolex")) || ((p.title || p.name || "").toLowerCase().includes("submariner")) || ((p.imageUrl || "").toLowerCase().includes("rolex")) || ((p.imageUrl || "").toLowerCase().includes("google.com/url")) || ((p.imageUrl || "").toLowerCase().includes("m126610lv"))) ? "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop" : (p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:5001${p.imageUrl}`) : "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"),
          tags: (p.stockCount > 0 || p.stock_count > 0) ? ["In Stock"] : ["Out of Stock"],
          description: p.description || "No description provided."
        }));
        
        setProducts(formatted);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCatalog();
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: "All Prices",
      region: "All Regions",
      trustScore: 0,
      category: "All Goods",
      searchQuery: ""
    });
  };

  // One-way Category Keyword Expansion (Hypernym -> Hyponym)
  // Ensures general searches (e.g. 'cloth') find specific items (e.g. 'kente'),
  // while specific searches (e.g. 'cashew', 'sobolo') NEVER pull in other unrelated items.
  const broadCategoryExpansions = {
    "cloth": ["kente", "smock", "dress", "shirt", "apparel", "attire", "outfit", "fabric", "textile", "woven", "garment"],
    "clothes": ["kente", "smock", "dress", "shirt", "apparel", "attire", "outfit", "fabric", "textile", "woven", "garment"],
    "clothing": ["kente", "smock", "dress", "shirt", "apparel", "attire", "outfit", "fabric", "textile", "woven", "garment"],
    "wear": ["kente", "smock", "dress", "shirt", "apparel", "attire", "outfit"],
    "snack": ["cashew", "nut", "kernel", "chips", "biscuit"],
    "snacks": ["cashew", "nut", "kernel", "chips", "biscuit"],
    "drink": ["coffee", "sobolo", "tea", "cocoa", "beverage", "juice"],
    "drinks": ["coffee", "sobolo", "tea", "cocoa", "beverage", "juice"],
    "beverage": ["coffee", "sobolo", "tea", "cocoa", "drink", "juice"],
    "oil": ["shea", "shea butter", "baobab", "botanical", "moringa", "serum", "lotion"],
    "oils": ["shea", "shea butter", "baobab", "botanical", "moringa", "serum", "lotion"],
    "cosmetic": ["shea", "shea butter", "skincare", "lotion", "serum"],
    "cosmetics": ["shea", "shea butter", "skincare", "lotion", "serum"],
    "electronics": ["laptop", "macbook", "computer", "phone", "camera", "sony", "apple", "gadget", "watch"],
    "tech": ["laptop", "macbook", "computer", "phone", "camera", "sony", "apple", "gadget", "watch"],
    "jewelry": ["gold", "necklace", "bracelet", "ring", "beads", "rolex", "watch", "heritage"],
    "jewellery": ["gold", "necklace", "bracelet", "ring", "beads", "rolex", "watch", "heritage"],
    "wood": ["furniture", "table", "chair", "wardrobe", "stool", "carved"]
  };

  const smartMatch = (item, queryStr) => {
    if (!queryStr || !queryStr.trim()) return true;
    const rawQuery = queryStr.toLowerCase().trim();
    const queryTokens = rawQuery.split(/\s+/).filter(t => t.length > 1);
    
    const targetText = [
      item.name || "",
      item.category || "",
      item.description || "",
      item.merchant || "",
      item.brand || "",
      ...(Array.isArray(item.tags) ? item.tags : [])
    ].join(" ").toLowerCase();

    // 1. Direct substring match on entire query string
    if (targetText.includes(rawQuery)) return true;

    // 2. Token evaluation with strict one-way expansion rules
    for (const token of queryTokens) {
      if (targetText.includes(token)) return true;
      
      // ONLY expand if the token is a general category term (like 'cloth', 'snack', 'drink').
      // If someone types 'cashew' or 'moringa', broadCategoryExpansions[token] is undefined,
      // so it will never erroneously match other items!
      if (broadCategoryExpansions[token]) {
        if (broadCategoryExpansions[token].some(hyponym => targetText.includes(hyponym))) {
          return true;
        }
      }
    }
    return false;
  };

  // Dynamic Filtering Logic
  const filteredProducts = products.filter(p => {
    if (filters.category && filters.category !== "All Goods") {
      const target = filters.category.toLowerCase().trim();
      const pCat = (p.category || "").toLowerCase().trim();
      const pName = (p.name || "").toLowerCase().trim();
      let match = pCat === target || pCat.includes(target) || target.includes(pCat);
      if (!match && (target === "clothes" || target === "clothing")) {
        match = pCat.includes("kente") || pCat.includes("artisanal") || pCat.includes("cloth") || pName.includes("cloth") || pName.includes("smock") || pName.includes("wear") || pName.includes("fashion") || pName.includes("necklace") || pName.includes("dress") || pName.includes("shirt");
      }
      if (!match && target === "culinary exports") {
        match = pCat.includes("agri") || pCat.includes("spices") || pCat.includes("botanical") || pCat.includes("health") || pName.includes("coffee") || pName.includes("sobolo") || pName.includes("moringa") || pName.includes("shea") || pName.includes("cashew") || pName.includes("pepper");
      }
      if (!match) return false;
    }
    if (filters.region !== "All Regions" && p.region !== filters.region) return false;
    if (filters.priceRange !== "All Prices" && p.price > filters.priceRange) return false;
    if (p.trustScore < filters.trustScore) return false;
    if (filters.searchQuery && !smartMatch(p, filters.searchQuery)) return false;
    return true;
  });

  return (
    <CatalogContext.Provider value={{ 
      products: filteredProducts, 
      allProducts: products,
      loading, 
      filters, 
      updateFilter, 
      resetFilters,
      smartMatch
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
