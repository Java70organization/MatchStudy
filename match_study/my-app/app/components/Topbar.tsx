// components/layout/Topbar.tsx (reemplaza tu archivo actual)
"use client";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { checkUserProfile } from "@/lib/supabase/user";
import NotificationBell from "../dashboard/NotificationBell";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

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

  const nameToShow =
    displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/70 backdrop-blur w-full">
      {/* Lado izquierdo: Botón de menú en móvil */}
      <div className="flex items-center lg:w-8 pl-4 lg:pl-8">
        <button
          onClick={onToggle}
          aria-label="Abrir navegación"
          aria-haspopup="true"
          className="rounded-md p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Lado derecho: usuario + notificaciones */}
      <div className="flex items-center gap-3 lg:flex-shrink-0 pr-4 lg:pr-8">
        <span className="hidden text-sm text-slate-300 sm:block">
          Hola {nameToShow}
        </span>

        {/* Icono de notificaciones */}
        <NotificationBell />

        <Link href="/dashboard/perfil" className="flex items-center">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt="Foto de perfil"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-slate-700 object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-purple-600 hover:bg-purple-500 transition-colors">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
