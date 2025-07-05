import { Eye } from "lucide-react";

export const getVisitasMensuales = async () => {
  try {
    const res = await fetch(
      `http://192.168.100.64:5500/api/propiedades/visitas`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const visitas = await res.json();

    const chartData =
      visitas && Array.isArray(visitas)
        ? visitas.map((item: any) => ({
            mes: item.mes,
            visitas: item.visitas,
          }))
        : [];

    const sortedChartData = chartData.sort(
      (a, b) =>
        new Date(`1 ${a.mes} 2025`).getTime() -
        new Date(`1 ${b.mes} 2025`).getTime()
    );

    const actividadCards = sortedChartData.map((item) => ({
      label: item.mes,
      valor: item.visitas,
      icon: <Eye className="text-[#0077b6]" size={20} />,
    }));

    return { chartData: sortedChartData, actividadCards };
  } catch (error) {
    console.error("Error al obtener visitas mensuales desde Flask:", error);
    return { chartData: [], actividadCards: [] };
  }
};

export const getEstadoPropiedades = async () => {
  try {
    const res = await fetch(
      `http://192.168.100.64:5500/api/propiedades/estados`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al obtener estados desde Flask:", error);
    return {};
  }
};

export default getVisitasMensuales;
