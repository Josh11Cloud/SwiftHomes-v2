import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import db from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

function ActivityHistory() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user || !user.userId) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "activities", user.userId, "logs"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const activityList = querySnapshot.docs.map((doc) => doc.data());
        setActivities(activityList);
      } catch (error) {
        console.error("Error al obtener actividades:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="space-y-4 text-center mb-5">
      <h3 className="text-2xl font-bold text-[#0077b6]">
        Historial de Actividad
      </h3>
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div
            key={index}
            className="bg-slate-50 rounded-xl shadow-lg p-4 mb-4"
          >
            <p className="font-semibold text-[#212529]">
              {activity.activityType}
            </p>
            <p className="text-sm text-slate-500">{activity.description}</p>
            <p className="text-xs text-slate-400">
              {activity.timestamp?.toDate().toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">
          No se han registrado actividades recientes.
        </p>
      )}
    </div>
  );
}

export default ActivityHistory;