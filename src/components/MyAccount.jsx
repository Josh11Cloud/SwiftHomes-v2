import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Button from "./ui/button";
import { LogOut, UserCircle } from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import usuario from '../assets/images/usuario.png'

function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = async () => {
      try {
        await logout();
        toast.success("Sesión cerrada correctamente");
        navigate("/");
      } catch (error) {
        toast.error("Error al cerrar sesión:", error);
      }
    };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-lg font-semibold text-slate-500">
          No estás logueado.
        </p>
      </div>
    );
  }

  return (
    <>
 {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r sm:min-h-180px min-h-[280px] from-[#2d7195] to-[#0077B6] text-center">
      <div className='text-center mt-6 md:mt-0'>
      <motion.h1
      initial={{ opacity: 0, y:-20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration: 0.8 }}
      className="text-3xl md:text-5xl font-bold mb-4 text-slate-100">
        Invierte con <span className="text-gray-900">Inteligencia</span></motion.h1>
        <motion.p 
        initial={{ opacity: 0, y:20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 1 }}
        className="text-base md:text-lg text-slate-800">Multiplica tu dinero con propiedades seleccionadas para inversión
        </motion.p>
        </div>
         <motion.img 
         src={usuario} 
         alt="usuario"
        initial={{ opacity: 0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.8 }} 
         className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"/>
      </section> 

    
    <section className="max-w-2xl mx-auto mt-16 px-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0077b6]">
        Mi Cuenta
      </h2>

      <div className="bg-slate-50 rounded-2xl shadow-lg p-8 border border-slate-200 space-y-6">
        {/* Foto de perfil */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Foto de perfil"
            className="w-20 h-20 rounded-full object-cover border border-slate-300 shadow"
          />
        ) : (
          <UserCircle size={40} className="text-slate-400" />
        )}

        {/* Email */}
        <div>
          <p className="text-sm text-slate-500">Correo electrónico</p>
          <p className="text-lg font-medium text-[#212529]">{user.email}</p>
        </div>

        {/* UID */}
        <div>
          <p className="text-sm text-slate-500">ID de usuario</p>
          <p className="text-xs font-mono text-[#6c757d] break-all">{user.uid}</p>
        </div>

      {isModalOpen && (
        <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
      
      <Button
        onClick={() => setIsModalOpen(true)}
        className="block text-center w-full bg-slate-200 hover:bg-slate-300 font-medium py-2 rounded-xl transition"
      >
        <span className="text-[#0077b6]">Editar perfil</span>
      </Button>

        {/* Botón Ver Mis Propiedades */}
        <Link
          to="/mis-propiedades"
          className="block text-center w-full bg-slate-200 hover:bg-slate-300 text-[#0077b6] font-medium py-2 rounded-xl transition"
        >
          Ver mis propiedades
        </Link>


        {/* Botón Cerrar Sesión */}
        <Button
          onClick={handleLogout}
          className="w-full bg-[#0077b6] hover:bg-[#005f87] text-white flex items-center justify-center gap-2 py-2 rounded-xl transition"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </Button>
      </div>

      {/* Sección futura */}
      <div className="mt-10 text-center text-sm text-slate-500">
        En el futuro podrás ver tus propiedades favoritas, historial y más.
      </div>
    </section>
    </>
  );
}

export default MyAccount;
