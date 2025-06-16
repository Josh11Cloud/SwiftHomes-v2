import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

const FavoritesContext = createContext();
const API_URL = "http://localhost:5500/api/favoritos";

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (token) {
        try {
          const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const ids = res.data.map((prop) => String(prop.id));
          setFavorites(ids);
        } catch (err) {
          console.error("Error cargando favoritos:", err);
        }
      }
    };
    fetchFavorites();
  }, [token]);

  const toggleFavorite = async (id) => {
    if (!token) {
      toast.error(
        "¡Ups! Debes iniciar sesión o crear una cuenta para guardar esta propiedad en tus favoritos"
      );
      router.push("/login");
      return;
    }
    const isFavorite = favorites.includes(id);
    setFavorites((prev) =>
      isFavorite ? prev.filter((f) => f !== id) : [...prev, id]
    );

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          API_URL,
          { propiedadid: id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.error("Error actualizando favoritos:", err);
      setFavorites((prev) =>
        isFavorite ? [...prev, id] : prev.filter((f) => f !== id)
      );
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
