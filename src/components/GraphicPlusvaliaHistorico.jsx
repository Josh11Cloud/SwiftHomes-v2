import { motion } from "framer-motion";
import { Camera } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import unidecode from "unidecode";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const GraphicHistorico = ({ zona, idPropiedad }) => {
  const [data, setData] = useState([]);
  const [predicciones, setPredicciones] = useState([]);
  const [showReal, setShowReal] = useState(true);
  const [showSimulado, setShowSimulado] = useState(true);
  const [showPrediccion, setShowPrediccion] = useState(true);
  const chartRef = useRef(null);

  const normalizar = (str) =>
    unidecode(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  useEffect(() => {
    if (!zona) return;

    const zonaCodificada = encodeURIComponent(unidecode(zona.toLowerCase()));
    const zonaNormalizada = normalizar(zona);

    Promise.all([
      fetch(`http://127.0.0.1:5500/api/zonas/historico?zona=${zonaCodificada}`).then((res) => res.json()),
      fetch("http://127.0.0.1:5500/api/plusvalia/predicciones").then((res) => res.json())
    ])
      .then(([dataHistorico, dataPredicciones]) => {
        setPredicciones(dataPredicciones);

        const zonaKey = Object.keys(dataHistorico).find(
          (z) => unidecode(z).toLowerCase() === zonaNormalizada
        );
        const zonaData = zonaKey ? dataHistorico[zonaKey] : [];
        setData(zonaData);
      })
      .catch((err) => console.error("Error cargando datos", err));
  }, [zona]);

  const prediccionActual = predicciones.find(p => p.id === idPropiedad);

  if (!data || data.length === 0) {
    return <p className="text-gray-600 text-center mt-4">No hay datos disponibles</p>;
  }

  const fechasUnicas = Array.from(new Set(data.map((p) => p.fecha))).sort();

  const reales = data.filter((d) => d.fuente === "propiedades.com");
  const simulados = data.filter((d) => d.fuente === "simulado");
  const prediccion = data.filter((d) => d.fuente === "prediccion");

  const makeDataset = (label, puntos, color, dash = []) => ({
    label,
    data: fechasUnicas.map((f) => {
      const item = puntos.find((p) => p.fecha === f);
      return item ? item.precio_m2 : null;
    }),
    borderColor: color,
    backgroundColor: color,
    borderDash: dash,
    tension: 0.3,
    spanGaps: true,
    fill: false,
  });

  const datasets = [];
  if (showReal) datasets.push(makeDataset("Histórico Real", reales, "#0077b6"));
  if (showSimulado) datasets.push(makeDataset("Histórico Simulado", simulados, "#0ea5e9d9", [6, 3]));
  if (showPrediccion) datasets.push(makeDataset("Predicción", prediccion, "#14b8a6d9", [2, 2]));

  const chartData = {
    labels: fechasUnicas,
    datasets,
  };

  const handleDownload = async () => {
    const chartEl = chartRef.current;
    if (chartEl) {
      const canvas = await html2canvas(chartEl);
      const link = document.createElement("a");
      link.download = `historico_${zona}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-white p-4 rounded shadow-md w-full overflow-x-auto"
    >
      <h3 className="text-xl font-bold mb-2 text-[#0077b6]">
        Histórico y predicción en {zona}
      </h3>

      <div className="flex flex-wrap gap-4 items-center mb-4 text-sm text-gray-600">
        <label>
          <input className="checkbox" type="checkbox" checked={showReal} onChange={() => setShowReal(!showReal)} />{" "}
          <span className="font-medium">Histórico Real</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showSimulado}
            className="checkbox accent-sky-500"
            onChange={() => setShowSimulado(!showSimulado)}
          />{" "}
          <span className="font-medium">Simulado</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPrediccion}
            className="checkbox accent-teal-500"
            onChange={() => setShowPrediccion(!showPrediccion)}
          />{" "}
          <span className="font-medium">Predicción</span>
        </label>

        <button
          onClick={handleDownload}
          className="ml-auto bg-[#0077b6] text-slate-50 px-3 py-1 rounded hover:bg-[#005f87] transition flex items-center"
        >
          <Camera size={18} className="mr-2" />
          Guardar gráfico
        </button>
      </div>

      <div
        className="min-w-[300px] sm:min-w-[500px] md:min-w-[700px] h-[350px]"
        ref={chartRef}
      >
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const current = context.parsed.y;
                    const index = context.dataIndex;
                    const dataset = context.dataset.data;
                    const prev = dataset[index - 1];

                    let growth = "";
                    if (prev && prev !== 0) {
                      const percent = ((current - prev) / prev) * 100;
                      growth = ` (${percent.toFixed(2)}%)`;
                    }

                    return ` ${context.dataset.label}: $${current.toLocaleString("es-MX")} por m²${growth}`;
                  },
                },
              },
            },
            scales: {
              y: {
                max: Math.max(...data.map((d) => d.precio_m2)),
                ticks: {
                  callback: (value) => `$${value.toLocaleString("es-MX")}`,
                },
                title: {
                  display: true,
                  text: "Precio por m² (MXN)",
                  color: "#0077b6",
                  font: {
                    weight: "bold",
                  },
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Fecha",
                  color: "#0077b6",
                  font: {
                    weight: "bold",
                  },
                },
              },
            },
          }}
        />
      </div>
      {prediccionActual && (
        <div className="mt-4 text-center">
          <p className="text-sm text-center text-gray-700 bg-slate-200 w-full">
            Plusvalía esperada:{" "}
            <span
              className={`font-semibold ${prediccionActual.clasificacion === "alta"
                ? "text-green-600"
                : prediccionActual.clasificacion === "media"
                  ? "text-yellow-600"
                  : "text-red-600"
                }`}
            >
              {prediccionActual.plusvalia}% anual
            </span>
          </p>
        </div>
      )}
    </motion.div>
  );
};