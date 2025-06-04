import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" open={isOpen} onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4 text-center">
          <Dialog.Panel className="bg-slate-50 p-6 rounded-2xl shadow-xl max-w-md w-full">
            <Dialog.Title className="text-xl font-bold text-[#0077b6] mb-4">
              Confirmar Cierre de Sesión
            </Dialog.Title>
            <p className="text-sm text-slate-500 mb-4">¿Estás seguro de que deseas cerrar sesión? Esto te desconectará de tu cuenta.</p>
            <div className="flex justify-center gap-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-xl text-sm">Cancelar</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-[#0077b6] text-slate-50 rounded-xl text-sm hover:bg-[#005f87]">
                Confirmar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
export default LogoutConfirmationModal;