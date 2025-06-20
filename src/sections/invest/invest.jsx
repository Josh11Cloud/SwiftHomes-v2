import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Spinner from "../../components/Spinner.jsx";
import { toast } from "sonner";
import PropertiesPerPage from "../../components/PropertiesPerPage";

function Invest() {
  const [loading, setLoading] = useState(true);
  const [fullProps, setFullProps] = useState([]);
  const [filtradas, setFiltradas] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://192.168.100.64:5500/api/propiedades");
      const { properties } = await res.json();

      const propiedadesConROI = await Promise.all(
        properties.map(async (prop) => {
          try {
            const roiRes = await fetch(`http://192.168.100.64:5500/api/roi/${prop.id}`);
            const roiData = await roiRes.json();

            return {
              ...prop,
              roi: roiData.roi_anual,
              ingresoAnual: roiData.ingreso_anual,
              utilidadAnual: roiData.utilidad_anual,
              plazoDelRetorno: roiData.payback_years,
            };
          } catch (e) {
            console.error("Error al calcular ROI:", e);
            return { ...prop, roi: null, plazoDelRetorno: null };
          }
        })
      );

      setFullProps(propiedadesConROI);
    } catch (error) {
      toast.error("Error cargando propiedades:" + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(fullProps);

  useEffect(() => {
    const filtradasTemp = fullProps.filter((p) => p.isinvestment === true);
    setFiltradas(filtradasTemp);
    console.log("Filtradas:", filtradasTemp);
  }, [fullProps]);

  const descartadas = fullProps.filter(
    (p) => p.isinvestment === true && (p.roi === null || p.ingresoAnual === undefined)
  );

  if (loading) return <Spinner />;

  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
        <div className="text-center mt-6 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100"
          >
            Invierte en tu <span className="text-gray-900">Futuro</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            Multiplica tu dinero con propiedades seleccionadas para inversión
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/barra-grafica.png"
          alt="grafica"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>

      {descartadas.length > 0 && (
        <div className="text-sm text-yellow-600 text-center mb-4">
          ⚠️ {descartadas.length} propiedades marcadas para inversión fueron omitidas por falta de datos.
        </div>
      )}

      {/* PROPIEDADES */}
      {!loading && filtradas.length > 0 && (
        <PropertiesPerPage
          key={filtradas.length}
          initialProperties={filtradas}
          showROI={true}
          propertiesPerPage={6}
        />
      )}
    </>
  );
}

export default Invest;