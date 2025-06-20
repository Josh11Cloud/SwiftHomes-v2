import { useState } from "react";
import { useRouter } from 'next/router';
import toast from "react-hot-toast";
import Link from 'next/link';
import { useAuth } from "../context/AuthContext";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [imagen, setImagen] = useState("");


  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const success = await register(name, email, password, imagen);
      console.log("¿Se registró correctamente?", success);
      if (success) {
        if (typeof window !== "undefined") {
          router.push("/");
        }
        router.push("/");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || "Error en el servidor");
        toast.error("Hubo un error en el servidor, porfavor intenta d enuevo más tarde,");
      } else {
        setError("Error de conexión. Por favor, inténtalo de nuevo.");
        toast.error("Error de conexión")
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-slate-50 rounded 2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded-xl mb-5 border focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          required
        />
        <div>
          <label className="text-sm text-slate-500">Imagen (URL)</label>
          <input
            type="url"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          />
        </div>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded-xl mb-5 border focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded-xl mb-5 border focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          required
        />
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className={`w-full py-2 rounded-xl ${loading ? "bg-gray-400" : "bg-[#0077b6] hover:bg-[#005f87]"} text-slate-50`}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Registrarse"}
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        ¿Ya tienes una cuenta?
        <Link href="/login" className="text-black text-center hover:text-[#0077b6] underline">
          Iniciar Sesión
        </Link>
      </p>
    </div>
  );
}