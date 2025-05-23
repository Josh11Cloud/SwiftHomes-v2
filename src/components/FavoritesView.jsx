import { useContext } from 'react';
import { PropertiesContext } from '../context/PropertiesContext';
import { useFavorites } from '../context/FavoritesContext';
import PropertyList from '../components/PropertyList';
import { motion } from 'framer-motion';
import corazon from '../assets/images/corazon.png';

const FavoritesPage = () => {
  const { properties } = useContext(PropertiesContext);
  const { favorites } = useFavorites();

  const favoriteProperties = properties.filter(property =>
    favorites.includes(String(property.id))
  );

  return (
    <>
              {/* HERO */}
          <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
          <div className='text-center mt-6 md:mt-0'>
          <motion.h1
          initial={{ opacity: 0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
           Tus propiedades favoritas, en un solo <span className="text-gray-900">Lugar</span></motion.h1>
            <motion.p 
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800">Guarda las opciones que más te gusten y compáralas fácilmente cuando estés listo para decidir.</motion.p>
            </div>
             <motion.img 
             src={corazon} 
             alt="Corazón"
            initial={{ opacity: 0, y:-20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration: 0.8 }} 
             className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
          </section> 
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Tus Favoritos</h2>
      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoriteProperties.map(property => (
            <PropertyList key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">No has agregado propiedades a favoritos.</p>
      )}
    </div>
  </>
  );
};

export default FavoritesPage;