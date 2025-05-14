    import { motion } from 'framer-motion'
    import {  useEffect, useState } from 'react';
    import { Home, Search, Filter, DollarSign } from 'lucide-react'; 
    import { properties } from '../../data/properties.js';
    import PropertyCard from '../../components/Propertycard.js';
    import PropertyModal from '../../components/PropertyModal.jsx';
  
const Invest = () => {
        const [minPrice, setMinPrice] = useState('');
        const [maxPrice, setMaxPrice] = useState('');
        const [propertyType, setPropertyType] = useState('');
        const [searchTerm, setSearchTerm] = useState('');
        const [sortOrder, setSortOrder] = useState('');
        const [selectedProperty, setSelectedProperty] = useState(null);
        const [currentPage, setCurrentPage] = useState(1);
        const propertiesPerPage = 6;
        const [roiData, setRoiData] = useState([]);
        const [fullProps, setFullProps] = useState([]);

        useEffect(() => {
        fetch('https://script.google.com/macros/s/AKfycbzSUx1ZBR-jBlGpQQF6deWkRC0HgRJmLhYqhNf0YPyIEgTM0Cz5lIaFf0u93MKQwOPX/exec')
        .then(res => res.json())
        .then(data => {
            console.log('Datos de ROI recibidos:', data);
            setRoiData(data);
        })
        .catch(err => console.error('Error:', err));
        }, []);

        useEffect(() => {
        if (roiData.length > 0) {
            console.log('Fusionando datos de ROI con propiedades...');
            const merged = properties.map(prop => {
        const roiMatch = roiData.find(roi => Number(roi.id) === prop.id);
        return {
            ...prop,
            roi: roiMatch ? `${(roiMatch.ROI * 100).toFixed(2)}` : 'N/A'
        };
        });
            console.log('Datos fusionados:', merged);
            setFullProps(merged);
        }
        }, [roiData]);

          const filteredProperties = fullProps
          .filter((property) => property.category === 'venta' && property.isInvestment)
          .filter((property) => {
            const searchTermLower = searchTerm.toLowerCase().trim();
            const minPriceValue = minPrice === '' ? 0 : parseInt(minPrice);
            const maxPriceValue = maxPrice === '' ? Infinity : parseInt(maxPrice);
            const matchesPrice = property.price >= minPriceValue && property.price <= maxPriceValue;
            const matchesSearchTerm = property.location.toLowerCase().includes(searchTermLower) ||
                                    property.type.toLowerCase().includes(searchTermLower) ||
                                    property.city.toLowerCase().includes(searchTermLower);
            const matchesPropertyType = propertyType === '' || property.type === propertyType;
            return matchesPrice && (searchTerm === '' || matchesSearchTerm) && matchesPropertyType;
        })
        .sort((a, b) => {
            if (sortOrder === 'desc') {
            return b.price - a.price;
            } else if (sortOrder === 'asc') {
            return a.price - b.price;
            } else {
            return 0;
            }
        });
    
          const indexOfLastProperty = currentPage * propertiesPerPage;
            const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
            const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

    return(
        <section className='min-h-screen w-full bg-cover bg-center'>
            {/* HERO */}
            <div className='bg-black/50 w-full py-20 px-6 h-full text-slate-50 flex flex-col items-center bg-gradient-to-r from-[#2d7195] to-[#0077B6]'>
            <motion.h1
            initial={{ opacity: 0, y:-20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration: 0.8 }}
            className='text-4xl md:text-5xl font-bold mb-4'
            >Invierte con <span className='text-gray-900'>Inteligencia</span> 
            </motion.h1>
            <motion.p
            initial={{ opacity: 0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration: 1 }}
            className='text-lg md:text-xl max-w-2xl text-gray-800'>
                Multiplica tu dinero con propiedades seleccionadas para inversión
            </motion.p>
            </div>
                      {/* Filtros */}
                      <div className="flex flex-wrap overflow-x-auto px-4 py-2 items-center justify-center gap-3">
                      <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Buscar Por Ciudad, Zona o Tipo"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full min-w-[150px] px-4 py-2 text-sm sm:text-base rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6] placeholder:text-gray-500 text-center"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
                      </div>
                      <div className="relative w-full sm:w-48">
                      <select
                        className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                        value={sortOrder}
                        onChange={(e) => {setSortOrder(e.target.value); setCurrentPage(1);}}
                      >
                        <option value="desc">Mayor a Menor</option>
                        <option value="asc">Menor a Mayor</option>
                      </select>
                      <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
                      </div>
                      <section className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2">
                      <div className="relative w-full sm:w-64">
                        <select
                          className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          value={propertyType}
                          onChange={(e) => {setPropertyType(e.target.value); setCurrentPage(1);}}
                        >
                          <option value="">Cualquier Tipo de Propiedad</option>
                          <option value="Casa">Casa</option>
                          <option value="Departamento">Departamento</option>
                        </select>
                        <Home className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
                      </div>
                        <div className="relative w-full sm:w-40">
                          <label className="text-lg font-medium"></label>
                          <input
                            type="number"
                            value={minPrice}
                            placeholder='Precio Mínimo'
                            onChange={(e) => {setMinPrice(e.target.value); setCurrentPage(1);}}
                            className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          />
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
                        </div>
                        <div className="relative w-full sm:w-40">
                          <label className="text-lg font-medium"></label>
                          <input
                            type="number"
                            value={maxPrice}
                            placeholder='Precio Máximo'
                            onChange={(e) => {setMaxPrice(e.target.value); setCurrentPage(1);}}
                            className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          />
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
                        </div>
                      </section>
                      </div>
                      <button className="bg-[#0077B6] text-[#F8F9FA] px-4 py-2 text-sm rounded-lg hover:bg-[#005f87] mt-5 transition mx-auto block" onClick={() => {   setPropertyType(''); setMinPrice(''); setMaxPrice(''); setSearchTerm('');setSortOrder('');}}>Limpiar filtros</button>

                              {/* CARDS */}
                              {currentProperties.length === 0 ? (
                              <p className='text-gray-600 text-center mb-10'>No hay propiedades que coincidan con los filtros.</p>
                              ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                                {currentProperties.map((property) => (
                                <div key={property.id}>
                                    <PropertyCard 
                                    property={property} 
                                    onClick={() => setSelectedProperty(property)} 
                                    />
                                    <p className="font-semibold text-center text-sm text-green-700">ROI: {property.roi === 'N/A' ? 'Cargando...' : `${property.roi}%`}</p>
                                </div>
                                ))}
                              </div>
                              )}
                                {/* PropertyModal*/}
                                <PropertyModal 
                                isOpen={!!selectedProperty} 
                                onClose={() => setSelectedProperty(null)} 
                                property={selectedProperty} 
                                />
                              {/* PAGINATION */}
                              <div className='flex justify-center items-center gap-2 mt-4'>
                              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              className='px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100'>
                                Anterior
                              </button>
                      
                              {[...Array(Math.ceil(filteredProperties.length / propertiesPerPage))].map(
                                (_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-[#0077B6] text-white' : 'bg-slate-100 text-gray-700 hover:bg-slate-200'}`}>
                                  {i + 1}
                                </button>
                              ))}
                      
                              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProperties.length / propertiesPerPage)))}
                              className='px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100'>
                                Siguiente
                              </button>
                            </div>
        </section>
    );
}
export default Invest;