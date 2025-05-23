import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import PropertyList from "./PropertyList";
import { doc, query, where, getDocs, collection, deleteDoc } from "firebase/firestore";
import { Trash2, Pencil } from "lucide-react";
import EditProperty from "./EditPropertyForm";
import { toast } from "sonner";
import { motion } from "framer-motion";
import casas from '../assets/images/casas-image.png'

function MyProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "propiedades", id));
      setProperties(properties.filter(property => property.id !== id));
    } catch (error) {
      toast.error("Error al eliminar propiedad:" + error);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  const handleSave = (updatedProperty) => {
  setProperties(properties.map(property => property.id === updatedProperty.id ? updatedProperty : property));
};

 useEffect(() => {
    if (!user) return;

    const fetchProperties = async () => {
      try {
        const q = query(
          collection(db, "propiedades"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const props = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProperties(props);
      } catch (error) {
        toast.error("Error al obtener propiedades:" + error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  if (!user) return  <p className='text-gray-600 text-sm text-center'>No estas registrado.</p>
  if (loading) return  <p className='text-gray-600 text-sm text-center'>Cargando propiedades.</p>;

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
          Supervisa, edita y potencia tus <span className="text-gray-900">Propiedades</span></motion.h1>
          <motion.p 
          initial={{ opacity: 0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration: 1 }}
          className="text-base md:text-lg text-slate-800">Consulta el estado de tus propiedades, edita detalles y haz seguimiento.
          </motion.p>
          </div>
           <motion.img 
           src={casas} 
           alt="casas"
          initial={{ opacity: 0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration: 0.8 }} 
           className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
        </section> 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
        {properties.map((property) => (
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
      {editModalOpen && (
      <EditProperty
        propiedad={selectedProperty}
        abierto={editModalOpen}
        cerrar={() => setEditModalOpen(false)}
        onSave={handleSave}
      />
      )}
    </div>
  );
}
export default MyProperties;