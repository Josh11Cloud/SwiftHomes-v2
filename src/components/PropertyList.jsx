import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CircleParking, ShowerHead, BedSingle, ChartNoAxesColumnIncreasing, Clock, Heart } from 'lucide-react';
import PropertyModal from './PropertyModal';
import ROIWithTooltip from "../sections/invest/ROITootlip";
import { useFavorites } from '../context/FavoritesContext';

export default function PropertyList({ property, showROI, isInvestSection }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(String(property.id));

  const abrirModal = () => {
    setSelectedProperty(property);
    setModalAbierto(true);
  };
  

if (!property || !property.imagen) {
  return <p>No hay imagen disponible</p>;
  }  

return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={abrirModal}
        className="cursor-pointer p-4 relative bg-slate-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-200 px-4 py-2"
      >
        <img src={property.imagen} alt={property.nombre} className="w-full aspect-[4/3] object-cover" />

        <div className="p-4 space-y-1">
          <h2 className="text-xl font-semibold text-gray-800">{property.nombre}</h2>
          <div className="flex items-center space-x-1.5 text-sm text-slate-400">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-5 p-2 rounded-full bg-slate-200 hover:scale-105"  
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
          >
            {isFavorite ? (
                <Heart size={25} fill="#0077b6" stroke="#0077b6" className="hover:fill-[#eeeeee]" />
              ) : (
                <Heart size={25} fill="#eeeeee" className="hover:fill-[#0077b6]"  />
              )}
            </motion.button>
            <MapPin className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className='text-gray-700'>{property.ubicacion}</p>
            <CircleParking className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className="text-gray-700">{property.estacionamientos}</p>
            <ShowerHead className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className="text-gray-700">{property.baños}</p>
            <BedSingle className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className="text-gray-700">{property.habitaciones}</p>
            <span className='text-sm text-gray-500'>{property.area}m²</span>
          </div>
          <p className="font-bold text-[#0077B6] mt-2 text-lg">
          {property.categoria === 'renta' ? `$${Number(property.renta).toLocaleString()}` : property.precio ? `$${Number(property.precio).toLocaleString('es-MX')}` : 'Precio no disponible'}
          </p>
          {window.location.pathname === '/inversiones' && (
          <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4">
              {showROI && (
                <p className="font-semibold">ROI: <ROIWithTooltip value={property.roi} />
                  {isInvestSection && property.roi && parseFloat(property.roi.replace('%', '').trim()) > 10 && (
                    <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                      <ChartNoAxesColumnIncreasing />  Oportunidad
                    </span>
                  )}
                </p>
              )}
              {showROI && (
                <p className="flex items-center">
                  <ChartNoAxesColumnIncreasing size={20} className="mr-2 text-[#0077b6]" />
                  Rentabilidad Anual: {property.rentabilidadAnual}
                </p>             
                  )}
            {isInvestSection && property.plazoDelRetorno && (
              <span className="text-sm text-gray-700 flex items-center">
                <Clock size={20} className="mr-1 text-[#0077b6]" />
                {property.plazoDelRetorno} para recuperar inversión.
              </span>
            )}
              </div>
            )}
          </div>
      </motion.div>
      <PropertyModal propiedad={selectedProperty} abierto={modalAbierto} cerrar={() => setModalAbierto(false)} />
    </>
  );
}