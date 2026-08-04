import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("bedidwa_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("bedidwa_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error("Could not save favorites", e);
    }
  }, [favorites]);

  const toggleFavorite = (product) => {
    if (!product || !product.id) return;
    const prodId = String(product.id);
    setFavorites(prev => {
      const exists = prev.some(item => String(item.id) === prodId);
      if (exists) {
        return prev.filter(item => String(item.id) !== prodId);
      } else {
        return [...prev, product];
      }
    });
  };

  const isFavorite = (id) => {
    if (!id) return false;
    return favorites.some(item => String(item.id) === String(id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, favoritesCount: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
