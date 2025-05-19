import React, { useEffect, useState } from 'react';
import SummaryCard from './Summarycard';
import { Home, Heart, Percent } from 'lucide-react';
import Spinner from '../../components/Spinner';
import { motion } from 'framer-motion';
import Layout from '../../assets/images/layout.png';

const Dashboard = ({ properties }) => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avgROI, setAvgROI] = useState(0);

      useEffect(() => {
        const favs = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(favs);

        if (Array.isArray(properties)) {
          const totalROI = properties.reduce((sum, prop) => sum + (prop.roi || 0), 0);
          const avg = properties.length > 0 ? (totalROI / properties.length).toFixed(2) : 0;
          setAvgROI(avg);
        } else {
          setAvgROI(0);
        }
          const timer = setTimeout(() => setLoading(false), 500);
          return () => clearTimeout(timer);
      }, [properties]);
        if (loading) {
        return (
          <Spinner />
        );
      }
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
      Tu panel de control <span className="text-gray-900">Inmobiliario</span></motion.h1>
      <motion.p
      initial={{ opacity: 0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 1 }}
      className="text-base md:text-lg text-slate-800">Monitorea tus propiedades guardadas, análisis de rentabilidad y automatizaciones en un solo lugar.</motion.p>
      </div>
      <motion.img
      src={Layout}
      alt="Layout"
      initial={{ opacity: 0, y:-20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 0.8 }}
      className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
    </section>

    {/* CONTENIDO */}
    {loading ? (
      <Spinner />
    ) : (
      <>
        {(!Array.isArray(properties) || properties.length === 0) ? (
          <p className='text-center mt-10'>No hay datos válidos para mostrar el Dashboard.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <SummaryCard title="Propiedades totales" value={properties?.length || 0} icon={<Home />} color="border-blue-500" />
            <SummaryCard title="Favoritos" value={favorites.length} icon={<Heart />} color="border-pink-500" />
            <SummaryCard title="ROI Promedio (%)" value={`${avgROI}%`} icon={<Percent />} color="border-green-500" />
          </div>
        )}
      </>
    )}
  </>
);
}
export default Dashboard;