import { collection, getDocs, query, where } from "firebase/firestore";
import db from "../../firebase/config";
import { Eye } from "lucide-react";

const getVisitasMensuales = async (userId: string) => {
  console.log("Obteniendo datos de visitas mensuales...");
  const propiedadesQuery = query(
    collection(db, "propiedades"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(propiedadesQuery);
  console.log("Documentos obtenidos:", snapshot.docs.length);

  const visitasPorMes: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const visitas = doc.data().visitas;
    if (visitas && visitas.cantidad && visitas.fecha) {
      const mes = new Date(visitas.fecha.toDate()).toLocaleString("default", {
        month: "short",
      });
      visitasPorMes[mes] = (visitasPorMes[mes] || 0) + visitas.cantidad;
    }
  });

  const chartData = Object.entries(visitasPorMes).map(([mes, visitas]) => ({
    mes,
    visitas,
  }));

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
};

const getEstadoPropiedades = async (userId: string) => {
  const propiedadesQuery = query(
    collection(db, "propiedades"),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(propiedadesQuery);

  const estados = {
    publicada: 0,
    pendiente: 0,
    archivada: 0,
    vendida: 0,
  };

  snapshot.forEach((doc) => {
    const estado = doc.data().status;
    if (estado && estados[estado] !== undefined) {
      estados[estado]++;
    }
  });

  return estados;
};

export default getVisitasMensuales;
export { getEstadoPropiedades };
