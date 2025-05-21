import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import grafica from '../../assets/images/barra-grafica.png';
import Spinner from '../../components/Spinner.jsx';
import { db } from "../../firebase/config.js";
import { getDocs, collection } from 'firebase/firestore';
import PropertiesPerPage from '../../components/PropertiesPerPage.jsx';
import { toast } from 'sonner';

function Invest() {
  const [loading, setLoading] = useState(true);
  const [fullProps, setFullProps] = useState([]);
  const propertiesPerPage = 6;

useEffect(() => {
  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "propiedades"));
      const propiedades = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));

      const res = await fetch("https://script.google.com/macros/s/AKfycbzedbE6kMBw5QEp94h-jfxyymxtEZrv0dh9OPqnRosiF9HDOKkx1VGXGT-FaVyw3-sI/exec");
      const rois = await res.json();

      const propiedadesConROI = propiedades.map(prop => {
        const roiData = rois.slice(1).find(r => r[0] === (prop.sheetId ? prop.sheetId.toString() : null));
        return {
          ...prop,
          roi: roiData ? roiData[5] : null,
          rentabilidadMensual: roiData ? (parseFloat(roiData[6]) * 100).toFixed(2) : null,
        };
      });

      setFullProps(propiedadesConROI);
      setLoading(false);

    } catch (error) {
      toast.error("Error cargando propiedades o ROI:"+ error);
    }
  };

  fetchData();

  const intervalId = setInterval(fetchData, 30000); 
  return () => clearInterval(intervalId);

}, []); 

  if (loading) return <Spinner />;

  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
      <div className='text-center mt-6 md:mt-0'>
      <motion.h1
      initial={{ opacity: 0, y:-20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 0.8 }}
      className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
        Invierte con <span className="text-gray-900">Inteligencia</span></motion.h1>
        <motion.p 
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 1 }}
        className="text-base md:text-lg text-slate-800">Multiplica tu dinero con propiedades seleccionadas para inversión
        </motion.p>
        </div>
         <motion.img 
         src={grafica} 
         alt="grafica"
        initial={{ opacity: 0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.8 }} 
         className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
      </section> 

      {/* PROPIEDADES */}
      <PropertiesPerPage
      properties={fullProps.filter(p => p.isInvestment)}
        propertiesPerPage={propertiesPerPage}
        showROI={true}
      />
    </>
  );
}

export default Invest;
