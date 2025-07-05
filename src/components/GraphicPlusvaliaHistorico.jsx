import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import unidecode from 'unidecode';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const GraphicHistorico = ({ zona }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (zona) {
      const zonaCodificada = encodeURIComponent(unidecode(zona.toLowerCase()));

      // Normalizador robusto
      const normalizar = str =>
        str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const zonaNormalizada = normalizar(zona);

      fetch(`http://127.0.0.1:5500/api/zonas/historico?zona=${zonaCodificada}`)
        .then(res => res.json())
        .then(data => {
          console.log("Datos recibidos: ", data);
          console.log("Zonas disponibles en la respuesta:", Object.keys(data));

          Object.keys(data).forEach(z => {
            console.log("→ zona en respuesta:", z, "| normalizada:", normalizar(z));
          });

          console.log("Zona original:", zona);
          console.log("Zona codificada:", zonaCodificada);
          console.log("Zona buscada normalizada:", zonaNormalizada);

          const zonaKey = Object.keys(data).find(z => normalizar(z) === zonaNormalizada);
          console.log("Zona clave encontrada en data:", zonaKey);

          const zonaData = zonaKey ? data[zonaKey] : [];
          if (zonaData.length > 0) {
            setData(zonaData);
          } else {
            console.log("No hay datos para la zona seleccionada");
            setData([]);
          }
        })
        .catch(err => console.error("Error obteniendo precios m2", err));
    }
  }, [zona]);

  if (!data || data.length === 0) {
    return <p className="text-gray-600 text-center mt-4">No hay datos disponibles</p>;
  }

  const fechasUnicas = Array.from(new Set(data.map(p => p.fecha))).sort();

  const dataset = {
    label: zona,
    data: fechasUnicas.map(fecha => {
      const item = data.find(p => p.fecha === fecha);
      return item ? item.precio_m2 : null;
    }),
    borderColor: "#0077b6",
    backgroundColor: "#0077b6",
    tension: 0.3,
    spanGaps: true,
    fill: false,
  };

  const chartData = {
    labels: fechasUnicas,
    datasets: [dataset],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-slate-50 p-4 rounded shadow-md w-full overflow-x-auto"
    >
      <h3 className="text-xl font-bold mb-4 text-[#0077b6]">Histórico de precios por m² en {zona}</h3>
      <div className="min-w-[300px] sm:min-w-[500px] md:min-w-[700px] text-gray-800">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
              tooltip: {
                callbacks: {
                  label: (context) =>
                    ` ${context.dataset.label}: $${context.parsed.y.toLocaleString("es-MX")} por m²`,
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  callback: (value) => `$${value.toLocaleString("es-MX")}`,
                },
                title: {
                  display: true,
                  text: "Precio por m² (MXN)",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Fecha",
                },
              },
            },
          }}
        />
      </div>
    </motion.div>
  );
};