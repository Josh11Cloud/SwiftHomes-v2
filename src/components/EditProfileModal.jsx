import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import db from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { addActivity } from "./AddActivity";

function EditProfileModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const auth = getAuth();

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [imagenBase64, setImagenBase64] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: imagenBase64,
      });

      if (newEmail && newEmail !== user.email) {
        await updateEmail(auth.currentUser, newEmail);
        addActivity(
          user.userId,
          "updated_email",
          "El usuario ha actualizado su correo"
        );
      }

      if (newPassword) {
        await updatePassword(auth.currentUser, newPassword);
        addActivity(
          user.userId,
          "updated_password",
          "El usuario ha actualizado su contraseña"
        );
      }

      await updateDoc(doc(db, "users", user.userId), {
        displayName,
        photoURL: imagenBase64,
        ...(newEmail && { email: newEmail }),
      });

      addActivity(
        user.userId, "profile_update",
        "El usuario ha actualizado su perfil"
      );

      await refreshUser();
      toast.success("Perfil actualizado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-50 inset-0 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
              <Dialog.Title className="text-xl font-bold text-[#0077b6] mb-4">
                Editar Perfil
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Nombre</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500">Imagen (URL)</label>
                  <input
                    type="url"
                    value={imagenBase64}
                    onChange={(e) => setImagenBase64(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500">Nuevo Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    placeholder="Opcional"
                  />
                </div>

                <div>
                  <label className="text-sm text-red-500 font-semibold">
                    Contraseña Actual *
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                    placeholder="Requerida para cambios"
                    required
                  />
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 rounded-xl text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-[#0077b6] text-white rounded-xl text-sm hover:bg-[#005f87]"
                  >
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditProfileModal;
