import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import db from "../firebase/config";
import { toast } from "sonner";
import Spinner from "./Spinner";
import {
  BedDouble,
  BrickWall,
  Building2,
  CalendarClock,
  DollarSign,
  FileText,
  House,
  Info,
  Landmark,
  List,
  MapPin,
  ParkingCircle,
  PlusCircle,
  ShieldCheck,
  ShowerHead,
  Tags,
  UploadCloud,
  WavesLadder,
} from "lucide-react";

function EditProperty({ propiedad, abierto, cerrar, onSave, user }) {
  const [form, setForm] = useState(propiedad || {});
  const [imagenBase64, setImagenBase64] = useState(propiedad.imagen || "");
  const cloudName = "dhtysitwx";
  const uploadPreset = "swifthomes-v3";
  const [imagenFile, setImagenFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user.isAdmin && propiedad.creador !== user.uid) {
    return <div>No tienes permiso para editar esta propiedad</div>;
  }

  useEffect(() => {
    if (propiedad) {
      setForm(propiedad);
    }
  }, [propiedad]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [services, setServices] = useState({
    piscina: false,
    seguridad: false,
  });

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
    const propiedad = await getProperty(id);
    if (!user.isAdmin && propiedad.creador !== user.uid) {
      throw new Error("No tienes permiso para editar esta propiedad");
    }
    try {
      await updateDoc(doc(db, "propiedades", id), propertyData);
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedForm = { ...form, imagen: imagenBase64 };
      await updateProperty(propiedad.id, updatedForm);
      onSave && onSave({ ...propiedad, ...updatedForm });
      toast.success("Propiedad actualizada correctamente");
      cerrar();
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
      toast.error("Hubo un error al actualizar la propiedad");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = (reader.onloadend = () => {
        setImagenBase64(reader.result);
        setImagenFile(imagenFile);
      });
      reader.readAsDataURL(file);
    } else {
      toast.error("Por favor, arrastra una imagen válida.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleImagenBase64 = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagenBase64(reader.result);
      setImagenFile(imagenFile);
      if (file) {
        toast.success("Imagen cargada correctamente");
      } else {
        toast.error("Por favor, selecciona una imagen válida");
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cerrar();
        }
      }}
    >
      <div className="bg-slate-100 p-6 rounded-xl z-10 shadow-xl relative max-w-2xl max-h-screen overflow-y-auto">
        <h1 className="text-2xl text-center font-bold mb-5 flex items-center justify-center gap-2 text-gray-800">
          <Building2 size={24} className="text-[#0077b6]" />
          Agregar Propiedad
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
              Categroía
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
                Antiguedad
              </span>{" "}
              <input
                type="number"
                name="antiguedad"
                value={form.antiguedad}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
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

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
              isDragging ? "bg-blue-200 border-blue-400" : "bg-slate-50"
            }`}
          >
            {imagenBase64 ? (
              <img
                src={imagenBase64}
                alt="Vista previa"
                className="w-full max-h-64 object-contain mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <UploadCloud className="w-12 h-12 mb-2 text-[#0077b6]" />
                <p>
                  Arrastra y suelta una imagen aquí o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="mt-2 px-4 py-2 bg-[#0077b6] text-white rounded hover:bg-[#005f87]cursor-pointer"
                >
                  Seleccionar Imagen
                </label>
              </div>
            )}
          </div>
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
              "Publicar Propiedad"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
export default EditProperty;
