import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CircleParking, ShowerHead, BedSingle, ChartNoAxesColumnIncreasing } from 'lucide-react';
import PropertyModal from './PropertyModal';
import ROIWithTooltip from "../sections/invest/ROITootlip";

export default function PropertyList({ property, showROI, isInvestSection }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

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
          <div className="flex items-center space-x-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p className='text-gray-700'>{property.ubicacion}</p>
            <CircleParking className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.estacionamientos}</p>
            <ShowerHead className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.baños}</p>
            <BedSingle className="w-4 h-4 mr-1 text-[#0077b6]" />
            <p>{property.habitaciones}</p>
            <span className='text-sm text-gray-500'>{property.area}m²</span>
          </div>
          <p className="font-bold text-[#0077B6] mt-2 text-lg">
          {property.categoria === 'renta' ? `$${Number(property.renta).toLocaleString()}` : property.precio ? `$${Number(property.precio).toLocaleString('es-MX')}` : 'Precio no disponible'}
          </p>
              {showROI && (
                <p className="font-semibold">ROI: <ROIWithTooltip value={property.roi} />
                  {isInvestSection && property.roi && parseFloat(property.roi.replace('%', '').trim()) > 12 && (
                    <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                      <ChartNoAxesColumnIncreasing />  Oportunidad
                    </span>
                  )}
                </p>
              )}
              {showROI && (
                <p>Rentabilidad Anual: {property.rentabilidadAnual}%</p>
              )}
              {isInvestSection && property.añosDeRetorno && (
                <span className="text-sm text-gray-500">
                  ({property.añosDeRetorno} años para recuperar inversión)
                </span>
              )}
          </div>
      </motion.div>
      <PropertyModal propiedad={selectedProperty} abierto={modalAbierto} cerrar={() => setModalAbierto(false)} />
    </>
  );
}