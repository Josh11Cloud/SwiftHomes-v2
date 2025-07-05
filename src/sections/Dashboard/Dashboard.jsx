import { useState, useEffect } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import MyProperties from "../../components/MyProperties";
import Header from "./Header";
import { motion } from "framer-motion";
import PropertyList from "../../components/PropertyList";
import SummaryCard from "./Summarycard";
import Spinner from "../../components/Spinner";
import ActivityHistory from "../../components/MyActivity";
import exportarPDF from '../../components/ExportPDF';
import {
  Home,
  Heart,
  Clock,
  Percent,
  ChevronDown,
  ChevronUp,
  Upload,
  Folder,
  HandCoins,
  Database,
} from "lucide-react";
import Graphic from "./Graphic";
import getVisitasMensuales from "./Analytics";
import { getEstadoPropiedades } from "./Analytics";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const userid = user?.userid;

  const [loading, setLoading] = useState(true);
  const [showVisitas, setShowVisitas] = useState(false);
  const [showAllVisitas, setShowAllVisitas] = useState(false);
  const [avgROI, setAvgROI] = useState(0);
  const [avgPaybackYears, setAvgPaybackYears] = useState(0);
  const [avgRentabilidadAnual, setAvgRentabilidadAnual] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyProperties, setShowMyProperties] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showGraphic, setShowGraphic] = useState(false);
  const [actividadCards, setActividadCards] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [estados, setEstados] = useState({});
  const [fullProps, setFullProps] = useState([]);
  const [plusvaliaData, setPlusvaliaData] = useState([]);

  useEffect(() => {
    const fetchEstados = async () => {
      if (userid) {
        const estadosPropiedades = await getEstadoPropiedades(userid);
        setEstados(estadosPropiedades);
      }
    };
    fetchEstados();
  }, [userid]);

  useEffect(() => {
    const fetchData = async () => {
      if (userid) {
        const { chartData, actividadCards } = await getVisitasMensuales(userid);
        setChartData(chartData);
        setActividadCards(actividadCards);
      }
    };
    fetchData();
  }, [userid]);

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const res = await fetch(
          `http://192.168.100.64:5500/api/propiedades/usuario`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
        const data = await res.json();
        setFullProps(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error al cargar propiedades desde el backend");
      }
    };

    if (userid) fetchPropiedades();
  }, [userid]);

  useEffect(() => {
    if (fullProps && fullProps.length > 0) {
      const propertiesWithROI = fullProps.filter((prop) => prop.roi);
      const totalROI = propertiesWithROI.reduce((sum, prop) => {
        let roiValue = typeof prop.roi === "number"
          ? prop.roi
          : parseFloat(String(prop.roi).replace("%", "").trim());
        return sum + (isNaN(roiValue) ? 0 : roiValue);
      }, 0);

      const avg =
        propertiesWithROI.length > 0 && totalROI !== 0
          ? (totalROI / propertiesWithROI.length).toFixed(2)
          : 0;

      const avgROIValue =
        avg === "Infinity" || avg === "-Infinity" || isNaN(avg) ? 0 : avg;

      setAvgROI(avgROIValue);

      const propertiesWithPlazo = fullProps.filter((prop) => prop.plazo_ret);
      const totalPlazo = propertiesWithPlazo.reduce((sum, prop) => {
        return sum + (Number(prop.plazo_ret) || 0);
      }, 0);

      const avgPlazo =
        propertiesWithPlazo.length > 0 && totalPlazo !== 0
          ? (totalPlazo / propertiesWithPlazo.length).toFixed(1)
          : 0;

      setAvgPaybackYears(avgPlazo);

      const propertiesWithIngreso = fullProps.filter(
        (prop) => prop.ingresos_mensuales && prop.precio
      );

      const totalRentas = propertiesWithIngreso.reduce((sum, prop) => {
        const ingreso = Number(prop.ingresos_mensuales) || 0;
        const precio = Number(prop.precio) || 1;
        const rentabilidad = (ingreso * 12) / precio * 100;
        return sum + (isNaN(rentabilidad) ? 0 : rentabilidad);
      }, 0);

      const avgRentabilidad =
        propertiesWithIngreso.length > 0 && totalRentas !== 0
          ? (totalRentas / propertiesWithIngreso.length).toFixed(2)
          : 0;

      setAvgRentabilidadAnual(avgRentabilidad);
    }
  }, [fullProps]);

  const toggleMyProperties = () => {
    setShowMyProperties(!showMyProperties);
  };

  const toggleGraphic = () => {
    setShowGraphic(!showGraphic);
  };

  const favoriteProperties = fullProps.filter((property) =>
    favorites.includes(String(property.id))
  );

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  if (!user) return <p className="text-center text-gray-600 mt-6 mb-6">Necesitas una cuenta para acceder al Dashboard</p>;

  return (
    <div>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
        <div className="text-center mt-6 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100"
          >
            Tu panel de control{" "}
            <span className="text-gray-900">Inmobiliario</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            Monitorea tus propiedades guardadas, análisis de rentabilidad y
            automatizaciones en la vida.
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/layout.png"
          alt="Layout"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Header />
          <div className="border-t border-gray-600">
            <button
              className="flex items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200"
              onClick={toggleFavorites}
            >
              <h2 className="text-gray-600 font-semibold text-lg">
                Mis Propiedades Favoritas
              </h2>
              {showFavorites ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showFavorites && (
              <div className="p-4">
                {favoriteProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {favoriteProperties.map((property) => (
                      <PropertyList key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center">
                    No has agregado propiedades a favoritos.
                  </p>
                )}
              </div>
            )}
            <button
              className="flex border-t border-slate-400 items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200"
              onClick={() => setShowActivity(!showActivity)}
            >
              <h2 className="text-gray-600 font-semibold text-lg">
                Mi Actividad
              </h2>
              {showActivity ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showActivity && (
              <div className="p-4">
                <ActivityHistory />
              </div>
            )}
            <button
              className="flex border-t border-slate-400 items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200"
              onClick={() => setShowVisitas(!showVisitas)}
            >
              <h2 className="text-gray-600 font-semibold text-lg">
                Historial de visitas a tus propiedades
              </h2>
              {showVisitas ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showVisitas && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {actividadCards.slice(0, showAllVisitas ? actividadCards.length : 3).map((item, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl shadow-md border flex items-center justify-between"
                    >
                      <div>
                        <p className="text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {item.valor}
                        </p>
                      </div>
                      <div className="bg-slate-100 p-2 rounded-full">
                        {item.icon}
                      </div>
                    </div>
                  ))}
                </div>
                {actividadCards.length > 3 && (
                  <button
                    className="text-[#0077b6] hover:text-[#005f87]"
                    onClick={() => setShowAllVisitas(!showAllVisitas)}
                  >
                    {showAllVisitas ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </div>
            )}
            <button
              className="flex border-t border-slate-400 items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200"
              onClick={toggleMyProperties}
            >
              <h3 className="text-gray-600 font-semibold text-lg">
                Mis Propiedades
              </h3>
              {showMyProperties ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showMyProperties && (
              <div className="p-4">
                <MyProperties />
              </div>
            )}
            <button
              className="flex border-t border-slate-400 items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200"
              onClick={toggleGraphic}
            >
              <h3 className="text-gray-600 font-semibold text-lg">
                Gráfica de Vistas Mensuales
              </h3>
              {showGraphic ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showGraphic && (
              <div className="p-4" style={{ width: "100%", height: "300px" }}>
                <Graphic data={chartData} />
              </div>
            )}
            <div className="flex justify-between items-center p-4">
              <h4 className="text-[#0077b6] font-semibold text-2xl flex items-center">
                <Database className="mr-2" size={20} />
                Más Datos
              </h4>
              <button
                onClick={exportarPDF}
                className="bg-red-600 text-slate-50 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Exportar métricas en PDF
              </button>
            </div>
            <div id="metricas-pdf" className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
              <SummaryCard
                title="Propiedades Publicadas"
                value={estados.publicada || 0}
                icon={<Upload />}
                color="border-[#0077b6]"
              />
              <SummaryCard
                title="Propiedades Archivadas"
                value={estados.archivada || 0}
                icon={<Folder />}
                color="border-[#0077b6]"
              />
              <SummaryCard
                title="Propiedades Vendidas"
                value={estados.vendida || 0}
                icon={<HandCoins />}
                color="border-[#0077b6]"
              />
              <SummaryCard
                title="Propiedades Totales"
                value={(estados.publicada || 0) + (estados.archivada || 0) + (estados.vendida || 0)}
                icon={<Home />}
                color="border-[#0077b6]"
              />
              <SummaryCard
                title="Favoritos"
                value={favorites.length}
                icon={<Heart />}
                color="border-red-600"
              />
              {!isNaN(avgROI) && avgROI !== null && avgROI !== undefined ? (
                <>
                  <SummaryCard
                    title="ROI Promedio (%)"
                    value={`${avgROI}%`}
                    icon={<Percent />}
                    color="border-green-600"
                  />
                  <SummaryCard
                    title="Plazo Promedio (años)"
                    value={`${avgPaybackYears}`}
                    icon={<Clock />}
                    color="border-yellow-500"
                  />
                  <SummaryCard
                    title="Rentabilidad Anual Promedio (%)"
                    value={`${avgRentabilidadAnual}`}
                    icon={<Percent />}
                    color="border-amber-600"
                  />
                </>
              ) : (
                <p>No hay propiedades con ROI</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;