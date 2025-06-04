import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import db from "../../firebase/config";
import { CSVLink } from "react-csv";
import { motion } from "framer-motion";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import {
  Calendar,
  EyeIcon,
  CrownIcon,
  DownloadIcon,
  FileUser,
  Folder,
  LucideFileQuestion,
  Mail,
  MessageCircleMore,
  Trash2Icon,
} from "lucide-react";

export default function AdminDashboard() {
  const [mostrarArchivados, setMostrarArchivados] = useState(false);
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [consultaFilter, setConsultaFilter] = useState("todos");
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const totalLeads = leads.length;
  const Nuevos = leads.filter((lead) => lead.estado === "Nuevo").length;
  const Completados = leads.filter((lead) => lead.estado === "Completado").length;
  const statusStyles = {
    Nuevo: "bg-yellow-300 text-yellow-600",
    Completado: "bg-green-100 text-green-600",
  };
  const buttonStyles = {
    Nuevo: "bg-green-100 text-green-600",
    Completado: "bg-yellow-300 text-yellow-600",
  };

  useEffect(() => {
    fetchLeads();
  }, [mostrarArchivados]);

  const fetchLeads = async () => {
    const querySnapshot = await getDocs(collection(db, "contactos"));
    const leadsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate().toLocaleString("es-ES") || "Sin fecha",
    }));

    const filtrados = mostrarArchivados
      ? leadsData
      : leadsData.filter((lead) => !lead.archivado);

    setLeads(filtrados);
  };

  useEffect(() => {
    const result = leads.filter((lead) => {
      const matchesConsulta =
        consultaFilter === "todos" || lead.tipoConsulta === consultaFilter;
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase());
      return matchesConsulta && matchesSearch;
    });

    setFilteredLeads(result);
  }, [leads, search, consultaFilter]);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de eliminar este lead definitivamente?")) {
      try {
        await deleteDoc(doc(db, "contactos", id));
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        toast.success("Lead eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar el lead");
        console.error(error);
      }
    }
  };

  const toggleArchivado = async (leadId, archivado) => {
    try {
      const ref = doc(db, "contactos", leadId);
      await updateDoc(ref, { archivado: !archivado });

      toast.success(
        !archivado ? "Lead archivado correctamente" : "Lead restaurado"
      );

      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === leadId ? { ...lead, archivado: !archivado } : lead
        )
      );
    } catch (error) {
      toast.error("Error al actualizar el lead");
      console.error(error);
    }
  };

  const cambiarEstado = async (leadId, nuevoEstado) => {
    const ref = doc(db, "contactos", leadId);
    await updateDoc(ref, { estado: nuevoEstado });
    toast.success("Estado actualizado");
  };
  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
        <div className="text-center mt-6 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100"
          >
            Controla y Monitorea{" "}
            <span className="text-gray-900">Información</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            Monitorea leads, mensajes y usuarios desde el panel.
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/admin.png"
          alt="Admin"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>
      <section className="max-w-7xl mx-auto mt-10 text-center p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">
          Panel de Administrador
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-600 mb-6 text-lg">
            Bienvenido {user?.nombre || user?.email}
          </span>
          <CrownIcon className="text-[#0077b6] mb-6" size={30} />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o correo"
            className="border w-64 px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-4 py-2 rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            value={consultaFilter}
            onChange={(e) => setConsultaFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="propiedad">Propiedad</option>
            <option value="inversión">Inversión</option>
            <option value="otro">Otro</option>
          </select>

          {/* Botón CSV */}
          <CSVLink
            data={filteredLeads}
            filename={"leads-swifthomes.csv"}
            className="bg-[#0077b6] text-white px-4 py-2 rounded-md hover:bg-[#005f87] transition flex items-center gap-2"
          >
            <DownloadIcon size={18} /> Exportar CSV
          </CSVLink>
        </div>
        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 text-sm text-md">
            <input
              type="checkbox"
              checked={mostrarArchivados}
              onChange={(e) => setMostrarArchivados(e.target.checked)}
              className="accent-blue-500 hover:scale-110"
            />
            Mostrar archivados
          </label>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="w-full table-auto border border-gray-800 border-collapse">
            <thead className="text-slate-800">
              <tr className="bg-[#0077b6] text-lg text-center">
                <th className="p-4 text-left w-1/4">Consulta</th>
                <th className="p-4 text-left w-1/4">Nombre</th>
                <th className="p-4 text-left w-1/4">Correo</th>
                <th className="p-4 text-left w-1/2">Mensaje</th>
                <th className="p-4 text-left w-1/4">Fecha</th>
                <th className="p-4 text-left w-1/4">Estado</th>
                <th className="p-4 text-center w-1/4">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {filteredLeads.length === 0 ? (
                <tr
                  key={leads.id}
                  className={`border-b transition md:text-lg ${
                    leads.archivado ? "bg-[#0077b6] text-slate-50 italic" : ""
                  }`}
                >
                  <td colSpan="5" className="text-center p-6">
                    No se encontraron leads.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={`border-b transition md:text-lg ${
                      i % 2 === 0 ? "bg-slate-200" : "bg-slate-100"
                    }`}
                  >
                    <td className="p-4 text-left capitalize">
                      {lead.tipoConsulta
                        ? lead.tipoConsulta
                        : "No especificado"}
                    </td>
                    <td className="p-4 text-left">
                      {lead.name ? lead.name : "No especificado"}
                    </td>
                    <td className="p-4 text-left">
                      {lead.email &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)
                        ? lead.email
                        : "Correo electrónico no válido"}{" "}
                    </td>
                    <td className="p-4 text-left truncate max-w-xs border-r border-gray-300">
                      {lead.message ? lead.message : "No especificado"}
                    </td>
                    <td className="">
                      {lead.fecha ? lead.fecha : "No especificado"}
                    </td>
                    <td className="p-4 text-left">
                      <span
                        className={`ml-2 px-2 py-1 text-md text-center rounded-full ${
                          statusStyles[lead.estado]
                        }`}
                      >
                        {lead.estado}
                      </span>
                      <motion.button
                        onClick={() =>
                          cambiarEstado(
                            lead.id,
                            lead.estado === "Nuevo" ? "Completado" : "Nuevo"
                          )
                        }
                        className={`text-sm hover:scale-105 px-3 py-1 rounded-md ml-2 ${
                          buttonStyles[lead.estado]
                        }`}
                      >
                        Marcar como
                        {lead.estado === "Nuevo" ? " Completado" : " Nuevo"}
                      </motion.button>
                    </td>
                    <td className="p-4 text-left">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowModal(true);
                        }}
                        title="Ver detalles"
                        className="text-sm hover:scale-105 px-3 py-1 rounded-md"
                      >
                        <EyeIcon className="text-[#0077b6]" size={30} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleArchivado(lead.id, lead.archivado)}
                        title={lead.archivado ? "Restaurar" : "Archivar"}
                        className={`text-sm ${
                          lead.archivado ? "bg-[#0077b6]" : "bg-gray-400"
                        } hover:scale-105 px-3 py-1 rounded-md`}
                      >
                        <Folder className="text-slate-50" size={30} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(lead.id)}
                        title="Eliminar lead"
                        className="text-sm bg-red-600 hover:scale-105 px-3 py-1 rounded-md"
                      >
                        <Trash2Icon className="text-slate-50" size={30} />
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
              {showModal && selectedLead && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowModal(false);
                    }
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-50 rounded-xl shadow-lg w-full max-w-lg relative h-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center bg-[#0077b6] text-gray-800 py-4 px-2 mb-6 rounded-t-xl">
                      <h2 className="text-xl font-bold">Detalles del Lead</h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-slate-50 hover:scale-110 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-3 text-left text-gray-700 p-4">
                      <p className="flex items-center gap-2">
                        <FileUser className="text-[#0077b6]" size={20} />
                        <strong>Nombre:</strong> {selectedLead.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="text-[#0077b6]" size={20} />
                        <strong>Correo:</strong> {selectedLead.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <LucideFileQuestion
                          className="text-[#0077b6]"
                          size={20}
                        />
                        <strong>Consulta:</strong> {selectedLead.tipoConsulta}
                      </p>
                      <p className="flex items-center gap-2">
                        <MessageCircleMore
                          className="text-[#0077b6]"
                          size={20}
                        />
                        <strong>Mensaje:</strong> {selectedLead.message}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="text-[#0077b6]" size={20} />
                        <strong>Fecha:</strong> {selectedLead.fecha}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </tbody>
          </table>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <h2 className="text-2xl mt-6 text-[#0077b6] font-semibold">Total de Leads</h2>
            <div className="bg-slate-50 rounded-xl shadow-md p-6 border-l-4 border-[#0077b6]">
              <p className="text-sm text-slate-500">Todos</p>
              <p className="text-2xl font-bold text-slate-700">{totalLeads}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-600">
              <p className="text-sm text-slate-500">Nuevos</p>
              <p className="text-2xl font-bold text-red-600">{Nuevos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
              <p className="text-sm text-slate-500">Completados</p>
              <p className="text-2xl font-bold text-green-600">{Completados}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
