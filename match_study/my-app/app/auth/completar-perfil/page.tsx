"use client";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { createUserProfile } from "@/lib/supabase/user";

export default function CompletarPerfilPage() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Obtener datos del usuario autenticado
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        // Pre-llenar el nombre si está disponible en los metadatos
        if (user.user_metadata?.full_name) {
          const fullName = user.user_metadata.full_name;
          const nameParts = fullName.split(" ");
          setNombres(nameParts[0] || "");
          setApellidos(nameParts.slice(1).join(" ") || "");
        }
      } else {
        // Si no hay usuario autenticado, redirigir al login
        window.location.href = "/auth/login";
      }
    };

    getUserData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nombres.trim()) {
      setErrorMsg("El nombre es requerido.");
      return;
    }

    if (!apellidos.trim()) {
      setErrorMsg("Los apellidos son requeridos.");
      return;
    }

    if (!universidad.trim()) {
      setErrorMsg("La universidad es requerida.");
      return;
    }

    setLoading(true);

    try {
      const userProfile = await createUserProfile({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        email: userEmail,
        telefono: telefono.trim() || null,
        universidad: universidad.trim(),
      });

      if (userProfile) {
        setSuccessMsg(
          "¡Perfil creado exitosamente! Redirigiendo al dashboard..."
        );
        setTimeout(() => {
          window.location.href = "/dashboard/lobby";
        }, 2000);
      } else {
        setErrorMsg("Error al crear el perfil. Por favor, intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al crear perfil:", error);
      setErrorMsg("Error inesperado al crear el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Header />
      <main className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-36 bg-gradient-to-br from-slate-950 to-gray-900">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Completa tu Perfil
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
          Para comenzar a usar MatchStudy, necesitamos algunos datos
          adicionales.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-10 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6"
        >
          <input
            type="text"
            placeholder="Nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="given-name"
          />

          <input
            type="text"
            placeholder="Apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="family-name"
          />

          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            autoComplete="tel"
          />

          <input
            type="text"
            placeholder="Universidad"
            value={universidad}
            onChange={(e) => setUniversidad(e.target.value)}
            className="px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
            autoComplete="organization"
          />

          <div className="text-sm text-gray-400">
            <strong>Email:</strong> {userEmail}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            {loading ? "Creando perfil..." : "Completar Perfil"}
          </button>

          {errorMsg && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-400 text-sm">{successMsg}</p>
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
