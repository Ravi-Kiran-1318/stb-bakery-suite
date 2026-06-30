import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState(() => {
    const localCart = localStorage.getItem('bakery_cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('bakery_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (user) {
      mergeWithServerCart();
    }
  }, [user]);

  const addToCart = (product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === product._id);
      if (exists) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          nameEN: product.nameEN,
          nameTe: product.nameTe,
          imageUrl: product.imageUrl,
          price: product.price,
          qty: 1,
          isGallery: product.isGallery || false,
          isCustomCake: product.isCustomCake || false,
          customCakeId: product.customCakeId || null,
          requestedDate: product.requestedDate || null,
          requestedTime: product.requestedTime || null
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const replaceCart = (newItems) => {
    setItems(newItems);
  };

  const mergeWithServerCart = async () => {
    // In a full implementation, you would merge the local cart with the backend cart here.
    // For this boilerplate, we'll just keep the local one.
  };

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, replaceCart, mergeWithServerCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
