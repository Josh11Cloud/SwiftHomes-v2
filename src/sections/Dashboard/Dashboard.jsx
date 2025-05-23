import { useContext, useState, useEffect } from 'react';
import { useFavorites } from '../../../context/FavoritesContext';
import { PropertiesContext } from '../../../context/PropertiesContext'
import PropertyList from '../../../components/PropertyList';
import MyProperties from '../../../components/MyProperties';
import Header from './Header';
import Layout from '../../../assets/images/layout.png'
import { motion } from 'framer-motion';
import SummaryCard from './Summarycard'
import Spinner from '../../../components/Spinner';
import { Home, Heart, Percent, ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = () => {
  const { properties } = useContext(PropertiesContext);
  const { favorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [avgROI, setAvgROI] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyProperties, setShowMyProperties] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    const totalROI = properties.reduce((sum, prop) => sum + (prop.roi || 0), 0);
    const avg = properties.length > 0 ? (totalROI / properties.length).toFixed(2) : 0;
    setAvgROI(avg);
    return () => clearTimeout(timer);
  }, [properties]);

  const favoriteProperties = properties.filter(property =>
    favorites.includes(String(property.id))
  );

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
  };

  const toggleMyProperties = () => {
    setShowMyProperties(!showMyProperties);
  };

  return (
    <div>
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
            className="text-base md:text-lg text-slate-800">Monitorea tus propiedades guardadas, análisis de rentabilidad y automatizaciones en la vida.</motion.p>
        </div>
        <motion.img
          src={Layout}
          alt="Layout"
          initial={{ opacity: 0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
      </section>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <Header />
          <div className="mb-4">
            <button className="flex items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200" onClick={toggleFavorites}>
              <h2 className='text-gray-600 font-semibold text-lg'>Mis Propiedades Favoritas</h2>
              {showFavorites ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showFavorites && (
              <div className="p-4">
                {favoriteProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {favoriteProperties.map(property => (
                      <PropertyList key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-600 text-sm text-center'>No has agregado propiedades a favoritos.</p>
                )}
              </div>
            )}
            <button className="flex border-t border-slate-400 items-center justify-center w-full p-4 bg-slate-100 rounded hover:bg-slate-200" onClick={toggleMyProperties}>
              <h3 className='text-gray-600 font-semibold text-lg'>Mis Propiedades</h3>
              {showMyProperties ? <ChevronUp /> : <ChevronDown />}
            </button>
            {showMyProperties && (
              <div className="p-4">
                <MyProperties />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <SummaryCard title="Propiedades totales" value={properties?.length || 0} icon={<Home />} color="border-[#0077b6]" />
            <SummaryCard title="Favoritos" value={favorites.length} icon={<Heart />} color="border-red-600" />
            <SummaryCard title="ROI Promedio (%)" value={`${avgROI}%`} icon={<Percent />} color="border-green-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;