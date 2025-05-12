import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

useEffect(() => {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}, [favorites]);

useEffect(() => {
  const saved = localStorage.getItem('favorites');
  if (saved) {
    setFavorites(JSON.parse(saved));
  }
}, []);


const toggleFavorite = (id) => {
  const stringId = String(id);
  const isFavorite = favorites.includes(stringId);

  const updatedFavorites = isFavorite
    ? favorites.filter(favId => favId !== stringId)
    : [...favorites, stringId];

  setFavorites(updatedFavorites);
};

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);