import { createContext, useState, useEffect } from "react";
import { useAuth } from './AuthContext';

const PropertiesContext = createContext();
const API_URL = "http://localhost:5500/api/propiedades";

const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${API_URL}?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener propiedades");
        const data = await res.json();
        if (!data || !Array.isArray(data.properties)) throw new Error("Formato de datos inválido");
        setProperties(data.properties);
      } catch (error) {
        setError(error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchProperties();
    }
  }, [token]);

  return (
    <PropertiesContext.Provider value={{ properties, loading, error }}>
      {children}
    </PropertiesContext.Provider>
  );
};

export { PropertiesContext, PropertiesProvider };