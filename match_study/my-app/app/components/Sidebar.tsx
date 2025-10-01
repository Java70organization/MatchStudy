"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Home, BookOpen, Calendar, MessageSquare, User, Settings, HelpCircle, LogOut,
} from "lucide-react";

type SidebarProps = { open: boolean; setOpen: (v: boolean) => void };

const NAV = [
  { href: "/lobby", label: "Lobby", icon: Home },
  { href: "/asesorias", label: "Asesorías", icon: BookOpen },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/mensajes", label: "Mensajes", icon: MessageSquare },
  { href: "/sesiones", label: "Mis sesiones", icon: BookOpen },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/perfil/configuracion", label: "Configuración de perfil", icon: Settings },
  { href: "/ayuda", label: "Ayuda", icon: HelpCircle },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  // Cierra el drawer en móvil cuando se navega
  useEffect(() => { setOpen(false); }, [pathname, setOpen]);

  return (
    <>
      {/* Overlay móvil */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Drawer / Fixed sidebar */}
      <aside
        aria-label="Navegación principal"
        className={`fixed left-0 top-0 z-50 w-72
          h-[100dvh] overflow-y-auto border-r border-slate-800 bg-slate-900 p-4
          transition-transform duration-300 will-change-transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/lobby" className="text-xl font-extrabold tracking-tight">
            MatchStudy
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800"
            aria-label="Cerrar navegación"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                  ${active ? "bg-purple-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sticky bottom-0 left-0 right-0 mt-6 bg-gradient-to-t from-slate-900 pt-4">
          <form action="/api/auth/signout" method="post" className="px-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
