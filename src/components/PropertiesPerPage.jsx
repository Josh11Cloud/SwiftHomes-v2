import PropertyList from "./PropertyList.jsx";
import {
  Home,
  Search,
  Filter,
  DollarSign,
  ChartNoAxesCombined,
  CalendarClock,
  PercentIcon,
  X,
  Ruler,
  Landmark,
  ParkingCircle,
  ShieldCheck,
  WavesLadder,
} from "lucide-react";
import { useState, useEffect } from "react";
import PropertyModal from "./PropertyModal.jsx";
import { motion } from "framer-motion";
import { fetchProperties } from './FetchProperties.jsx';
import { useRouter } from 'next/router';

const PropertiesPerPage = ({
  showROI = false,
  propertiesPerPage = 6,
  category = "renta",
  initialProperties,
}) => {

  // Estado de propiedades y paginación
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState(initialProperties);

  // Filtros
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [roiOrder, setRoiOrder] = useState("");
  const [minAñosRetorno, setMinAñosRetorno] = useState("");
  const [advancedFiltersModalOpen, setAdvancedFiltersModalOpen] = useState(false);
  const [minRentabilidadAnual, setMinRentabilidadAnual] = useState("");
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    superficieMin: "",
    superficieMax: "",
    antiguedad: "",
    servicios: {
      piscina: false,
      seguridad: false,
    },
    financiamiento: false,
  });

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    searchTerm: "",
    sortOrder: "",
    roiOrder: "",
    minAñosRetorno: "",
    minRentabilidadAnual: "",
    ubicacion: "",
    advanced: {
      superficieMin: "",
      superficieMax: "",
      antiguedad: "",
      servicios: {
        piscina: false,
        seguridad: false,
      },
      financiamiento: false,
    },
  });

  useEffect(() => {
    const query = router.query;

    setFilters((prev) => ({
      ...prev,
      propertyType: query.propertyType || "",
      minPrice: query.minPrice || "",
      maxPrice: query.maxPrice || "",
      searchTerm: query.texto || "",
      sortOrder: query.sortOrder || "",
      roiOrder: query.roiOrder || "",
      minAñosRetorno: query.minAñosRetorno || "",
      minRentabilidadAnual: query.minRentabilidadAnual || "",
      ubicacion: query.ubicacion || "",
      advanced: {
        superficieMin: query.superficieMin || "",
        superficieMax: query.superficieMax || "",
        antiguedad: query.antiguedad || "",
        servicios: {
          piscina: query.piscina === "true",
          seguridad: query.seguridad === "true",
        },
        financiamiento: query.financiamiento === "true",
      },
    }));

    setPage(parseInt(query.page || "1"));

    setPropertyType(query.propertyType || "");
    setMinPrice(query.minPrice || "");
    setMaxPrice(query.maxPrice || "");
    setSortOrder(query.sortOrder || "");
    setRoiOrder(query.roiOrder || "");
    setMinAñosRetorno(query.minAñosRetorno || "");
    setMinRentabilidadAnual(query.minRentabilidadAnual || "");
    setAdvancedFilters({
      superficieMin: query.superficieMin || "",
      superficieMax: query.superficieMax || "",
      antiguedad: query.antiguedad || "",
      servicios: {
        piscina: query.piscina === "true",
        seguridad: query.seguridad === "true",
      },
      financiamiento: query.financiamiento === "true",
    });
  }, [router.query]);

  const appendIfExists = (params, key, value) => {
    if (value !== "" && value !== null && value !== undefined) {
      if (typeof value === "boolean") {
        params.append(key, value.toString());
      } else {
        params.append(key, value);
      }
    }
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    appendIfExists(params, "page", page);
    appendIfExists(params, "limit", propertiesPerPage);
    appendIfExists(params, "category", category);
    appendIfExists(params, "propertyType", filters.propertyType);
    appendIfExists(params, "minPrice", filters.minPrice);
    appendIfExists(params, "maxPrice", filters.maxPrice);
    appendIfExists(params, "texto", filters.searchTerm);
    appendIfExists(params, "ubicacion", filters.ubicacion);
    appendIfExists(params, "sortOrder", filters.sortOrder);
    appendIfExists(params, "antiguedad", filters.advanced.antiguedad);
    appendIfExists(params, "superficieMin", filters.advanced.superficieMin);
    appendIfExists(params, "superficieMax", filters.advanced.superficieMax);
    if (filters.advanced.servicios.piscina) params.append("piscina", "true");
    if (filters.advanced.servicios.seguridad) params.append("seguridad", "true");
    if (filters.advanced.financiamiento) params.append("financiamiento", "true");
    return params.toString();
  };

  useEffect(() => {
    const fetchPropertiesData = async () => {
      try {
        const params = buildQueryParams();
        const data = await fetchProperties({ query: params });
        const filteredProperties = data.properties.filter(p => p.categoria?.toLowerCase().trim() === category);
        setProperties(filteredProperties);
        setTotal(data.total);
      } catch (error) {
        console.error(error);
      }
    };
    if (!properties || !properties.length) {
      fetchPropertiesData();
    }
  }, [category, properties]);

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  const totalPages = Math.ceil(total / propertiesPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, [key]: value, page: 1 },
    });
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, texto: filters.searchTerm, page: 1 },
      });
    }
  }

  const handleMinPriceKeyDown = (e) => {
    if (e.key === "Enter") {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, minPrice: filters.minPrice, page: 1 },
      });
    }
  };

  const handleMaxPriceKeyDown = (e) => {
    if (e.key === "Enter") {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, maxPrice: filters.maxPrice, page: 1 },
      });
    }
  };

  const applyAdvancedFilters = () => {
    setPage(1);
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        superficieMin: advancedFilters.superficieMin || undefined,
        superficieMax: advancedFilters.superficieMax || undefined,
        antiguedad: advancedFilters.antiguedad || undefined,
        piscina: advancedFilters.servicios.piscina ? "true" : undefined,
        seguridad: advancedFilters.servicios.seguridad ? "true" : undefined,
        financiamiento: advancedFilters.financiamiento ? "true" : undefined,
        page: 1,
      },
    });
  };

  const updateAdvancedFilter = (key, value) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }));
    console.log(advancedFilters);
    applyAdvancedFilters();
  };

  const updateService = (serviceKey, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      servicios: { ...prev.servicios, [serviceKey]: value },
    }));
    setFilters((prev) => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        servicios: { ...prev.advanced.servicios, [serviceKey]: value },
      },
    }));
  };

  const resetFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      propertyType: "",
      searchTerm: "",
      sortOrder: "",
      roiOrder: "",
      minAñosRetorno: "",
      minRentabilidadAnual: "",
      ubicacion: "",
      advanced: {
        superficieMin: "",
        superficieMax: "",
        antiguedad: "",
        servicios: {
          piscina: false,
          seguridad: false,
        },
        financiamiento: false,
      },
    });
    router.push({
      pathname: router.pathname,
      query: {},
    });
  };

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      advanced: advancedFilters,
    }));
    applyAdvancedFilters();
    setAdvancedFiltersModalOpen(false);
  };

  useEffect(() => {
    if (initialProperties) {
      setProperties(initialProperties);
      setTotal(initialProperties.length);
    }
  }, [initialProperties]);

  return (
    <>
      {/* Filtros y Propiedades */}
      <div className="bg-slate-50">
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8 w-full max-w-3xl mx-auto">
          {/* Filtros */}
          <div className="flex flex-wrap overflow-x-auto px-4 py-2 items-center justify-center gap-3">
            {/* Sección de búsqueda */}
            <div className="relative w-full sm:w-[350px] mx-auto mt-4">
              <input
                type="text"
                placeholder="Buscar por ubicación, tipo o precio..."
                value={filters.searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                size={18}
              />
            </div>
            {/* Sección de filtros */}
            <section className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2">
              {/* Tipo  de Propiedad */}
              <div className="relative w-full sm:w-64">
                <select
                  className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  value={propertyType}
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                >
                  <option value="">Cualquier Tipo de Propiedad</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Terreno">Terreno</option>
                </select>
                <Home
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                  size={18}
                />
              </div>
              {/* Orden */}
              <div className="relative w-full sm:w-48">
                <select
                  className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  value={sortOrder}
                  onChange={(e) => updateFilter("sortOrder", e.target.value)}
                >
                  <option value="">Ordenar por Precio</option>
                  <option value="desc">Mayor a Menor</option>
                  <option value="asc">Menor a Mayor</option>
                </select>
                <Filter
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                  size={18}
                />
              </div>

              {/* Precio */}
              <div className="flex flex-row gap-2">
                <div className="relative w-full sm:w-40">
                  <input
                    type="number"
                    value={minPrice}
                    placeholder="Precio Mínimo"
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    onKeyDown={handleMinPriceKeyDown}
                    className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                  <DollarSign
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                    size={18}
                  />
                </div>
                <div className="relative w-full sm:w-40">
                  <input
                    type="number"
                    value={maxPrice}
                    placeholder="Precio Máximo"
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    onKeyDown={handleMaxPriceKeyDown}
                    className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                  <DollarSign
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                    size={18}
                  />
                </div>
              </div>

              {/* ROI y meses de retorno */}
              {window.location.pathname === "/inversiones" && (
                <div>
                  <div className="flex flex-row gap-2">
                    <div className="relative w-full sm:w-48">
                      <select
                        className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                        value={roiOrder}
                        onChange={(e) => updateFilter("roiOrder", e.target.value)}
                      >
                        <option value="">Ordenar por ROI</option>
                        <option value="roiDesc">ROI: Mayor a Menor</option>
                        <option value="roiAsc">ROI: Menor a Mayor</option>
                      </select>
                      <ChartNoAxesCombined
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                        size={18}
                      />
                    </div>
                    <div className="relative w-full sm:w-48">
                      <input
                        type="number"
                        value={minAñosRetorno}
                        placeholder="Min. Años de Retorno"
                        onChange={(e) => updateFilter("minAñosRetorno", e.target.value)}
                        className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                      />
                      <CalendarClock
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                        size={18}
                      />
                    </div>
                  </div>

                  <div className="relative w-full sm:min-w-44">
                    <select
                      value={minRentabilidadAnual}
                      onChange={(e) => updateFilter("minRentabilidadAnual", e.target.value)}
                      className="w-full mt-2 min-w-[200px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    >
                      <option value="">Mínimo De Rentabilidad Anual (%)</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                      <option value="25">25%</option>
                      <option value="30">30%</option>
                    </select>
                    <PercentIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                      size={18}
                    />
                  </div>
                </div>
              )}
            </section>
            {/* FILTROS AVANZADOS */}
            <div>
              <button
                className="text-gray-600 rounded-lg px-1 py-2 flex items-center gap-2 text-md absolute"
                onClick={() => setAdvancedFiltersModalOpen(true)}
              >
                <Filter size={15} className="text-[#0077b6]" />
                Filtros avanzados
              </button>

              {advancedFiltersModalOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.5 }}
                    className="bg-slate-100 rounded-lg p-4 w-full max-w-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-lg text-gray-800">
                        Filtros avanzados
                      </h2>
                      <button
                        className="btn btn-ghost text-gray-700 hover:scale-110"
                        onClick={() => setAdvancedFiltersModalOpen(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Superficie mínima"
                            className="input input-bordered w-28 focus:outline-none focus:ring-1 focus:ring-[#0077B6] rounded-md border border-slate-300 pl-10"
                            value={advancedFilters.superficieMin}
                            onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, superficieMin: e.target.value }))}
                          />
                          <Ruler className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077b6]" />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Superficie máxima"
                            className="input input-bordered w-28 focus:outline-none focus:ring-1 focus:ring-[#0077B6] rounded-md border border-slate-300 pl-10"
                            value={advancedFilters.superficieMax}
                            onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, superficieMax: e.target.value }))}
                          />
                          <Ruler className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077b6]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="w-full text-md rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          value={advancedFilters.antiguedad}
                          title="Antiguedad de la Propiedad"
                          onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, antiguedad: e.target.value }))}
                        >
                          <option value="">Cualquiera</option>
                          <option value="0-5">0-5 años</option>
                          <option value="5-10">5-10 años</option>
                          <option value="10+">10+ años</option>
                        </select>
                        <CalendarClock className="text-[#0077b6]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          Servicios
                        </h3>
                        {["piscina", "seguridad"].map((servicio) => (
                          <label
                            key={servicio}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="checkbox hover:scale-110"
                              checked={advancedFilters.servicios[servicio]}
                              onChange={() => updateService(servicio, !advancedFilters.servicios[servicio])}
                            />
                            {servicio === "piscina" && (
                              <WavesLadder
                                size={18}
                                className="text-[#0077b6]"
                              />
                            )}
                            {servicio === "seguridad" && (
                              <ShieldCheck
                                size={18}
                                className="text-[#0077b6]"
                              />
                            )}
                            <span className="text-md capitalize">
                              {servicio}
                            </span>
                          </label>
                        ))}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="checkbox hover:scale-110"
                            checked={advancedFilters.financiamiento}
                            onChange={(e) => {
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                financiamiento: e.target.checked,
                              }));
                            }}
                          />
                          <Landmark size={18} className="text-[#0077b6]" />
                          <span className="text-md">Acepta financiamiento</span>
                        </label>
                      </div>
                    </div>
                    <div className="modal-action">
                      <button
                        className="bg-[#0077b6] mx-auto block rounded-md text-slate-50 px-2 py-1 mt-5"
                        onClick={handleApplyFilters}
                      >
                        Aplicar filtros
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
            {/* Botón de limpiar filtros */}
            <button
              className="bg-[#0077B6] text-[#F8F9FA] px-4 py-2 text-sm rounded-lg hover:bg-[#005f87] mt-5 transition mx-auto block"
              onClick={resetFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div >
      {/* CARDS */}
      {
        properties && properties.length === 0 && total > 0 ? (
          <p className="text-gray-600 text-center mb-10">
            No hay propiedades que coincidan con los filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {properties && properties.map((prop) => (
              <PropertyList
                key={prop.id}
                property={prop}
                showROI={showROI}
              />
            ))}
          </div>
        )
      }
      {/* PropertyModal*/}
      <PropertyModal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        property={selectedProperty}
      />
      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 mt-4 mb-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Anterior
        </button>

        {[
          ...Array(Math.ceil(total / propertiesPerPage)),
        ].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded ${page === i + 1
              ? "bg-[#0077B6] text-white"
              : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default PropertiesPerPage;