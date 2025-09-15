import Image from "next/image";
import Link from "next/link";

const Header = () => (
  <header className="fixed top-0 z-50 w-full backdrop-filter backdrop-blur-lg bg-slate-950/70 shadow-lg">
    <div className="container mx-auto flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-4">
        {/* Logo redirige a la página principal */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logoPNG-removebg-preview.png"
            alt="Logo MatchStudy"
            width={150}
            height={60}
            priority
          />
          <span className="font-bold text-2xl text-purple-400 font-display">
            MatchStudy
          </span>
        </Link>
      </div>
      <nav className="flex gap-6">
        <a
          href="#features"
          className="text-gray-300 hover:text-purple-400 transition-colors font-semibold"
        >
          Características
        </a>
        <a
          href="#contact"
          className="text-gray-300 hover:text-purple-400 transition-colors font-semibold"
        >
          Contacto
        </a>
        {/* Botón de login usando Link */}
        <Link href="/login">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold">
            Login
          </button>
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;
