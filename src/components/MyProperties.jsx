import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PropertyList from "./PropertyList";
import { Trash2, Pencil } from "lucide-react";
import EditProperty from "./EditPropertyForm";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Spinner from './Spinner';

function MyProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 6;
  const router = useRouter();
  const [token, setToken] = useState(null);
  const API_URL = "http://192.168.100.64:5500";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      console.log('Token en localStorage:', storedToken);
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProperties = async () => {
      try {
        const response = await fetch(`${API_URL}/api/mis-propiedades`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response:', response);

        if (!response.ok) {
          const data = await response.json();
          console.log('Error:', data);
          throw new Error(data.error || "Error al obtener propiedades");
        }

        const props = await response.json();
        console.log('Properties:', props);
        setProperties(props);
      } catch (error) {
        console.log('Error:', error);
        toast.error("Error al obtener propiedades: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user, token]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/propiedades/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        toast.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar propiedad");
      }

      setProperties(properties.filter((property) => property.id !== id));
      toast.success("Propiedad eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar propiedad: " + error.message);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  const handleSave = (updatedProperty) => {
    setProperties(
      properties.map((property) =>
        property.id === updatedProperty.id ? updatedProperty : property
      )
    );
  };

  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (!user)
    return (
      <p className="text-gray-600 text-sm text-center">No estas registrado.</p>
    );
  if (loading)
    return <Spinner />

  return (
    <div>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
        <div className="text-center mt-6 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100"
          >
            Supervisa, edita y potencia tus{" "}
            <span className="text-gray-900">Propiedades</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            Consulta el estado de tus propiedades, edita detalles y haz
            seguimiento.
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/casas-image.png"
          alt="casas"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
        {currentProperties.map((property) => (
          <div key={property.id}>
            <PropertyList property={property} />
            <div className="flex justify-center mt-2 gap-4">
              <button
                className="bg-[#0077b6] hover:bg-[#005f87] text-slate-50 font-bold py-2 px-4 rounded"
                onClick={() => handleEdit(property)}
              >
                <Pencil />
              </button>
              <button
                className="bg-red-600 hover:bg-red-800 text-slate-50 font-bold py-2 px-4 rounded"
                onClick={() => handleDelete(property.id)}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          disabled={currentPage === 1}
        >
          Anterior
        </button>

        {[...Array(Math.ceil(properties.length / propertiesPerPage))].map(
          (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1
                ? "bg-[#0077B6] text-white"
                : "bg-slate-100 text-gray-700 hover:bg-slate-200"
                }`}
            >
              {i + 1}
            </button>
          )
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-3 py-1 bg-slate-100 text-gray-800 rounded hover:bg-[#0077b6] hover:text-slate-100 ${currentPage === Math.ceil(properties.length / propertiesPerPage)
            ? "opacity-50 cursor-not-allowed"
            : ""
            }`}
          disabled={
            currentPage === Math.ceil(properties.length / propertiesPerPage)
          }
        >
          Siguiente
        </button>
      </div>
      {editModalOpen && (
        <EditProperty
          propiedad={selectedProperty}
          abierto={editModalOpen}
          cerrar={() => setEditModalOpen(false)}
          onSave={handleSave}
          user={user}
        />
      )}
    </div>
  );
}
export default MyProperties;