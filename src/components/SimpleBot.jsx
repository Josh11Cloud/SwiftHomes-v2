import { Bot, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import respuestasData from "../data/response.json";

function SimpleBot() {
  const [input, setInput] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [visible, setVisible] = useState(true);

  const manejarPregunta = () => {
    const pregunta = input.toLowerCase();

    const coincidencia = respuestasData.find((obj) =>
      obj.keywords.some((keyword) => pregunta.includes(keyword))
    );

    if (coincidencia) {
      setRespuesta(coincidencia.respuesta);
    } else {
      setRespuesta(
        "Lo siento, no tengo una respuesta para eso. Pronto aprenderé más 😊"
      );
    }

    setInput("");
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
            <button
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-red-600 transition"
            >
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