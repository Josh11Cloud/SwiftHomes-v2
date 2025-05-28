import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../firebase/config";
import { Activity, UploadCloud, Hourglass, Lightbulb, Scale, TrendingUp, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function PropertyForm() {

  const [imagenBase64, setImagenBase64] = useState("");
  const [resultados, setResultados] = useState(null); 
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const initialState = {
    nombre: "",
    ubicacion: "",
    precio: "",
    renta: "",
    tipo: "",
    habitaciones: "",
    baños: "",
    area: "",
    estacionamientos: "",
    descripcion: "",
    categoria: "",
    roi: null,
    paybackYears: null,
    isInvestment: null,
    userId: user.uid
  };

  const [form, setForm] = useState({
    ...initialState,
    userId: user.uid
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const validateForm = () => {
  const requiredFields = [
    "nombre", "ubicacion", "tipo",
    "habitaciones", "baños", "area", "estacionamientos",
    "descripcion", "categoria"
  ];

  if (form.categoria === "venta") {
    requiredFields.push("precio");
  } else if (form.categoria === "renta") {
    requiredFields.push("renta");
  }

  for (const field of requiredFields) {
    if (!form[field]) {
      toast.error(`El campo "${field}" es obligatorio`);
      return false;
    }
  }

  const numericFields = ["habitaciones", "baños", "area", "estacionamientos"];
  if (form.categoria === "venta") {
    numericFields.push("precio");
  } else if (form.categoria === "renta") {
    numericFields.push("renta");
  }

  for (const field of numericFields) {
    const value = Number(form[field]);
    if (isNaN(value) || value <= 0) {
      toast.error(`El campo "${field}" debe ser un número mayor que 0`);
      return false;
    }
    if (field !== "precio" && field !== "renta" && !Number.isInteger(value)) {
      toast.error(`El campo "${field}" debe ser un número entero`);
      return false;
    }
  }

  return true;
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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const propertyData = {
        ...form,
        ...(form.categoria === "venta" && { precio: Number(form.precio) }),    
        habitaciones: Number(form.habitaciones),
        baños: Number(form.baños),
        area: Number(form.area),
        estacionamientos: Number(form.estacionamientos),
        imagen: imagenBase64,
      };

      if (form.categoria === "renta") {
        const renta = Number(form.renta);
        const ingresosAnuales = renta * 12;
        const roi = (ingresosAnuales / propertyData.precio) * 100;
        const paybackYears = propertyData.precio / ingresosAnuales;
        const isInvestment = roi > 5 && paybackYears <= 10;

        propertyData.roi = parseFloat(roi.toFixed(2));
        propertyData.paybackYears = parseFloat(paybackYears.toFixed(1));
        propertyData.isInvestment = isInvestment;

        setResultados({
          roi: parseFloat(roi.toFixed(2)),
          paybackYears: parseFloat(paybackYears.toFixed(1)),
          isInvestment,
        });
      }

      try {
        await addDoc(collection(db, "propiedades"), propertyData);
        toast.error("Propiedad Guardada con Éxito!");
        setForm(prev => ({
          ...initialState,
          userId: prev.userId
        }));
        setImagenBase64("");
        setResultados(null);
      } catch (error) {
        toast.error("Error al guardar la Propiedad" + error);
      }
    };

  const handleImagenBase64 = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagenBase64(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  if (Number(form.precio) > 1000000000) {
  toast.error("El precio parece excesivamente alto. Verifica el valor ingresado.");
  return;
  }

  if (!user) return <p className="text-center mt-10">Debes de tener una cuenta para publicar una propiedad.</p>;

   return (
    <div>
    <div className='bg-slate-50'>
      <div className="min-h-screen bg-slate-100 mx-auto max-w-[800px]">
          <h1 className="text-2xl text-center p-4 font-bold text-gray-800">Agregar Propiedad</h1>
    <form onSubmit={handleSubmit} className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold text-[#0077B6]">Información General</h2>

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

      <h2 className="text-xl font-semibold text-[#0077B6]">Características</h2>

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
      <img src={imagenBase64} alt="Vista previa" className="w-full max-h-64 object-contain mx-auto" />
    ) : (
    <div className="flex flex-col items-center text-gray-500">
      <UploadCloud className="w-12 h-12 mb-2" />
      <p>Arrastra y suelta una imagen aquí o haz clic para seleccionar</p>
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
        Publicar Propiedad
      </button>
    </form>

     {/* Mostrar ROI y Payback */}
      {resultados && (
        <div className="mt-6 p-4 bg-slate-100 border rounded text-center">
          <h3 className="text-lg font-semibold mb-2">Resultado de la inversión</h3>
          <p><Activity className="w-4 h-4 mr-1 text-[#0077b6]" /> ROI: {resultados.roi}%
          {/* Barra visual del ROI */}
            <div className="mt-2 w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-full transition-all duration-500"
                style={{
                width: `${Math.min(resultados.roi, 100)}%`,
                backgroundColor:
                    resultados.roi >= 8
                    ? "#38b000" 
                    : resultados.roi >= 5
                    ? "#ffba08" 
                    : "#d00000", 
                }}
            ></div>
            </div>
            </p>
            <p className="text-sm mt-1 italic flex items-center gap-2">
            {resultados.roi >= 8 ? (
                <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                Excelente rendimiento
                </>
            ) : resultados.roi >= 5 ? (
                <>
                <Scale className="w-4 h-4 text-yellow-600" />
                Aceptable pero mejorable
                </>
            ) : (
                <>
                <Wallet className="w-4 h-4 text-red-600" />
                Poco atractivo para invertir
                </>
            )}
            </p>
          <p><Hourglass className="w-4 h-4 mr-1 text-[#0077b6]" /> Payback: {resultados.paybackYears} años</p>
          <p><Lightbulb className="w-4 h-4 mr-1 text-[#0077b6]" /> Clasificada como{" "}
            <strong>{resultados.isInvestment ? "INVERSIÓN RENTABLE ✅" : "NO RENTABLE ⚠️"}</strong>
          </p>
        </div>
      )}
    </div>
    </div>
  </div>
  );
}