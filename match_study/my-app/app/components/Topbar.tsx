"use client";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Topbar({ onToggle }: { onToggle: () => void }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);

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

      {/* Lado derecho: Información del usuario */}
      <div className="flex items-center gap-3 lg:flex-shrink-0 pr-4 lg:pr-8">
        <span className="text-sm text-slate-300 hidden sm:block">
          Hola,{" "}
          {user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "Usuario"}
        </span>
        <Link href="/dashboard/perfil" className="flex items-center">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border border-slate-700 hover:bg-purple-500 transition-colors">
            <User className="h-4 w-4 text-white" />
          </div>
        </Link>
      </div>
    </header>
  );
}
