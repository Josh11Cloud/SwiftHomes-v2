import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { addActivity } from "./AddActivity";
import { UploadCloud } from "lucide-react";

function EditProfileModal({ isOpen, onClose }) {
  const { user, token, refreshUser } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [imageURL, setImageURL] = useState(user?.imagen || "");

  const handleSave = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://192.168.100.64:5500/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, email, imagen: imageURL }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Error al actualizar perfil");
        return;
      }

      await addActivity(token, "update_profile", "El usuario actualizó su perfil");

      await refreshUser();
      toast.success("Perfil actualizado correctamente");
      onClose();
    } catch (err) {
      toast.error("Error de red al actualizar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cloudName = "dhtysitwx";
  const uploadPreset = "swifthomes-v3";

  const handleImageChange = async (e) => {
    let file;
    if (e.target && e.target.files) {
      file = e.target.files[0];
    } else if (e.dataTransfer && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    } else {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setImageURL(data.secure_url);
      } else {
        throw new Error("Error al subir imagen");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al subir imagen");
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

                <div
                  onDrop={handleImageChange}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="border-2 border-dashed rounded p-6 text-center cursor-pointer flex flex-col items-center"
                >
                  {imageURL && (
                    <img
                      src={imageURL}
                      alt="Vista previa"
                      className="w-20 h-20 rounded-full object-cover border mb-4"
                    />
                  )}
                  <div className="flex flex-col items-center text-gray-500">
                    <UploadCloud className="w-12 h-12 mb-2 text-[#0077b6]" />
                    <p>
                      Arrastra y suelta una imagen aquí o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="mt-2 px-4 py-2 bg-[#0077b6] text-white rounded hover:bg-[#005f87] cursor-pointer"
                    >
                      Seleccionar Imagen
                    </label>
                  </div>
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
