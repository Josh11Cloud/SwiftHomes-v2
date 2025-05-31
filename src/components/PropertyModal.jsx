import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import ROIWithTooltip from "../sections/invest/ROITootlip";
import {
  MapPin,
  CircleParking,
  ShowerHead,
  BedSingle,
  X,
  Heart,
  CalendarClock,
  Landmark,
  Info,
  ListChecks,
  WavesLadder,
  ShieldCheck,
  ChartNoAxesColumnIncreasing,
  Clock,
} from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";

export default function PropertyModal({
  propiedad,
  abierto,
  cerrar,
  showROI,
  isInvestSection,
}) {
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
            className="bg-slate-50 p-6 rounded-xl z-10 shadow-xl relative max-w-2xl max-h-screen overflow-y-auto"
          >
            <span
              className="absolute top-4 left-4 cursor-pointer text-gray-500 hover:text-[#0077b6]"
              onClick={cerrar}
            >
              <X size={24} />
            </span>
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
            <h2 className="text-2xl font-semibold mb-2 text-center">
              {propiedad.nombre}
            </h2>

            <img
              src={propiedad.imagen}
              alt={propiedad.nombre}
              className="rounded-t-2xl w-full h-60 object-cover mb-4"
            />

            <div className="flex flex-wrap gap-3 text-sm text-gray-600 items-center mb-2">
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
              <span className="text-sm text-gray-500 ml-auto">
                {propiedad.area}m²
              </span>
            </div>

            <div className="px-1 pb-3 max-h-32 overflow-y-auto text-black text-sm scrollbar-thin scrollbar-thumb-gray-300">
              <span>{propiedad.descripcion}</span>
            </div>

            <p className="font-bold text-[#0077B6] mt-2 text-lg">
              {propiedad.categoria === "renta"
                ? `$${Number(propiedad.renta).toLocaleString()} MXN`
                : `$${Number(propiedad.precio).toLocaleString()} MXN`}
            </p>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Info size={20} className="text-[#0077b6]" />
                Detalles adicionales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-800">
                  <CalendarClock size={18} className="text-[#0077b6]" />
                  <span>Antigüedad: {propiedad.antiguedad} años</span>
                </div>
                <div className="flex items-center gap-2 text-gray-800">
                  <Landmark size={18} className="text-[#0077b6]" />
                  <span>
                    Financiamiento: {propiedad.financiamiento ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-800 col-span-1 md:col-span-2">
                  <ListChecks size={18} className="text-[#0077b6]" />
                  <span>Servicios:</span>
                  <ul className="flex flex-wrap gap-2 ml-2">
                    {propiedad.servicios &&
                      propiedad.servicios.includes("piscina") && (
                        <li className="flex items-center gap-1">
                          <WavesLadder size={16} className="text-[#0077b6]" />
                          <span>Piscina</span>
                        </li>
                      )}
                    {propiedad.servicios.includes("seguridad") && (
                      <li className="flex items-center gap-1">
                        <ShieldCheck size={16} className="text-[#0077b6]" />
                        <span>Seguridad</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              {propiedad.etiquetas?.includes("nuevo") && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Nuevo
                </span>
              )}
              {propiedad.etiquetas?.includes("oportunidad-inversion") && (
                <span className="bg-blue-100 text-[#0077b6] text-xs px-2 py-1 rounded-full">
                  Oportunidad de Inversión
                </span>
              )}
              {isInvestSection && (
                <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4">
                  {showROI && (
                    <p className="font-semibold">
                      ROI: <ROIWithTooltip value={propiedad.roi} />
                      {isInvestSection &&
                        propiedad.roi &&
                        parseFloat(propiedad.roi.replace("%", "").trim()) >
                          10 && (
                          <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                            <ChartNoAxesColumnIncreasing /> Oportunidad
                          </span>
                        )}
                    </p>
                  )}
                  {showROI && (
                    <p className="flex items-center">
                      <ChartNoAxesColumnIncreasing
                        size={20}
                        className="mr-2 text-[#0077b6]"
                      />
                      Rentabilidad Anual: {propiedad.rentabilidadAnual}
                    </p>
                  )}
                  {isInvestSection && propiedad.plazoDelRetorno && (
                    <span className="text-sm text-gray-700 flex items-center">
                      <Clock size={20} className="mr-1 text-[#0077b6]" />
                      {propiedad.plazoDelRetorno} para recuperar inversión.
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
