"use client";

import Image from "next/image";
import { Users, BookOpen, Video, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { checkUserProfile } from "@/lib/supabase/user";

export default function LobbyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfileOnLoad = async () => {
      try {
        // Verificar si hay usuario autenticado
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          // No hay usuario autenticado, redirigir al login
          window.location.href = "/auth/login";
          return;
        }

        const userEmail = user.email;
        if (userEmail) {
          // Verificar si el usuario tiene perfil en la tabla usuarios
          const userProfile = await checkUserProfile(userEmail);

          if (!userProfile) {
            // No tiene perfil, redirigir a completar perfil
            console.log("Usuario sin perfil, redirigiendo a completar perfil");
            window.location.href = "/auth/completar-perfil";
            return;
          }

          console.log("Usuario con perfil existente:", userProfile);
        }
      } catch (error) {
        console.error("Error verificando perfil:", error);
        // En caso de error, permitir continuar al dashboard
      } finally {
        setLoading(false);
      }
    };

    checkUserProfileOnLoad();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-slate-300">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Presentación de MatchStudy */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <Image
            src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
            alt="MatchStudy Logo"
            width={150}
            height={150}
            className="rounded-2xl shadow-2xl border-4 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Bienvenido a MatchStudy
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Tu plataforma integral para conectar con compañeros de estudio,
            compartir conocimientos y organizar sesiones colaborativas de
            aprendizaje.
          </p>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Video className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Videollamadas
              </h3>
            </div>
            <p className="text-slate-300 text-sm">
              Conéctate en tiempo real con tus compañeros para sesiones de
              estudio colaborativas.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Biblioteca</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Comparte y accede a materiales de estudio, apuntes y recursos
              educativos.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Comunidad</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Encuentra Feeds con intereses similares y forma grupos de estudio
              mediante la comunidad de MatchStudy.
            </p>
          </div>
        </div>
      </div>

      {/* Consejos para empezar */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">
            ¿Qué puedo realizar en MatchStudy?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-purple-300">
              Para la comunidad MatchStudy:
            </h3>
            <ul className="space-y-1 text-slate-300">
              <li>• Comparte Feeds entre la comunidad</li>
              <li>• Busca Feeds entre la comunidad de tu interés</li>
              <li>• Crea Salas de asesorías entre la comunidad</li>
              <li>• Busca Salas de asesorías de tu interés</li>
              <li>• Comparte materiales en la biblioteca</li>
              <li>• Busca materiales de tu interés</li>
              <li>• Puedes consultar nuestro calendario de actividades</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// UI local para esta ruta
//function Card(props: any){ return (<div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg"><h2 className="mb-3 text-lg font-semibold">{props.title}</h2>{props.children}</div>); }
//function QuickLink({ href, label }: { href: string; label: string }){ return (<a href={href} className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 hover:border-purple-500 hover:bg-slate-800">{label}</a>); }
