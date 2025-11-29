"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import { checkUserProfile } from "@/lib/supabase/user";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Home,
  MessageSquare,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Rss,
  Video,
  FileText,
  Settings,
} from "lucide-react";

type SidebarProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

type IconType = React.ComponentType<{ className?: string }>;

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NAV: NavItem[] = [
    { href: "/dashboard/lobby", label: "Lobby", icon: Home },
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
    { href: "/dashboard/asesorias/salas", label: "Salas", icon: Video },
    { href: "/dashboard/perfil", label: "Perfil", icon: User },
    {
      href: "/dashboard/asesorias/administracion",
      label: "Administración",
      icon: Settings,
    },
    { href: "/dashboard/ayuda", label: "Ayuda", icon: HelpCircle },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user || null);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const current = session?.user ?? null;
      setUser(current);
      const email = current?.email;
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
          setDisplayName(current?.user_metadata?.full_name ?? null);
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
      } catch {}
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
        window.removeEventListener(
          "display-name-updated",
          onDisplayNameUpdated,
        );
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isCollapsedOnDesktop = isCollapsed;

  return (
    <>
      {/* Overlay móvil */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        aria-label="Navegación principal"
        className={`fixed left-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden border-r border-slate-800 bg-slate-950/95 p-3 transition-transform duration-300 will-change-transform
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:z-auto
        ${isCollapsedOnDesktop ? "lg:w-20" : "lg:w-72"} w-64`}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-2 px-1">
          <Link
            href="/dashboard/lobby"
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-900/60"
          >
            <Image
              src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
              alt="Logo MatchStudy"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span
              className={`text-lg font-extrabold tracking-tight text-purple-400 transition-opacity duration-200 ${
                isCollapsedOnDesktop ? "hidden lg:hidden" : "inline lg:inline"
              }`}
            >
              MatchStudy
            </span>
          </Link>

          {/* Toggle desktop */}
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            className="hidden rounded-full border border-slate-700 bg-slate-900/80 p-1 text-slate-300 hover:border-purple-500 hover:text-purple-300 lg:inline-flex"
            aria-label={
              isCollapsedOnDesktop ? "Expandir sidebar" : "Colapsar sidebar"
            }
          >
            {isCollapsedOnDesktop ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Cerrar móvil */}
          <button
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800 lg:hidden"
            aria-label="Cerrar navegación"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const activeClasses = active
              ? "bg-gradient-to-r from-purple-600/80 to-pink-500/70 text-white border border-purple-500/80 shadow-inner"
              : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent";

            return (
              <div key={href} className="group relative">
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activeClasses}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={`truncate text-xs lg:text-sm transition-opacity duration-200 ${
                      isCollapsedOnDesktop ? "hidden lg:hidden" : "inline lg:inline"
                    }`}
                  >
                    {label}
                  </span>
                </Link>

                {isCollapsedOnDesktop && (
                  <span className="pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-100 opacity-0 shadow-lg ring-1 ring-slate-800 transition-opacity duration-150 group-hover:opacity-100">
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mt-6 mb-3 border-t border-slate-800/70" />

        {/* Usuario (solo expandido en desktop) */}
        {!isCollapsedOnDesktop && (
          <div className="px-1">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Foto de perfil"
                  width={32}
                  height={32}
                  className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white">
                  <User className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1 text-xs">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName ||
                    user?.user_metadata?.full_name ||
                    user?.email?.split("@")[0] ||
                    "Usuario"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {user ? "En línea" : "Desconectado"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="sticky bottom-0 left-0 right-0 mt-4 bg-gradient-to-t from-slate-950/95 pt-3">
          <div className="px-1 pb-1">
            <div className="group relative">
              <button
                type="button"
                onClick={handleSignOut}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-red-500/70 hover:bg-red-600/20 hover:text-red-100 ${
                  isCollapsedOnDesktop ? "justify-center" : "justify-between"
                }`}
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span
                  className={`text-sm transition-opacity duration-200 ${
                    isCollapsedOnDesktop ? "hidden lg:hidden" : "inline lg:inline"
                  }`}
                >
                  Cerrar sesión
                </span>
              </button>

              {isCollapsedOnDesktop && (
                <span className="pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-100 opacity-0 shadow-lg ring-1 ring-slate-800 transition-opacity duration-150 group-hover:opacity-100">
                  Cerrar sesión
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
