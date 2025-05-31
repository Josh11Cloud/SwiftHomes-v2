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

const PropertiesPerPage = ({
  properties,
  showROI = false,
  propertiesPerPage,
  category = "renta",
}) => {
  const filterByCategory = (prop) =>
    prop.categoria?.toLowerCase().trim() === category.toLowerCase().trim();
  const [minPrice, setMinPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [roiOrder, setRoiOrder] = useState("");
  const [minAñosRetorno, setMinAñosRetorno] = useState("");
  const [minRentabilidadAnual, setMinRentabilidadAnual] = useState("");
  const fullProps = properties;
  const [ubicacionFiltro, setUbicacionFiltro] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [advancedFiltersModalOpen, setAdvancedFiltersModalOpen] =
    useState(false);

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

  const filteredProperties = fullProps
    .filter(filterByCategory)
    .filter((prop) => {
      const cumpleRentabilidad =
        minRentabilidadAnual === "" ||
        (minRentabilidadAnual !== "" &&
          parseFloat(String(prop.rentabilidadAnual)) >=
            parseFloat(minRentabilidadAnual) / 100);
      const searchTermLower = searchTerm.toLowerCase().trim();
      const minPriceValue = minPrice === "" ? 0 : Number(minPrice);
      const maxPriceValue = maxPrice === "" ? Infinity : Number(maxPrice);
      const matchesPrice =
        Number(prop.precio) >= minPriceValue &&
        Number(prop.precio) <= maxPriceValue;
      const cumpleAños =
        minAñosRetorno === "" || prop.añosDeRetorno >= Number(minAñosRetorno);
      const matchesSearchTerm =
        prop.ubicacion?.toLowerCase().includes(searchTermLower) ||
        prop.tipo?.toLowerCase().includes(searchTermLower);
      const matchesPropertyType =
        propertyType === "" ||
        prop.tipo?.toLowerCase().trim() === propertyType.toLowerCase().trim();
      const matchesUbicacion =
        ubicacionFiltro === "" ||
        prop.ubicacion?.toLowerCase().includes(ubicacionFiltro.toLowerCase());
      const superficieValida =
        (!advancedFilters.superficieMin ||
          prop.area >= advancedFilters.superficieMin) &&
        (!advancedFilters.superficieMax ||
          prop.area <= advancedFilters.superficieMax);

      const antiguedadValida = (() => {
        const anios = prop.antiguedad;
        if (!advancedFilters.antiguedad) return true;
        if (advancedFilters.antiguedad === "0-5") return anios <= 5;
        if (advancedFilters.antiguedad === "5-10")
          return anios > 5 && anios <= 10;
        if (advancedFilters.antiguedad === "10+") return anios > 10;
        return true;
      })();

      const serviciosValidos = Object.entries(advancedFilters.servicios).every(
        ([servicio, activo]) => !activo || prop.servicios.includes(servicio)
      );

      const financiamientoValido =
        !advancedFilters.financiamiento || prop.financiamiento === true;
      return (
        superficieValida &&
        antiguedadValida &&
        serviciosValidos &&
        financiamientoValido &&
        matchesPrice &&
        (searchTerm === "" || matchesSearchTerm) &&
        matchesPropertyType &&
        cumpleAños &&
        cumpleRentabilidad &&
        matchesUbicacion
      );
    })
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return Number(b.precio) - Number(a.precio);
      } else if (sortOrder === "asc") {
        return Number(a.precio) - Number(b.precio);
      } else {
        return 0;
      }
    });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const allSuggestions = [
    ...new Set(
      properties.flatMap((prop) => [
        prop.ubicacion,
        prop.tipo,
        `$${Number(prop.precio).toLocaleString()}`,
      ])
    ),
  ];

  const filteredSuggestions = searchTerm
    ? allSuggestions.filter((sug) =>
        sug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    if (suggestion.includes("$")) {
      const precio = Number(suggestion.replace(/\D/g, ""));
      if (precio < Number(minPrice)) {
        setMinPrice(precio);
      } else if (precio > Number(maxPrice)) {
        setMaxPrice(precio);
      } else {
        setMinPrice(precio);
        setMaxPrice(precio);
      }
    } else if (["Casa", "Departamento"].includes(suggestion)) {
      setPropertyType(suggestion);
    } else {
      setUbicacionFiltro(suggestion);
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const filteredPropertiesWithAñosDeRetorno = showROI
    ? filteredProperties.map((prop) => {
        const rentabilidadAnual = prop.rentabilidadAnual;
        return {
          ...prop,
          rentabilidadAnual: rentabilidadAnual
            ? `${(parseFloat(rentabilidadAnual) * 100).toFixed(2)}%`
            : null,
        };
      })
    : filteredProperties;

  const finalFilteredProperties = filteredPropertiesWithAñosDeRetorno;

  if (finalFilteredProperties && roiOrder) {
    finalFilteredProperties.sort((a, b) => {
      if (roiOrder === "roiAsc") return parseFloat(a.roi) - parseFloat(b.roi);
      if (roiOrder === "roiDesc") return parseFloat(b.roi) - parseFloat(a.roi);
      return 0;
    });
  }

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = finalFilteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const handlePageChange = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(filteredProperties.length / propertiesPerPage)
    ) {
      setCurrentPage(pageNumber);
    }
  };

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
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                  setShowSuggestions(true);
                }}
                className="w-full px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077B6]"
                size={18}
              />

              {/* Sugerencias */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-slate-50 border border-gray-300 shadow-lg max-h-60 overflow-y-auto text-sm rounded-lg">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-[#0077b6] hover:text-slate-50 border border-gray-600 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Sección de filtros */}
            <section className="flex flex-row flex-wrap gap-3 items-center justify-center mt-2">
              {/* Tipo  de Propiedad */}
              <div className="relative w-full sm:w-64">
                <select
                  className="w-full min-w-[150px] px-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  value={propertyType}
                  onChange={(e) => {
                    setPropertyType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Cualquier Tipo de Propiedad</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
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
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
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
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
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
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
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
                        onChange={(e) => {
                          setRoiOrder(e.target.value);
                          setCurrentPage(1);
                        }}
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
                        onChange={(e) => {
                          setMinAñosRetorno(e.target.value);
                          setCurrentPage(1);
                        }}
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
                      type="number"
                      value={minRentabilidadAnual}
                      onChange={(e) => {
                        setMinRentabilidadAnual(e.target.value);
                        setCurrentPage(1);
                      }}
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
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                superficieMin: e.target.value,
                              })
                            }
                          />
                          <Ruler className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077b6]" />
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Superficie máxima"
                            className="input input-bordered w-28 focus:outline-none focus:ring-1 focus:ring-[#0077B6] rounded-md border border-slate-300 pl-10"
                            value={advancedFilters.superficieMax}
                            onChange={(e) =>
                              setAdvancedFilters({
                                ...advancedFilters,
                                superficieMax: e.target.value,
                              })
                            }
                          />
                          <Ruler className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0077b6]" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="w-full text-md rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                          value={advancedFilters.antiguedad}
                          title="Antiguedad de la Propiedad"
                          onChange={(e) =>
                            setAdvancedFilters({
                              ...advancedFilters,
                              antiguedad: e.target.value,
                            })
                          }
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
                              onChange={() =>
                                setAdvancedFilters((prev) => ({
                                  ...prev,
                                  servicios: {
                                    ...prev.servicios,
                                    [servicio]: !prev.servicios[servicio],
                                  },
                                }))
                              }
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
                            onChange={() =>
                              setAdvancedFilters((prev) => ({
                                ...prev,
                                financiamiento: !prev.financiamiento,
                              }))
                            }
                          />
                          <Landmark size={18} className="text-[#0077b6]" />
                          <span className="text-md">Acepta financiamiento</span>
                        </label>
                      </div>
                    </div>
                    <div className="modal-action">
                      <button
                        className="bg-[#0077b6] mx-auto block rounded-md text-slate-50 px-2 py-1 mt-5"
                        onClick={() => setAdvancedFiltersModalOpen(false)}
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
              onClick={() => {
                setPropertyType("");
                setMinPrice("");
                setMaxPrice("");
                setSearchTerm("");
                setSortOrder("");
                setRoiOrder("");
                setMinAñosRetorno("");
                setMinRentabilidadAnual("");
                setUbicacionFiltro("");
                setAdvancedFilters({
                  superficieMin: "",
                  superficieMax: "",
                  antiguedad: "",
                  servicios: {
                    piscina: false,
                    seguridad: false,
                  },
                  financiamiento: false,
                });
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      {/* CARDS */}
      {currentProperties.length === 0 ? (
        <p className="text-gray-600 text-center mb-10">
          No hay propiedades que coincidan con los filtros.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {currentProperties.map((prop) => (
            <PropertyList
              key={prop.id}
              property={prop}
              setSelectedProperty={setSelectedProperty}
              showROI={showROI}
              isInvestSection={true}
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
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Anterior
        </button>

        {[
          ...Array(Math.ceil(filteredProperties.length / propertiesPerPage)),
        ].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-[#0077B6] text-white"
                : "bg-slate-100 text-gray-700 hover:bg-slate-200"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default PropertiesPerPage;
