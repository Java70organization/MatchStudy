import Image from "next/image";
import Link from "next/link";

const LandingHeader = () => {
  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Glass background */}
      <div className="backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo + brand */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              {/* glow */}
              <div className="absolute -inset-1 rounded-full bg-purple-500/30 blur-md opacity-0 transition group-hover:opacity-100" />
              <Image
                src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
                alt="MatchStudy"
                width={44}
                height={44}
                priority
                className="relative h-11 w-11 rounded-full border border-white/10 object-cover bg-slate-900"
              />
            </div>

            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight text-white">
                Match<span className="text-purple-400">Study</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Comunidad · Feeds · Salas
              </div>
            </div>
          </Link>

          {/* CTA */}
          <Link
            href="/auth/login"
            className="relative inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white transition"
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

