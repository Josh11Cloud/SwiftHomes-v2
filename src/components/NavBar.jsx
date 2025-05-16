import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import logo from '../assets/icons/SwiftHomes-logo-png.png';

function Navbar() {
    const navigate = useNavigate();
    const handleFavoritesClick = () => {
    navigate('/favoritos');
  };
  return (
        <nav className="flex flex-col sm:flex-row items-center justify-between w-full px-4 py-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <img className="h-16 sm:h-12 md:h-16 w-auto" src={logo} alt="Logo" />
            <h1 className="text-1xl font-bold text-[#212529] sm:text-2xl md:text-3xl lg:text-4xl">SwiftHomes</h1>
        </div>
            <ul className="flex flex-col sm:flex-row items-center gap-4 text-base sm:text-lg font-semibold text-[#212529]">
              <Link className='hover:text-[#0077b6] transition' to="/">Inicio</Link>
              <Link className="hover:text-[#0077b6] transition" to="/comprar">Comprar</Link>
              <Link className="hover:text-[#0077b6] transition" to="/rentar">Rentar</Link>
              <Link className="hover:text-[#0077b6] transition" to="/inversiones">Inversiones</Link>
              <Link to="/dashboard" className="hover:text-[#0077b6] transition">
              Dashboard
              </Link>
              <button onClick={handleFavoritesClick} className="text-[#212529] hover:text-[#0077B6]">Favoritos</button>
              <Link className="hover:text-[#0077b6] transition" to="/contacto">Contacto</Link>
            </ul>
        </nav> 
  );
}
export default Navbar;