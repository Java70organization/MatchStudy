import Image from "next/image";
import Link from "next/link";

const Header = () => (
  <header className="fixed top-0 z-50 w-full backdrop-filter backdrop-blur-lg bg-slate-950/70 shadow-lg">
    <div className="container mx-auto flex items-center px-8 py-4">
      {/* Logo a la izquierda */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
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

      {/* Navegación centrada */}
      <nav className="flex-1 flex items-center justify-center gap-8"></nav>

      {/* Botón de login a la derecha */}
      <div className="flex items-center">
        <Link href="/auth/login">
          <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold">
            Login
          </button>
        </Link>
      </div>
    </div>
  </header>
);

export default Header;
