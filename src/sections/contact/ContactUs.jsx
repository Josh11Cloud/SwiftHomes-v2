import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import SimpleBot from "../../components/SimpleBot";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    tipoConsulta: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor, completa todos los campos requeridos");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          tipoConsulta: formData.tipoConsulta,
          message: formData.message,
          fecha: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        toast.success("¡Mensaje enviado con éxito!");
        setFormData({ name: "", email: "", message: "", tipoConsulta: "" });
      } else {
        throw new Error("Error al enviar el mensaje");
      }
    } catch (error) {
      toast.error("Hubo un error al enviar tu mensaje");
    } finally {
      setIsSubmitting(false);
    }
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
            Estamos aquí para <span className="text-gray-900">Ayudarte</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            ¿Tienes dudas, quieres asesoría o una propuesta personalizada?
            Escríbenos y te responderemos en menos de 24 horas.
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/correo.png"
          alt="Correo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>
      <div className="bg-white py-12 px-4 md:px-12" id="contact">
        <div className="bg-white py-12 px-4 md:px-12" id="contact">
          {isClient && <Toaster />}
        </div>
        <h2 className="text-3xl font-bold text-center text-[#0077B6] mb-4">
          Contáctanos
        </h2>
        <div className="space-y-2 text-sm text-gray-700 mb-4 font-semibold">
          <div className="flex items-center justify-center gap-2">
            <Phone className="text-[#0077B6]" size={20} />
            <span>+52 33 2788 2862</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Mail className="text-[#0077B6]" size={20} />
            <span>swifthomes.mx@gmail.com</span>
          </div>
        </div>

        <SimpleBot />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-6 rounded-2xl shadow space-y-4"
        >
          <input
            type="text"
            placeholder="Tu nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          />
          <input
            type="email"
            placeholder="Tu correo"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          />
          <select
            name="tipoConsulta"
            value={formData.tipoConsulta}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2 focus:outline-[#0077B6]"
          >
            <option value="">Selecciona una opción</option>
            <option value="propiedad">
              Quiero contactar por una propiedad
            </option>
            <option value="problema">Reportar un problema</option>
            <option value="consulta">Consulta general</option>
            <option value="asesoria">Agendar asesoría</option>
          </select>
          <textarea
            placeholder="Escribe tu mensaje..."
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-[#0077B6]"
          ></textarea>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
              isSubmitting ? "bg-gray-400" : "bg-[#0077b6] hover:bg-[#005f87]"
            }`}
          >
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </form>
      </div>
    </>
  );
}
