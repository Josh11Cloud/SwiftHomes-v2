import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  CircleParking,
  ShowerHead,
  BedSingle,
  Handshake,
  Hammer,
  Clock,
  Heart,
  ChartNoAxesCombined,
  ChartNoAxesColumnIncreasing,
  Phone,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import Spinner from './Spinner';
import PropertyModal from "./PropertyModal";
import ROIWithTooltip from "../sections/invest/ROITootlip";
import { useFavorites } from "../context/FavoritesContext";

export default function PropertyList({ property, showROI }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const totalImages = property.imagenes.length;
  const [localIsFavorite, setLocalIsFavorite] = useState(property && favorites && favorites.includes(String(property.id)));

  const imagenes = property && property.imagenes ? Array.isArray(property.imagenes) ? property.imagenes : [] : [];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % totalImages);
  };

  const abrirModal = () => {
    setSelectedProperty(property);
    setModalAbierto(true);
  };

  useEffect(() => {
    if (property) {
      setLoading(false);
    }
  }, [property]);

  const rentabilidadAnual = property.precio > 0 ? (property.ingresos_mensuales * 12) / property.precio * 100 : 0;

  const getRentabilidadColor = (rentabilidad) => {
    if (rentabilidad >= 7) return 'text-green-600';
    if (rentabilidad >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!property || !property.imagenes) {
    return <p className="text-center text-gray-600 text-md">No hay imagen disponible</p>;
  }

  const tags = [
    {
      id: "oportunidadInversion",
      label: "Oportunidad de Inversión",
      condition:
        property.roi !== null &&
        property.roi !== undefined &&
        !isNaN(parseFloat(property.roi)) &&
        parseFloat(property.roi) >= 7,
      bg: "bg-green-200",
      text: "text-green-600",
      icon: <ChartNoAxesCombined size={18} />,
    },
    {
      id: "oportunidadRemodelacion",
      label: "Oportunidad de Remodelar",
      condition: property.estado === "para remodelar",
      bg: "bg-slate-200",
      text: "text-yellow-600",
      icon: <Hammer size={18} />,
    },
    {
      id: "precioNegociable",
      label: "Precio Negociable",
      condition: property.precioNegociable === true,
      bg: "bg-slate-200",
      text: "text-[#0077b6]",
      icon: <Handshake size={18} />,
    },
  ];

  if (loading) return <Spinner />;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={abrirModal}
        className="cursor-pointer p-4 relative bg-slate-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-200 px-4 py-2 h-auto mb-6"
      >
        {/* TAGS DE OPORTUNIDAD */}
        <div className="absolute top-3 left-3 flex items-center gap-2 overflow-x-auto max-w-[90%] scrollbar-hide">
          {tags.map(
            (tag) =>
              tag.condition && (
                <div
                  key={tag.id}
                  className={`flex px-2 py-1 text-xs rounded-full font-semibold shadow items-center gap-1 ${tag.bg} ${tag.text}`}
                >
                  {tag.icon}
                  <span>{tag.label}</span>
                </div>
              )
          )}
        </div>
        {property && (
          <motion.button
            style={{ zIndex: 25 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-5 p-2 rounded-full bg-slate-200 hover:scale-105 text-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
              setLocalIsFavorite(!localIsFavorite);
            }}
          >
            {localIsFavorite ? (
              <Heart
                size={25}
                fill="#0077b6"
                stroke="#0077b6"
                className="hover:fill-[#eeeeee]"
              />
            ) : (
              <Heart
                size={25}
                fill="#eeeeee"
                className="hover:fill-[#0077b6]"
              />
            )}
          </motion.button>
        )}
        <div className="relative w-full h-auto mb-4 flex justify-between">
          <motion.img
            key={currentImage}
            src={imagenes[currentImage]}
            alt={`${property.nombre} - Imagen ${currentImage + 1}`}
            className="rounded-xl w-full aspect-[4/3] object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="flex flex-col md:flex-row gap-3 justify-center items-stretch">
            {/* Botón anterior */}
            <button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePrev(e);
              }}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-slate-50 px-2 py-4 rounded-lg shadow z-10"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Botón siguiente */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext(e);
              }}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-slate-50 px-2 py-4 rounded-lg shadow z-10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          {property.nombre}
        </h2>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 text-[#0077b6]" />
          <span className="truncate whitespace-nowrap">{property.ubicacion}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center mb-2">
          <div className="flex items-center gap-1">
            <CircleParking className="w-4 h-4 text-[#0077b6]" />
            <span>{property.estacionamientos}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShowerHead className="w-4 h-4 text-[#0077b6]" />
            <span>{property.banos}</span>
          </div>
          <div className="flex items-center gap-1">
            <BedSingle className="w-4 h-4 text-[#0077b6]" />
            <span>{property.habitaciones}</span>
          </div>
          <span className="text-md text-gray-500 ml-auto">
            {property.area}m²
          </span>
        </div>

        <p className="font-bold text-[#0077B6] mt-5 text-lg">
          {property.categoria === "renta"
            ? `$${Number(property.renta).toLocaleString()} MXN`
            : `$${Number(property.precio).toLocaleString()} MXN`}
        </p>

        <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
          {window.location.pathname === "/inversiones" && (
            <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4">
              {showROI && (
                <p className="font-semibold">
                  ROI: {property.roi === null || property.roi === undefined || isNaN(property.roi) ? "No disponible" : <ROIWithTooltip value={property.roi} />}
                </p>
              )}
              {showROI && (
                <p className="flex items-center gap-1">
                  <ChartNoAxesColumnIncreasing
                    size={20}
                    className="mr-2 text-[#0077b6]"
                  />
                  Rentabilidad Anual:
                  <span className={`${getRentabilidadColor(rentabilidadAnual)} font-bold`}>
                    {property.precio > 0 ? `${Number(rentabilidadAnual).toFixed(2)}%` : 'No disponible'}
                  </span>
                </p>
              )}
              {property.paybackyears && (
                <span className="text-sm text-gray-700 flex items-center">
                  <Clock size={20} className="mr-1 text-[#0077b6]" />
                  {(() => {
                    const años = Math.floor(property.paybackyears);
                    const meses = Math.round((property.paybackyears - años) * 12);
                    return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'} para recuperar inversión.`;
                  })()}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-3 justify-center items-stretch w-full mt-4">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/52${property.publicador_telefono}?text=Hola, vi tu propiedad en SwiftHomes: ${property.nombre}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full md:w-auto text-center items-center gap-2 bg-green-600 text-slate-50 px-4 py-2 rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
            >
              <i className="bi bi-whatsapp"></i>
              WhatsApp
            </a>

            {/* Llamar */}
            <a
              href={`tel:+52${property.publicador_telefono}`}
              className="flex items-center w-full md:w-auto text-center gap-2 bg-[#0077b6] text-slate-50 px-4 py-2 rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
            >
              <Phone size={20} />
              Llamar
            </a>

            {/* Correo */}
            <a
              href={`mailto:${property.publicador_email}?subject=Interés en propiedad en SwiftHomes&body=Hola, estoy interesado en la propiedad ${property.nombre}.`}
              className="flex items-center w-full md:w-auto text-center gap-2 border border-red-600 bg-white text-red-600 px-4 py-2 font-semibold rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
            >
              <Mail size={20} />
              Correo
            </a>
          </div>
        </div>
      </motion.div>
      <PropertyModal
        propiedad={selectedProperty}
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        isInvestSection={selectedProperty?.isInvestment === true}
        showROI={true}
      />
    </>
  );
}
