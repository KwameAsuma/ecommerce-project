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
    trustScore: 80,
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
          rating: 4.8,
          reviews: Math.floor(Math.random() * 200) + 10,
          merchant: p.vendor?.name || "Verified Merchant",
          vendorId: p.vendor?.id || p.vendorId || p.vendor_id,
          image: p.imageUrl ? `http://localhost:5001${p.imageUrl}` : "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80",
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
      trustScore: 80,
      category: "All Goods",
      searchQuery: ""
    });
  };

  // Dynamic Filtering Logic
  const filteredProducts = products.filter(p => {
    if (filters.category !== "All Goods" && p.category !== filters.category) return false;
    if (filters.region !== "All Regions" && p.region !== filters.region) return false;
    if (filters.priceRange !== "All Prices" && p.price > filters.priceRange) return false;
    if (p.trustScore < filters.trustScore) return false;
    if (filters.searchQuery && !p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <CatalogContext.Provider value={{ 
      products: filteredProducts, 
      allProducts: products,
      loading, 
      filters, 
      updateFilter, 
      resetFilters 
    }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
