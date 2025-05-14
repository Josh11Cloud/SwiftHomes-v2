import { motion } from 'framer-motion';
import { Heart, MapPin, CircleParking, ShowerHead, BedSingle } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

const PropertyCard = ({ property, onClick }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.some(favId => favId.trim() === String(property.id));

  return (
    <motion.div
      onClick={() => onClick(property)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='relative bg-slate-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-200 px-4 py-2'
    >
      <img className="w-full aspect-[4/3] object-cover" src={property.image} alt={property.name} />

      <div className="p-4 space-y-1">
        <h3 className='text-xl font-semibold text-gray-800'>{property.name}</h3>
        <div className="flex items-center space-x-1.5 text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-1 text-[#0077b6]" />
          <p className='text-gray-700'>{property.location}</p>
          <CircleParking className="w-4 h-4 mr-1 text-[#0077b6]" />
          <p>{property.parking}</p>
          <ShowerHead className="w-4 h-4 mr-1 text-[#0077b6]" />
          <p>{property.bathrooms}</p>
          <BedSingle className="w-4 h-4 mr-1 text-[#0077b6]" />
          <p>{property.bedrooms}</p>
          <span className='text-sm text-gray-500'>{property.area}m²</span>
        </div>
        <p className="font-bold text-[#0077B6] mt-2 text-lg">${property.price.toLocaleString('es-MX')}</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(property.id);
        }}
        className='absolute top-3 right-3 bg-slate-50 rounded-full p-2 shadow-md'
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#0077B6] text-[#0077B6]' : 'text-gray-400'}`} />
      </motion.button>
    </motion.div>
  );
};

export default PropertyCard;