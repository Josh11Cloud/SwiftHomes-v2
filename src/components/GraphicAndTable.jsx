import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import Spinner from "./Spinner";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

const GraphicPlusvalia = ({ propiedadId }) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlusvalia = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5500/api/plusvalia/detallado/${propiedadId}`);
                const data = await res.json();
                setDatos(data);
            } catch (error) {
                console.error("Error al cargar plusvalía detallada:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlusvalia();
    }, [propiedadId]);

    if (loading) return <Spinner />;
    if (!datos.length) return <p className="text-center text-gray-600 mb-3 mt-3">No hay datos disponibles.</p>;

    const formatter = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
    });

    const chartData = {
        labels: datos.map((item) => item.anio),
        datasets: [
            {
                label: "Valor estimado ($ MXN)",
                data: datos.map((item) => item.valor),
                fill: false,
                borderColor: "#0077b6",
                backgroundColor: "#0077b6",
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        return formatter.format(value);
                    },
                },
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return formatter.format(value);
                    },
                    color: "#333",
                },
            },
            x: {
                ticks: {
                    color: "#333",
                },
            },
        },
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
                <ChartNoAxesColumnIncreasing size={28} className="text-[#0077b6]" />
                Proyección de Plusvalía
            </h3>

            <div className="bg-slate-50 p-4 rounded shadow mb-4">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default GraphicPlusvalia;