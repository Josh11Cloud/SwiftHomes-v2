import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config"; 
import { useState } from "react";
import { useNavigate } from "react-router";
import { Link } from 'react-router-dom';
import toast from "react-hot-toast";
import { doc, setDoc, } from "firebase/firestore";
import { db } from "../firebase/config";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: "user",
        imagen: "",
      });
      toast.success("¡Cuenta creada correctamente!");
      navigate("/login");
    } catch (error) {
      toast.error("Error al crear la cuenta: " + error.message);
    }
  }

  return(
  <div className="max-w-md mx-auto mt-20 p-6 bg-slate-50 rounded 2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
      <form onSubmit={handleRegister} className="space-y-4">
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
          <button type="submit" className="w-full bg-[#0077b6] text-slate-50 py-2 rounded-xl hover:bg-[#005f87]">
            Registrarse
          </button>
        </form>
           <p className="text-sm mt-4 text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-black text-center hover:text-[#0077b6] underline">Iniciar Sesión</Link>
            </p>
    </div>
  );
}
