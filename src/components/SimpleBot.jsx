import { Bot, X } from 'lucide-react';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const respuestas = [
    {
        keywords: ["vender", "venda", "venta"],
        respuesta: "Para vender tu propiedad haz click en tu cuenta en la esquina superior derecha, haz click en 'Agregar Propiedad' y completa el formulario. ¡Te contactaremos pronto",
    },
    {
        keywords: ["comprar", "compra"],
        respuesta: "Para comprar, explora nuestras propiedades en la sección comprar. Puedes encontrar tu nuevo hogar filtrando por ubicacion, precio y más!."
    },
    {
        keywords: ["rentar", "renta", "alquiler"],
        respuesta: "Para alquilar una propiedad, ve a la sección de renta y filtra por ciudad o tipo de propiedad!.",
    },
    {
        keywords: ["invertir", "inversiones", "inversión"],
        respuesta: "Puedes ver oportunidades de inversión en la sección de Inversiones, calculamos ROI, Rendimiento y Retorno estimado para ayudarte a tener un mejor futuro!",
    },
    {
        keywords: ["ayuda", "contacto", "contactar"],
        respuesta: "Necesitas ayuda? Ve a la sección de contacto, llena el formulario en base a tu petición y nos pondremos en contacto contigo.",
    },
    {
        keywords: ["editar", "modificar", "cambiar", "eliminar", "borrar", "quitar"],
        respuesta: "Necesitas editar o eliminar una propiedad que publicaste? No te preocupes puedes ir a la sección de 'Mis Propiedades' dentro de tu Dashboard o puedes navegar hasta ahí haciendo click en tu cuenta en la esquina superior derecha y hacer click en 'Mis Propiedades', puedes modificar la información en el formulario o si necesitas eliminarla simplemente haz click en el icono de borrar y listo!.",
    },
    {
        keywords: ["mi cuenta", "editar perfil", "editar información"],
        respuesta: "Puedes ver tu información o editar tu perfil en la seccion mi cuenta!.",
    },
    {
        keywords: ["mis inversiones", "mis propiedades", "mis favoritos"],
        respuesta: "Puedes ver toda tu información de propiedades, inversiones o favoritos dentro de tu Dashboard, monitorea o busca propiedades con facilidad!"
    },
    {
        keywords: ["registro", "registrar", "crear cuenta", "cuenta nueva"],
        respuesta: "Puedes crear una cuenta desde la esquina superior derecha haciendo clic en 'Registrarse'."
    },
    {
        keywords: ["problema", "error", "bug"],
        respuesta: "Si detectaste un error, por favor repórtalo en la sección de contacto seleccionando 'Reportar problema'."
    },
];

function SimpleBot() {
  const [input, setInput] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [visible, setVisible] = useState(true);

  const manejarPregunta = async () => {
  const pregunta = input.toLowerCase();
  const coincidencia = respuestas.find(obj =>
    obj.keywords.some(keyword => pregunta.includes(keyword))
  );

  if (coincidencia) {
    setRespuesta(coincidencia.respuesta);
  } else {
    try {
      const res = await fetch("/api/openAI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: input })
      });

      const data = await res.json();
      const textoAI = data.choices?.[0]?.message?.content;
      setRespuesta(textoAI || "Lo siento, no encontré una respuesta.");
    } catch (error) {
      console.error(error);
      setRespuesta("Hubo un error al contactar al asistente. Intenta más tarde.");
    }
  }

  setInput('');
};

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 right-4 bg-white p-4 rounded-xl shadow-2xl max-w-md w-[90%] sm:w-[400px] z-50"
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 font-bold text-[#0077b6]">
              <Bot size={22} />
              <span>SwiftBot</span>
            </div>
            <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-red-600 transition">
              <X size={20} />
            </button>
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿Cómo puedo ayudarte?"
            className="border border-gray-300 p-2 w-full rounded mb-2 focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={manejarPregunta}
            className="bg-[#0077b6] text-white w-full py-2 rounded hover:bg-[#005f87] transition"
          >
            Preguntar
          </motion.button>

          {respuesta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-gray-100 p-3 rounded"
            >
              {respuesta}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SimpleBot;