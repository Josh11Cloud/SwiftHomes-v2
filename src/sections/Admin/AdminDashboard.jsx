import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <section className="max-w-6xl mx-auto mt-10 text-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#0077b6]">Panel de Administrador</h1>
      <p className="text-slate-600 mb-4">Bienvenido {user?.nombre || user?.email} 👑</p>
      <p>Aquí podrás ver estadísticas, usuarios y propiedades.</p>
    </section>
  );
}
