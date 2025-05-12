import './App.css';
import { Home, Search, Filter, DollarSign } from 'lucide-react'; 
import logo from './assets/icons/SwiftHomes-logo-png.png';
import hero from './assets/images/hero-png.png'
import PropertyCard from './components/Propertycard.js';
import { properties } from './data/properties.js';
import { Heart } from 'lucide-react';
import ScrollToTop from './components/ScrollToTop.jsx';
import { useNavigate, Link, Outlet } from 'react-router';
import WhySwiftHomes from './components/WhySwiftHomes';
import { useState } from 'react';
import PropertyModal from './components/PropertyModal';

function App() {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;
  const navigate = useNavigate();
const [selectedProperty, setSelectedProperty] = useState(null);

  const filteredProperties = properties
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

  const handleFavoritesClick = () => {
    navigate('/favoritos');
  };

    return (
      <>
        <ScrollToTop />
      {/* El contenido principal */}
      <header className="bg-white shadow-md">
      <nav className="flex items-center justify-start gap-4 mb-4 sm:mb-0 w-full px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start gap-2 mb-4 sm:mb-0 w-full px-4 py-2 sm:px-6 lg:px-8">
          <img className="h-16 sm:h-12 md:h-16 w-auto" src={logo} alt="Logo" />
            <h1 className="text-1xl font-bold text-[#212529] sm:text-2xl md:text-3xl lg:text-4xl">SwiftHomes</h1>
        </div>
            <ul className="flex flex-col sm:flex-row justify-between items-center gap-4 text-base sm:text-lg font-semibold text-[#212529]">
              <Link className="hover:text-[#0077b6] transition" to="/">Comprar</Link>
              <Link className="hover:text-[#0077b6] transition" to="/">Rentar</Link>
              <Link className="hover:text-[#0077b6] transition" to="/">Inversiones</Link>
              <Link className="hover:text-[#0077b6] transition" to="/contacto">Contacto</Link>
              <button onClick={handleFavoritesClick} className="text-gray-700 hover:text-[#0077B6]"><Heart className='hover:scale-105' /></button>
            </ul>
        </nav>   
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
      <div className='text-center mt-6 md:mt-0'>
      <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
        Bienvenido a <span className="text-gray-900">SwiftHomes</span></h2>
        <p className="text-base md:text-lg text-slate-800">Tu plataforma inteligente para comprar o rentar propiedades</p>
        </div>
         <img src={hero} alt="Hero" className="w-full sm:w-full md:w-1/2 h-auto max-h-64 object-contain"/>
      </section> 
      <WhySwiftHomes />
    </header>
      <div className="App bg-slate-50">
        {/* Filtros y Propiedades */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8 w-full max-w-3xl mx-auto">
          {/* Filtros */}
          <div className="flex flex-wrap overflow-x-auto px-4 py-2 items-center justify-center gap-3">
          <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar Por Ciudad, Zona o Tipo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-w-[150px] px-4 py-2 text-sm sm:text-base rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6] placeholder:text-gray-500 text-center"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
          </div>
          <div className="relative w-full sm:w-48">
          <select
            className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
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
              onChange={(e) => setPropertyType(e.target.value)}
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
                onChange={(e) => setMinPrice(e.target.value)}
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
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]" size={18} />
            </div>
          </section>
          </div>
          <button className="bg-[#0077B6] text-[#F8F9FA] px-4 py-2 text-sm rounded-lg hover:bg-[#005f87] mt-5 transition" onClick={() => {   setPropertyType(''); setMinPrice(''); setMaxPrice(''); setSearchTerm('');setSortOrder('');}}>Limpiar filtros</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Paginación y Cards */}
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
      </div>
      {/* Renderizar componentes hijos */}
        <Outlet />
      {/* Footer */}
      <footer className='text-center py-6 text-sm text-slate-600 bg-slate-100'>
        © 2025 SwiftHomes. Todos los derechos reservados.
        </footer>
    </>
  );
}

export default App;