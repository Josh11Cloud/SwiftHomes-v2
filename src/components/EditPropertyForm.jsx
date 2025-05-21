import { UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "sonner"; 

function EditProperty({ propiedad, abierto, cerrar, onSave }) {
  const [form, setForm] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [imagenBase64, setImagenBase64] = useState("");

  useEffect(() => {
    if (propiedad) {
      setForm(propiedad);
    }
  }, [propiedad]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const updateProperty = async (id, propertyData) => {
    try {
        await updateDoc(doc(db, "propiedades", id), propertyData);
    } catch (error) {
        console.error("Error al actualizar la propiedad:", error);
    }
    };


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await updateProperty(propiedad.id, form);
    onSave && onSave({ ...propiedad, ...form });
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
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenBase64(reader.result);
    };
    reader.readAsDataURL(file);
    } else {
      toast.error("Por favor, arrastra una imagen válida.");
    }
  }

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
      if (file) {
      reader.readAsDataURL(file);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
      <div className="bg-slate-50 p-4 rounded-lg shadow-lg max-h-screen overflow-y-auto w-1/2">
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-[#0077B6]">
            Editar Propiedad
          </h2>
          <label className="block">
            Nombre
            <input
              name="nombre"
              required
              value={form.nombre}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Ubicación
            <input
              name="ubicacion"
              required
              value={form.ubicacion}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Categoría
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
                Precio ($)
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
              Renta Mensual ($)
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
            Tipo
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

          <h2 className="text-xl font-semibold text-[#0077B6]">
            Características
          </h2>

          <label className="block">
            Habitaciones
            <input
              type="number"
              name="habitaciones"
              value={form.habitaciones}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Baños
            <input
              type="number"
              name="baños"
              value={form.baños}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Área (m²)
            <input
              type="number"
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Estacionamientos
            <input
              type="number"
              name="estacionamientos"
              value={form.estacionamientos}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <label className="block">
            Descripción
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            />
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
              isDragging ? "bg-blue-100 border-blue-400" : "bg-white"
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
                <UploadCloud className="w-12 h-12 mb-2" />
                <p>
                  Arrastra y suelta una imagen aquí o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagenBase64}
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
          >
            Actualizar Información
          </button>
        </form>
      </div>
    </div>
  );
}
export default EditProperty;