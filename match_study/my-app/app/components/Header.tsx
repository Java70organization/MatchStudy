import Image from "next/image";
import Link from "next/link";

const Header = () => (
  <header className="fixed top-0 z-50 w-full">
    {/* Glow / gradient top bar */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent" />

    {/* Glass container */}
    <div className="backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
      <div className="container mx-auto flex items-center justify-between gap-6 px-6 py-3 md:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-purple-500/10 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            <Image
              src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
              alt="Logo MatchStudy"
              width={44}
              height={44}
              priority
              className="relative h-11 w-11 rounded-2xl border border-slate-800 bg-slate-900/30 object-cover shadow-lg"
            />
          </div>

          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-white">
              Match<span className="text-purple-400">Study</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Comunidad • Feeds • Salas
            </div>
          </div>
        </Link>

        {/* Center nav (placeholder) */}
        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          <Link
            href="/feeds"
            className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60 hover:text-white transition"
          >
            Feeds
          </Link>
          <Link
            href="/salas"
            className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60 hover:text-white transition"
          >
            Salas
          </Link>
          <Link
            href="/materiales"
            className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-slate-900/60 hover:text-white transition"
          >
            Biblioteca
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="group relative inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
          >
            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-90 transition-opacity group-hover:opacity-100" />
            <span className="absolute inset-0 rounded-xl blur-md bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative">Login</span>
          </Link>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
