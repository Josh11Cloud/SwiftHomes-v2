import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import house from '../../assets/images/casa-slate.png';
import Spinner from '../../components/Spinner.jsx';
import { db } from "../../firebase/config.js";
import { getDocs, collection } from 'firebase/firestore';
import PropertiesPerPage from '../../components/PropertiesPerPage.jsx';
import { toast } from 'sonner';

function Buy() {
  const [loading, setLoading] = useState(true);
  const [fullProps, setFullProps] = useState([]);
  const propertiesPerPage = 6;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "propiedades"));
        const fetchedProperties = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            ubicacion: data.ubicacion ?? '',
            tipo: data.tipo ?? '',
            precio: Number(data.precio) || 0,
            categoria: data.categoria ?? '',
          };
        });
        setFullProps(fetchedProperties);
        setLoading(false);
      } catch (error) {
        toast.error("Error al obtener propiedades:" + error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <Spinner />;

  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
        <div className='text-center mt-6 md:mt-0'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
            Encuentra tu nuevo <span className="text-gray-900">Hogar</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800">
            Empieza a explorar Propiedades
          </motion.p>
        </div>
        <motion.img
          src={house}
          alt="House"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>

      {/* PROPIEDADES */}
      <PropertiesPerPage
        properties={fullProps.filter(p => p.categoria?.toLowerCase().trim() === "venta")}
        category="venta"
        propertiesPerPage={propertiesPerPage}
      />
    </>
  );
}

export default Buy;