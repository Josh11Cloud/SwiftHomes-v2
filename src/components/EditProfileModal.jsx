import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { addActivity } from "./AddActivity";

function EditProfileModal({ isOpen, onClose }) {
  const { user, token, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.imagen || "");

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://192.168.100.64:5500/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, email, photoURL }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Error al actualizar perfil");
        return;
      }

      await addActivity(user.userid, "update_profile", "El usuario actualizó su perfil");

      await refreshUser();
      toast.success("Perfil actualizado correctamente");
      onClose();
    } catch (err) {
      toast.error("Error de red al actualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPhotoURL(user?.imagen || "");
  }, [user]);

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
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500">Correo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-500">Imagen (URL)</label>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                  />
                </div>

                {photoURL && (
                  <div className="flex justify-center">
                    <img
                      src={photoURL}
                      alt="Vista previa"
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                  </div>
                )}

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
                  <label className="text-sm text-gray-800 font-semibold">
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
                    className="px-4 py-2 bg-slate-200 text-gray-800 rounded-xl text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || !currentPassword}
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
