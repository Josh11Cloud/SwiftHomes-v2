import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CircleParking, ShowerHead, BedSingle, X, Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

export default function PropertyModal({ propiedad, abierto, cerrar, }){
  const { favorites, toggleFavorite } = useFavorites();

  if (!propiedad) return null;

  const isFavorite = favorites.includes(String(propiedad.id));

 return (
     <AnimatePresence>
      {abierto && (
        <Dialog
          open={abierto}
          onClose={cerrar}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={cerrar}
          />    

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-50 p-6 rounded-xl z-10 shadow-xl relative max-w-2xl"
          >
            <span
              className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-900"
              onClick={cerrar}
            >
              <X size={24} />
            </span>

            <h2 className="text-2xl font-semibold mb-2 text-center">
              {propiedad.nombre}
            </h2>

            <img
              src={propiedad.imagen}
              alt={propiedad.nombre}
              className="rounded-t-2xl w-full h-60 object-cover mb-4"
            />

            <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center mb-2">
            {propiedad && (
            <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-5 p-2 rounded-full bg-slate-200 hover:scale-105"  
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(propiedad.id);
            }}
          >
            {isFavorite ? (
                <Heart size={25} fill="#0077b6" stroke="#0077b6" className="hover:fill-[#eeeeee]" />
              ) : (
                <Heart size={25} fill="#eeeeee" className="hover:fill-[#0077b6]"  />
              )}
            </motion.button>
            )}
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#0077b6]" />
                <span>{propiedad.ubicacion}</span>
              </div>
              <div className="flex items-center gap-1">
                <CircleParking className="w-4 h-4 text-[#0077b6]" />
                <span>{propiedad.estacionamientos}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShowerHead className="w-4 h-4 text-[#0077b6]" />
                <span>{propiedad.baños}</span>
              </div>
              <div className="flex items-center gap-1">
                <BedSingle className="w-4 h-4 text-[#0077b6]" />
                <span>{propiedad.habitaciones}</span>
              </div>
              <span className="text-sm text-gray-500 ml-auto">{propiedad.area}m²</span>
            </div>

            <div className="px-1 pb-3 max-h-32 overflow-y-auto text-black text-sm scrollbar-thin scrollbar-thumb-gray-300">
              <span>{propiedad.descripcion}</span>
            </div>

            <p className="font-bold text-[#0077B6] mt-2 text-lg">{propiedad.categoria === 'renta' ? `$${Number(propiedad.renta).toLocaleString()} MXN` : `$${Number(propiedad.precio).toLocaleString()} MXN`}</p>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}