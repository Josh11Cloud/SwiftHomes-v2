import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "./ui/button";
import {
  LogOut,
  UserCircle,
  Pencil,
  KeyRound,
  HouseIcon,
  LayoutIcon,
} from "lucide-react";
import EditProfileModal from "./EditProfileModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { addActivity } from "./AddActivity";
import LogoutConfirmationModal from "./LogOutConfirmationModal";

function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const handleLogout = async () => {
    try {
      const currentUserId = user.userId;
      setIsLogoutModalOpen(false);
      await logout();
      toast.success("Sesión cerrada correctamente");
      addActivity(currentUserId, "logout", "El usuario ha cerrado sesión");
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
  const handleChangePassword = async () => {
    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      addActivity(
        user.userId,
        activityType,
        description,
        "password_update",
        "El usuario actualizó su contraseña"
      );

      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        toast.success("Contraseña actualizada correctamente");
        setShowModal(false);
      }
    } catch (error) {
      toast.error("Error al actualizar la contraseña: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirmation = async () => {
    setIsLogoutModalOpen(false);
    await handleLogout();
  };

  return (
    <>
      {/* HERO */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-12 bg-gradient-to-r from-[#2d7195] to-[#0077B6] text-center">
        <div className="text-center mt-6 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold mb-4 text-slate-100"
          >
            Tu espacio, tus <span className="text-gray-900">Decisiones</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-base md:text-lg text-slate-800"
          >
            Consulta tus actividades, actualiza tu información y mantente al
            día.
          </motion.p>
        </div>
        <motion.img
          src="/assets/images/usuario.png"
          alt="usuario"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full sm:w-full md:w-1/2 h-60 max-h-64 object-contain"
        />
      </section>

      {/* CUENTA */}
      <section className="max-w-2xl mx-auto mt-16 px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#0077b6]">
          Mi Cuenta
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-50 rounded-2xl shadow-lg p-8 border border-slate-200 space-y-6"
        >
          {/* Foto */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full object-cover border border-slate-300 shadow"
            />
          ) : (
            <UserCircle size={40} className="text-slate-400" />
          )}

          {/* Email + userId */}
          <div>
            <p className="text-sm text-slate-500">Correo electrónico</p>
            <p className="text-lg font-medium text-[#212529]">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">ID de usuario</p>
            <p className="text-xs font-mono text-[#6c757d] break-all">
              {user.userId}
            </p>
          </div>

          {/* MODAL EDITAR PERFIL */}
          {isModalOpen && (
            <EditProfileModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}

          {/* Botones */}
          <div className="space-y-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-2 justify-center bg-slate-100 hover:bg-slate-200 font-medium py-2 rounded-xl transition"
            >
              <Pencil className="w-5 h-5 text-[#0077b6]" />
              <span className="text-[#0077b6]">Editar perfil</span>
            </Button>

            <Button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-2 justify-center bg-slate-100 hover:bg-slate-200 font-medium py-2 rounded-xl transition"
            >
              <KeyRound className="w-5 h-5 text-[#0077b6]" />
              <span className="text-[#0077b6]">Cambiar contraseña</span>
            </Button>

            {showModal && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setShowModal(false);
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg w-full max-w-md p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-bold mb-2">Cambiar contraseña</h2>
                  <div className="mb-4">
                    <label className="text-sm text-slate-500">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-sm text-slate-500">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setShowModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 font-medium py-2 px-4 rounded-xl transition"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="bg-[#0077b6] text-white font-medium py-2 px-4 rounded-xl transition"
                      disabled={loading}
                    >
                      {loading ? "Cargando..." : "Guardar"}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
            <Link
              href="/mis-propiedades"
              className="w-full flex items-center gap-2 justify-center bg-slate-100 hover:bg-slate-200 font-medium py-2 rounded-xl transition"
            >
              <HouseIcon className="w-5 h-5 text-[#0077b6]" />
              <span className="text-[#0077b6]"> Ver mis propiedades</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-2 justify-center bg-slate-100 hover:bg-slate-200 font-medium py-2 rounded-xl transition"
            >
              <LayoutIcon className="w-5 h-5 text-[#0077b6]" />
              <span className="text-[#0077b6]">
                Ver tus propiedades favoritas, actividad y más.
              </span>
            </Link>

            <Button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full bg-[#0077b6] hover:bg-[#005f87] text-slate-50 flex items-center justify-center gap-2 py-2 rounded-xl transition"
            >
              <LogOut className="w-5 h-5" /> Cerrar sesión
            </Button>
            <LogoutConfirmationModal
              isOpen={isLogoutModalOpen}
              onClose={() => setIsLogoutModalOpen(false)}
              onConfirm={handleLogout}
            />
          </div>
        </motion.div>
      </section>
    </>
  );
}

export default MyAccount;
