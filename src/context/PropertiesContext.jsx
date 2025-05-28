import { createContext, useState, useEffect } from 'react';
import db from "../firebase/config.js";
import { getDocs, collection } from 'firebase/firestore';

const PropertiesContext = createContext();

const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const snapshot = await getDocs(collection(db, "propiedades"));
        const propiedades = snapshot.docs.map(doc => ({
          id: doc.id, 
          ...doc.data()
        }));
        setProperties(propiedades);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProperties();
  }, []);

  return (
    <PropertiesContext.Provider value={{ properties }}>
      {children}
    </PropertiesContext.Provider>
  );
};

export { PropertiesContext, PropertiesProvider };