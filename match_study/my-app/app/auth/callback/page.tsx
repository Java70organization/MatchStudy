"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { ensureUserRow } from "@/lib/supabase/user";
import { CheckCircle, XCircle, Clock, Mail, Sparkles } from "lucide-react";

function AuthCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener parámetros de la URL
        const url = new URL(window.location.href);
        const params = Object.fromEntries(url.searchParams.entries());
        const hashParams = url.hash
          ? Object.fromEntries(
              new URLSearchParams(url.hash.substring(1)).entries()
            )
          : {};
        const allParams = { ...params, ...hashParams };

        // Verificar si hay errores
        if (allParams.error) {
          setStatus("error");
          setMessage(
            allParams.error_description || "Error en la confirmación del email"
          );
          return;
        }

        // Intentar obtener sesión actual (método más simple)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await processSuccessfulAuth(session.user);
          return;
        }

        // Si hay código, intercambiarlo por sesión
        if (allParams.code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            allParams.code
          );

          if (error) {
            setStatus("error");
            setMessage(`Error al confirmar: ${error.message}`);
            return;
          }

          if (data.user) {
            await processSuccessfulAuth(data.user);
            return;
          }
        }

        // Si hay token_hash, verificarlo
        if (allParams.token_hash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: allParams.token_hash,
            type: "email",
          });

          if (error) {
            setStatus("error");
            setMessage(`Error al verificar: ${error.message}`);
            return;
          }

          if (data.user) {
            await processSuccessfulAuth(data.user);
            return;
          }
        }

        // Si llegamos aquí, no hay parámetros válidos
        setStatus("error");
        setMessage("Enlace de confirmación inválido");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        setStatus("error");
        setMessage(`Error inesperado: ${errorMessage}`);
      }
    };

    const processSuccessfulAuth = async (user: {
      user_metadata?: Record<string, unknown>;
      email?: string;
    }) => {
      try {
        const metadata = user.user_metadata || {};
        await ensureUserRow({
          email: user.email || "",
          displayName:
            (metadata.full_name as string) || user.email?.split("@")[0] || "",
          phone: (metadata.phone as string) || "",
          userType: (metadata.user_type as string) || "student",
          university: (metadata.university as string) || "",
          photoUrl: (metadata.avatar_url as string) || null,
        });

        setStatus("success");
        setMessage(
          "¡Tu email ha sido confirmado exitosamente! Tu cuenta está ahora activa y puedes acceder a todas las funciones de MatchStudy. Haz clic en el botón de abajo para iniciar sesión."
        );
      } catch {
        setStatus("success");
        setMessage(
          "Email confirmado exitosamente. Tu cuenta está activa. Inicia sesión para completar tu perfil y comenzar a usar MatchStudy."
        );
      }
    };

    handleAuthCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="relative">
            <Clock className="w-20 h-20 text-blue-500 animate-spin" />
            <div className="absolute inset-0 animate-pulse">
              <Clock className="w-20 h-20 text-blue-300 opacity-50" />
            </div>
          </div>
        );
      case "success":
        return (
          <div className="relative">
            <CheckCircle className="w-20 h-20 text-green-500" />
            <div className="absolute -inset-2 animate-ping">
              <CheckCircle className="w-24 h-24 text-green-400 opacity-20" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
        );
      case "error":
        return (
          <div className="relative">
            <XCircle className="w-20 h-20 text-red-500" />
            <div className="absolute inset-0 animate-pulse">
              <XCircle className="w-20 h-20 text-red-300 opacity-50" />
            </div>
          </div>
        );
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "loading":
        return "Confirmando tu email...";
      case "success":
        return "¡Confirmación Exitosa!";
      case "error":
        return "Error en la Confirmación";
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "loading":
        return "from-blue-900 via-purple-900 to-indigo-900";
      case "success":
        return "from-green-900 via-emerald-900 to-teal-900";
      case "error":
        return "from-red-900 via-rose-900 to-pink-900";
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundColor()} relative overflow-hidden`}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-4 left-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <main className="relative flex items-center justify-center min-h-screen px-4">
        <div className="max-w-lg w-full">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl text-center relative">
            {/* Borde brillante animado para success */}
            {status === "success" && (
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 animate-pulse"></div>
            )}

            <div className="relative z-10">
              {/* Icono de estado */}
              <div className="flex justify-center mb-8">{getStatusIcon()}</div>

              {/* Título */}
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {getStatusTitle()}
              </h1>

              {/* Mensaje */}
              <div className="mb-8">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Características desbloqueadas */}
              {status === "success" && (
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 mb-8 border border-gray-600/30">
                  <div className="flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-green-400 mr-2" />
                    <h3 className="text-xl font-semibold text-green-400">
                      ¡Cuenta Activada!
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-left">
                    {[
                      "Acceso completo al dashboard",
                      "Programar sesiones de estudio",
                      "Conectar con otros estudiantes",
                      "Recibir notificaciones importantes",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Cargando...</h2>
            <p className="text-gray-300">Procesando confirmación de email...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
