import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto text-center py-6 text-sm text-slate-600 bg-slate-200">
      © 2025 SwiftHomes. Todos los derechos reservados.
      <p className="mt-2 flex justify-center gap-2">
        <Link
          href="/politica-de-privacidad"
          className="text-slate-600 hover:text-gray-900"
        >
          Política de privacidad
        </Link>
        |
        <Link
          href="/terminos-de-servicio"
          className="text-slate-600 hover:text-gray-900"
        >
          Términos de servicio
        </Link>
      </p>
      <div className="flex justify-center gap-4 mt-4">
        <a
          href="https://www.facebook.com/swifthomes"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
        >
          <Facebook
            size={25}
            className="text-slate-600 hover:text-[#0077b6] hover:scale-110"
          />
        </a>
        <a
          href="https://www.instagram.com/swifthomes"
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
        >
          <Instagram
            size={25}
            className="text-slate-600 hover:text-[#0077b6] hover:scale-110"
          />
        </a>
        <a
          href="https://www.twitter.com/swifthomes"
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
        >
          <Twitter
            size={25}
            className="text-slate-600 hover:text-[#0077b6] hover:scale-110"
          />
        </a>
      </div>
      <p className="mt-4 flex gap-2 justify-center">
        ¿Necesitas ayuda?
        <a
          href="mailto:swifthomes.mx@gmail.com"
          className="text-slate-600 hover:text-[#0077b6]"
          title="Correo"
        >
          swifthomes.mx@gmail.com
        </a>
      </p>
    </footer>
  );
}
export default Footer;
