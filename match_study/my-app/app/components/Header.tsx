import Image from "next/image";
import Link from "next/link";

const LandingHeader = () => {
  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Fondo glass */}
      <div className="backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo + marca */}
          <Link href="/" className="group flex items-center gap-4">
            <div className="relative">
              {/* Glow sutil */}
              <div className="absolute -inset-2 bg-purple-500/20 blur-lg opacity-0 transition group-hover:opacity-100" />
              <Image
                src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
                alt="MatchStudy"
                width={56}
                height={56}
                priority
                className="relative object-contain"
              />
            </div>

            <div className="leading-tight">
              <div className="text-xl font-extrabold tracking-tight text-white">
                Match<span className="text-purple-400">Study</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Comunidad · Feeds · Salas
              </div>
            </div>
          </Link>

          {/* CTA Login */}
          <Link
            href="/auth/login"
            className="relative inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold text-white transition"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-90" />
            <span className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 transition group-hover:opacity-100" />
            <span className="relative">Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;


