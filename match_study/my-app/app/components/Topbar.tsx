"use client";
import { Menu } from "lucide-react";
import Image from "next/image";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-800 bg-slate-950/70 px-4 backdrop-blur">
      <button
        onClick={onToggle}
        aria-label="Abrir navegación"
        aria-haspopup="true"
        className="rounded-md p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="mx-auto hidden text-slate-300 sm:block">
        {/* Título centrado en pantallas medianas+ */}
        <span className="text-sm">Panel</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-slate-300">Hola, Usuario</span>
        <Image src="/avatar-placeholder.png" alt="avatar" width={28} height={28}
               className="rounded-full border border-slate-700" />
      </div>
    </header>
  );
}
