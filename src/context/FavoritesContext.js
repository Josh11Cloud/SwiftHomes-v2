import { createContext, useContext, useState, useEffect } from 'react';
import { addActivity } from '../components/AddActivity';
import { useAuth } from "../context/AuthContext";

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

  const { user } = useAuth();

  const toggleFavorite = (id) => {
    const stringId = String(id);
    const isFavorite = favorites.includes(stringId);

    const updatedFavorites = isFavorite
      ? favorites.filter(favId => favId !== stringId)
      : [...favorites, stringId];

    setFavorites(updatedFavorites);

    if (user && user.uid) {
      if (isFavorite) {
        addActivity(
          user.uid,
          "removed_from_favorites",
          "El usuario ha eliminado una propiedad de sus favoritos"
        );
      } else {
        addActivity(
          user.uid,
          "added_to_favorites",
          "El usuario ha agregado una propiedad a sus favoritos"
        );
      }
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);