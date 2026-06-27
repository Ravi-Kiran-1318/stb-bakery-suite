import React, { createContext, useState, useEffect, useContext } from 'react';

export const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const localFavs = localStorage.getItem('bakery_favorites');
    return localFavs ? JSON.parse(localFavs) : [];
  });

  useEffect(() => {
    localStorage.setItem('bakery_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (productId) => {
    setFavoriteIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const isFavorite = (productId) => favoriteIds.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
