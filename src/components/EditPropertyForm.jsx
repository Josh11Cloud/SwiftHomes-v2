import { useState, useEffect } from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";
import { addActivity } from "./AddActivity";
import {
  BedDouble,
  BrickWall,
  Building2,
  CalendarClock,
  DollarSign,
  FileText,
  House,
  Info,
  ImagePlus,
  Landmark,
  List,
  MapPin,
  ParkingCircle,
  PlusCircle,
  ShieldCheck,
  ShowerHead,
  Tags,
  Trash2,
  UploadCloud,
  WavesLadder,
  Handshake,
  Hammer,
} from "lucide-react";

function EditProperty({ propiedad, abierto, cerrar, onSave, user }) {
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenBase64, setImagenBase64] = useState("");
  const cloudName = "dhtysitwx";
  const uploadPreset = "swifthomes-v3";
  const [services, setServices] = useState({
    piscina: false,
    seguridad: false,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    precio: "",
    renta: "",
    tipo: "",
    habitaciones: "",
    banos: "",
    area: "",
    estacionamientos: "",
    descripcion: "",
    categoria: "",
    roi: "",
    paybackYears: "",
    isInvestment: "",
    userId: "",
    antiguedad: "",
    financiamiento: false,
    servicios: [],
    remodelar: false,
    precioNegociable: false,
  });

  useEffect(() => {
    if (user && propiedad) {
      const isAdmin = user.role === "admin";
      const isCreator = propiedad.userId === user.userId;
      setHasPermission(isAdmin || isCreator);
    } else {
      setHasPermission(false);
    }
  }, [user, propiedad]);

  useEffect(() => {
    if (propiedad) {
      setForm({
        nombre: propiedad.nombre || "",
        ubicacion: propiedad.ubicacion || "",
        categoria: propiedad.categoria || "",
        precio: propiedad.precio || "",
        renta: propiedad.renta || "",
        tipo: propiedad.tipo || "",
        habitaciones: propiedad.habitaciones || "",
        banos: propiedad.banos || "",
        area: propiedad.area || "",
        estacionamientos: propiedad.estacionamientos || "",
        descripcion: propiedad.descripcion || "",
        antiguedad: propiedad.antiguedad || "",
        financiamiento: propiedad.financiamiento || false,
        remodelar: propiedad.remodelar || false,
        precioNegociable: propiedad.negociable || false,
      });
      setImagenBase64(propiedad.imagen || "");
      setServices({
        piscina: propiedad.piscina || false,
        seguridad: propiedad.seguridad || false,
      });
    }
  }, [propiedad]);

  if (!abierto) return null;

  if (hasPermission === null) return <Spinner />;

  if (!hasPermission) {
    return <div>No tienes permiso para editar esta propiedad</div>;
  }

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setForm({ ...form, [e.target.name]: e.target.checked });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setServices((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen supera los 5MB");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setImagenBase64(data.secure_url);
        setImagenFile(file);
        toast.success("Imagen cargada correctamente");
      } else {
        throw new Error("Error al subir imagen");
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al cargar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (id, propertyData, user) => {
    if (user && user.role !== "admin" && propiedad.userId !== user.userId) {
      toast.error("No tienes permiso para editar esta propiedad");
      throw new Error("No tienes permiso para editar esta propiedad");
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/propiedades/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al actualizar la propiedad: ${errorData.message}`
        );
      }

      addActivity(
        user.userId,
        "updated_property",
        "El usuario ha actualizado una propiedad"
      );
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("Usuario no encontrado");
      toast.error("Usuario no encontrado");
      return;
    }
    try {
      const updatedForm = {
        ...form,
        imagen: imagenBase64,
        piscina: services.piscina,
        seguridad: services.seguridad,
      };
      await updateProperty(propiedad.id, updatedForm, user);
      onSave && onSave({ ...propiedad, ...updatedForm });
      cerrar();
      toast.success("Propiedad actualizada correctamente");
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
      toast.error("Hubo un error al actualizar la propiedad");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload({ target: { files: [file] } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (loading) return <Spinner />;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cerrar();
        }
      }}
    >
      <div className="bg-slate-100 p-6 rounded-xl z-10 shadow-xl relative max-w-2xl max-h-screen overflow-y-auto w-auto">
        <h1 className="text-2xl text-center font-bold mb-5 flex items-center justify-center gap-2 text-gray-800">
          <Building2 size={24} className="text-[#0077b6]" />
          Editar Propiedad
        </h1>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-[#0077B6] flex items-center gap-2">
            <Info size={20} />
            Información General
          </h2>

          <label className="block">
            <span className="flex items-center gap-2">
              <House size={18} className="text-[#0077b6]" />
              Nombre
            </span>
            <input
              name="nombre"
              autoFocus
              required
              value={form.nombre}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              aria-label="Nombre de la propiedad"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <MapPin size={18} className="text-[#0077b6]" />
              Ubicación
            </span>
            <input
              name="ubicacion"
              required
              value={form.ubicacion}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <List size={18} className="text-[#0077b6]" />
              Categoría
            </span>
            <select
              name="categoria"
              required
              value={form.categoria}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            >
              <option value="">Seleccionar</option>
              <option value="venta">Venta</option>
              <option value="renta">Renta</option>
            </select>
          </label>

          {form.categoria === "venta" && (
            <div>
              <label className="block">
                <span className="flex items-center gap-2">
                  <DollarSign size={18} className="text-[#0077b6]" />
                  Precio ($)
                </span>
                <input
                  type="number"
                  name="precio"
                  required
                  value={form.precio}
                  onChange={handleChange}
                  className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                />
              </label>
            </div>
          )}

          {form.categoria === "renta" && (
            <label className="block">
              <span className="flex items-center gap-2">
                <DollarSign size={18} className="text-[#0077b6]" />
                Renta Mensual ($)
              </span>{" "}
              <input
                type="number"
                name="renta"
                required={form.categoria === "renta"}
                value={form.renta}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
            </label>
          )}

          <label className="block">
            <span className="flex items-center gap-2">
              <Handshake size={18} className="text-[#0077b6]" />
              ¿El precio es negociable?
            </span>
            <input
              type="checkbox"
              name="precioNegociable"
              checked={form.precioNegociable}
              onChange={handleChange}
              className="h-4 w-4"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <Tags size={18} className="text-[#0077b6]" />
              Tipo
            </span>
            <select
              name="tipo"
              required
              value={form.tipo}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            >
              <option value="">Seleccionar</option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
            </select>
          </label>

          <h2 className="text-xl font-semibold text-[#0077B6] flex items-center gap-2">
            <Info size={20} />
            Características
          </h2>

          <label className="block">
            <span className="flex items-center gap-2">
              <BedDouble size={18} className="text-[#0077b6]" />
              Habitaciones
            </span>
            <input
              type="number"
              name="habitaciones"
              value={form.habitaciones}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <ShowerHead size={18} className="text-[#0077b6]" />
              Baños
            </span>
            <input
              type="number"
              name="banos"
              value={form.banos}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <BrickWall size={18} className="text-[#0077b6]" />
              Área (m²)
            </span>
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-2">
              <ParkingCircle size={18} className="text-[#0077b6]" />
              Estacionamientos
            </span>
            <input
              type="number"
              name="estacionamientos"
              value={form.estacionamientos}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="flex items-center gap-2">
                <CalendarClock size={18} className="text-[#0077b6]" />
                Antigüedad (años)
              </span>
              <input
                name="antiguedad"
                type="number"
                min="0"
                value={form.antiguedad}
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
            </label>

            <div className="mt-4">
              <h3 className="text-xl font-semibold text-[#0077B6] flex items-center gap-2 mb-5">
                <PlusCircle size={20} />
                Servicios
              </h3>
              <div className="flex flex-wrap gap-6 mt-2">
                <label className="flex items-center gap-2">
                  <span className="flex items-center gap-2">
                    <Landmark size={18} className="text-[#0077b6]" />
                    Financiamiento
                  </span>
                  <input
                    type="checkbox"
                    name="financiamiento"
                    checked={form.financiamiento}
                    onChange={(e) =>
                      setForm({ ...form, financiamiento: e.target.checked })
                    }
                    className="h-4 w-4 text-[#0077B6] focus:ring-[#0077B6] border-gray-300 rounded hover:scale-105"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="flex items-center gap-2">
                    <WavesLadder size={18} className="text-[#0077b6]" />
                    Piscina
                  </span>
                  <input
                    type="checkbox"
                    name="piscina"
                    checked={services.piscina}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[#0077B6] focus:ring-[#0077B6] border-gray-300 rounded hover:scale-105"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#0077b6]" />
                    Seguridad
                  </span>
                  <input
                    type="checkbox"
                    name="seguridad"
                    checked={services.seguridad}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[#0077B6] focus:ring-[#0077B6] border-gray-300 rounded hover:scale-105"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="flex items-center gap-2">
                    <Hammer size={18} className="text-[#0077b6]" />
                    ¿Requiere remodelación?
                  </span>
                  <input
                    type="checkbox"
                    name="remodelar"
                    checked={form.remodelar}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#0077B6] focus:ring-[#0077B6] border-gray-300 rounded hover:scale-105"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block">
              <h4 className="text-xl font-semibold text-[#0077B6] flex items-center mb-5 gap-2 mt-10">
                <FileText size={20} className="text-[#0077b6]" />
                Descripción
              </h4>

              <textarea
                name="descripcion"
                title="Descripción de la propiedad"
                value={form.descripcion}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
              />
            </label>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
              <Spinner />
            </div>
          )}

          {/* Sección de Imagen */}
          <div className="space-y-2">
            <label className="font-semibold text-[#0077B6] flex items-center gap-2">
              <ImagePlus size={18} />
              Imagen Principal
            </label>

            {imagenBase64 ? (
              <div className="relative group w-full max-w-sm">
                <img
                  src={imagenBase64}
                  alt="Imagen de la propiedad"
                  className="rounded-lg shadow w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagenBase64("");
                    setImagenFile(null);
                  }}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-opacity opacity-0 group-hover:opacity-100"
                  title="Eliminar imagen"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed p-4 text-center rounded-lg cursor-pointer ${
                  isDragging ? "border-blue-400 bg-blue-100" : "border-gray-300"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() =>
                  document.getElementById("imagenInputEdit").click()
                }
              >
                <UploadCloud size={24} className="mx-auto text-gray-500" />
                <p className="mt-2 text-sm text-gray-500">
                  Arrastra una imagen aquí o haz clic para subir.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imagenInputEdit"
            />
          </div>

          {imagenBase64 && (
            <div className="flex gap-4 mt-4 justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="fileUpload2"
              />
              <label
                htmlFor="fileUpload2"
                className="px-4 py-2 bg-[#0077b6] text-slate-50 rounded hover:bg-[#005f87]cursor-pointer"
              >
                <span>
                  <ImagePlus size={18} className="text-slate-50" />
                  Cambiar Imagen
                </span>
              </label>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-slate-50 rounded hover:bg-red-700"
                onClick={() => setImagenBase64("")}
              >
                <span>
                  <Trash2 size={18} className="text-slate-50" />
                  Borrar Imagen
                </span>
              </button>
            </div>
          )}
          <button
            type="submit"
            className="bg-[#0077b6] text-white hover:bg-[#005f87] px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center">
                <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full text-white"></div>
              </div>
            ) : (
              "Editar Propiedad"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
export default EditProperty;
