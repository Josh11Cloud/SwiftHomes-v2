import { useContext, useState, useEffect } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import { PropertiesContext } from "../../context/PropertiesContext";
import PropertyList from "../../components/PropertyList";
import MyProperties from "../../components/MyProperties";
import Header from "./Header";
import { motion } from "framer-motion";
import SummaryCard from "./Summarycard";
import Spinner from "../../components/Spinner";
import ActivityHistory from "../../components/MyActivity";
import {
  Home,
  Heart,
  Percent,
  ChevronDown,
  ChevronUp,
  Upload,
  AlertOctagon,
  Folder,
  HandCoins,
  Database,
} from "lucide-react";
import Graphic from "./Graphic";
import getVisitasMensuales from "./Analytics";
import { getEstadoPropiedades } from "./Analytics";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { getDocs, collection } from "firebase/firestore";
import db from "../../firebase/config";

const Dashboard = () => {
  const { properties } = useContext(PropertiesContext);
  const { favorites } = useFavorites();
  const { user } = useAuth();
  const userId = user?.userId;

  const [loading, setLoading] = useState(true);
  const [avgROI, setAvgROI] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyProperties, setShowMyProperties] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showGraphic, setShowGraphic] = useState(false);
  const [actividadCards, setActividadCards] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [estados, setEstados] = useState({});
  const [fullProps, setFullProps] = useState([]);

  useEffect(() => {
    const fetchEstados = async () => {
      if (userId) {
        const estadosPropiedades = await getEstadoPropiedades(userId);
        setEstados(estadosPropiedades);
      }
    };
    fetchEstados();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const { chartData, actividadCards } = await getVisitasMensuales(userId);
        setChartData(chartData);
        setActividadCards(actividadCards);
      } 
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    console.log("Efecto ejecutado para cargar chartData"); 
    const obtenerDatos = async () => {
      try {
        const snapshot = await getDocs(collection(db, "propiedades"));
        const visitasPorMes = {};

        snapshot.forEach((doc) => {
          const visitas = doc.data().visitas;
          if (visitas && visitas.cantidad && visitas.fecha) {
            const mes = new Date(visitas.fecha.toDate()).toLocaleString(
              "default",
              {
                month: "short",
              }
            );
            visitasPorMes[mes] = (visitasPorMes[mes] || 0) + visitas.cantidad;
          }
        });

        const data = Object.entries(visitasPorMes).map(([mes, cantidad]) => ({
          mes,
          visitas: cantidad,
        }));

        console.log("Datos para el gráfico:", data); 

        setChartData(data);
        console.log("Estado actualizado con chartData:", data);
      } catch (error) {
        console.error("Error al obtener propiedades:", error);
      }
    };

    obtenerDatos();
  }, []);

  useEffect(() => {
    let intervalId;
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "propiedades"));
        const propiedades = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbzedbE6kMBw5QEp94h-jfxyymxtEZrv0dh9OPqnRosiF9HDOKkx1VGXGT-FaVyw3-sI/exec"
        );
        const rois = await res.json();

        const propiedadesConROI = propiedades.map((prop) => {
          const roiData = rois
            .slice(1)
            .find(
              (r) => r[0] === (prop.sheetId ? prop.sheetId.toString() : null)
            );
          const roiIndex = rois[0].indexOf("ROI");
          const rentabilidadAnualIndex = rois[0].indexOf("Rentabilidad Anual");
          const plazoDelRetornoIndex = rois[0].indexOf("Plazo del Retorno");
          return {
            ...prop,
            roi: roiData ? roiData[roiIndex] : null,
            rentabilidadAnual: roiData ? roiData[rentabilidadAnualIndex] : null,
            plazoDelRetorno: roiData ? roiData[plazoDelRetornoIndex] : null,
          };
        });

        setFullProps(propiedadesConROI);
        setLoading(false);
      } catch (error) {
        toast.error("Error cargando propiedades o ROI:" + error);
        clearInterval(intervalId);
      }
    };

    fetchData();

    intervalId = setInterval(fetchData, 30000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (fullProps && fullProps.length > 0) {
      const propertiesWithROI = fullProps.filter((prop) => prop.roi);
      const totalROI = propertiesWithROI.reduce((sum, prop) => {
        let roiValue;
        if (typeof prop.roi === "number") {
          roiValue = prop.roi;
        } else {
          roiValue = parseFloat(String(prop.roi).replace("%", "").trim());
        }
        return sum + (isNaN(roiValue) ? 0 : roiValue);
      }, 0);
      const avg =
        propertiesWithROI.length > 0 && totalROI !== 0
          ? (totalROI / propertiesWithROI.length).toFixed(2)
          : 0;
      const avgROIValue =
        avg === "Infinity" || avg === "-Infinity" || isNaN(avg) ? 0 : avg;
      setAvgROI(avgROIValue);
    }
  }, [fullProps]);

  const favoriteProperties = properties.filter((property) =>
    favorites.includes(String(property.id))
  );

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const toggleMyProperties = () => {
    setShowMyProperties(!showMyProperties);
  };

  const toggleGraphic = () => {
    setShowGraphic(!showGraphic);
  };

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
          <div className="mb-4">
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
                Actividad Reciente
              </h2>
              {showActivity ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showActivity && (
              <div className="p-4 space-y-4">
                <ActivityHistory />
                <h3 className="text-2xl text-center font-bold border-t border-slate-400 text-[#0077b6]">
                  Historial de visitas a tus propiedades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {actividadCards.map((item, i) => (
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            <h4 className="text-[#0077b6] font-semibold text-2xl text-center m-auto flex items-center">
              <Database className="mr-2" size={20} />
              Más Datos
            </h4>
            <SummaryCard
              title="Propiedades totales"
              value={properties?.length || 0}
              icon={<Home />}
              color="border-[#0077b6]"
            />
            <SummaryCard
              title="Publicadas"
              value={estados.publicada || 0}
              icon={<Upload />}
              color="border-[#0077b6]"
            />
            <SummaryCard
              title="Pendientes"
              value={estados.pendiente || 0}
              icon={<AlertOctagon />}
              color="border-[#0077b6]"
            />
            <SummaryCard
              title="Archivadas"
              value={estados.archivada || 0}
              icon={<Folder />}
              color="border-[#0077b6]"
            />
            <SummaryCard
              title="Vendidas"
              value={estados.vendida || 0}
              icon={<HandCoins />}
              color="border-[#0077b6]"
            />
            <SummaryCard
              title="Favoritos"
              value={favorites.length}
              icon={<Heart />}
              color="border-red-600"
            />
            {!isNaN(avgROI) && avgROI !== null && avgROI !== undefined ? (
              <SummaryCard
                title="ROI Promedio (%)"
                value={`${avgROI}%`}
                icon={<Percent />}
                color="border-green-600"
              />
            ) : (
              <p>No hay propiedades con ROI</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
