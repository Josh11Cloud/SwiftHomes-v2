import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Spinner from '../../components/Spinner.jsx';
import PropertiesPerPage from '../../components/PropertiesPerPage.jsx';
import { toast } from 'sonner';

function Buy() {
  const [loading, setLoading] = useState(true);
  const [fullProps, setFullProps] = useState([]);
  const propertiesPerPage = 6;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5500/api/propiedades");
        if (!res.ok) throw new Error("No se pudo obtener propiedades");

        const fetchedProperties = await res.json();

        const parsedProperties = fetchedProperties.map((p) => ({
          id: p.id || crypto.randomUUID(),
          nombre: p.nombre,
          precio: Number(p.precio) || 0,
          ubicacion: p.ubicacion ?? '',
          tipo: p.tipo ?? '',
          categoria: p.categoria ?? '',
          imagen: p.imagen,
          descripcion: p.descripcion,
        }));

        setFullProps(parsedProperties);
        setLoading(false);
      } catch (error) {
        toast.error("Error al obtener propiedades: " + error.message);
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
          src="/assets/images/casa.png"
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
        initialProperties={fullProps.filter(p => p.categoria?.toLowerCase().trim() === "venta")}
      />
    </>
  );
}

export default Buy;