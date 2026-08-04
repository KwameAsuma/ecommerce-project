import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("bedidwa_cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse cart from localStorage", e);
      return [];
    }
  });
  const [addedItemModal, setAddedItemModal] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("bedidwa_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const addToCart = (product, customQty = 1) => {
    const qtyToAdd = (typeof customQty === "number" && customQty > 0) ? customQty : (product.qty || 1);
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item);
      }
      return [...prev, { ...product, qty: qtyToAdd }];
    });
    setAddedItemModal({ ...product, addedQty: qtyToAdd });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const decreaseQuantity = (productId) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.qty > 1) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, decreaseQuantity, clearCart, cartTotal, cartCount, addedItemModal, setAddedItemModal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
