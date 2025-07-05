import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import Spinner from "./Spinner";

const GraficaCrecimientoZonas = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5500/api/zonas/historico");
                const data = await res.json();
                setDatos(data);
            } catch (error) {
                console.error("Error al cargar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorico();
    }, []);

    if (loading) return <Spinner />;
    if (!datos.length) return <p className="text-center text-gray-600">No hay datos disponibles.</p>;

    // Agrupamos los datos por mes
    const formatearMes = (fechaStr) => {
        const [a, m] = fechaStr.split(" ")[0].split("-");
        return `${a}-${m}`;
    };

    const zonas = [...new Set(datos.map((d) => d.zona))];
    const meses = [...new Set(datos.map((d) => formatearMes(d.fecha)))].sort();

    const datasets = zonas.map((zona, i) => {
        const color = ["#0077b6", "#90e0ef", "#00b4d8", "#03045e", "#0096c7", "#f94144", "#f3722c"][i % 7];
        const valoresPorMes = meses.map((mes) => {
            const entrada = datos.find((d) => formatearMes(d.fecha) === mes && d.zona === zona);
            return entrada ? entrada.precio_m2 : null;
        });

        return {
            label: zona,
            data: valoresPorMes,
            borderColor: color,
            backgroundColor: color,
            tension: 0.3,
            fill: false,
            spanGaps: true,
        };
    });

    const chartData = {
        labels: meses,
        datasets,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-slate-50 p-5 rounded shadow-md mt-6"
        >
            <h3 className="text-2xl font-bold mb-4 text-[#0077b6]">Crecimiento de Plusvalía por Zona (Histórico)</h3>
            <Line data={chartData} />
        </motion.div>
    );
};

export default GraficaCrecimientoZonas;