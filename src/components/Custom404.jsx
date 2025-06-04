import Link from "next/link";
import { AlertTriangle } from "lucide-react";

function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-r from-[#2d7195] to-[#0077B6] text-slate-50 p-4">
      <AlertTriangle size={64} className="mb-4 text-slate-100" />
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl font-semibold mt-4">Oops! Página no encontrada</p>
      <p className="text-lg mt-2">La página que buscas no existe o ha sido movida.</p>
      <Link href="/" className="mt-6 bg-slate-100 hover:bg-slate-300 text-gray-800 py-2 px-6 rounded-xl">
        Regresar al inicio
      </Link>
    </div>
  );
}

export default Custom404;