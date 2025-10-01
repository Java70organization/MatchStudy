"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      <div className="flex">
        {/* Sidebar a la izquierda */}
        <Sidebar open={open} setOpen={setOpen} />

        {/* Contenido */}
        <div className="flex min-h-[100dvh] flex-1 flex-col lg:ml-72">
          <Topbar onToggle={() => setOpen((v) => !v)} />

          {/* Contenedor centrado y responsivo */}
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
