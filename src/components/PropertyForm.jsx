import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Activity, Hourglass, Lightbulb, Scale, TrendingUp, Wallet } from "lucide-react";

export default function PropertyForm() {
  const [imagenBase64, setImagenBase64] = useState("");
  const [resultados, setResultados] = useState(null); 

  const [form, setForm] = useState({
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
      alert(`El campo "${field}" es obligatorio`);
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
      alert(`El campo "${field}" debe ser un número mayor que 0`);
      return false;
    }
    if (field !== "precio" && field !== "renta" && !Number.isInteger(value)) {
      alert(`El campo "${field}" debe ser un número entero`);
      return false;
    }
  }

  return true;
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

    const precio = Number(form.precio);
    const renta = Number(form.renta);

    const ingresosAnuales = renta * 12;
    const roi = (ingresosAnuales / precio) * 100;
    const paybackYears = precio / ingresosAnuales;
    const isInvestment = roi > 5 && paybackYears <= 10;

   
  try {
    const propertyData = {
      ...form,
      precio,
      habitaciones: Number(form.habitaciones),
      baños: Number(form.baños),
      area: Number(form.area),
      estacionamientos: Number(form.estacionamientos),
      imagen: imagenBase64,
    };

    if (form.categoria === "renta") {
      const renta = Number(form.renta);
      const ingresosAnuales = renta * 12;
      const roi = (ingresosAnuales / precio) * 100;
      const paybackYears = precio / ingresosAnuales;
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

    await addDoc(collection(db, "propiedades"), propertyData);

    alert("Propiedad Guardada con Éxito!");

      setResultados({
        roi: parseFloat(roi.toFixed(2)),
        paybackYears: parseFloat(paybackYears.toFixed(1)),
        isInvestment,
      });

      setForm({
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
      });
      setImagenBase64("");

    } catch (error) {
      console.error("Error al guardar la Propiedad", error);
      alert("Hubo un error al guardar la Propiedad");
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

   return (
    <div>
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

      <label className="block">
        Imagen
        <input
          type="file"
          accept="image/*"
          onChange={handleImagenBase64}
          className="block w-full mt-1 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
        />
      </label>

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
  );
}