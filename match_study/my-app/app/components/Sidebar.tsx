"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { checkUserProfile } from "@/lib/supabase/user";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Home,
  BookOpen,
  MessageSquare,
  User,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Rss,
  Video,
  FileText,
  Calendar,
} from "lucide-react";

type SidebarProps = { open: boolean; setOpen: (v: boolean) => void };

type NavItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const NAV: NavItem[] = [
    { href: "/dashboard/lobby", label: "Lobby", icon: Home },
    {
      label: "Asesorías",
      icon: BookOpen,
      submenu: [
        { href: "/dashboard/asesorias/feeds", label: "Feeds", icon: Rss },

        {
          href: "/dashboard/asesorias/materiales",
          label: "Materiales",
          icon: FileText,
        },
        {
          href: "/dashboard/asesorias/mensajes",
          label: "Mensajes",
          icon: MessageSquare,
        },
        {
          href: "/dashboard/asesorias/crear-sala",
          label: "Salas",
          icon: Video,
        },
        {
          href: "/dashboard/organizacion/calendario",
          label: "Calendario",
          icon: Calendar,
        },
      ],
    },
    { href: "/dashboard/perfil", label: "Perfil", icon: User },
    { href: "/dashboard/ayuda", label: "Ayuda", icon: HelpCircle },
  ];

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
      if (user?.email) {
        const profile = await checkUserProfile(user.email);
        if (profile?.urlFoto) {
          try {
            const res = await fetch("/api/profile-photo/signed", {
              cache: "no-store",
              credentials: "include",
            });
            const data = await res.json();
            setPhotoUrl(res.ok ? data.url ?? null : null);
          } catch {
            setPhotoUrl(null);
          }
        } else {
          setPhotoUrl(null);
        }
        setDisplayName(user.user_metadata?.full_name ?? null);
      } else {
        setPhotoUrl(null);
        setDisplayName(null);
      }
    };

    getUser();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      const email = session?.user?.email;
      if (email) {
        (async () => {
          const profile = await checkUserProfile(email);
          if (profile?.urlFoto) {
            try {
              const res = await fetch("/api/profile-photo/signed", {
                cache: "no-store",
                credentials: "include",
              });
              const data = await res.json();
              setPhotoUrl(res.ok ? data.url ?? null : null);
            } catch {
              setPhotoUrl(null);
            }
          } else {
            setPhotoUrl(null);
          }
          setDisplayName(session?.user?.user_metadata?.full_name ?? null);
        })();
      } else {
        setPhotoUrl(null);
        setDisplayName(null);
      }
    });

    const onProfilePhotoUpdated = async () => {
      try {
        const res = await fetch("/api/profile-photo/signed", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();
        setPhotoUrl(res.ok ? data.url ?? null : null);
      } catch {
        // ignore
      }
    };
    const onDisplayNameUpdated = (e: Event) => {
      const d = (e as CustomEvent).detail as { full_name?: string };
      if (d?.full_name) setDisplayName(d.full_name);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("profile-photo-updated", onProfilePhotoUpdated);
      window.addEventListener("display-name-updated", onDisplayNameUpdated);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "profile-photo-updated",
          onProfilePhotoUpdated,
        );
        window.removeEventListener("display-name-updated", onDisplayNameUpdated);
      }
    };
  }, []);

  // Función para cerrar sesión
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirigir al home
  };

  // Función para manejar submenús expandidos
  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Verificar si un submenú está activo
  const isSubmenuActive = (
    submenu: {
      href: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
    }[]
  ) => {
    return submenu.some((item) => pathname === item.href);
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
          {NAV.map((item) => {
            const { href, label, icon: Icon, submenu } = item;

            if (submenu) {
              // Elemento con submenú
              const isExpanded = expandedMenus.includes(label);
              const hasActiveSubmenu = isSubmenuActive(submenu);

              return (
                <div key={label}>
                  <button
                    onClick={() => toggleSubmenu(label)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                      ${
                        hasActiveSubmenu
                          ? "bg-purple-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Submenú */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-4">
                      {submenu.map((subItem) => {
                        const subActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition
                              ${
                                subActive
                                  ? "bg-purple-500 text-white"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                              }`}
                          >
                            <subItem.icon className="h-3 w-3" />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else if (href) {
              // Elemento simple con href
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
            }
            return null;
          })}
        </nav>

        {/* Estado del usuario */}
        <div className="mt-6 px-3">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Foto de perfil"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  unoptimized
                />
              ) : (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">
                  {displayName ||
                    user?.user_metadata?.full_name ||
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
