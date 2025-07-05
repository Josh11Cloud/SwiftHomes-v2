import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserCircle, UserRoundPlus } from 'lucide-react';
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { addActivity } from './AddActivity.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu.tsx";

function Navbar() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const handleFavoritesClick = () => {
    router.push('/favoritos');
  };
  return (
    <nav className="flex flex-col sm:flex-row items-center justify-between w-full px-4 py-4 sm:px-6 lg:px-8 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4 sm:mb-0">
        <Link href="/">
          <img className="h-16 sm:h-12 md:h-16 w-auto" src="/assets/icons/SwiftHomes-logo-png.png" alt="Logo" />
        </Link>
        <h1 className="text-1xl font-bold text-[#212529] sm:text-2xl md:text-3xl lg:text-4xl">SwiftHomes</h1>
      </div>
      <ul className="flex flex-col sm:flex-row items-center gap-4 text-base sm:text-lg font-semibold text-[#212529]">
        <Link className='hover:text-[#0077b6] transition' href="/">Inicio</Link>
        <Link className="hover:text-[#0077b6] transition" href="/comprar">Comprar</Link>
        <Link className="hover:text-[#0077b6] transition" href="/rentar">Rentar</Link>
        <Link className="hover:text-[#0077b6] transition" href="/inversiones">Inversiones</Link>
        <Link href="/dashboard" className="hover:text-[#0077b6] transition">
          Dashboard
        </Link>
        <button onClick={handleFavoritesClick} className="text-[#212529] hover:text-[#0077B6]">Favoritos</button>
        <Link className="hover:text-[#0077b6] transition" href="/contacto">Contacto</Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:text-[#0077b6] hover:scale-110 transition cursor-pointer">
              {user.imagen ? (
                <img
                  src={user.imagen}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <UserCircle size={40} className="hover:text-[#0077b6] hover:scale-110 transition cursor-pointer" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className='bg-slate-100 text-gray-800'>
              <DropdownMenuItem onClick={() => router.push("/micuenta")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/mispropiedades")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                Mis propiedades
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                Mi Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/favoritos")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                Mis Favoritos
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => router.push("/admin")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                  Panel Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push("/agregarpropiedad")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                Agregar Propiedad
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await addActivity(token, "logout", "El usuario cerró sesión".substring(0, 100));
                  await logout();
                  router.push("/");
                  toast.success("Sesión cerrada correctamente");
                }} className='hover:bg-[#0077b6] hover:text-slate-50'
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link className="hover:text-[#0077b6] transition" href="/login">
            <UserRoundPlus size={30} className='hover:text-[#0077b6] hover:scale-110 transition cursor-pointer' />
          </Link>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;