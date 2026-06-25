import React, { createContext, useContext, useState, useEffect } from "react";
import { mockProducts } from "../data/mockDb";

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    priceRange: 10000, // Max price
    region: "All Regions",
    trustScore: 80,
    category: "All Goods",
    searchQuery: ""
  });

  // Simulate network fetch
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 600); // 600ms artificial delay for realism
    return () => clearTimeout(timer);
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: 10000,
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
    if (p.price > filters.priceRange) return false;
    if (p.trustScore < filters.trustScore) return false;
    if (filters.searchQuery && !p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <CatalogContext.Provider value={{ 
      products: filteredProducts, 
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
