    import { useState } from 'react';
    import { Home, Search, Filter, DollarSign } from 'lucide-react'; 
    import { properties } from '../../data/properties.js';
    import PropertyCard from '../../components/Propertycard.js';
    import PropertyModal from '../../components/PropertyModal.jsx';
    import { motion } from 'framer-motion'
    import house from '../../assets/images/house-white.png';

    function Buy(){
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 6;

    const filteredProperties = properties
    .filter((property) => property.category === 'venta') 
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

    return (
        <>
                    {/* HERO */}
                    <div className='bg-black/50 w-full py-20 px-6 h-full text-slate-50 flex flex-col items-center bg-gradient-to-r from-[#2d7195] to-[#0077B6]'>
                    <motion.h1
                    initial={{ opacity: 0, y:-20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration: 0.8 }}
                    className='text-4xl md:text-5xl font-bold mb-4'
                    >Encuentra tu nuevo <span className="text-gray-900">Hogar</span>
                    </motion.h1>
                    <motion.img 
                    src={house} 
                    alt="House"
                    initial={{ opacity: 0, y:-20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration: 0.8 }} 
                    className="w-full sm:w-full md:w-1/2 h-auto max-h-64 object-contain"/>
                    <motion.p
                    initial={{ opacity: 0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration: 1 }}
                    className='text-lg md:text-xl max-w-2xl text-gray-800'>
                    Empieza a explorar propiedades
                    </motion.p>
                    </div>
                {/* Filtros y Propiedades */}
        <div className="bg-slate-50">
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8 w-full max-w-3xl mx-auto">
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
        </div>
      </div>
        {/* CARDS */}
        {currentProperties.length === 0 ? (
        <p className='text-gray-600 text-center mb-10'>No hay propiedades que coincidan con los filtros.</p>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {currentProperties.map((property) => (
            <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={(property) => setSelectedProperty(property)} 
            />
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
    </>
    );
}
export default Buy;