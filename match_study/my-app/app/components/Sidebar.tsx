"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Home,
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

type SidebarProps = { open: boolean; setOpen: (v: boolean) => void };

const NAV = [
  { href: "/dashboard/lobby", label: "Lobby", icon: Home },
  { href: "/dashboard/asesorias", label: "Asesorías", icon: BookOpen },
  { href: "/dashboard/calendario", label: "Calendario", icon: Calendar },
  { href: "/dashboard/mensajes", label: "Mensajes", icon: MessageSquare },
  { href: "/dashboard/sesiones", label: "Mis sesiones", icon: BookOpen },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
  {
    href: "/dashboard/configuracion",
    label: "Configuración",
    icon: Settings,
  },
  { href: "/dashboard/ayuda", label: "Ayuda", icon: HelpCircle },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Cierra el drawer en móvil cuando se navega
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Obtener usuario de Supabase
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirigir al home
  };

  return (
    <>
      {/* Overlay móvil */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Drawer / Sticky sidebar */}
      <aside
        aria-label="Navegación principal"
        className={`fixed left-0 top-0 z-50 w-72
          h-[100dvh] overflow-y-auto border-r border-slate-800 bg-slate-900 p-4
          transition-transform duration-300 will-change-transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:z-auto`}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <Link
            href="/dashboard/lobby"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
              alt="Logo MatchStudy"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-lg font-extrabold tracking-tight text-purple-400">
              MatchStudy
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800"
            aria-label="Cerrar navegación"
          >
            ✕
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="mt-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                  ${
                    active
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Estado del usuario */}
        <div className="mt-6 px-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0] ||
                    "Usuario"}
                </p>
                <p className="text-xs text-slate-400">
                  {user ? "En línea" : "Desconectado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 mt-6 bg-gradient-to-t from-slate-900 pt-4">
          <div className="px-2">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
