import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import ROIWithTooltip from "../sections/invest/ROITootlip";
import { useState, useEffect } from "react";
import SimpleBot from './SimpleBot';
import TablaYGraficaPlusvalia from "./GraphicAndTable";
import { GraphicHistorico } from './GraphicPlusvaliaHistorico';
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
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  BadgeCheck,
  Star,
} from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";

export default function PropertyModal({
  propiedad,
  abierto,
  cerrar,
  showROI,
}) {
  if (!propiedad) return null;

  const { favorites, toggleFavorite } = useFavorites();
  const [plusvalia, setPlusvalia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagenes = propiedad && propiedad.imagenes ? Array.isArray(propiedad.imagenes) ? propiedad.imagenes : [] : [];

  const extraerZonaDeUbicacion = (ubicacion) => {
    const zonas = [
      "Valle Imperial",
      "Ladrón de Guevara",
      "Jardines del Valle",
      "La Cima",
      "Las Cañadas",
      "Providencia",
    ];

    const normalizar = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const ubicacionNormalizada = normalizar(ubicacion);

    const zonaEncontrada = zonas.find(zona => ubicacionNormalizada.includes(normalizar(zona)));

    return zonaEncontrada || "";
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const rentabilidadAnual = propiedad.precio > 0 ? (propiedad.ingresos_mensuales * 12) / propiedad.precio * 100 : 0;

  const getRentabilidadColor = (rentabilidad) => {
    if (rentabilidad >= 7) return 'text-green-600';
    if (rentabilidad >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isFavorite = favorites.includes(String(propiedad.id));

  const [usuario, setUsuario] = useState({});

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5500/api/usuarios/${propiedad.userid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };
    obtenerUsuario();
  }, [propiedad.userid]);

  useEffect(() => {
    if (propiedad?.id) {
      fetch(`http://127.0.0.1:5500/api/plusvalia/${propiedad.id}`)
        .then(res => res.json())
        .then(data => setPlusvalia(data))
        .catch(err => console.error("Error obteniendo plusvalía", err));
    }
  }, [propiedad]);

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
            className="bg-slate-50 p-6 rounded-xl z-10 shadow-xl relative w-full max-w-3xl max-h-screen overflow-y-auto"
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
            <h2 className="text-2xl font-semibold mb-2 text-center text-gray-800">
              {propiedad.nombre}
            </h2>

            <div className="relative w-full h-auto mb-4 flex justify-between">
              <motion.img
                key={currentIndex}
                src={imagenes[currentIndex]}
                alt={`${propiedad.nombre} - Imagen ${currentIndex + 1}`}
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

              <div className="flex justify-center gap-1 mt-2">
                {imagenes.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === currentIndex ? "bg-black" : "bg-gray-300"
                      }`}
                  />
                ))}
              </div>
            </div>

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
                <span>{propiedad.banos}</span>
              </div>
              <div className="flex items-center gap-1">
                <BedSingle className="w-4 h-4 text-[#0077b6]" />
                <span>{propiedad.habitaciones}</span>
              </div>
              <span className="text-md text-gray-500 ml-auto">
                {propiedad.area}m²
              </span>
            </div>

            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              {propiedad.nombre}
            </h2>

            <div className="px-1 pb-3 max-h-32 overflow-y-auto text-gray-600 text-sm leading-relaxed text-justify scrollbar-thin scrollbar-thumb-gray-300">
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
              {window.location.pathname === "/inversiones" && (
                <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4">
                  {showROI && (
                    <p className="font-semibold">
                      ROI: <ROIWithTooltip value={propiedad.roi} />
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
                        {propiedad.precio > 0 ? `${Number(rentabilidadAnual).toFixed(2)}%` : 'No disponible'}
                      </span>
                    </p>
                  )}
                  {propiedad.paybackyears && (
                    <span className="text-sm text-gray-700 flex items-center">
                      <Clock size={20} className="mr-1 text-[#0077b6]" />
                      {(() => {
                        const años = Math.floor(propiedad.paybackyears);
                        const meses = Math.round((propiedad.paybackyears - años) * 12);
                        return `${años} ${años === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'} para recuperar inversión.`;
                      })()}
                    </span>
                  )}
                  <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4">
                    <TablaYGraficaPlusvalia propiedadId={propiedad.id} />
                  </div>
                  <div className="p-2 mt-2 border rounded-lg shadow-xl bg-slate-50 text-sm space-y-4 text-center text-gray-800">
                    <GraphicHistorico zona={extraerZonaDeUbicacion(propiedad.ubicacion)} />
                  </div>
                </div>
              )}
              <h3 className="text-lg text-gray-800 font-bold mt-5 text-start">Publicado por</h3>
              <div className="flex items-center gap-2 mt-2 mb-10">
                <img src={usuario.imagen} className="w-10 h-10 rounded-full hover:scale-105" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-700">{usuario.nombre}</p>
                    {usuario.verificado && (
                      <span title="Usuario Verificado">
                        <BadgeCheck size={16} fill="#0077b6" className="text-slate-100" />
                      </span>)}
                    {usuario.calificacion && (
                      <div title="Calificación en base a reseñas" className="flex items-center gap-1 text-gray-700 hover:scale-105">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < Math.floor(usuario.calificacion) ? "#0077b6" : "#ccc"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{usuario.telefono}</p>
                </div>
              </div>
              <iframe
                width="100%"
                height="250"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${propiedad.ubicacion}&output=embed`}
                allowFullScreen
                className="rounded-lg mb-5 mt-5 border border-md border-slate-400 shadow-lg"
              />
              <div className="flex flex-col md:flex-row gap-3 justify-center items-stretch w-full mt-4">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/52${usuario.telefono}?text=Hola, vi tu propiedad en SwiftHomes: ${propiedad.nombre}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full md:w-auto text-center items-center gap-2 bg-green-600 text-slate-50 px-4 py-2 rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
                >
                  <i className="bi bi-whatsapp"></i>
                  WhatsApp
                </a>

                {/* Llamar */}
                <a
                  href={`tel:+52${usuario.telefono}`}
                  className="flex items-center w-full md:w-auto text-center gap-2 bg-[#0077b6] text-slate-50 px-4 py-2 rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
                >
                  <Phone size={20} />
                  Llamar
                </a>

                {/* Correo */}
                <a
                  href={`mailto:${usuario.email}?subject=Interés en propiedad en SwiftHomes&body=Hola, estoy interesado en la propiedad ${propiedad.nombre}.`}
                  className="flex items-center w-full md:w-auto text-center gap-2 border border-red-600 bg-white text-red-600 px-4 py-2 font-semibold rounded-md hover:scale-105 transition-all duration-200 ease-in-out transform"
                >
                  <Mail size={20} />
                  Correo
                </a>
              </div>
            </div>
            <SimpleBot />
          </motion.div>
        </Dialog >
      )
      }
    </AnimatePresence >
  );
}
