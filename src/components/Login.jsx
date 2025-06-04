import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { addActivity } from "./AddActivity";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      toast.success("¡Bienvenido de nuevo!");
      addActivity(user.uid, "login", "El usuario inició sesión");
      router.push("/", undefined, { shallow: true });
    } catch (error) {
      toast.error("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-slate-50 rounded 2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          className="w-full p-2 rounded-xl mb-5 border focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          className="w-full p-2 rounded-xl mb-5 border focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#0077b6] text-slate-50 py-2 rounded-xl hover:bg-[#005f87] transition"
        >
          Ingresar
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="text-black text-center hover:text-[#0077b6] underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}
