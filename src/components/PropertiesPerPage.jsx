import PropertyList from "./PropertyList.jsx";
import {
  Home,
  Search,
  Filter,
  DollarSign,
  ChartNoAxesCombined,
  CalendarClock,
  PercentIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import PropertyModal from "./PropertyModal.jsx";

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
      minAñosRetorno === "" ||
      prop.añosDeRetorno >= Number(minAñosRetorno);
    const matchesSearchTerm =
      prop.ubicacion?.toLowerCase().includes(searchTermLower) ||
      prop.tipo?.toLowerCase().includes(searchTermLower);
    const matchesPropertyType =
      propertyType === "" ||
      prop.tipo?.toLowerCase().trim() === propertyType.toLowerCase().trim();
    return (
      matchesPrice &&
      (searchTerm === "" || matchesSearchTerm) &&
      matchesPropertyType &&
      cumpleAños &&
      cumpleRentabilidad
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

  const filteredPropertiesWithAñosDeRetorno = showROI
    ? filteredProperties.map((prop) => {
        const rentabilidadAnual = prop.rentabilidadAnual;
        return {
          ...prop,
          rentabilidadAnual: rentabilidadAnual ? `${(parseFloat(rentabilidadAnual) * 100).toFixed(2)}%` : null,
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

  return (
    <>
      {/* Filtros y Propiedades */}
      <div className="bg-slate-50">
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8 w-full max-w-3xl mx-auto">
          {/* Filtros */}
          <div className="flex flex-wrap overflow-x-auto px-4 py-2 items-center justify-center gap-3">
            {/* Sección de búsqueda */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar Por Ciudad, Zona o Tipo"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full min-w-[200px] px-4 py-2 text-sm sm:text-base rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0077B6] placeholder:text-gray-500 text-center"
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
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Anterior
        </button>

        {[
          ...Array(Math.ceil(filteredProperties.length / propertiesPerPage)),
        ].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
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
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredProperties.length / propertiesPerPage)
              )
            )
          }
          className="px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100"
        >
          Siguiente
        </button>
      </div>
    </>
  );
};

export default PropertiesPerPage;
