import Link from 'next/link';
import { useRouter } from 'next/router';
import logo from '../../public/assets/icons/SwiftHomes-logo-png.png';
import { UserCircle, UserRoundPlus } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./ui/dropdown-menu.tsx";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config"; 

function Navbar() {
    const { user } = useAuth();
    const router = useRouter();
    const handleFavoritesClick = () => {
    router.push('/favoritos');
  };
  return (
        <nav className="flex flex-col sm:flex-row items-center justify-between w-full px-4 py-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
        <Link href="/">
          <img className="h-16 sm:h-12 md:h-16 w-auto" src={logo} alt="Logo" />
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
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Foto de perfil"
                          className="w-20 h-20 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <UserCircle size={40} className="hover:text-[#0077b6] hover:scale-110 transition cursor-pointer" />
                      )}
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className='bg-slate-100'>
                    <DropdownMenuItem onClick={() => navigate("/micuenta")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Mi cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/mis-propiedades")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Mis propiedades
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Mi Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favoritos")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Mis Favoritos
                    </DropdownMenuItem>
                   {user?.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Panel Admin
                    </DropdownMenuItem>
                  )}
                    <DropdownMenuItem onClick={() => navigate("/agregarpropiedad")} className='hover:bg-[#0077b6] hover:text-slate-50'>
                      Agregar Propiedad
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        signOut(auth).then(() => {
                          navigate("/");
                        });
                      }} className='hover:bg-[#0077b6] hover:text-slate-50'
                    >
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link className="hover:text-[#0077b6] transition" href="/login">
                  <UserRoundPlus size={30} className='hover:text-[#0077b6] hover:scale-110 transition cursor-pointer'/>
                </Link>
              )}
            </ul>
        </nav> 
  );
}
export default Navbar;