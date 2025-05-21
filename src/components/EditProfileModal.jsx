import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Fragment } from "react";
import { getAuth } from "firebase/auth";

function EditProfileModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();  const auth = getAuth();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [loading, setLoading] = useState(false);
  const [imagenBase64, setImagenBase64] = useState("");

    useEffect(() => {
      if (user) {
        setDisplayName(user.displayName || "");
      }
    }, [user]);

    const handleSave = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: imagenBase64,
      });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        photoURL: imagenBase64,
      });
      await refreshUser(); 
      toast.success("Perfil actualizado con éxito");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-slate-50 p-6 rounded-2xl shadow-xl max-w-md w-full">
          <Dialog.Title className="text-xl font-bold text-[#0077b6] mb-4">
            Editar Perfil
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Nombre</label>
              <input
                type="text"
                className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

           <div>
          <label className="text-md text-gray-700 font-semibold mb-2">URL de Imagen de Perfil</label>
          <input
            type="url"
            className="w-full border rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-[#0077B6]"
            value={imagenBase64}
            onChange={(e) => setImagenBase64(e.target.value)}
            placeholder="Ingrese la URL de la imagen"
          />
        </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-[#0077b6] text-slate-50 rounded-xl text-sm hover:bg-[#005f87]"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
      </Transition.Child>
    </Dialog>
</Transition>
  );
}

export default EditProfileModal;