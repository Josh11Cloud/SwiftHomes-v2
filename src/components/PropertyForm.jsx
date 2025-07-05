import { useState } from "react";
import {
  BedDouble,
  BrickWall,
  Building2,
  CalendarClock,
  DollarSign,
  FileText,
  Handshake,
  Hammer,
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
  Trash2,
} from "lucide-react";
import { addActivity } from "./AddActivity";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import Spinner from "../components/Spinner";

export default function PropertyForm() {
  const { user } = useAuth();

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
    roi: null,
    paybackYears: null,
    isInvestment: null,
    userid: "",
    antiguedad: "",
    financiamiento: false,
    servicios: [],
    remodelar: false,
    precioNegociable: false,
  });

  const [services, setServices] = useState({
    piscina: false,
    seguridad: false,
  });

  const [imagenes, setImagenes] = useState([]);
  const [imagenesBase64, setImagenesBase64] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.userid) {
      setForm((prev) => ({ ...prev, userid: user.userid }));
    }
  }, [user]);

  console.log("user: ", user);
  console.log("userid: ", user?.userid)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      const numericFields = [
        "precio", "renta", "habitaciones", "banos", "area", "estacionamientos", "antiguedad"
      ];
      setForm((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? Number(value) : value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setServices((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const required = [
      "nombre",
      "ubicacion",
      "tipo",
      "descripcion",
      "categoria",
    ];

    if (form.tipo !== "Terreno") {
      required.push("area");
    }

    const numeric = ["habitaciones", "banos", "area", "estacionamientos"];
    if (form.categoria === "venta" && (!form.precio || form.precio <= 0)) {
      toast.error("Debes ingresar un valor válido para el precio");
      return false;
    }

    if (form.categoria === "renta" && (!form.renta || form.renta <= 0)) {
      toast.error("Debes ingresar un valor válido para la renta");
      return false;
    }

    if (form.precio <= 0) {
      toast.error("El precio debe ser mayor que 0");
      return false;
    }
    if (!form.descripcion.trim()) {
      toast.error("La descripción no puede estar vacía");
      return false;
    }

    for (const field of numeric) {
      if (form.tipo === "Terreno" && ["habitaciones", "banos", "estacionamientos", "antiguedad"].includes(field)) {
        continue;
      }
      const value = Number(form[field]);
      if (isNaN(value) || value <= 0) {
        toast.error(`"${field}" debe ser un número mayor que 0`);
        return false;
      }
      if (!["precio", "renta"].includes(field) && !Number.isInteger(value)) {
        toast.error(`"${field}" debe ser un número entero`);
        return false;
      }
    }

    if (imagenes.length === 0) {
      toast.error("Debes subir al menos una imagen");
      return false;
    }

    return true;
  };

  const cloudName = "dhtysitwx";
  const uploadPreset = "swifthomes-v3";

  const handleImageUpload = async (e) => {
    let files;
    if (e.target && e.target.files) {
      files = e.target.files;
    } else if (e.files) {
      files = e.files;
    } else {
      return;
    }
    if (!files) return;

    for (const file of files) {
      if (
        !file.type.startsWith("image/") ||
        !/\.(jpg|jpeg|png|webp)$/i.test(file.name)
      ) {
        toast.error("Formato de imagen no permitido");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen supera los 5MB");
        return;
      }
    }

    try {
      setLoading(true);
      const nuevasImagenes = [];
      const nuevasImagenesBase64 = [];

      for (const file of files) {
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
          nuevasImagenes.push(file);
          nuevasImagenesBase64.push(data.secure_url);
        } else {
          throw new Error("Error al subir imagen");
        }
      }

      setImagenes((prevImagenes) => [...prevImagenes, ...nuevasImagenes]);
      setImagenesBase64((prevImagenesBase64) => [...prevImagenesBase64, ...nuevasImagenesBase64]);
      toast.success("Imágenes cargadas correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const serviciosSeleccionados = Object.keys(services).filter(
      (key) => services[key]
    );
    setForm((prev) => ({ ...prev, servicios: serviciosSeleccionados }));
  }, [services]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload({ target: { files } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const propiedad = {
      nombre: form.nombre,
      ubicacion: form.ubicacion,
      precio: form.categoria === "venta" ? Number(form.precio) : null,
      renta: form.categoria === "renta" ? Number(form.renta) : null,
      tipo: form.tipo,
      habitaciones: form.habitaciones ? Number(form.habitaciones) : 0,
      banos: form.banos ? Number(form.banos) : 0,
      estacionamientos: form.estacionamientos ? Number(form.estacionamientos) : 0,
      area: form.area,
      descripcion: form.descripcion,
      categoria: form.categoria,
      imagenes: imagenesBase64,
      antiguedad: Number(form.antiguedad),
      financiamiento: form.financiamiento,
      servicios: Object.keys(services).filter((service) => services[service]),
      userid: user?.userid,
      isInvestment: form.isInvestment,
      fechaEnvio: new Date().toISOString(),
      remodelar: form.remodelar,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://192.168.100.64:5500/api/propiedades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(propiedad),
      });

      const data = await response.json();
      console.log("datos:", data)

      if (response.ok) {
        toast.success("Propiedad publicada");
        addActivity(
          user.userid,
          "published_property",
          "El usuario ha publicado una propiedad"
        );
        if (user) {
          setForm({
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
            roi: null,
            paybackYears: null,
            isInvestment: null,
            userid: user.userid,
            antiguedad: "",
            financiamiento: false,
            servicios: [],
            remodelar: false,
            precioNegociable: false,
          });
          setImagenes([]);
          setImagenesBase64([]);
        }
      } else {
        toast.error("Error al publicar");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Debes tener una cuenta para publicar propiedades.
      </p>
    );
  }
  return (
    <div>
      <div className="bg-slate-50">
        <div className="min-h-screen bg-slate-100 mx-auto max-w-[800px] p-4">
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
                className="h-4 w-4 text-[#0077b6]"
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
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Oficina">Oficina</option>
                <option value="Terreno">Terreno</option>
              </select>
            </label>

            <h2 className="text-xl font-semibold text-[#0077B6] flex items-center gap-2">
              <Info size={20} />
              Características
            </h2>

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

            {form.tipo !== "Terreno" && (
              <div>
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
                </div>
              </div>
            )}

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
              className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${isDragging ? "bg-blue-200 border-blue-400" : "bg-slate-50"
                }`}
            >
              {imagenesBase64.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {imagenesBase64.map((imagen, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imagen}
                        alt="Vista previa"
                        className="w-full h-64 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagenesBase64(prevImagenes => prevImagenes.filter((img, i) => i !== index));
                          setImagenes(prevImagenes => prevImagenes.filter((img, i) => i !== index));
                        }}
                        className="flex justify-center absolute inset-0 bg-red-600 text-white rounded-full p-2 w-8 h-8 hover:scale-105 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center text-gray-500">
                <UploadCloud className="w-12 h-12 mb-2 text-[#0077b6]" />
                <p>
                  Arrastra y suelta una imagen aquí o haz clic para
                  seleccionar
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
    </div>
  );
}
